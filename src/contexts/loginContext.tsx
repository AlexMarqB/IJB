import React, { createContext, useState, useContext, ReactNode } from 'react';
import { api } from '../api';
import { User } from '../@types';

interface AuthContextType {
    user: User | null;
    login: ({email, password}: LoginRequest) => Promise<LoginResponse>
    logout: () => void;
    navigate: (path: string) => void;
}

interface LoginRequest {
    email: string;
    password: string;
}

interface LoginResponse {
    success: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {

    const navigate = (path: string) => {
        window.location.href = path;
    }

    const [user, setUser] = useState<User | null>(null);

    const login = async ({ email, password }: LoginRequest): Promise<LoginResponse> => {
        try {
            const response = await api.get('/users'); // Faz a requisição para obter todos os usuários
            const user = response.data.find((u: User) => u.email === email && u.password === password);
            
            if (user) {
                setUser(user); // Armazena o usuário autenticado
                console.log("Login successful");
                navigate('/dashboard'); // Redireciona para o dashboard
                return { success: true };
            } else {
                console.error('Login failed: User not found or incorrect password');
                return { success: false };
            }
        } catch (error) {
            console.error('Login failed:', error);
            return { success: false };
        }
    };


    const logout = () => {
        setUser(null);
        navigate('/')
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, navigate}}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};