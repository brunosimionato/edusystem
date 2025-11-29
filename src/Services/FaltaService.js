import { z } from 'zod';
import { API_URL } from '../utils/env.js';

export const novaFaltaSchema = z.object({
    idAluno: z.number().int().positive(),
    data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    periodo: z.number().min(1).max(5).optional().nullable()
});

export const faltaSchema = z.object({
    id: z.number(),
    idAluno: z.number(),
    data: z.string(),
    periodo: z.number().nullable(),
    aluno: z.object({
        id: z.number(),
        nome: z.string()
    }).optional(),
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
                
        if (filters.data_inicio) queryParams.append('data_inicio', filters.data_inicio);
        if (filters.data_fim) queryParams.append('data_fim', filters.data_fim);
        if (filters.idAluno) queryParams.append('aluno_id', filters.idAluno);
        if (filters.page) queryParams.append('page', filters.page);
        if (filters.limit) queryParams.append('limit', filters.limit);
        
        const url = `${API_URL}/faltas?${queryParams}`;

        try {
            const res = await fetch(url, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            
            if (!res.ok) {
                const errorText = await res.text();
                console.error("❌ Erro na resposta:", errorText);
                throw new Error(`Failed to fetch faltas: ${res.status} ${res.statusText}`);
            }

            const body = await res.json();
            
            // Verifique se é um array
            if (!Array.isArray(body)) {
                console.error("❌ Resposta não é array:", body);
                return [];
            }
            
            return body.map(faltaSchema.parse);
            
        } catch (error) {
            console.error("❌ Erro no FaltaService.getAll:", error);
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
            throw new Error('Failed to fetch falta');
        }

        const body = await res.json();
        return faltaSchema.parse(body);
    }

    /**
     * @param {Object} faltaData
     * @returns {Promise<Falta>}
     */
    async create(faltaData) {
        const token = localStorage.getItem('token');
        
        console.log("📝 Criando falta:", faltaData);
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

        const body = await res.json();
        return faltaSchema.parse(body);
    }

    /**
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const token = localStorage.getItem('token');

        console.log("🗑️ Deletando falta ID:", id);
        
        const res = await fetch(`${API_URL}/faltas/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to delete falta');
        }
    }

}

export default new FaltaService();