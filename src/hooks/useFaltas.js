import { useState, useEffect, useCallback } from 'react';
import FaltaService from '../Services/FaltaService';

export const useFaltas = (filters = {}) => {
    const [faltas, setFaltas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchFaltas = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await FaltaService.getAll(filters);
            setFaltas(data);
        } catch (err) {
            setError(err.message);
            console.error("Erro ao carregar faltas:", err);
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(filters)]);

    const createFalta = useCallback(async (faltaData) => {
        try {
            const novaFalta = await FaltaService.create(faltaData);
            setFaltas(prev => [...prev, novaFalta]);
            return novaFalta;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const updateFalta = useCallback(async (id, updateData) => {
        try {
            const faltaAtualizada = await FaltaService.update(id, updateData);
            setFaltas(prev => prev.map(falta => 
                falta.id === id ? faltaAtualizada : falta
            ));
            return faltaAtualizada;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteFalta = useCallback(async (id) => {
        try {
            await FaltaService.delete(id);
            setFaltas(prev => prev.filter(falta => falta.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const createMultipleFaltas = useCallback(async (faltasData) => {
        try {
            const novasFaltas = await FaltaService.createMultiple(faltasData);
            setFaltas(prev => [...prev, ...novasFaltas]);
            return novasFaltas;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchFaltas();
    }, [fetchFaltas]);

    return {
        faltas,
        isLoading,
        error,
        refetch: fetchFaltas,
        createFalta,
        updateFalta,
        deleteFalta,
        createMultipleFaltas
    };
};

// Hook específico para faltas por turma em uma data
export const useFaltasPorTurma = (turmaId, data) => {
    const filters = { 
        idTurma: turmaId, 
        data 
    };
    
    return useFaltas(filters);
};

// Hook específico para faltas por aluno em um período
export const useFaltasPorAluno = (alunoId, dataInicio, dataFim) => {
    const filters = { 
        idAluno: alunoId,
        dataInicio,
        dataFim
    };
    
    return useFaltas(filters);
};