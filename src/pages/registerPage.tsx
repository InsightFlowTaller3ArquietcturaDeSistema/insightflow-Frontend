import {useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import insightflowImg from "../assets/insightflow.png";
import "../css/registerCss.css"

/**
 * Componente de la página de registro de usuario.
 * @returns JSX.Element
 */
export default function Register(){
    const [nombre_completo,setNombre_completo]= useState("");
    const [apellidos,setApellidos] = useState("");
    const [correo,setCorreo] =useState("");
    const [usuario, setUsuario] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const [fecha_nacimiento,setFecha_nacimiento]=useState("");
    const [telefono,setTelefono]=useState("");
    const [direccion,setDireccion] = useState("");
    const [error,setError] = useState("");

    const navigate = useNavigate();
    /**
     * Maneja el registro del usuario cuando se envía el formulario.
     * @param e Evento de envío del formulario
     */
    const  handleRegister = async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();

        // Validar extensión del correo
        if (!correo.endsWith("@insightflow.cl")) {
            setError("El correo debe tener la extensión @insightflow.cl");
            return;
        }

        try{
            
            const res = await axios.post("https://user-services-13hx.onrender.com/usuario/users",{
                nombre_completo,
                apellidos,
                correo,
                usuario,
                contrasenia,
                fecha_nacimiento,
                telefono,
                direccion
            });
            navigate('/');
        }catch(error: any){
            if (error.response?.status === 400) {
                setError("Error en la creación del usuario. Verifica los datos ingresados.");
            } else {
                setError("Ocurrió un error al registrar el usuario. Intenta nuevamente.");
            }
        }
    }
    return (
        <div className="container">
            <div className="left">
                <div className="Imagen">
                    <img src={insightflowImg} alt="Imagen"/>
                </div>
            </div>
            
            <div className="right">

                <div className="Formulario">
                    <h2>Registro de Usuario</h2>
                    {error && <p className="error-message">{error}</p>}
                    <form onSubmit={handleRegister}>
                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="nombre">Nombre Completo</label>
                                <input type="text" id="nombre" name="nombre_completo" value={nombre_completo} onChange={(e) => setNombre_completo(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="apellido">Apellido</label>
                                <input type="text" id="apellido" name="apellido" value={apellidos} onChange={(e) => setApellidos(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="correo">Correo Electrónico</label>
                                <input type="email" id="correo" name="correo" value={correo} onChange={(e) => setCorreo(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="usuario">Usuario</label>
                                <input type="text" id="usuario" name="usuario" value={usuario} onChange={(e) => setUsuario(e.target.value)} required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="contrasenia">Contraseña</label>
                                <input type="password" id="contrasenia" name="contrasenia" value={contrasenia} onChange={(e) => setContrasenia(e.target.value)} required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="fecha_nacimiento">Fecha de Nacimiento</label>
                                <input type="date" id="fecha_nacimiento" name="fecha_nacimiento" value={fecha_nacimiento} onChange={(e) => setFecha_nacimiento(e.target.value)} max="2025-12-07" required />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="telefono">Teléfono</label>
                                <input type="tel" id="telefono" name="telefono" value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 9 3749 5862" pattern="\+56\s9\s\d{4}\s\d{4}" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="direccion">Dirección</label>
                                <input type="text" id="direccion" name="direccion" value={direccion} onChange={(e) => setDireccion(e.target.value)} required />
                            </div>
                        </div>

                        <button type="submit">Registrarse</button>
                    </form>
                </div>
                
            </div>
        </div>

    )
}