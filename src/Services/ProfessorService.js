import { z } from "zod";
import { API_URL } from "../utils/env.js";

export const usuarioSchema = z.object({
    id: z.number(),
    nome: z.string(),
    email: z.string().email(),
    tipo_usuario: z.string(),
    status: z.string().optional()
});

export const professorSchema = z.object({
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
    updatedAt: z.string().optional(),

    usuario: usuarioSchema.optional(),

    disciplinaEspecialidade: z.object({
        id: z.number(),
        nome: z.string()
    }).optional(),

    disciplinas: z.array(
        z.object({ id: z.number(), nome: z.string() })
    ).optional(),

    turmas: z.array(
        z.object({ id: z.number(), nome: z.string() })
    ).optional()
});

class ProfessorService {

    // GET ALL
    async getAll() {
        const token = localStorage.getItem("token");

        const res = await fetch(API_URL + "/professores", {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to fetch professors");

        const body = await res.json();
        
        console.log("🔍 TODOS OS PROFESSORES:", body);
        
        // FILTRAR APENAS PROFESSORES COM USUÁRIOS ATIVOS
        const professoresAtivos = body.filter(professor => {
            const statusUsuario = professor.usuario?.status;
            return !statusUsuario || statusUsuario === "ativo";
        });
        
        console.log("✅ PROFESSORES ATIVOS:", professoresAtivos);
        
        return professoresAtivos.map(professorSchema.parse);
    }

    // GET BY ID
    async getById(id) {
        const token = localStorage.getItem("token");

        const res = await fetch(API_URL + `/professores/${id}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Professor not found");

        const body = await res.json();
        
        // VERIFICAR SE O USUÁRIO DO PROFESSOR ESTÁ ATIVO
        if (body.usuario?.status === "inativo") {
            throw new Error("Professor inativo não pode ser acessado");
        }
        
        return professorSchema.parse(body);
    }

    // CREATE
    async create(data) {
        const token = localStorage.getItem("token");

        const payload = {
            usuario: data.usuario ? {
                nome: data.usuario.nome,
                email: data.usuario.email,
                senha: data.usuario.senha || "password",
                tipo_usuario: "professor",
                status: "ativo"
            } : undefined,

            professor: {
                idDisciplinaEspecialidade: data.professor.idDisciplinaEspecialidade,
                telefone: data.professor.telefone,
                genero: data.professor.genero,
                cpf: data.professor.cpf,
                nascimento: data.professor.nascimento,
                logradouro: data.professor.logradouro,
                numero: data.professor.numero,
                bairro: data.professor.bairro,
                cep: data.professor.cep,
                cidade: data.professor.cidade,
                estado: data.professor.estado,
                formacaoAcademica: data.professor.formacaoAcademica,
                idDisciplinas: data.professor.idDisciplinas || [],
                turmas: data.professor.turmas || []
            }
        };

        const res = await fetch(API_URL + "/professores", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to create professor");
        }

        const body = await res.json();
        return professorSchema.parse(body);
    }

    // UPDATE
    async update(id, data) {
        const token = localStorage.getItem("token");

        const payload = {
            usuario: data.usuario ? {
                nome: data.usuario.nome,
                email: data.usuario.email,
                tipo_usuario: "professor"
            } : undefined,

            professor: {
                idDisciplinaEspecialidade: data.professor.idDisciplinaEspecialidade,
                telefone: data.professor.telefone,
                genero: data.professor.genero,
                cpf: data.professor.cpf,
                nascimento: data.professor.nascimento,
                logradouro: data.professor.logradouro,
                numero: data.professor.numero,
                bairro: data.professor.bairro,
                cep: data.professor.cep,
                cidade: data.professor.cidade,
                estado: data.professor.estado,
                formacaoAcademica: data.professor.formacaoAcademica,
                idDisciplinas: data.professor.idDisciplinas || [],
                turmas: data.professor.turmas || []
            }
        };

        const res = await fetch(API_URL + `/professores/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            throw new Error(err.error || "Failed to update professor");
        }

        const body = await res.json();
        return professorSchema.parse(body);
    }

    // DELETE
    async delete(id) {
        const token = localStorage.getItem("token");

        const res = await fetch(API_URL + `/professores/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error("Failed to delete professor");
    }

    
}

export default new ProfessorService();