import { z } from 'zod';

const novaTurmaSchema = z.object({
    nome: z.string(),
    anoEscolar: z.number().int(),
    quantidadeMaxima: z.number().int(),
    turno: z.string(),
    serie: z.string()
});

const turmaSchema = z.object({
    id: z.number(),
    nome: z.string(),
    anoEscolar: z.number().int(),
    quantidadeMaxima: z.number().int(),
    turno: z.string(),
    serie: z.string(),
    createdAt: z.union([z.string(), z.date()]).optional(),
    updatedAt: z.union([z.string(), z.date()]).optional()
});

class TurmaService {
    async list() {
        const jwt = localStorage.getItem('token');

        const res = await fetch(`${API_URL}/turmas`, {
            headers: { 'Authorization': `Bearer ${jwt}` }
        });

        if (!res.ok) throw new Error('Failed to fetch turmas');

        const data = await res.json();

        return turmaSchema.array().parse(data).map(t => ({ ...t, alunosMatriculados: 0 }));
    }

    async create(novaTurma) {
        const jwt = localStorage.getItem('token');

        const body = novaTurmaSchema.parse(novaTurma);

        const res = await fetch(`${API_URL}/turmas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${jwt}`
            },
            body: JSON.stringify(body)
        });

        if (!res.ok) {
            const errorData = await res.json();
            throw new Error(errorData.message || errorData.error || 'Failed to create turma');
        }

        const data = await res.json();

        return turmaSchema.parse(data);
    }

    async delete(id) {
        const jwt = localStorage.getItem('token');
        const res = await fetch(`${API_URL}/turmas/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${jwt}` }
        });
        if (!res.ok) {
            let msg = 'Failed to delete turma';
            try {
                const errorData = await res.json();
                msg = errorData.message || errorData.error || msg;
            } catch { }
            throw new Error(msg);
        }
    }
}

const API_URL = 'http://localhost:3000' // TODO: Move to env variable

export default new TurmaService();