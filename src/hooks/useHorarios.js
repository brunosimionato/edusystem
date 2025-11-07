// src/hooks/useHorarios.js - NOVO
import { useState, useEffect, useCallback } from 'react';
import HorarioService from '../Services/HorarioService';

export const useHorarios = (filters = {}) => {
    const [horarios, setHorarios] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchHorarios = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await HorarioService.getAll(filters);
            setHorarios(data);
        } catch (err) {
            setError(err.message);
            console.error("Erro ao carregar horários:", err);
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(filters)]);

    const createHorario = useCallback(async (horarioData) => {
        try {
            // Verificar conflito antes de criar
            const hasConflito = await HorarioService.hasConflito(horarioData);
            if (hasConflito) {
                throw new Error('Conflito de horário detectado');
            }

            const novoHorario = await HorarioService.create(horarioData);
            setHorarios(prev => [...prev, novoHorario]);
            return novoHorario;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const updateHorario = useCallback(async (id, updateData) => {
        try {
            // Verificar conflito antes de atualizar
            const hasConflito = await HorarioService.hasConflito({
                ...updateData,
                id
            });
            if (hasConflito) {
                throw new Error('Conflito de horário detectado');
            }

            const horarioAtualizado = await HorarioService.update(id, updateData);
            setHorarios(prev => prev.map(horario => 
                horario.id === id ? horarioAtualizado : horario
            ));
            return horarioAtualizado;
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const deleteHorario = useCallback(async (id) => {
        try {
            await HorarioService.delete(id);
            setHorarios(prev => prev.filter(horario => horario.id !== id));
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    const getGradeHorarios = useCallback(async (turmaId) => {
        try {
            return await HorarioService.getGradeHorarios(turmaId);
        } catch (err) {
            setError(err.message);
            throw err;
        }
    }, []);

    useEffect(() => {
        fetchHorarios();
    }, [fetchHorarios]);

    return {
        horarios,
        isLoading,
        error,
        refetch: fetchHorarios,
        createHorario,
        updateHorario,
        deleteHorario,
        getGradeHorarios
    };
};

// Hook específico para horários por turma
export const useHorariosPorTurma = (turmaId) => {
    const filters = { idTurma: turmaId };
    return useHorarios(filters);
};

// Hook específico para horários por professor
export const useHorariosPorProfessor = (professorId) => {
    const filters = { idProfessor: professorId };
    return useHorarios(filters);
};