// src/services/AlunoService.js
import { z } from "zod";
import { API_URL } from "../utils/env.js";

/**
 * ✅ SCHEMA PARA VALIDAÇÃO DO QUE É ENVIADO PARA O BACK
 * esse schema valida apenas o que o backend espera receber
 */
export const novoAlunoSchema = z.object({
    nome: z.string(),
    cpf: z.string(),
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

    turma: z.number().nullable().optional(),

    historicoEscolar: z.array(z.any()).nullable().optional() // ✅ aceitamos qualquer estrutura, o backend valida depois
});

/**
 * ✅ SCHEMA PARA O QUE É RECEBIDO DO BACKEND
 */
export const alunoSchema = z.object({
    id: z.number(),
    nome: z.string(),
    cpf: z.string(),
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

    async getAll() {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/alunos`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Erro ao buscar alunos");

        const body = await res.json();
        return body.map(alunoSchema.parse);
    }


    async getById(id) {
        const token = localStorage.getItem("token");

        const res = await fetch(`${API_URL}/alunos/${id}`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Erro ao buscar aluno");

        const body = await res.json();
        return alunoSchema.parse(body);
    }


    /**
     * ✅ CREATE — Envia aluno + histórico para o backend
     */
    async create(alunoData) {
        const token = localStorage.getItem("token");

        const backendData = {
            nome: alunoData.nome,
            cpf: alunoData.cpf,
            cns: alunoData.cns,
            nascimento: alunoData.dataNascimento,
            genero: alunoData.genero,
            religiao: alunoData.religiao || null,
            telefone: alunoData.telefone,
            logradouro: alunoData.rua,
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
            responsavel2Parentesco: alunoData.parentescoR2 || null,

            turma: Number(alunoData.turma) || null,

            historicoEscolar: alunoData.alunoOutraEscola
                ? alunoData.historicoEscolar
                : null
        };

        // ✅ Validação ZOD somente do que vai pro backend
        const validatedData = novoAlunoSchema.parse(backendData);

        const res = await fetch(`${API_URL}/alunos`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(validatedData),
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.error || "Erro ao criar aluno");
        }

        const body = await res.json();
        return alunoSchema.parse(body);
    }


    async update(id, updateData) {
        const token = localStorage.getItem("token");

        const backendData = {
            nome: updateData.nome,
            cpf: updateData.cpf,
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
            responsavel2Parentesco: updateData.parentescoR2 || null,
        };

        const validatedData = novoAlunoSchema.parse(backendData);

        const res = await fetch(`${API_URL}/alunos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(validatedData),
        });

        if (!res.ok) throw new Error("Erro ao atualizar aluno");

        const body = await res.json();
        return alunoSchema.parse(body);
    }


    async delete(id) {
        const token = localStorage.getItem("token");

        await fetch(`${API_URL}/alunos/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
            }
        });
    }
}

export default new AlunoService();
