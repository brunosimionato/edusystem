import { z } from 'zod'

import { disciplinaSchema } from './DisciplinaService';

import { API_URL } from '../utils/env.js'

export const usuarioSchema = z.object({
    id: z.number(),
    nome: z.string(),
    email: z.string().email(),
    tipo_usuario: z.string()
});

export const novoProfessorSchema = z.object({
    usuario: z.object({
        nome: z.string(),
        email: z.string().email(),
        senha: z.string().min(6).optional(), // default password will be set to "password"
        tipo_usuario: z.string().optional() // Will be set to 'professor' by the backend
    }),
    idDisciplinaEspecialidade: z.number(),
    idDisciplinas: z.array(z.number()).min(1),
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
})

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
})

// Professor with nested usuario and disciplinaEspecialidade fields
export const professorSchema = baseProfessorSchema.extend({
    usuario: usuarioSchema,
    disciplinaEspecialidade: disciplinaSchema,
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
        })

        if (!res.ok) {
            throw new Error('Failed to fetch professors')
        }

        try {
            const body = await res.json()

            return body.map(professorSchema.parse)
        } catch (error) {
            console.error("Error parsing professors:", error);
            throw error;
        }
    }

    async create(professorData) {
        const token = localStorage.getItem('token');

        const data = novoProfessorSchema.parse(professorData);

        const res = await fetch(API_URL + '/professores', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                professor: data,
                usuario: { ...data.usuario, tipo_usuario: 'professor' },
            })
        });

        if (!res.ok) {
            throw new Error('Failed to create professor');
        }

        try {
            const body = await res.json();
            // create method does not return complete professor
            return baseProfessorSchema.parse(body);
        } catch (error) {
            console.error("Error parsing professor:", error);
            throw error;
        }
    }
}

export default new ProfessorService();