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

    // URL base de tu servicio de tareas
    const API_BASE_URL = "https://task-service-5dmf.onrender.com/api/tasks";

    // Obtener todas las tareas
    const fetchTasks = async () => {
        setLoading(true);
        setError("");
        try {
            const token = Cookies.get('token');

            if (!token) {
                setError("No hay sesión activa. Por favor inicia sesión.");
                navigate('/');
                return;
            }

            const res = await axios.get(`${API_BASE_URL}/tasks`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Tu backend devuelve { data: [...] }
            const tasksData = res.data.data || res.data || [];
            setTasks(tasksData);
        } catch (err: any) {
            console.error("Error al cargar tareas:", err);
            if (err.response?.status === 401 || err.response?.status === 403) {
                setError("No autorizado. Por favor inicia sesión.");
                Cookies.remove('token');
                navigate('/');
            } else {
                setError("Error al cargar las tareas. Verifica que el servicio esté activo.");
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, []);

    
    const updateTaskStatus = async (id: string, newStatus: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED') => {
        try {
            const token = Cookies.get('token');
            await axios.put(
                `${API_BASE_URL}/${id}/status`,
                { status: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            fetchTasks();
        } catch (err) {
            console.error("Error al actualizar estado:", err);
            alert("No se pudo actualizar el estado de la tarea");
        }
    };

    
    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.title.trim() || !formData.documentId.trim() || !formData.assignedUserId.trim()) {
            setError("Por favor completa todos los campos obligatorios");
            return;
        }

        try {
            const token = Cookies.get('token');
            await axios.post(
                API_BASE_URL,
                {
                    ...formData,
                    dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : new Date().toISOString()
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setShowModal(false);
            resetForm();
            fetchTasks();
            setError("");
        } catch (err: any) {
            console.error("Error al crear tarea:", err);
            setError("Error al crear la tarea");
        }
    };

    
    const handleUpdateTask = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!editingTask) return;

        try {
            const token = Cookies.get('token');
            const updateData: any = {};

            if (formData.title !== editingTask.title) updateData.title = formData.title;
            if (formData.description !== editingTask.description) updateData.description = formData.description;
            if (formData.priority !== editingTask.priority) updateData.priority = formData.priority;
            if (formData.assignedUserId !== editingTask.assignedUserId) updateData.assignedUserId = formData.assignedUserId;
            if (formData.dueDate) updateData.dueDate = new Date(formData.dueDate).toISOString();

            await axios.patch(
                `${API_BASE_URL}/${editingTask.id}`,
                updateData,
                { headers: { Authorization: `Bearer ${token}` } }
            );

            setShowModal(false);
            setEditingTask(null);
            resetForm();
            fetchTasks();
            setError("");
        } catch (err: any) {
            console.error("Error al actualizar tarea:", err);
            setError("Error al actualizar la tarea");
        }
    };

    
    const handleDeleteTask = async (id: string) => {
        if (!window.confirm("¿Estás seguro de eliminar esta tarea?")) return;

        try {
            const token = Cookies.get('token');
            await axios.delete(`${API_BASE_URL}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            fetchTasks();
        } catch (err) {
            console.error("Error al eliminar tarea:", err);
            alert("Error al eliminar la tarea");
        }
    };

    
    const openCreateModal = () => {
        resetForm();
        setEditingTask(null);
        setShowModal(true);
    };

    
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
        setFormData({
            documentId: "",
            title: "",
            description: "",
            status: "PENDING",
            priority: "MEDIUM",
            assignedUserId: "",
            dueDate: ""
        });
        setError("");
    };

    
    const getTasksByStatus = (status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED'): Task[] =>
        tasks.filter((t) => t.status === status && t.active);

    
    const getPriorityColor = (priority: 'HIGH' | 'MEDIUM' | 'LOW'): string => {
        if (priority === 'HIGH') return 'red';
        if (priority === 'MEDIUM') return 'orange';
        return 'green';
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('usuario');
        navigate('/');
    };

    return (
        <div className="board-container">
            <header className="board-header">
                <div>
                    <h1>📋 Tablero de Tareas - InsightFlow</h1>
                    <p className="header-subtitle">Gestiona tus tareas de forma eficiente</p>
                </div>
                <div className="header-actions">
                    <button className="create-btn" onClick={openCreateModal}>
                        + Nueva Tarea
                    </button>
                    <button className="logout-btn" onClick={handleLogout}>
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Cargando tablero...</p>
                </div>
            ) : (
                <div className="kanban-board">
                    {/* Columna Pendientes */}
                    <div className="kanban-column">
                        <div className="column-header pending-header">
                            <h3 className="column-title">📝 Pendientes</h3>
                            <span className="task-count">{getTasksByStatus('PENDING').length}</span>
                        </div>
                        <div className="task-list">
                            {getTasksByStatus('PENDING').length === 0 ? (
                                <div className="empty-column">No hay tareas pendientes</div>
                            ) : (
                                getTasksByStatus('PENDING').map(task => (
                                    <div key={task.id} className="task-card">
                                        <div className="task-card-header">
                                            <div className={`priority-tag ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </div>
                                            <button
                                                className="task-menu-btn"
                                                onClick={() => openEditModal(task)}
                                                title="Editar tarea"
                                            >
                                                ⋮
                                            </button>
                                        </div>
                                        <h4 className="task-title">{task.title}</h4>
                                        <p className="task-description">{task.description}</p>
                                        <div className="task-meta">
                                            <span className="task-user">👤 {task.assignedUserId}</span>
                                            {task.dueDate && (
                                                <span className="task-date">
                                                    📅 {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="card-actions">
                                            <button
                                                className="action-btn start-btn"
                                                onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                                            >
                                                ▶ Iniciar
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Columna En Progreso */}
                    <div className="kanban-column">
                        <div className="column-header progress-header">
                            <h3 className="column-title">⚡ En Progreso</h3>
                            <span className="task-count">{getTasksByStatus('IN_PROGRESS').length}</span>
                        </div>
                        <div className="task-list">
                            {getTasksByStatus('IN_PROGRESS').length === 0 ? (
                                <div className="empty-column">No hay tareas en progreso</div>
                            ) : (
                                getTasksByStatus('IN_PROGRESS').map(task => (
                                    <div key={task.id} className="task-card in-progress-card">
                                        <div className="task-card-header">
                                            <div className={`priority-tag ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </div>
                                            <button
                                                className="task-menu-btn"
                                                onClick={() => openEditModal(task)}
                                                title="Editar tarea"
                                            >
                                                ⋮
                                            </button>
                                        </div>
                                        <h4 className="task-title">{task.title}</h4>
                                        <p className="task-description">{task.description}</p>
                                        <div className="task-meta">
                                            <span className="task-user">👤 {task.assignedUserId}</span>
                                            {task.dueDate && (
                                                <span className="task-date">
                                                    📅 {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <div className="card-actions">
                                            <button
                                                className="action-btn back-btn"
                                                onClick={() => updateTaskStatus(task.id, 'PENDING')}
                                            >
                                                ◀
                                            </button>
                                            <button
                                                className="action-btn complete-btn"
                                                onClick={() => updateTaskStatus(task.id, 'COMPLETED')}
                                            >
                                                ✓ Completar
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Columna Completadas */}
                    <div className="kanban-column">
                        <div className="column-header completed-header">
                            <h3 className="column-title">✅ Completadas</h3>
                            <span className="task-count">{getTasksByStatus('COMPLETED').length}</span>
                        </div>
                        <div className="task-list">
                            {getTasksByStatus('COMPLETED').length === 0 ? (
                                <div className="empty-column">No hay tareas completadas</div>
                            ) : (
                                getTasksByStatus('COMPLETED').map(task => (
                                    <div key={task.id} className="task-card completed-card">
                                        <div className="task-card-header">
                                            <span className="check-icon">✓</span>
                                            <button
                                                className="task-menu-btn"
                                                onClick={() => openEditModal(task)}
                                                title="Editar tarea"
                                            >
                                                ⋮
                                            </button>
                                        </div>
                                        <h4 className="task-title completed-title">{task.title}</h4>
                                        <p className="task-description">{task.description}</p>
                                        <div className="task-meta">
                                            <span className="task-user">👤 {task.assignedUserId}</span>
                                        </div>
                                        <div className="card-actions">
                                            <button
                                                className="action-btn reopen-btn"
                                                onClick={() => updateTaskStatus(task.id, 'IN_PROGRESS')}
                                            >
                                                ↺ Reabrir
                                            </button>
                                            <button
                                                className="action-btn delete-btn"
                                                onClick={() => handleDeleteTask(task.id)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal para crear/editar tarea */}
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

                            <div className="form-group">
                                <label htmlFor="title">Título *</label>
                                <input
                                    type="text"
                                    id="title"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    placeholder="Implementar nueva funcionalidad"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Descripción</label>
                                <textarea
                                    id="description"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={3}
                                    placeholder="Describe los detalles de la tarea..."
                                />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="priority">Prioridad</label>
                                    <select
                                        id="priority"
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                                    >
                                        <option value="LOW">Baja</option>
                                        <option value="MEDIUM">Media</option>
                                        <option value="HIGH">Alta</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="status">Estado</label>
                                    <select
                                        id="status"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                        disabled={!editingTask}
                                    >
                                        <option value="PENDING">Pendiente</option>
                                        <option value="IN_PROGRESS">En Progreso</option>
                                        <option value="COMPLETED">Completado</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="assignedUserId">Usuario Asignado *</label>
                                <input
                                    type="text"
                                    id="assignedUserId"
                                    value={formData.assignedUserId}
                                    onChange={(e) => setFormData({ ...formData, assignedUserId: e.target.value })}
                                    required
                                    placeholder="user-001"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dueDate">Fecha de Vencimiento</label>
                                <input
                                    type="date"
                                    id="dueDate"
                                    value={formData.dueDate}
                                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="save-btn">
                                    {editingTask ? "💾 Guardar Cambios" : "➕ Crear Tarea"}
                                </button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingTask(null);
                                        resetForm();
                                    }}
                                >
                                    ✖ Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}