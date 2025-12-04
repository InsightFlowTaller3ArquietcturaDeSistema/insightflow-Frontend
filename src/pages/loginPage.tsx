import {useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import "../css/loginCss.css";
import insightflowImg from "../assets/insightflow.png";

export default function Login(){
    const [usuario,setUsuario] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const [loading, setLoading] = useState(false);
    const [error,setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        try{
            const res = await axios.post("http://localhost:3000/usuario/login",{
                usuario,
                contrasenia
            });
            Cookies.set('token',res.data.token);
            Cookies.set('usuario', res.data.usuario);
            navigate('/dashboardUsuario');
        }catch(error){
            setError("Credenciales incorrectas");
        }
    }
    return(
        <div className="container">
            <div className="left">
                <div className="Imagen">
                    <img src={insightflowImg} alt="Imagen" />
                </div>
            </div>

            <div className="right">

                <div className="Formulario">
                    <h2>Iniciar Sesión</h2>
                    <form onSubmit={handleLogin}>
                        <input
                            type="text"
                            placeholder="Usuario"
                            value={usuario}
                            onChange={(e) => setUsuario(e.target.value)}
                            required
                        />
                        <input
                            type="password"
                            placeholder="Contraseña"
                            value={contrasenia}
                            onChange={(e) => setContrasenia(e.target.value)}
                            required
                        />
                        <button type="submit" disabled={loading}>
                            {loading ? "Cargando..." : "Ingresar"}
                        </button>
                        {error && <p className="error">{error}</p>}
                    </form>
                    <button type="button" className="register-btn" onClick={() => navigate('/register')}>
                        Registrar
                    </button>
                </div>

            </div>
        </div>

    )
}