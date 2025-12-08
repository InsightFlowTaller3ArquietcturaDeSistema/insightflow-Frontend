import { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import "../css/crudUsuario.css";

interface Usuario {
    id: string;
    nombre_completo: string;
    apellidos?: string;
    correo: string;
    usuario: string;
    fecha_nacimiento: string;
    telefono?: string;
    direccion?: string;
    estado: string;
}

export default function CrudUsuarios() {
    const [usuarios, setUsuarios] = useState<Usuario[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [editingUser, setEditingUser] = useState<Usuario | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [searchId, setSearchId] = useState("");
    const [searchResult, setSearchResult] = useState<Usuario | null>(null);
    const [isSearching, setIsSearching] = useState(false);
    const navigate = useNavigate();

    // Formulario para editar
    const [formData, setFormData] = useState({
        nombre_completo: "",
        correo: "",
        usuario: "",
        contrasenia: "",
        fecha_nacimiento: "",
        telefono: "",
        direccion: ""
    });

    // Obtener todos los usuarios
    const fetchUsuarios = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('token');

            if (!token) {
                setError("No hay sesión activa. Por favor inicia sesión.");
                navigate('/');
                return;
            }

            const res = await axios.get("https://user-services-13hx.onrender.com/usuario/users", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            // El backend devuelve { data: [...] }
            setUsuarios(res.data.data || res.data);
            setError("");
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                setError("No autorizado. Por favor inicia sesión.");
                Cookies.remove('token');
                Cookies.remove('usuario');
                navigate('/');
            } else {
                setError("Error al cargar los usuarios");
                console.error("Error details:", error.response?.data);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsuarios();
    }, []);

    // Buscar usuario por ID
    const handleSearchById = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!searchId.trim()) {
            setError("Por favor ingresa un ID para buscar");
            return;
        }

        setIsSearching(true);
        setLoading(true);

        try {
            const token = Cookies.get('token');

            if (!token) {
                setError("No hay sesión activa. Por favor inicia sesión.");
                navigate('/');
                return;
            }

            const res = await axios.get(`https://user-services-13hx.onrender.com/usuario/users/${searchId}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            // Mostrar solo el usuario buscado
            setSearchResult(res.data.data || res.data);
            setUsuarios([res.data.data || res.data]);
            setError("");
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                setError("No autorizado. Por favor inicia sesión.");
                Cookies.remove('token');
                Cookies.remove('usuario');
                navigate('/');
            } else if (error.response?.status === 404) {
                setError("Usuario no encontrado con ese ID");
                setSearchResult(null);
                setUsuarios([]);
            } else {
                setError("Error al buscar el usuario");
                console.error("Error details:", error.response?.data);
            }
        } finally {
            setLoading(false);
        }
    };

    // Limpiar búsqueda y mostrar todos los usuarios
    const handleClearSearch = () => {
        setSearchId("");
        setSearchResult(null);
        setIsSearching(false);
        setError("");
        fetchUsuarios();
    };

    // Eliminar usuario
    const handleDelete = async (id: string) => {
        if (!window.confirm("¿Estás seguro de eliminar este usuario?")) return;

        try {
            const token = Cookies.get('token');

            if (!token) {
                setError("No hay sesión activa. Por favor inicia sesión.");
                navigate('/');
                return;
            }

            await axios.delete(`https://user-services-13hx.onrender.com/usuario/users/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            fetchUsuarios();
            setError("");
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                setError("No autorizado. Por favor inicia sesión.");
                Cookies.remove('token');
                Cookies.remove('usuario');
                navigate('/');
            } else {
                setError("Error al eliminar el usuario");
                console.error("Error details:", error.response?.data);
            }
        }
    };

    // Abrir modal para editar
    const handleEdit = (usuario: Usuario) => {
        setEditingUser(usuario);
        setFormData({
            nombre_completo: usuario.nombre_completo,
            correo: usuario.correo,
            usuario: usuario.usuario,
            contrasenia: "",
            fecha_nacimiento: usuario.fecha_nacimiento,
            telefono: usuario.telefono || "",
            direccion: usuario.direccion || ""
        });
        setShowModal(true);
    };

    // Actualizar usuario
    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validar extensión del correo si se está modificando
        if (formData.correo && !formData.correo.endsWith("@insightflow.cl")) {
            setError("El correo debe tener la extensión @insightflow.cl");
            return;
        }

        // Construir objeto con solo los campos MODIFICADOS (actualización parcial)
        const updatedFields: any = {};

        // Solo agregar campos que realmente cambiaron
        if (formData.nombre_completo && formData.nombre_completo.trim() !== "" &&
            formData.nombre_completo !== editingUser?.nombre_completo) {
            updatedFields.nombre_completo = formData.nombre_completo;
        }
        if (formData.correo && formData.correo.trim() !== "" &&
            formData.correo !== editingUser?.correo) {
            updatedFields.correo = formData.correo;
        }
        if (formData.usuario && formData.usuario.trim() !== "" &&
            formData.usuario !== editingUser?.usuario) {
            updatedFields.usuario = formData.usuario;
        }
        // La contraseña siempre se envía si está presente (porque no guardamos la contraseña original)
        if (formData.contrasenia && formData.contrasenia.trim() !== "") {
            updatedFields.contrasenia = formData.contrasenia;
        }
        if (formData.fecha_nacimiento && formData.fecha_nacimiento.trim() !== "" &&
            formData.fecha_nacimiento !== editingUser?.fecha_nacimiento) {
            updatedFields.fecha_nacimiento = formData.fecha_nacimiento;
        }
        if (formData.telefono && formData.telefono.trim() !== "" &&
            formData.telefono !== (editingUser?.telefono || "")) {
            updatedFields.telefono = formData.telefono;
        }
        if (formData.direccion && formData.direccion.trim() !== "" &&
            formData.direccion !== (editingUser?.direccion || "")) {
            updatedFields.direccion = formData.direccion;
        }

        // Si no hay cambios
        if (Object.keys(updatedFields).length === 0) {
            setError("No se detectaron cambios en los campos");
            return;
        }

        try {
            const token = Cookies.get('token');

            if (!token) {
                setError("No hay sesión activa. Por favor inicia sesión.");
                navigate('/');
                return;
            }

            await axios.patch(
                `https://user-services-13hx.onrender.com/usuario/users/${editingUser?.id}`,
                updatedFields,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            setShowModal(false);
            setEditingUser(null);
            fetchUsuarios();
            setError("");
        } catch (error: any) {
            if (error.response?.status === 401 || error.response?.status === 403) {
                setError("No autorizado. Por favor inicia sesión.");
                Cookies.remove('token');
                Cookies.remove('usuario');
                navigate('/');
            } else if (error.response?.status === 400) {
                // Mostrar el mensaje específico del backend
                const backendMessage = error.response?.data?.message;
                setError(backendMessage || "Error al actualizar. Verifica los datos ingresados.");
            } else {
                setError("Error al actualizar el usuario");
                console.error("Error details:", error.response?.data);
            }
        }
    };

    // Cerrar sesi�n
    const handleLogout = () => {
        Cookies.remove('token');
        Cookies.remove('usuario');
        navigate('/');
    };

    return (
        <div className="crud-container">
            <div className="crud-header">
                <h1>Gestión de Usuarios</h1>
                <button className="logout-btn" onClick={handleLogout}>
                    Cerrar Sesión
                </button>
            </div>

            {/* Barra de búsqueda por ID */}
            <div className="search-container">
                <form onSubmit={handleSearchById} className="search-form">
                    <input
                        type="text"
                        placeholder="Buscar usuario por ID"
                        value={searchId}
                        onChange={(e) => setSearchId(e.target.value)}
                        className="search-input"
                    />
                    <button type="submit" className="search-btn">Buscar</button>
                    {isSearching && (
                        <button type="button" className="clear-btn" onClick={handleClearSearch}>
                            Mostrar Todos
                        </button>
                    )}
                </form>
            </div>

            {error && <p className="error-message">{error}</p>}

            {loading ? (
                <p>Cargando usuarios...</p>
            ) : (
                <div className="table-container">
                    <table className="users-table">
                        <thead>
                            <tr>
                                <th>Nombre Completo</th>
                                <th>Correo</th>
                                <th>Usuario</th>
                                <th>Fecha Nacimiento</th>
                                <th>Estado</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {usuarios.map((usuario) => (
                                <tr key={usuario.id}>
                                    <td>{usuario.nombre_completo}</td>
                                    <td>{usuario.correo}</td>
                                    <td>{usuario.usuario}</td>
                                    <td>{usuario.fecha_nacimiento}</td>
                                    <td>
                                        <span className={`estado-badge ${usuario.estado === 'activo' ? 'estado-activo' : 'estado-inactivo'}`}>
                                            {usuario.estado}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            className="edit-btn"
                                            onClick={() => handleEdit(usuario)}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            type="button"
                                            className="delete-btn"
                                            onClick={() => handleDelete(usuario.id)}
                                        >
                                            Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal para editar */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <h2>Editar Usuario</h2>
                        <form onSubmit={handleUpdate}>
                            <div className="form-group">
                                <label htmlFor="nombre_completo">Nombre Completo</label>
                                <input
                                    type="text"
                                    id="nombre_completo"
                                    value={formData.nombre_completo}
                                    onChange={(e) => setFormData({ ...formData, nombre_completo: e.target.value })}
                                    placeholder="Dejar vacío para no modificar"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="correo">Correo Electrónico</label>
                                <input
                                    type="email"
                                    id="correo"
                                    value={formData.correo}
                                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                                    placeholder="Dejar vacío para no modificar"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="usuario">Usuario</label>
                                <input
                                    type="text"
                                    id="usuario"
                                    value={formData.usuario}
                                    onChange={(e) => setFormData({ ...formData, usuario: e.target.value })}
                                    placeholder="Dejar vacío para no modificar"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="contrasenia">Contraseña</label>
                                <input
                                    type="password"
                                    id="contrasenia"
                                    value={formData.contrasenia}
                                    onChange={(e) => setFormData({ ...formData, contrasenia: e.target.value })}
                                    placeholder="Dejar vacío para no modificar"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                                <input
                                    type="date"
                                    id="fecha_nacimiento"
                                    value={formData.fecha_nacimiento}
                                    onChange={(e) => setFormData({ ...formData, fecha_nacimiento: e.target.value })}
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="telefono">Teléfono</label>
                                <input
                                    type="tel"
                                    id="telefono"
                                    value={formData.telefono}
                                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                                    placeholder="+56 9 3749 5862"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="direccion">Dirección</label>
                                <input
                                    type="text"
                                    id="direccion"
                                    value={formData.direccion}
                                    onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                                    placeholder="Dejar vacío para no modificar"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="save-btn">Guardar</button>
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setShowModal(false);
                                        setEditingUser(null);
                                        setError("");
                                    }}
                                >
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
