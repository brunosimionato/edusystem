import { useState, useEffect, useCallback } from 'react';
import { API_URL } from '../utils/env.js';

export const useProfessores = () => {
    const [professores, setProfessores] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProfessores = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/professores`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                throw new Error(`Erro ${response.status}: ${response.statusText}`);
            }

            const professoresData = await response.json();
            setProfessores(professoresData);
        } catch (err) {
            setError(err.message);
            console.error("Erro ao carregar professores:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProfessores();
    }, [fetchProfessores]);

    return {
        professores,
        isLoading,
        error,
        refetch: fetchProfessores,
    };
};