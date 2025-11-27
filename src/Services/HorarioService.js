import { z } from 'zod';
import { API_URL } from '../utils/env.js';

export const novoHorarioSchema = z.object({
    idTurma: z.number(),
    idProfessor: z.number(),
    idDisciplina: z.number(),
    diaSemana: z.number().min(1).max(5),
    periodo: z.number().min(1).max(5),
    sala: z.string().optional()
});

export const horarioSchema = z.object({
    id: z.number(),
    idTurma: z.number(),
    idDisciplina: z.number(),
    idProfessor: z.number(),
    diaSemana: z.number(),
    periodo: z.number(),
    sala: z.string().nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
    turma: z.object({
        id: z.number(),
        nome: z.string()
    }).optional(),
    disciplina: z.object({
        id: z.number(),
        nome: z.string()
    }).optional(),
    professor: z.object({
        id: z.number(),
        usuario: z.object({
            nome: z.string()
        })
    }).optional()
});

class HorarioService {
    constructor() {
        this.useMock = false;
    }

    async checkBackendStatus() {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/horarios`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                },
            });
            return response.ok;
        } catch (error) {
            console.error('❌ Backend de horários offline:', error);
            return false;
        }
    }

    async getAll(filters = {}) {
        try {
            const token = localStorage.getItem('token');
            const queryParams = new URLSearchParams();

            Object.entries(filters).forEach(([key, value]) => {
                if (value !== undefined && value !== null) {
                    queryParams.append(key, value.toString());
                }
            });

            console.log(`🔍 Buscando horários no backend: ${API_URL}/horarios?${queryParams}`);

            const res = await fetch(`${API_URL}/horarios?${queryParams}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                throw new Error(`Erro ${res.status} ao buscar horários`);
            }

            const body = await res.json();
            console.log('✅ Horários recebidos do backend:', body);
            return body.map(horarioSchema.parse);

        } catch (error) {
            console.error('❌ Erro ao buscar horários:', error);
            throw new Error(`Falha ao carregar horários: ${error.message}`);
        }
    }

    async create(horarioData) {
        try {
            const token = localStorage.getItem('token');
            const validatedData = novoHorarioSchema.parse(horarioData);

            console.log('📤 Enviando horário para o backend:', validatedData);

            const res = await fetch(`${API_URL}/horarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(validatedData)
            });

            if (!res.ok) {
                const errorText = await res.text();
                throw new Error(`Erro ${res.status}: ${errorText}`);
            }

            const body = await res.json();
            console.log('✅ Horário criado no backend:', body);
            return horarioSchema.parse(body);

        } catch (error) {
            console.error('❌ Erro ao criar horário:', error);
            throw new Error(`Falha ao criar horário: ${error.message}`);
        }
    }

    async update(id, updateData) {
        try {
            const token = localStorage.getItem('token');
            const validatedData = novoHorarioSchema.partial().parse(updateData);

            console.log(`📝 Atualizando horário ${id}:`, validatedData);

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
                    throw new Error('Horário não encontrado');
                }
                const errorText = await res.text();
                throw new Error(`Erro ${res.status}: ${errorText}`);
            }

            const body = await res.json();
            return horarioSchema.parse(body);

        } catch (error) {
            console.error('❌ Erro ao atualizar horário:', error);
            throw new Error(`Falha ao atualizar horário: ${error.message}`);
        }
    }

    async delete(id) {
        try {
            const token = localStorage.getItem('token');

            console.log(`🗑️ Deletando horário ${id}`);

            const res = await fetch(`${API_URL}/horarios/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!res.ok) {
                if (res.status === 404) {
                    throw new Error('Horário não encontrado');
                }
                const errorText = await res.text();
                throw new Error(`Erro ${res.status}: ${errorText}`);
            }

            console.log('✅ Horário deletado com sucesso');

        } catch (error) {
            console.error('❌ Erro ao deletar horário:', error);
            throw new Error(`Falha ao deletar horário: ${error.message}`);
        }
    }

    async getByTurma(turmaId) {
        return this.getAll({ idTurma: turmaId });
    }

    async getByProfessor(professorId) {
        return this.getAll({ idProfessor: professorId });
    }

    async getByDisciplina(disciplinaId) {
        return this.getAll({ idDisciplina: disciplinaId });
    }

    async getGradeHorarios(turmaId) {
        try {
            const horarios = await this.getByTurma(turmaId);

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
        } catch (error) {
            console.error('❌ Erro ao gerar grade de horários:', error);
            throw new Error(`Falha ao gerar grade: ${error.message}`);
        }
    }

    async tryReconnect() {
        try {
            const isOnline = await this.checkBackendStatus();
            if (isOnline) {
                console.log('✅ Conexão com backend restaurada');
            }
            return isOnline;
        } catch (error) {
            console.error('❌ Falha ao reconectar:', error);
            return false;
        }
    }
}

export default new HorarioService();