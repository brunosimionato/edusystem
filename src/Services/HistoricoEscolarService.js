import { z } from 'zod';

import { API_URL } from '../utils/env.js'

export const novoHistoricoEscolarSchema = z.object({
    idAluno: z.number(),
    idDisciplina: z.number().nullish(),
    nomeEscola: z.string(),
    serieConcluida: z.string(),
    nota: z.coerce.number(),
    anoConclusao: z.number().int()
});

export const historicoEscolarSchema = z.object({
    id: z.number(),
    idAluno: z.number(),
    idDisciplina: z.number().nullish(),
    nomeEscola: z.string(),
    serieConcluida: z.string(),
    nota: z.coerce.number(),
    anoConclusao: z.number().int().nullable(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional()
});

class HistoricoEscolarService {
    /**
     * Get all historicos escolares
     */
    async getAll() {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + '/historicos-escolares', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            throw new Error('Failed to fetch historicos escolares')
        }

        try {
            const body = await res.json()
            return body.map(historicoEscolarSchema.parse)
        } catch (error) {
            console.error("Error parsing historicos escolares:", error);
            throw error;
        }
    }

    /**
     * Get historico escolar by ID
     * @param {number} id
     */
    async getById(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/historicos-escolares/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Histórico escolar not found')
            }
            throw new Error('Failed to fetch histórico escolar')
        }

        try {
            const body = await res.json()
            return historicoEscolarSchema.parse(body)
        } catch (error) {
            console.error("Error parsing histórico escolar:", error);
            throw error;
        }
    }

    /**
     * Get historicos escolares by aluno ID
     * @param {number} alunoId
     */
    async getByAlunoId(alunoId) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/historicos-escolares/aluno/${alunoId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            throw new Error('Failed to fetch historicos escolares by aluno')
        }

        try {
            const body = await res.json()
            return body.map(historicoEscolarSchema.parse)
        } catch (error) {
            console.error("Error parsing historicos escolares by aluno:", error);
            throw error;
        }
    }

    /**
     * Get historicos escolares by disciplina ID
     * @param {number} disciplinaId
     */
    async getByDisciplinaId(disciplinaId) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/historicos-escolares/disciplina/${disciplinaId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            throw new Error('Failed to fetch historicos escolares by disciplina')
        }

        try {
            const body = await res.json()
            return body.map(historicoEscolarSchema.parse)
        } catch (error) {
            console.error("Error parsing historicos escolares by disciplina:", error);
            throw error;
        }
    }

    /**
     * Create new historico escolar
     * @param {Object} novoHistoricoEscolar
     */
    async create(novoHistoricoEscolar) {
        const token = localStorage.getItem('token');
        const validatedData = novoHistoricoEscolarSchema.parse(novoHistoricoEscolar);

        const res = await fetch(API_URL + '/historicos-escolares', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        })

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || errorData.error || 'Failed to create histórico escolar');
        }

        try {
            const body = await res.json()
            return historicoEscolarSchema.parse(body)
        } catch (error) {
            console.error("Error parsing created histórico escolar:", error);
            throw error;
        }
    }

    /**
     * Update historico escolar
     * @param {number} id
     * @param {Object} updateData
     */
    async update(id, updateData) {
        const token = localStorage.getItem('token');
        const validatedData = novoHistoricoEscolarSchema.parse(updateData);

        const res = await fetch(API_URL + `/historicos-escolares/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        })

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Histórico escolar not found')
            }
            const errorData = await res.json();
            throw new Error(errorData.message || errorData.error || 'Failed to update histórico escolar');
        }

        try {
            const body = await res.json()
            return historicoEscolarSchema.parse(body)
        } catch (error) {
            console.error("Error parsing updated histórico escolar:", error);
            throw error;
        }
    }

    /**
     * Delete historico escolar
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/historicos-escolares/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Histórico escolar not found')
            }
            let msg = 'Failed to delete histórico escolar';
            try {
                const errorData = await res.json();
                msg = errorData.message || errorData.error || msg;
            } catch { }
            throw new Error(msg);
        }
    }
}

export default new HistoricoEscolarService();