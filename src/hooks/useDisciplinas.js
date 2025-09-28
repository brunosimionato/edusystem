import { useState, useEffect, useCallback } from 'react';

import DisciplinaService from '../Services/DisciplinaService';

export const useDisciplinas = () => {
    const [disciplinas, setDisciplinas] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const list = await DisciplinaService.getAll();
            setDisciplinas(list);
        } catch (error) {
            setHasError(true);
            console.error("Erro ao buscar discpilinas:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return {
        disciplinas,
        isLoading,
        hasError,
        refetch,
    }
}