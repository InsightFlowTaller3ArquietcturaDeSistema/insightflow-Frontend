import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../css/workspace.css";

interface Workspace {
    id: string;
    name: string;
    description?: string;
    theme?: string;
    icon: string;
    user_role: string;
    members?: Array<{
        user_id: string;
        user_name: string;
        role: string;
    }>;
}

export default function WorkspaceView() {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingWorkspace, setEditingWorkspace] = useState<Workspace | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        theme: "light",
        owner_name: ""
    });
    const [file, setFile] = useState<File | null>(null);

    // Use deployed URL
    const API_BASE_URL = "https://insightflow-workspace-service-fe4d.onrender.com/workspaces";

    const getAuthHeaders = (isMultipart = false) => {
        const userId = Cookies.get("userid");
        const headers: any = {
            "X-User-Id": userId || ""
        };
        if (!isMultipart) {
            headers["Content-Type"] = "application/json";
        }
        return { headers };
    };

    const fetchWorkspaces = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(API_BASE_URL, getAuthHeaders());
            setWorkspaces(res.data);
        } catch (err: any) {
            console.error("Error fetching workspaces:", err);
            setError("Error al cargar espacios de trabajo.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const userName = Cookies.get("usuario");
        if (userName) {
            setFormData(prev => ({ ...prev, owner_name: userName }));
        }
        fetchWorkspaces();
    }, []);

    const resetForm = () => {
        const userName = Cookies.get("usuario");
        setFormData({
            name: "",
            description: "",
            theme: "light",
            owner_name: userName || ""
        });
        setFile(null);
        setEditingWorkspace(null);
        setError("");
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!file) {
            setError("Please select an image file.");
            return;
        }
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("theme", formData.theme);
            data.append("owner_name", formData.owner_name);
            data.append("image", file);

            await axios.post(API_BASE_URL, data, getAuthHeaders(true));
            setShowModal(false);
            resetForm();
            fetchWorkspaces();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Error al crear espacio de trabajo");
        }
    };

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingWorkspace) return;
        try {
            const data = new FormData();
            data.append("name", formData.name);
            data.append("description", formData.description);
            data.append("theme", formData.theme);
            if (file) {
                data.append("image", file);
            }
            await axios.patch(`${API_BASE_URL}/${editingWorkspace.id}`, data, getAuthHeaders(true));
            setShowModal(false);
            resetForm();
            fetchWorkspaces();
        } catch (err: any) {
            setError(err.response?.data?.detail || "Error al actualizar espacio de trabajo");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("¿Estás seguro de eliminar este espacio de trabajo?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/${id}`, getAuthHeaders());
            fetchWorkspaces();
        } catch (err: any) {
            alert(err.response?.data?.detail || "Error al eliminar espacio de trabajo");
        }
    };

    const openEditModal = (workspace: Workspace) => {
        setEditingWorkspace(workspace);
        setFormData({
            name: workspace.name,
            description: workspace.description || "",
            theme: workspace.theme || "light",
            owner_name: formData.owner_name
        });
        setFile(null);
        setShowModal(true);
    };

    return (
        <div className="workspace-container">
            <div className="header-actions">
                <h1>Workspaces</h1>
                <button className="btn-primary" onClick={() => { resetForm(); setShowModal(true); }}>
                    + New Workspace
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <p>Cargando...</p>
            ) : (
                <div className="workspace-grid">
                    {workspaces.map((workspace) => (
                        <div key={workspace.id} className="workspace-card">
                            <div className="card-header">
                                <div className="workspace-icon">
                                    {workspace.icon && workspace.icon.startsWith("http") ? (
                                        <img src={workspace.icon} alt="icon" style={{width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px'}} />
                                    ) : (
                                        <span>{workspace.icon === "folder" ? "📁" : "🏢"}</span>
                                    )}
                                </div>
                                <div className="workspace-info">
                                    <h3>{workspace.name}</h3>
                                    <span className={`role-badge ${workspace.user_role === 'OWNER' ? 'owner' : ''}`}>
                                        {workspace.user_role}
                                    </span>
                                </div>
                            </div>

                            <div className="card-body">
                                <p className="workspace-desc">{workspace.description}</p>
                                <div className="workspace-meta">
                                    <span className="meta-item">🎨 {workspace.theme}</span>
                                    <div className="members-preview">
                                        <strong>👥 Miembros:</strong>
                                        <ul className="members-list-mini">
                                            {workspace.members?.map(m => (
                                                <li key={m.user_id}>
                                                    {m.user_name} <small>({m.role})</small>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="card-actions">
                                <button className="btn-action btn-edit" onClick={() => openEditModal(workspace)}>
                                    Editar
                                </button>
                                {workspace.user_role === 'OWNER' && (
                                    <button className="btn-action btn-delete" onClick={() => handleDelete(workspace.id)}>
                                        Eliminar
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>{editingWorkspace ? "Edit Workspace" : "New Workspace"}</h2>
                        <form onSubmit={editingWorkspace ? handleUpdate : handleCreate}>
                            <div className="form-group">
                                <label>Nombre</label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Descripción</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label>Tema</label>
                                <select
                                    value={formData.theme}
                                    onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                                >
                                    <option value="light">Claro</option>
                                    <option value="dark">Oscuro</option>
                                    <option value="blue">Azul</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Icono (Imagen)</label>
                                <input 
                                    type="file" 
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files && e.target.files[0]) {
                                            setFile(e.target.files[0]);
                                        }
                                    }}
                                    required={!editingWorkspace}
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                                    Cancelar
                                </button>
                                <button type="submit" className="btn-primary">
                                    {editingWorkspace ? "Guardar Cambios" : "Crear"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
