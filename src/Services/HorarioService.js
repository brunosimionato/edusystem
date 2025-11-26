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
    idProfessor: z.number(),
    idDisciplina: z.number(),
    diaSemana: z.number(),
    periodo: z.number(),
    sala: z.string().nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional(),
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
    constructor() {
        this.useMock = false;
        this.storageKey = 'horarios_mock_data';
        this.initializeMockData();
    }

    initializeMockData() {
        // Tenta carregar do localStorage
        const savedData = localStorage.getItem(this.storageKey);
        if (savedData) {
            try {
                this.mockData = JSON.parse(savedData);
                console.log('📂 Dados de horários carregados do localStorage');
                return;
            } catch (error) {
                console.error('❌ Erro ao carregar dados do localStorage:', error);
            }
        }

        // Se não há dados salvos, inicia vazio
        this.mockData = [];
        this.saveToLocalStorage();
    }

    saveToLocalStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.mockData));
            console.log('💾 Dados de horários salvos no localStorage');
        } catch (error) {
            console.error('❌ Erro ao salvar dados no localStorage:', error);
        }
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

            this.useMock = !response.ok;
            console.log(`🔍 Backend de horários: ${this.useMock ? 'Usando mock' : 'Online'}`);
            return !this.useMock;
        } catch (error) {
            this.useMock = true;
            console.log('🔍 Backend de horários offline, usando mock');
            return false;
        }
    }

    async getAll(filters = {}) {
        // Verificar status do backend se ainda não sabemos
        if (this.useMock === false) {
            const isOnline = await this.checkBackendStatus();
            if (!isOnline) {
                return this.getAllMock(filters);
            }
        }

        if (this.useMock) {
            return this.getAllMock(filters);
        }

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
                throw new Error(`Backend retornou ${res.status}`);
            }

            const body = await res.json();
            console.log('✅ Horários recebidos do backend:', body);
            return body.map(horarioSchema.parse);

        } catch (error) {
            console.warn('⚠️  Erro ao buscar horários no backend, usando mock:', error);
            this.useMock = true;
            return this.getAllMock(filters);
        }
    }

    getAllMock(filters = {}) {
        console.log('🎭 Usando dados mockados de horários');
        let filteredData = [...this.mockData];

        if (filters.idTurma) {
            filteredData = filteredData.filter(h => h.idTurma == filters.idTurma);
        }
        if (filters.idProfessor) {
            filteredData = filteredData.filter(h => h.idProfessor == filters.idProfessor);
        }
        if (filters.idDisciplina) {
            filteredData = filteredData.filter(h => h.idDisciplina == filters.idDisciplina);
        }

        return filteredData.map(horarioSchema.parse);
    }

    async create(horarioData) {
        // Verificar status do backend
        if (this.useMock === false) {
            const isOnline = await this.checkBackendStatus();
            if (!isOnline) {
                return this.createMock(horarioData);
            }
        }

        if (this.useMock) {
            return this.createMock(horarioData);
        }

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
                throw new Error(`Backend: ${res.status} - ${errorText}`);
            }

            const body = await res.json();
            console.log('✅ Horário criado no backend:', body);
            return horarioSchema.parse(body);

        } catch (error) {
            console.warn('⚠️  Erro ao criar horário no backend, usando mock:', error);
            this.useMock = true;
            return this.createMock(horarioData);
        }
    }

    createMock(horarioData) {
        console.log('🎭 Criando horário mock:', horarioData);
        const novoHorario = {
            id: Date.now() + Math.random(),
            ...horarioData,
            sala: horarioData.sala || "Sala padrão",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            turma: { id: horarioData.idTurma, nome: `Turma ${horarioData.idTurma}` },
            professor: {
                id: horarioData.idProfessor,
                usuario: { nome: `Professor ${horarioData.idProfessor}` }
            },
            disciplina: { id: horarioData.idDisciplina, nome: `Disciplina ${horarioData.idDisciplina}` }
        };

        this.mockData.push(novoHorario);
        this.saveToLocalStorage();
        return horarioSchema.parse(novoHorario);
    }

    async update(id, updateData) {
        if (this.useMock) {
            return this.updateMock(id, updateData);
        }

        try {
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

            const body = await res.json();
            return horarioSchema.parse(body);

        } catch (error) {
            console.warn('⚠️  Erro ao atualizar horário no backend, usando mock:', error);
            this.useMock = true;
            return this.updateMock(id, updateData);
        }
    }

    updateMock(id, updateData) {
        console.log('🎭 Atualizando horário mock:', id, updateData);
        const index = this.mockData.findIndex(h => h.id === id);
        if (index === -1) {
            throw new Error('Horario not found');
        }

        this.mockData[index] = {
            ...this.mockData[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        this.saveToLocalStorage();
        return horarioSchema.parse(this.mockData[index]);
    }

    async delete(id) {
        if (this.useMock) {
            return this.deleteMock(id);
        }

        try {
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

        } catch (error) {
            console.warn('⚠️  Erro ao deletar horário no backend, usando mock:', error);
            this.useMock = true;
            return this.deleteMock(id);
        }
    }

    deleteMock(id) {
        console.log('🎭 Deletando horário mock:', id);
        const index = this.mockData.findIndex(h => h.id === id);
        if (index === -1) {
            throw new Error('Horario not found');
        }
        this.mockData.splice(index, 1);
        this.saveToLocalStorage();
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
    }

    async hasConflito(horarioData) {
        if (this.useMock) {
            return false;
        }

        try {
            const { idProfessor, diaSemana, periodo, id } = horarioData;

            const horarios = await this.getAll({
                idProfessor,
                diaSemana,
                periodo
            });

            return horarios.some(h => h.id !== id);
        } catch (error) {
            console.warn('⚠️  Erro ao verificar conflito, assumindo sem conflito:', error);
            return false;
        }
    }


}

export default new HorarioService();
