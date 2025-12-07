import {useState} from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import insightflowImg from "../assets/insightflow.png";

export default function Register(){
    const [usuario, setUsuario] = useState("");
    const [contrasenia, setContrasenia] = useState("");
    const [email,setEmail] = useState("");
    
}