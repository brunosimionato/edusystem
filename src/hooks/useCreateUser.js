import { useState } from 'react';
import AuthService from '../Services/AuthService';

export function useCreateUser() {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const createPublic = async (userData) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await AuthService.createUserPublic(userData);
            setData(response);
            return response;
        } catch (err) {
            const errorMessage = err.message || 'Erro ao criar usuário';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const create = async (userData, authToken) => {
        setIsLoading(true);
        setError(null);
        
        try {
            const response = await AuthService.createUser(userData, authToken);
            setData(response);
            return response;
        } catch (err) {
            const errorMessage = err.message || 'Erro ao criar usuário';
            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return {
        createPublic,
        create,     
        isLoading,
        error,
        data,
    };
}