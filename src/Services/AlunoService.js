// src/services/AlunoService.js - CORRIGIDO
import { z } from 'zod';
import { API_URL } from '../utils/env.js';

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
     * @returns {Promise<Aluno[]>}
     */
    async getAll() {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + '/alunos', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch alunos');
        }

        try {
            const body = await res.json();
            return body.map(alunoSchema.parse);
        } catch (error) {
            console.error("Error parsing alunos:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @returns {Promise<Aluno>}
     */
    async getById(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/alunos/${id}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Aluno not found');
            }
            throw new Error('Failed to fetch aluno');
        }

        try {
            const body = await res.json();
            return alunoSchema.parse(body);
        } catch (error) {
            console.error("Error parsing aluno:", error);
            throw error;
        }
    }

    /**
     * @param {Object} alunoData - Dados do frontend (AlunoForm)
     * @returns {Promise<Aluno>}
     */
    async create(alunoData) {
        const token = localStorage.getItem('token');
        
        // MAPEAMENTO CORRETO: Frontend → Backend
        const backendData = {
            nome: alunoData.nome,
            cns: alunoData.cns, // Campo obrigatório no backend
            nascimento: alunoData.dataNascimento, // dataNascimento → nascimento
            genero: alunoData.genero,
            religiao: alunoData.religiao || null,
            telefone: alunoData.telefone,
            logradouro: alunoData.rua, // rua → logradouro
            numero: alunoData.numero,
            bairro: alunoData.bairro,
            cep: alunoData.cep,
            cidade: alunoData.cidade,
            estado: alunoData.estado,
            responsavel1Nome: alunoData.nomeR1,
            responsavel1Cpf: alunoData.cpfR1,
            responsavel1Telefone: alunoData.telefoneR1,
            responsavel1Parentesco: alunoData.parentescoR1,
            responsavel2Nome: alunoData.nomeR2 || null,
            responsavel2Cpf: alunoData.cpfR2 || null,
            responsavel2Telefone: alunoData.telefoneR2 || null,
            responsavel2Parentesco: alunoData.parentescoR2 || null
        };

        const validatedData = novoAlunoSchema.parse(backendData);

        const res = await fetch(API_URL + '/alunos', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Failed to create aluno');
        }

        try {
            const body = await res.json();
            return alunoSchema.parse(body);
        } catch (error) {
            console.error("Error parsing created aluno:", error);
            throw error;
        }
    }

    /**
     * @param {number} id
     * @param {Object} updateData
     * @returns {Promise<Aluno>}
     */
    async update(id, updateData) {
        const token = localStorage.getItem('token');
        
        // Aplicar mesmo mapeamento do create
        const backendData = {
            nome: updateData.nome,
            cns: updateData.cns,
            nascimento: updateData.dataNascimento,
            genero: updateData.genero,
            religiao: updateData.religiao || null,
            telefone: updateData.telefone,
            logradouro: updateData.rua,
            numero: updateData.numero,
            bairro: updateData.bairro,
            cep: updateData.cep,
            cidade: updateData.cidade,
            estado: updateData.estado,
            responsavel1Nome: updateData.nomeR1,
            responsavel1Cpf: updateData.cpfR1,
            responsavel1Telefone: updateData.telefoneR1,
            responsavel1Parentesco: updateData.parentescoR1,
            responsavel2Nome: updateData.nomeR2 || null,
            responsavel2Cpf: updateData.cpfR2 || null,
            responsavel2Telefone: updateData.telefoneR2 || null,
            responsavel2Parentesco: updateData.parentescoR2 || null
        };

        const validatedData = novoAlunoSchema.parse(backendData);

        const res = await fetch(API_URL + `/alunos/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validatedData)
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Aluno not found');
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Failed to update aluno');
        }

        try {
            const body = await res.json();
            return alunoSchema.parse(body);
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
        });

        if (!res.ok) {
            if (res.status === 404) {
                throw new Error('Aluno not found');
            }
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Failed to delete aluno');
        }
    }

    /**
     * Busca alunos por turma (usando o endpoint de turmas)
     * @param {number} turmaId
     * @returns {Promise<Aluno[]>}
     */
    async getByTurma(turmaId) {
        const token = localStorage.getItem('token');
        
        const res = await fetch(`${API_URL}/turmas/${turmaId}?with=alunos`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch alunos from turma');
        }

        try {
            const body = await res.json();
            return body.alunos ? body.alunos.map(alunoSchema.parse) : [];
        } catch (error) {
            console.error("Error parsing alunos from turma:", error);
            throw error;
        }
    }
}

export default new AlunoService();