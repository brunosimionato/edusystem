// src/services/FaltaService.js 
import { z } from 'zod';
import { API_URL } from '../utils/env.js';

export const novaFaltaSchema = z.object({
    idAluno: z.number(),
    idTurma: z.number(),
    data: z.string(), // ISO string
    periodo: z.number().min(1).max(5).optional(),
    justificada: z.boolean().default(false),
    observacao: z.string().optional()
});

export const faltaSchema = z.object({
    id: z.number(),
    idAluno: z.number(),
    idTurma: z.number(),
    data: z.string(),
    periodo: z.number().nullable(),
    justificada: z.boolean(),
    observacao: z.string().nullable(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
});

class FaltaService {
    /**
     * @param {Object} filters
     * @returns {Promise<Falta[]>}
     */
    async getAll(filters = {}) {
        const token = localStorage.getItem('token');
        const queryParams = new URLSearchParams();
        
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                queryParams.append(key, value.toString());
            }
        });

        const res = await fetch(`${API_URL}/faltas?${queryParams}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch faltas');
        }

        try {
            const body = await res.json();
            return body.map(faltaSchema.parse);
        } catch (error) {
            console.error("Error parsing faltas:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<Falta>}
     */
    async getById(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_URL}/faltas/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Falta not found');
            }
            throw new Error('Failed to fetch falta');
        }

        try {
            const body = await res.json();
            return faltaSchema.parse(body);
        } catch (error) {
            console.error("Error parsing falta:", error);
            throw error;
        }
    }

    /**
     * @param {Object} faltaData
     * @returns {Promise<Falta>}
     */
    async create(faltaData) {
        const token = localStorage.getItem('token');
        const validatedData = novaFaltaSchema.parse(faltaData);

        const res = await fetch(`${API_URL}/faltas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to create falta');
        }

        try {
            const body = await res.json();
            return faltaSchema.parse(body);
        } catch (error) {
            console.error("Error parsing created falta:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise<Falta>}
     */
    async update(id, updateData) {
        const token = localStorage.getItem('token');
        const validatedData = novaFaltaSchema.partial().parse(updateData);

        const res = await fetch(`${API_URL}/faltas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Falta not found');
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to update falta');
        }

        try {
            const body = await res.json();
            return faltaSchema.parse(body);
        } catch (error) {
            console.error("Error parsing updated falta:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(`${API_URL}/faltas/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Falta not found');
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to delete falta');
        }
    }

    /**
     * @param {number} alunoId
     * @param {string} dataInicio
     * @param {string} dataFim
     * @returns {Promise<Falta[]>}
     */
    async getByAluno(alunoId, dataInicio, dataFim) {
        const filters = { idAluno: alunoId };
        if (dataInicio) filters.dataInicio = dataInicio;
        if (dataFim) filters.dataFim = dataFim;
        
        return this.getAll(filters);
    }

    /**
     * @param {number} turmaId
     * @param {string} data
     * @returns {Promise<Falta[]>}
     */
    async getByTurma(turmaId, data) {
        const filters = { idTurma: turmaId };
        if (data) filters.data = data;
        
        return this.getAll(filters);
    }

    /**
     * @param {number} alunoId
     * @param {string} mes
     * @param {number} ano
     * @returns {Promise<number>}
     */
    async getTotalFaltasPorMes(alunoId, mes, ano) {
        const faltas = await this.getByAluno(alunoId, `${ano}-${mes}-01`, `${ano}-${mes}-31`);
        return faltas.length;
    }

    /**
     * Cria múltiplas faltas de uma vez
     * @param {Array} faltasData
     * @returns {Promise<Falta[]>}
     */
    async createMultiple(faltasData) {
        const token = localStorage.getItem('token');
        const validatedData = z.array(novaFaltaSchema).parse(faltasData);

        const res = await fetch(`${API_URL}/faltas/batch`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to create faltas');
        }

        try {
            const body = await res.json();
            return body.map(faltaSchema.parse);
        } catch (error) {
            console.error("Error parsing created faltas:", error);
            throw error;
        }
    }
}

export default new FaltaService();