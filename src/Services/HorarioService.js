// src/services/HorarioService.js - NOVO
import { z } from 'zod';
import { API_URL } from '../utils/env.js';

export const novoHorarioSchema = z.object({
    idTurma: z.number(),
    idProfessor: z.number(),
    idDisciplina: z.number(),
    diaSemana: z.number().min(1).max(5), // 1=Segunda, 5=Sexta
    periodo: z.number().min(1).max(5), // 1-5 períodos
    sala: z.string().optional()
});

export const horarioSchema = z.object({
    id: z.number(),
    idTurma: z.number(),
    idProfessor: z.number(),
    idDisciplina: z.number(),
    diaSemana: z.number(),
    periodo: z.number(),
    sala: z.string().nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    // Campos populados
    turma: z.object({
        id: z.number(),
        nome: z.string()
    }).optional(),
    professor: z.object({
        id: z.number(),
        usuario: z.object({
            nome: z.string()
        })
    }).optional(),
    disciplina: z.object({
        id: z.number(),
        nome: z.string()
    }).optional()
});

class HorarioService {
    /**
     * @param {Object} filters
     * @returns {Promise<Horario[]>}
     */
    async getAll(filters = {}) {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        const res = await fetch(`${API_URL}/horarios?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch horarios');
        }

        try {
            const body = await res.json();
            return body.map(horarioSchema.parse);
        } catch (error) {
            console.error("Error parsing horarios:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<Horario>}
     */
    async getById(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_URL}/horarios/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Horario not found');
            }
            throw new Error('Failed to fetch horario');
        }

        try {
            const body = await res.json();
            return horarioSchema.parse(body);
        } catch (error) {
            console.error("Error parsing horario:", error);
            throw error;
        }
    }

    /**
     * @param {Object} horarioData
     * @returns {Promise<Horario>}
     */
    async create(horarioData) {
        const token = localStorage.getItem('token');
        const validatedData = novoHorarioSchema.parse(horarioData);

        const res = await fetch(`${API_URL}/horarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to create horario');
        }

        try {
            const body = await res.json();
            return horarioSchema.parse(body);
        } catch (error) {
            console.error("Error parsing created horario:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise<Horario>}
     */
    async update(id, updateData) {
        const token = localStorage.getItem('token');
        const validatedData = novoHorarioSchema.partial().parse(updateData);

        const res = await fetch(`${API_URL}/horarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Horario not found');
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to update horario');
        }

        try {
            const body = await res.json();
            return horarioSchema.parse(body);
        } catch (error) {
            console.error("Error parsing updated horario:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_URL}/horarios/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Horario not found');
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to delete horario');
        }
    }

    /**
     * @param {number} turmaId
     * @returns {Promise<Horario[]>}
     */
    async getByTurma(turmaId) {
        return this.getAll({ idTurma: turmaId });
    }

    /**
     * @param {number} professorId
     * @returns {Promise<Horario[]>}
     */
    async getByProfessor(professorId) {
        return this.getAll({ idProfessor: professorId });
    }

    /**
     * @param {number} disciplinaId
     * @returns {Promise<Horario[]>}
     */
    async getByDisciplina(disciplinaId) {
        return this.getAll({ idDisciplina: disciplinaId });
    }

    /**
     * @param {number} turmaId
     * @returns {Promise<Object>} Grade de horários formatada
     */
    async getGradeHorarios(turmaId) {
        const horarios = await this.getByTurma(turmaId);
        
        // Formatar como grade (dias x períodos)
        const grade = {
            1: {}, // Segunda
            2: {}, // Terça
            3: {}, // Quarta
            4: {}, // Quinta
            5: {}  // Sexta
        };

        horarios.forEach(horario => {
            if (!grade[horario.diaSemana]) {
                grade[horario.diaSemana] = {};
            }
            grade[horario.diaSemana][horario.periodo] = horario;
        });

        return grade;
    }

    /**
     * Verifica conflito de horários
     * @param {Object} horarioData
     * @returns {Promise<boolean>}
     */
    async hasConflito(horarioData) {
        const { idProfessor, diaSemana, periodo, id } = horarioData;
        
        const horarios = await this.getAll({ 
            idProfessor, 
            diaSemana, 
            periodo 
        });

        // Se estiver atualizando, ignora o próprio horário
        return horarios.some(h => h.id !== id);
    }
}

export default new HorarioService();