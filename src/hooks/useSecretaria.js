import { useState, useEffect, useCallback } from 'react';
import SecretariaService from '../Services/SecretariaService';

export const useSecretarias = () => {
    const [secretarias, setSecretarias] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchSecretarias = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await SecretariaService.getAll();
            setSecretarias(data);
        } catch (err) {
            setError(err.message);
            console.error("Erro ao carregar secretarias:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    const createSecretaria = useCallback(async (secretariaData) => {
        try {
            const novaSecretaria = await SecretariaService.create(secretariaData);
            setSecretarias(prev => [...prev, novaSecretaria]);
            return novaSecretaria;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const updateSecretaria = useCallback(async (id, updateData) => {
        try {
            const secretariaAtualizada = await SecretariaService.update(id, updateData);
            setSecretarias(prev => prev.map(secretaria => 
                secretaria.id === id ? secretariaAtualizada : secretaria
            ));
            return secretariaAtualizada;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteSecretaria = useCallback(async (id) => {
        try {
            await SecretariaService.delete(id);
            setSecretarias(prev => prev.filter(secretaria => secretaria.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchSecretarias();
    }, [fetchSecretarias]);

    return {
        secretarias,
        isLoading,
        error,
        refetch: fetchSecretarias,
        createSecretaria,
        updateSecretaria,
        deleteSecretaria
    };
};