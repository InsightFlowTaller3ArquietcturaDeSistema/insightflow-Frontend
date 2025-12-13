import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";

interface Document {
    id: string;
    workspace_id: string;
    title: string;
    icon: string;
    content: {
        blocks: Array<{
            id: string;
            type: string;
            content: string;
        }>;
    };
    created_by: string;
    created_at: string;
    updated_at: string;
    deleted: boolean;
}

export default function DocumentsView() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Document | null>(null);
    
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        workspace_id: "",
        title: "",
        icon: "document",
        content: { blocks: [] as Array<{ id: string; type: string; content: string }> },
        created_by: ""
    });

    const API_BASE_URL = "https://insightflow-documents-drw9.onrender.com/documents";

    // Cargar documentos
    const fetchDocuments = async () => {
        setLoading(true);
        setError("");
        try {
            const res = await axios.get(API_BASE_URL);

            const docsData = res.data.documents || [];
            setDocuments(Array.isArray(docsData) ? docsData : []);
            
        } catch (err: any) {
            console.error("Error al cargar documentos:", err);
            setError("Error al conectar con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, []);

    // Crear documento
    const handleCreateDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim() || !formData.workspace_id.trim()) {
            setError("Completa los campos obligatorios");
            return;
        }
        try {
            await axios.post(API_BASE_URL, formData);
            setShowModal(false);
            resetForm();
            fetchDocuments();
        } catch (err) {
            setError("Error al crear documento");
        }
    };

    // Actualizar documento
    const handleUpdateDocument = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingDocument) return;
        try {
            const updateData: any = {};
            if (formData.title !== editingDocument.title) updateData.title = formData.title;
            if (formData.icon !== editingDocument.icon) updateData.icon = formData.icon;

            await axios.patch(`${API_BASE_URL}/${editingDocument.id}`, updateData);
            setShowModal(false);
            setEditingDocument(null);
            resetForm();
            fetchDocuments();
        } catch (err) {
            setError("Error al actualizar");
        }
    };

    // Eliminar documento
    const handleDeleteDocument = async (id: string) => {
        if (!window.confirm("¿Eliminar documento?")) return;
        try {
            await axios.delete(`${API_BASE_URL}/${id}`);
            fetchDocuments();
        } catch (err) {
            alert("Error al eliminar");
        }
    };

    const openCreateModal = () => {
        resetForm();
        setEditingDocument(null);
        setShowModal(true);
    };

    const openEditModal = (doc: Document) => {
        setEditingDocument(doc);
        setFormData({
            workspace_id: doc.workspace_id,
            title: doc.title,
            icon: doc.icon,
            content: doc.content,
            created_by: doc.created_by
        });
        setShowModal(true);
    };

    const resetForm = () => {
        setFormData({
            workspace_id: "",
            title: "",
            icon: "document",
            content: { blocks: [] },
            created_by: ""
        });
        setError("");
    };

    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('usuario');
        navigate('/');
    };

    return (
        <div style={{ padding: '20px' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
                <div>
                    <h1>Documentos - InsightFlow</h1>
                    <p>Gestiona tus documentos</p>
                </div>
                <div>
                    <button onClick={openCreateModal} style={{ marginRight: '10px', padding: '10px 20px', background: '#ff6b35', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>+ Nuevo Documento</button>
                </div>
            </header>

            {error && <div style={{ color: 'red', marginBottom: '20px', padding: '10px', background: '#ffe0e0', borderRadius: '5px' }}>{error}</div>}

            {loading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Cargando documentos...</div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
                    {documents.map(doc => (
                        <div key={doc.id} style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            <h3 style={{ margin: '0 0 10px 0', fontSize: '18px' }}>{doc.icon} {doc.title}</h3>
                            <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>Workspace: {doc.workspace_id}</p>
                            <p style={{ fontSize: '14px', color: '#666', margin: '5px 0' }}>Bloques: {doc.content.blocks.length}</p>
                            <p style={{ fontSize: '12px', color: '#999', margin: '5px 0' }}>Creado: {new Date(doc.created_at).toLocaleDateString()}</p>
                            <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
                                <button onClick={() => openEditModal(doc)} style={{ padding: '8px 16px', background: '#4a90e2', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Editar</button>
                                <button onClick={() => handleDeleteDocument(doc.id)} style={{ padding: '8px 16px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Eliminar</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ background: 'white', padding: '30px', borderRadius: '8px', width: '500px', maxHeight: '90vh', overflow: 'auto' }}>
                        <h2 style={{ marginTop: 0 }}>{editingDocument ? "Editar Documento" : "Nuevo Documento"}</h2>
                        <form onSubmit={editingDocument ? handleUpdateDocument : handleCreateDocument}>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Workspace ID *</label>
                                <input
                                    type="text"
                                    value={formData.workspace_id}
                                    onChange={(e) => setFormData({ ...formData, workspace_id: e.target.value })}
                                    required
                                    disabled={!!editingDocument}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    placeholder="workspace-123"
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Titulo *</label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    required
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    placeholder="Mi Documento"
                                />
                            </div>
                            <div style={{ marginBottom: '15px' }}>
                                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Icono</label>
                                <input
                                    type="text"
                                    value={formData.icon}
                                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                    placeholder="📄"
                                />
                            </div>
                            {!editingDocument && (
                                <div style={{ marginBottom: '15px' }}>
                                    <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Creado por *</label>
                                    <input
                                        type="text"
                                        value={formData.created_by}
                                        onChange={(e) => setFormData({ ...formData, created_by: e.target.value })}
                                        required
                                        style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                                        placeholder="user-001"
                                    />
                                </div>
                            )}
                            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
                                <button type="submit" style={{ flex: 1, padding: '10px', background: '#27ae60', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    {editingDocument ? "Guardar" : "Crear"}
                                </button>
                                <button type="button" onClick={() => { setShowModal(false); setEditingDocument(null); resetForm(); }} style={{ flex: 1, padding: '10px', background: '#95a5a6', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
                                    Cancelar
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}