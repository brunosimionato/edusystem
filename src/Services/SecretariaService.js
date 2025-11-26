import { z } from 'zod';
import { API_URL } from '../utils/env.js';

export const novaSecretariaSchema = z.object({
    idUsuario: z.number()
});

export const secretariaSchema = z.object({
    id: z.number(),
    idUsuario: z.number(),
    usuario: z.object({
        id: z.number(),
        nome: z.string(),
        email: z.string().email(),
        tipo_usuario: z.string()
    }).optional()
});

class SecretariaService {
    /**
     * @returns {Promise<Secretaria[]>}
     */
    async getAll() {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + '/secretarias', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch secretarias');
        }

        try {
            const body = await res.json();
            return body.map(secretariaSchema.parse);
        } catch (error) {
            console.error("Error parsing secretarias:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<Secretaria>}
     */
    async getById(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/secretarias/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Secretaria not found');
            }
            throw new Error('Failed to fetch secretaria');
        }

        try {
            const body = await res.json();
            return secretariaSchema.parse(body);
        } catch (error) {
            console.error("Error parsing secretaria:", error);
            throw error;
        }
    }

    /**
     * @param {Object} secretariaData
     * @returns {Promise<Secretaria>}
     */
    async create(secretariaData) {
        const token = localStorage.getItem('token');
        const validatedData = novaSecretariaSchema.parse(secretariaData);

        const res = await fetch(API_URL + '/secretarias', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to create secretaria');
        }

        try {
            const body = await res.json();
            return secretariaSchema.parse(body);
        } catch (error) {
            console.error("Error parsing created secretaria:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise<Secretaria>}
     */
    async update(id, updateData) {
        const token = localStorage.getItem('token');
        const validatedData = novaSecretariaSchema.parse(updateData);

        const res = await fetch(API_URL + `/secretarias/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Secretaria not found');
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to update secretaria');
        }

        try {
            const body = await res.json();
            return secretariaSchema.parse(body);
        } catch (error) {
            console.error("Error parsing updated secretaria:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/secretarias/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Secretaria not found');
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to delete secretaria');
        }
    }

    /**
     * @param {number} usuarioId
     * @returns {Promise<Secretaria>}
     */
    async getByUsuarioId(usuarioId) {
        const secretarias = await this.getAll();
        const secretaria = secretarias.find(s => s.idUsuario === usuarioId);

        if (!secretaria) {
            throw new Error('Secretaria not found for this user');
        }

        return secretaria;
    }
}

export default new SecretariaService();