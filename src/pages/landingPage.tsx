import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation, Link } from "react-router-dom";
import Cookies from "js-cookie";
import "../css/landingCss.css";

/**
 * Componente de diseño del panel de control con barra lateral y contenido principal dinámico.
 * @returns JSX.Element
 */
export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState({ name: "", id: "" });

    /**
     * Verifica la autenticación del usuario al montar el componente
     * y obtiene la información del usuario desde las cookies.
     */
    useEffect(() => {
        const token = Cookies.get("token");
        
        if (!token) {
            navigate("/"); 
        } else {
            const user_name = Cookies.get("usuario");
            const user_id = Cookies.get("userid");
            
            setUser({ name: user_name || "", id: user_id || "" });
        }
    }, [navigate]);

    /**
     * Maneja el cierre de sesión del usuario
     */
    const handleLogout = () => {
        Cookies.remove("token");
        Cookies.remove("usuario");
        navigate("/");
    };

    /**
     * Marca si una ruta está activa
     * @param path ruta a verificar
     * @returns boolean indicando si la ruta está activa
     */
    const isActive = (path: string): boolean => location.pathname.includes(path);

    return (
        <div className="app-container">
            {/* SIDEBAR */}
            <aside className="sidebar">
                <div className="sidebar-header">
                    <span className="logo-icon">📋</span>
                    <h2>InsightFlow</h2>
                </div>

                <div className="user-profile-mini">
                    <div className="avatar-circle">
                        {user.name.charAt(0)}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user.name}</span>
                        <span className="user-id">{user.id}</span>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    <p className="nav-label">SERVICIOS</p>
                    
                    <Link to="/dashboard/tasks" className={`nav-item ${isActive('tasks') ? 'active' : ''}`}>
                        <span className="icon">✅</span>
                        Tablero de Tareas
                    </Link>

                    <Link to="/dashboard/Usuarios" className={`nav-item ${isActive('Usuarios') ? 'active' : ''}`}>
                        <span className="icon">👥</span>
                        Gestión de Usuarios
                    </Link>

                    {/* DOCUMENTS Y WORKSPACE SERVICES */}
                    <div className="nav-item disabled">
                        <span className="icon">📂</span>
                        Espacios
                    </div>
                </nav>

                <div className="sidebar-footer">
                    <button onClick={handleLogout} className="logout-btn">
                        <span className="icon">🚪</span> Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* CONTENIDO PRINCIPAL DINÁMICO */}
            <main className="main-content">
                {/* Aquí se renderizará CrudUsuarios o TaskBoard según la ruta */}
                <Outlet /> 
            </main>
        </div>
    );
}