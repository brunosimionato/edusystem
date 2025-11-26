import { useState, useEffect, useCallback } from 'react';
import NotaService from '../Services/NotaService';

export const useNotas = (filters = {}) => {
    const [notas, setNotas] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchNotas = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await NotaService.getAll(filters);
            setNotas(data);
        } catch (err) {
            setError(err.message);
            console.error("Erro ao carregar notas:", err);
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(filters)]);

    const createNota = useCallback(async (notaData) => {
        try {
            const novaNota = await NotaService.create(notaData);
            setNotas(prev => [...prev, novaNota]);
            return novaNota;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const updateNota = useCallback(async (id, updateData) => {
        try {
            const notaAtualizada = await NotaService.update(id, updateData);
            setNotas(prev => prev.map(nota => 
                nota.id === id ? notaAtualizada : nota
            ));
            return notaAtualizada;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteNota = useCallback(async (id) => {
        try {
            await NotaService.delete(id);
            setNotas(prev => prev.filter(nota => nota.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const createMultipleNotas = useCallback(async (notasData) => {
        try {
            // Implementar criação em lote se o service tiver
            const promises = notasData.map(nota => NotaService.create(nota));
            const novasNotas = await Promise.all(promises);
            setNotas(prev => [...prev, ...novasNotas]);
            return novasNotas;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchNotas();
    }, [fetchNotas]);

    return {
        notas,
        isLoading,
        error,
        refetch: fetchNotas,
        createNota,
        updateNota,
        deleteNota,
        createMultipleNotas
    };
};

// Hook específico para notas por turma
export const useNotasPorTurma = (turmaId, anoLetivo, trimestre) => {
    const filters = { 
        idTurma: turmaId, 
        anoLetivo, 
        trimestre 
    };
    
    return useNotas(filters);
};

// Hook específico para notas por aluno
export const useNotasPorAluno = (alunoId, anoLetivo, trimestre) => {
    const filters = { 
        idAluno: alunoId, 
        anoLetivo, 
        trimestre 
    };
    
    return useNotas(filters);
};