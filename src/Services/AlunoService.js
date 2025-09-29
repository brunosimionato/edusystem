import { z } from 'zod';

import { API_URL } from '../utils/env.js'


export const novoAlunoSchema = z.object({
    nome: z.string(),
    cns: z.string(),
    nascimento: z.union([z.string(), z.date()]),
    genero: z.string(),
    religiao: z.string().nullable().optional(),
    telefone: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cep: z.string(),
    cidade: z.string(),
    estado: z.string(),
    responsavel1Nome: z.string(),
    responsavel1Cpf: z.string(),
    responsavel1Telefone: z.string(),
    responsavel1Parentesco: z.string(),
    responsavel2Nome: z.string().nullable().optional(),
    responsavel2Cpf: z.string().nullable().optional(),
    responsavel2Telefone: z.string().nullable().optional(),
    responsavel2Parentesco: z.string().nullable().optional()
});

export const alunoSchema = z.object({
    id: z.number(),
    nome: z.string(),
    cns: z.string(),
    nascimento: z.union([z.string(), z.date()]),
    genero: z.string(),
    religiao: z.string().nullable().optional(),
    telefone: z.string(),
    logradouro: z.string(),
    numero: z.string(),
    bairro: z.string(),
    cep: z.string(),
    cidade: z.string(),
    estado: z.string(),
    responsavel1Nome: z.string(),
    responsavel1Cpf: z.string(),
    responsavel1Telefone: z.string(),
    responsavel1Parentesco: z.string(),
    responsavel2Nome: z.string().nullable().optional(),
    responsavel2Cpf: z.string().nullable().optional(),
    responsavel2Telefone: z.string().nullable().optional(),
    responsavel2Parentesco: z.string().nullable().optional(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional()
});

class AlunoService {
    /**
     */
    async getAll() {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + '/alunos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            throw new Error('Failed to fetch alunos')
        }

        try {
            const body = await res.json()
            return body.map(alunoSchema.parse)
        } catch (error) {
            console.error("Error parsing alunos:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     */
    async getById(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/alunos/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Aluno not found')
            }
            throw new Error('Failed to fetch aluno')
        }

        try {
            const body = await res.json()
            return alunoSchema.parse(body)
        } catch (error) {
            console.error("Error parsing aluno:", error);
            throw error;
        }
    }

    /**
     * @param {Object} novoAluno
     */
    async create(novoAluno) {
        const token = localStorage.getItem('token');
        const validatedData = novoAlunoSchema.parse(novoAluno);

        const res = await fetch(API_URL + '/alunos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        })

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || errorData.error || 'Failed to create aluno');
        }

        try {
            const body = await res.json()
            return alunoSchema.parse(body)
        } catch (error) {
            console.error("Error parsing created aluno:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @param {Object} updateData
     */
    async update(id, updateData) {
        const token = localStorage.getItem('token');
        const validatedData = novoAlunoSchema.parse(updateData);

        const res = await fetch(API_URL + `/alunos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        })

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Aluno not found')
            }
            const errorData = await res.json();
            throw new Error(errorData.message || errorData.error || 'Failed to update aluno');
        }

        try {
            const body = await res.json()
            return alunoSchema.parse(body)
        } catch (error) {
            console.error("Error parsing updated aluno:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<void>}
     */
    async delete(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/alunos/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Aluno not found')
            }
            let msg = 'Failed to delete aluno';
            try {
                const errorData = await res.json();
                msg = errorData.message || errorData.error || msg;
            } catch { }
            throw new Error(msg);
        }
    }
}

export default new AlunoService();