import { useState, useEffect, useCallback } from 'react';

import TurmaService from '../Services/TurmaService';

export const useTurmas = ({ withAlunos } = { withAlunos: false }) => {
    const [turmas, setTurmas] = useState([]);

    const [isLoading, setIsLoading] = useState(false);
    const [hasError, setHasError] = useState(false);

    const refetch = useCallback(async () => {
        setIsLoading(true);
        setHasError(false);
        try {
            const list = await TurmaService.list({ withAlunos });
            setTurmas(list);
        } catch (error) {
            setHasError(true);
            console.error("Erro ao buscar turmas:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refetch();
    }, [refetch]);

    return {
        turmas,
        isLoading,
        hasError,
        refetch,
    }
}