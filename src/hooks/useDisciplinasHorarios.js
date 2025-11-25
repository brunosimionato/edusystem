// src/hooks/useDisciplinas.js
import { useState, useEffect, useCallback } from 'react';
import DisciplinaService from '../Services/DisciplinaService';

export const useDisciplinas = () => {
    const [disciplinas, setDisciplinas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDisciplinas = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const disciplinasData = await DisciplinaService.getAll();
            console.log('✅ Disciplinas carregadas:', disciplinasData);
            setDisciplinas(disciplinasData);
        } catch (err) {
            setError(err.message);
            console.error("Erro ao carregar disciplinas:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchDisciplinas();
    }, [fetchDisciplinas]);

    return {
        disciplinas,
        isLoading,
        error,
        refetch: fetchDisciplinas,
    };
};