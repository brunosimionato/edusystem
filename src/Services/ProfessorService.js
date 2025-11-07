// src/services/ProfessorService.js 
import { z } from 'zod';
import { API_URL } from '../utils/env.js';

export const usuarioSchema = z.object({
    id: z.number(),
    nome: z.string(),
    email: z.string().email(),
    tipo_usuario: z.string()
});

export const novoProfessorSchema = z.object({
    idDisciplinaEspecialidade: z.number(),
    telefone: z.string(),
    genero: z.string(),
    cpf: z.string(),
    nascimento: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cep: z.string(),
    cidade: z.string(),
    estado: z.string(),
    formacaoAcademica: z.string()
});

export const baseProfessorSchema = z.object({
    id: z.number(),
    idUsuario: z.number(),
    idDisciplinaEspecialidade: z.number(),
    telefone: z.string(),
    genero: z.string(),
    cpf: z.string(),
    nascimento: z.union([z.string(), z.date()]),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cep: z.string(),
    cidade: z.string(),
    estado: z.string(),
    formacaoAcademica: z.string(),
    createdAt: z.string().optional(),
    updatedAt: z.string().optional()
});

export const professorSchema = baseProfessorSchema.extend({
    usuario: usuarioSchema.optional(),
    disciplinaEspecialidade: z.object({
        id: z.number(),
        nome: z.string()
    }).optional()
});

class ProfessorService {
    /**
     * @returns {Promise<Professor[]>}
     */
    async getAll() {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + '/professores', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch professors');
        }

        try {
            const body = await res.json();
            return body.map(professorSchema.parse);
        } catch (error) {
            console.error("Error parsing professors:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<Professor>}
     */
    async getById(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/professores/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Professor not found');
            }
            throw new Error('Failed to fetch professor');
        }

        try {
            const body = await res.json();
            return professorSchema.parse(body);
        } catch (error) {
            console.error("Error parsing professor:", error);
            throw error;
        }
    }

    /**
     * @param {Object} professorData
     * @returns {Promise<Professor>}
     */
    async create(professorData) {
        const token = localStorage.getItem('token');
        
        // Estrutura que o backend espera
        const payload = {
            professor: {
                idDisciplinaEspecialidade: professorData.idDisciplinaEspecialidade,
                telefone: professorData.telefone,
                genero: professorData.genero,
                cpf: professorData.cpf,
                nascimento: professorData.nascimento,
                logradouro: professorData.logradouro,
                numero: professorData.numero,
                bairro: professorData.bairro,
                cep: professorData.cep,
                cidade: professorData.cidade,
                estado: professorData.estado,
                formacaoAcademica: professorData.formacaoAcademica
            },
            usuario: professorData.usuario ? {
                nome: professorData.usuario.nome,
                email: professorData.usuario.email,
                senha: professorData.usuario.senha || 'password',
                tipo_usuario: 'professor'
            } : undefined
        };

        const res = await fetch(API_URL + '/professores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to create professor');
        }

        try {
            const body = await res.json();
            return professorSchema.parse(body);
        } catch (error) {
            console.error("Error parsing created professor:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise<Professor>}
     */
    async update(id, updateData) {
        const token = localStorage.getItem('token');
        const validatedData = novoProfessorSchema.parse(updateData);

        const res = await fetch(API_URL + `/professores/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Professor not found');
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to update professor');
        }

        try {
            const body = await res.json();
            return professorSchema.parse(body);
        } catch (error) {
            console.error("Error parsing updated professor:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/professores/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Professor not found');
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || errorData.message || 'Failed to delete professor');
        }
    }

    /**
     * @param {number} usuarioId
     * @returns {Promise<Professor>}
     */
    async getByUsuarioId(usuarioId) {
        const token = localStorage.getItem('token');

        // Buscar todos e filtrar - backend não tem endpoint específico
        const professores = await this.getAll();
        const professor = professores.find(p => p.idUsuario === usuarioId);
        
        if (!professor) {
            throw new Error('Professor not found for this user');
        }
        
        return professor;
    }
}

export default new ProfessorService();