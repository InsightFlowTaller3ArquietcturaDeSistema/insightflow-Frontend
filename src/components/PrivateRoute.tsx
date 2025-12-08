import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { PrivateRouteProps } from "../interfaces/types.ts";

/**
 * Manejador de rutas privadas que verifica la autenticación del usuario.
 * @param param0 propiedades del componente PrivateRoute
 * @returns JSX.Element
 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  /**
   * Verifica la autenticación del usuario al montar el componente
   */
  useEffect(() => {
    const verifyAuth = () => {
      try {
        // Verificar si existe el token en las cookies
        const token = document.cookie
          .split('; ')
          .find(row => row.startsWith('token='))
          ?.split('=')[1];

        if (token) {
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Error verificando autenticación:', error);
        setIsAuthenticated(false);
      }
    };

    verifyAuth();
  }, []);

  if (isAuthenticated === null) {
    return <div>Cargando...</div>;
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/" />;
}