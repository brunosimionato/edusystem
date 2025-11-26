import { useState, useEffect, useCallback } from 'react';
import HorarioService from '../Services/HorarioService';

export const useHorarios = (filters = {}) => {
    const [horarios, setHorarios] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [usingMock, setUsingMock] = useState(false);

    const fetchHorarios = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            console.log('🔄 Buscando horários...');
            const data = await HorarioService.getAll(filters);
            setHorarios(data);
            setUsingMock(HorarioService.useMock);
            console.log(`✅ ${data.length} horários carregados (${HorarioService.useMock ? 'mock' : 'backend'})`);
        } catch (err) {
            setError(err.message);
            setUsingMock(HorarioService.useMock);
            console.error("Erro ao carregar horários:", err);
        } finally {
            setIsLoading(false);
        }
    }, [JSON.stringify(filters)]);

    const createHorario = useCallback(async (horarioData) => {
        try {
            console.log('📤 Criando horário:', horarioData);
            
            // Em ambiente mock, não verificamos conflitos
            if (!HorarioService.useMock) {
                const hasConflito = await HorarioService.hasConflito(horarioData);
                if (hasConflito) {
                    throw new Error('Conflito de horário detectado. Já existe um horário para este professor no mesmo dia e período.');
                }
            }

            const novoHorario = await HorarioService.create(horarioData);
            setHorarios(prev => [...prev, novoHorario]);
            setUsingMock(HorarioService.useMock);
            return novoHorario;
        } catch (err) {
            setError(err.message);
            setUsingMock(HorarioService.useMock);
            throw err;
        }
    }, []);

    const updateHorario = useCallback(async (id, updateData) => {
        try {
            // Em ambiente mock, não verificamos conflitos
            if (!HorarioService.useMock) {
                const hasConflito = await HorarioService.hasConflito({
                    ...updateData,
                    id
                });
                if (hasConflito) {
                    throw new Error('Conflito de horário detectado. Já existe um horário para este professor no mesmo dia e período.');
                }
            }

            const horarioAtualizado = await HorarioService.update(id, updateData);
            setHorarios(prev => prev.map(horario => 
                horario.id === id ? horarioAtualizado : horario
            ));
            setUsingMock(HorarioService.useMock);
            return horarioAtualizado;
        } catch (err) {
            setError(err.message);
            setUsingMock(HorarioService.useMock);
            throw err;
        }
    }, []);

    const deleteHorario = useCallback(async (id) => {
        try {
            await HorarioService.delete(id);
            setHorarios(prev => prev.filter(horario => horario.id !== id));
            setUsingMock(HorarioService.useMock);
        } catch (err) {
            setError(err.message);
            setUsingMock(HorarioService.useMock);
            throw err;
        }
    }, []);

    const getGradeHorarios = useCallback(async (turmaId) => {
        try {
            return await HorarioService.getGradeHorarios(turmaId);
        } catch (err) {
            setError(err.message);
            setUsingMock(HorarioService.useMock);
            throw err;
        }
    }, []);

    const tryReconnect = useCallback(async () => {
        const isOnline = await HorarioService.tryReconnect();
        if (isOnline) {
            await fetchHorarios();
        }
        return isOnline;
    }, [fetchHorarios]);

    useEffect(() => {
        fetchHorarios();
    }, [fetchHorarios]);

    return {
        horarios,
        isLoading,
        error,
        usingMock,
        refetch: fetchHorarios,
        createHorario,
        updateHorario,
        deleteHorario,
        getGradeHorarios,
        tryReconnect
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