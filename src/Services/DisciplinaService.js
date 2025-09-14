import { z } from 'zod'

const API_URL = 'http://localhost:3000' // TODO: Move to env variable

export const disciplinaSchema = z.object({
    id: z.number(),
    nome: z.string(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional()
});

export const novaDisciplinaSchema = z.object({
    nome: z.string()
});

class DisciplinaService {
    /**
     * @returns {Promise<Disciplina[]>}
     */
    async getAll() {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + '/disciplinas', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            throw new Error('Failed to fetch disciplinas')
        }

        try {
            const body = await res.json()
            return body.map(disciplinaSchema.parse)
        } catch (error) {
            console.error("Error parsing disciplinas:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<Disciplina>}
     */
    async getById(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/disciplinas/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Disciplina not found')
            }
            throw new Error('Failed to fetch disciplina')
        }

        try {
            const body = await res.json()
            return disciplinaSchema.parse(body)
        } catch (error) {
            console.error("Error parsing disciplina:", error);
            throw error;
        }
    }

    /**
     * @param {Object} novaDisciplina
     * @returns {Promise<Disciplina>}
     */
    async create(novaDisciplina) {
        const token = localStorage.getItem('token');
        const validatedData = novaDisciplinaSchema.parse(novaDisciplina);

        const res = await fetch(API_URL + '/disciplinas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        })

        if (!res.ok) {
            throw new Error('Failed to create disciplina')
        }

        try {
            const body = await res.json()
            return disciplinaSchema.parse(body)
        } catch (error) {
            console.error("Error parsing created disciplina:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise<Disciplina>}
     */
    async update(id, updateData) {
        const token = localStorage.getItem('token');
        const validatedData = novaDisciplinaSchema.parse(updateData);

        const res = await fetch(API_URL + `/disciplinas/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        })

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Disciplina not found')
            }
            throw new Error('Failed to update disciplina')
        }

        try {
            const body = await res.json()
            return disciplinaSchema.parse(body)
        } catch (error) {
            console.error("Error parsing updated disciplina:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/disciplinas/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Disciplina not found')
            }
            throw new Error('Failed to delete disciplina')
        }
    }
}

export default new DisciplinaService();