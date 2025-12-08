import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../css/taskBoard.css";

interface Task {
    id: string;
    documentId: string;
    title: string;
    description: string;
    status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';
    priority: 'HIGH' | 'MEDIUM' | 'LOW';
    assignedUserId: string;
    dueDate: string;
    createdAt: string;
    updatedAt: string;
    active: boolean;
}

export default function TaskBoard() {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    
    // --- ESTADOS PARA LA BÚSQUEDA ---
    const [searchType, setSearchType] = useState<'ALL' | 'DOCUMENT' | 'USER'>('ALL');
    const [searchQuery, setSearchQuery] = useState("");
    
    const navigate = useNavigate();

    // Formulario para crear/editar tarea
    const [formData, setFormData] = useState({
        documentId: "",
        title: "",
        description: "",
        status: "PENDING" as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED',
        priority: "MEDIUM" as 'HIGH' | 'MEDIUM' | 'LOW',
        assignedUserId: "",
        dueDate: ""
    });

    const API_BASE_URL = "https://task-service-5dmf.onrender.com/api/tasks";

    // --- FUNCIÓN UNIFICADA DE CARGA DE TAREAS ---
    // Esta función decide qué endpoint llamar basándose en el tipo de búsqueda
    const fetchTasks = async (type = searchType, query = searchQuery) => {
        setLoading(true);
        setError("");
        try {
            const token = Cookies.get('token');
            if (!token) {
                setError("No hay sesión activa.");
                navigate('/');
                return;
            }

            let url = `${API_BASE_URL}/tasks`; // Por defecto: Traer todas

            // Lógica de Endpoints según tu Backend
            if (type === 'DOCUMENT' && query.trim()) {
                url = `${API_BASE_URL}/document/${query}/tasks`;
            } else if (type === 'USER' && query.trim()) {
                url = `${API_BASE_URL}/users/${query}/tasks`;
            }

            const res = await axios.get(url, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Manejar la respuesta del SuccessResponse
            const tasksData = res.data.data || res.data || [];
            setTasks(Array.isArray(tasksData) ? tasksData : []);
            
        } catch (err: any) {
            console.error("Error al cargar tareas:", err);
            if (err.response?.status === 404) {
                setTasks([]); // Si no encuentra nada (ej: documento no existe), vaciar lista
                setError("No se encontraron tareas con ese criterio.");
            } else if (err.response?.status === 401) {
                Cookies.remove('token');
                navigate('/');
            } else {
                setError("Error al conectar con el servidor.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Cargar todas al inicio
    useEffect(() => {
        fetchTasks('ALL', '');
    }, []);

    // --- MANEJADORES DE BÚSQUEDA ---
    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchType !== 'ALL' && !searchQuery.trim()) {
            setError("Por favor ingresa un ID para buscar.");
            return;
        }
        fetchTasks();
    };

    const handleClearSearch = () => {
        setSearchType('ALL');
        setSearchQuery("");
        fetchTasks('ALL', '');
    };

    // ... (El resto de funciones: updateTaskStatus, handleCreateTask, handleDeleteTask, etc. QUEDAN IGUAL) ...
    // ... Copia tus funciones updateTaskStatus, handleCreateTask, handleUpdateTask, handleDeleteTask, openModals ...
    
    const updateTaskStatus = async (id: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
        try {
            const token = Cookies.get('token');
            await axios.put(`${API_BASE_URL}/${id}/status`,{ status: newStatus },{ headers: { Authorization: `Bearer ${token}` } });
            // Recargamos usando el filtro actual para no perder la vista
            fetchTasks(); 
        } catch (err) { alert("No se pudo actualizar el estado"); }
    };

    // (Para ahorrar espacio, asumo que tienes aquí handleCreateTask, handleUpdateTask, etc. 
    // Asegúrate de que cuando llamen a fetchTasks(), lo hagan sin argumentos o gestionen el refresh)
    
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.documentId.trim() || !formData.assignedUserId.trim()) {
            setError("Completa los campos obligatorios"); return;
        }
        try {
            const token = Cookies.get('token');
            await axios.post(API_BASE_URL, { ...formData, dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : new Date().toISOString() }, { headers: { Authorization: `Bearer ${token}` } });
            setShowModal(false);
            resetForm();
            fetchTasks(); // Recargar lista
        } catch (err) { setError("Error al crear tarea"); }
    };

    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        if(!editingTask) return;
        try {
            const token = Cookies.get('token');
            const updateData: any = {};
            if (formData.title !== editingTask.title) updateData.title = formData.title;
            if (formData.description !== editingTask.description) updateData.description = formData.description;
            if (formData.priority !== editingTask.priority) updateData.priority = formData.priority;
            if (formData.assignedUserId !== editingTask.assignedUserId) updateData.assignedUserId = formData.assignedUserId;
            if (formData.dueDate) updateData.dueDate = new Date(formData.dueDate).toISOString();

            await axios.patch(`${API_BASE_URL}/${editingTask.id}`, updateData, { headers: { Authorization: `Bearer ${token}` } });
            setShowModal(false);
            setEditingTask(null);
            resetForm();
            fetchTasks();
        } catch (err) { setError("Error al actualizar"); }
    };

    const handleDeleteTask = async (id: string) => {
        if (!window.confirm("¿Eliminar tarea?")) return;
        try {
            const token = Cookies.get('token');
            await axios.delete(`${API_BASE_URL}/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            fetchTasks();
        } catch (err) { alert("Error al eliminar"); }
    };

    const openCreateModal = () => { resetForm(); setEditingTask(null); setShowModal(true); };
    const openEditModal = (task: Task) => {
        setEditingTask(task);
        setFormData({
            documentId: task.documentId,
            title: task.title,
            description: task.description,
            status: task.status,
            priority: task.priority,
            assignedUserId: task.assignedUserId,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : ""
        });
        setShowModal(true);
    };
    const resetForm = () => {
        setFormData({ documentId: "", title: "", description: "", status: "PENDING", priority: "MEDIUM", assignedUserId: "", dueDate: "" });
        setError("");
    };
    const handleLogout = () => { Cookies.remove('token'); Cookies.remove('usuario'); navigate('/'); };
    const getTasksByStatus = (status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'): Task[] => tasks.filter((t) => t.status === status && t.active);
    const getPriorityColor = (priority: 'HIGH' | 'MEDIUM' | 'LOW'): string => { if (priority === 'HIGH') return 'red'; if (priority === 'MEDIUM') return 'orange'; return 'green'; };


    return (
        <div className="board-container">
            <header className="board-header">
                <div>
                    <h1>📋 Tablero de Tareas - InsightFlow</h1>
                    <p className="header-subtitle">Gestiona tus tareas de forma eficiente</p>
                </div>
                <div className="header-actions">
                    <button className="create-btn" onClick={openCreateModal}>+ Nueva Tarea</button>
                    <button className="logout-btn" onClick={handleLogout}>Salir</button>
                </div>
            </header>

            {/* --- SECCIÓN DE BÚSQUEDA NUEVA --- */}
            <div className="search-container">
                <select 
                    className="search-select"
                    value={searchType}
                    onChange={(e) => {
                        setSearchType(e.target.value as any);
                        setSearchQuery(""); // Limpiar input al cambiar tipo
                    }}
                >
                    <option value="ALL">📂 Ver Todas</option>
                    <option value="DOCUMENT">📄 Por ID Documento</option>
                    <option value="USER">👤 Por ID Usuario Asignado</option>
                </select>

                <form onSubmit={handleSearchSubmit} className="search-input-wrapper">
                    {searchType !== 'ALL' && (
                        <input 
                            type="text" 
                            className="search-input-field"
                            placeholder={searchType === 'DOCUMENT' ? "Ej: doc-123" : "Ej: user-456"}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    )}
                    
                    <button type="submit" className="btn-search">
                        {searchType === 'ALL' ? '🔄 Recargar' : '🔍 Buscar'}
                    </button>
                    
                    {(searchType !== 'ALL' || searchQuery !== "") && (
                        <button type="button" className="btn-clear" onClick={handleClearSearch}>
                            ✖ Limpiar
                        </button>
                    )}
                </form>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando tablero...</p>
                </div>
            ) : (
                <div className="kanban-board">
                    {/* ... (TUS COLUMNAS KANBAN - SE MANTIENEN IGUAL) ... */}
                    {/* Solo asegúrate de copiar el código de las columnas que ya tenías */}
                    
                    {/* Columna Pendientes */}
                    <div className="kanban-column">
                        <div className="column-header pending-header">
                            <h3 className="column-title">📝 Pendientes</h3>
                            <span className="task-count">{getTasksByStatus('PENDING').length}</span>
                        </div>
                        <div className="task-list">
                            {getTasksByStatus('PENDING').map(task => (
                                <div key={task.id} className="task-card">
                                    <div className="task-card-header">
                                        <div className={`priority-tag ${getPriorityColor(task.priority)}`}>{task.priority}</div>
                                        <button className="task-menu-btn" onClick={() => openEditModal(task)}>⋮</button>
                                    </div>
                                    <h4 className="task-title">{task.title}</h4>
                                    <p className="task-description">{task.description}</p>
                                    <div className="task-meta">
                                        <span className="task-user">👤 {task.assignedUserId}</span>
                                        {/* Mostrar Document ID también ayuda en las búsquedas */}
                                        <span className="task-date" style={{fontSize: '0.8rem'}}>📄 {task.documentId}</span>
                                    </div>
                                    <div className="card-actions">
                                        <button className="action-btn start-btn" onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}>▶ Iniciar</button>
                                        <button className="action-btn delete-btn" onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Columna En Progreso */}
                    <div className="kanban-column">
                        <div className="column-header progress-header">
                            <h3 className="column-title">⚡ En Progreso</h3>
                            <span className="task-count">{getTasksByStatus('IN_PROGRESS').length}</span>
                        </div>
                        <div className="task-list">
                            {getTasksByStatus('IN_PROGRESS').map(task => (
                                <div key={task.id} className="task-card in-progress-card">
                                    <div className="task-card-header">
                                        <div className={`priority-tag ${getPriorityColor(task.priority)}`}>{task.priority}</div>
                                        <button className="task-menu-btn" onClick={() => openEditModal(task)}>⋮</button>
                                    </div>
                                    <h4 className="task-title">{task.title}</h4>
                                    <p className="task-description">{task.description}</p>
                                    <div className="task-meta">
                                        <span className="task-user">👤 {task.assignedUserId}</span>
                                    </div>
                                    <div className="card-actions">
                                        <button className="action-btn back-btn" onClick={() => updateTaskStatus(task.id, 'PENDING')}>◀</button>
                                        <button className="action-btn complete-btn" onClick={() => updateTaskStatus(task.id, 'COMPLETED')}>✓ Completar</button>
                                        <button className="action-btn delete-btn" onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Columna Completadas */}
                    <div className="kanban-column">
                        <div className="column-header completed-header">
                            <h3 className="column-title">✅ Completadas</h3>
                            <span className="task-count">{getTasksByStatus('COMPLETED').length}</span>
                        </div>
                        <div className="task-list">
                            {getTasksByStatus('COMPLETED').map(task => (
                                <div key={task.id} className="task-card completed-card">
                                    <div className="task-card-header">
                                        <span className="check-icon">✓</span>
                                        <button className="task-menu-btn" onClick={() => openEditModal(task)}>⋮</button>
                                    </div>
                                    <h4 className="task-title completed-title">{task.title}</h4>
                                    <div className="task-meta">
                                        <span className="task-user">👤 {task.assignedUserId}</span>
                                    </div>
                                    <div className="card-actions">
                                        <button className="action-btn reopen-btn" onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}>↺ Reabrir</button>
                                        <button className="action-btn delete-btn" onClick={() => handleDeleteTask(task.id)}>🗑️</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para crear/editar (SE MANTIENE IGUAL) */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>{editingTask ? "✏️ Editar Tarea" : "➕ Nueva Tarea"}</h2>
                        <form onSubmit={editingTask ? handleUpdateTask : handleCreateTask}>
                            <div className="form-group">
                                <label htmlFor="documentId">ID del Documento *</label>
                                <input
                                    type="text"
                                    id="documentId"
                                    value={formData.documentId}
                                    onChange={(e) => setFormData({ ...formData, documentId: e.target.value })}
                                    required
                                    disabled={!!editingTask}
                                    placeholder="doc-001"
                                />
                            </div>
                            {/* ... Resto de los campos del formulario (Título, Descripción, etc) ... */}
                            {/* Se mantienen exactamente igual que en tu código original */}
                            <div className="form-group">
                                <label htmlFor="title">Título *</label>
                                <input type="text" id="title" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="description">Descripción</label>
                                <textarea id="description" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} />
                            </div>
                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="priority">Prioridad</label>
                                    <select id="priority" value={formData.priority} onChange={(e) => setFormData({...formData, priority: e.target.value as any})}>
                                        <option value="LOW">Baja</option>
                                        <option value="MEDIUM">Media</option>
                                        <option value="HIGH">Alta</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="status">Estado</label>
                                    <select id="status" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as any})} disabled={!editingTask}>
                                        <option value="PENDING">Pendiente</option>
                                        <option value="IN_PROGRESS">En Progreso</option>
                                        <option value="COMPLETED">Completado</option>
                                    </select>
                                </div>
                            </div>
                            <div className="form-group">
                                <label htmlFor="assignedUserId">Usuario Asignado *</label>
                                <input type="text" id="assignedUserId" value={formData.assignedUserId} onChange={(e) => setFormData({...formData, assignedUserId: e.target.value})} required placeholder="user-001" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dueDate">Fecha de Vencimiento</label>
                                <input type="date" id="dueDate" value={formData.dueDate} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="save-btn">{editingTask ? "💾 Guardar Cambios" : "➕ Crear Tarea"}</button>
                                <button type="button" className="cancel-btn" onClick={() => { setShowModal(false); setEditingTask(null); resetForm(); }}>✖ Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}