import React, { createContext, useState, useContext, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
    const [userRole, setUserRole] = useState(localStorage.getItem('userRole'));
    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (authToken) {
            try {
                const decoded = jwtDecode(authToken);

                setUser({
                    id: decoded.usuario?.id,
                    nome: decoded.usuario?.nome,
                    email: decoded.usuario?.email,
                    role: decoded.usuario?.tipo_usuario,
                });

                if (!userRole && decoded.usuario?.tipo_usuario) {
                    setUserRole(decoded.usuario.tipo_usuario);
                    localStorage.setItem('userRole', decoded.usuario.tipo_usuario);
                }
            } catch (error) {
                console.error('Erro ao decodificar token:', error);
                logout();
            }
        }
        setIsLoading(false);
    }, [authToken, userRole]);

    const login = (token, role) => {
        setAuthToken(token);
        setUserRole(role);
        localStorage.setItem('token', token);
        localStorage.setItem('userRole', role);
    };

    const logout = () => {
        setAuthToken(null);
        setUserRole(null);
        setUser(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        
        window.location.href = '/';
    };

    const value = {
        authToken,
        userRole,
        user,
        login,
        logout,
        isLoading,
        isAuthenticated: !!authToken
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};