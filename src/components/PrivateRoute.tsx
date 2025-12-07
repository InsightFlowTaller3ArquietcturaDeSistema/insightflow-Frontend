import { Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import type { PrivateRouteProps } from "../interfaces/types.ts";

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const response = await fetch('http://localhost:3000/usuario/auth/verify', {
          method: 'GET',
          credentials: 'include', // Importante: envía las cookies
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
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