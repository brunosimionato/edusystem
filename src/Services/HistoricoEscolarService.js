import { z } from 'zod';
import { API_URL } from '../utils/env.js';

export const novoHistoricoEscolarSchema = z.object({
    idAluno: z.number(),
    idDisciplina: z.number().nullish(),
    nomeEscola: z.string(),
    serieConcluida: z.string(),
    nota: z.coerce.number().nullable().optional(),  // ✅ permite vazio
    anoConclusao: z.coerce.number().int()           // ✅ aceita string e converte
});

export const historicoEscolarSchema = z.object({
    id: z.number(),
    idAluno: z.number(),
    idDisciplina: z.number().nullish(),
    nomeEscola: z.string(),
    serieConcluida: z.string(),
    nota: z.coerce.number().nullable().optional(),
    anoConclusao: z.coerce.number().int().nullable(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional()
});

class HistoricoEscolarService {

    async getAll() {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + '/historicos-escolares', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            throw new Error('Failed to fetch historicos escolares');
        }

        const body = await res.json();
        return body.map(historicoEscolarSchema.parse);
    }

    async getById(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/historicos-escolares/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            if (res.status === 404) throw new Error('Histórico escolar not found');
            throw new Error('Failed to fetch histórico escolar');
        }

        const body = await res.json();
        return historicoEscolarSchema.parse(body);
    }

    async getByAlunoId(alunoId) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/historicos-escolares/aluno/${alunoId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Failed to fetch historicos escolares by aluno');

        const body = await res.json();
        return body.map(historicoEscolarSchema.parse);
    }

    async getByDisciplinaId(disciplinaId) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/historicos-escolares/disciplina/${disciplinaId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) throw new Error('Failed to fetch historicos escolares by disciplina');

        const body = await res.json();
        return body.map(historicoEscolarSchema.parse);
    }

    async create(novoHistoricoEscolar) {
        const token = localStorage.getItem('token');

        const validated = novoHistoricoEscolarSchema.parse(novoHistoricoEscolar);

        const res = await fetch(API_URL + '/historicos-escolares', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validated)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Failed to create histórico escolar');
        }

        const body = await res.json();
        return historicoEscolarSchema.parse(body);
    }

    async update(id, updateData) {
        const token = localStorage.getItem('token');

        const validated = novoHistoricoEscolarSchema.parse(updateData);

        const res = await fetch(API_URL + `/historicos-escolares/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(validated)
        });

        if (!res.ok) {
            const errorData = await res.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Failed to update histórico escolar');
        }

        const body = await res.json();
        return historicoEscolarSchema.parse(body);
    }

    async delete(id) {
        const token = localStorage.getItem('token');

        const res = await fetch(API_URL + `/historicos-escolares/${id}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            let msg = "Failed to delete histórico escolar";
            try {
                const errorData = await res.json();
                msg = errorData.message || msg;
            } catch {}
            throw new Error(msg);
        }
    }
}

export default new HistoricoEscolarService();
