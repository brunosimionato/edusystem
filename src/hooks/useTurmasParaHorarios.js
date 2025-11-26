import { useState, useEffect, useCallback } from 'react';
import TurmaService from '../Services/TurmaService';

export const useTurmasParaHorarios = () => {
    const [turmas, setTurmas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchTurmas = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const turmasData = await TurmaService.list({ withAlunos: false });
            console.log('✅ Turmas carregadas para horários:', turmasData);
            setTurmas(turmasData);
        } catch (err) {
            setError(err.message);
            console.error("Erro ao carregar turmas para horários:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTurmas();
    }, [fetchTurmas]);

    return {
        turmas,
        isLoading,
        error,
        refetch: fetchTurmas,
    };
};