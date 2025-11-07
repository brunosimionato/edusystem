// src/Services/AuthService.js
import { z } from 'zod';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000';

const roleSchema = z.enum(['professor', 'secretaria', 'aluno']);

const loginPayloadSchema = z.object({
    email: z.string().email(),
    password: z.string(),
    role: roleSchema
});

const loginResponseSchema = z.object({
    token: z.string()
});

const userRegistrationSchema = z.object({
    nome: z.string().min(1, 'Nome é obrigatório'),
    email: z.string().email('Email inválido'),
    senha: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
    tipo_usuario: roleSchema
});

class AuthService {
async login(payload) {
    try {
        const data = loginPayloadSchema.parse(payload);

        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        });

        // Se deu erro no backend, capturamos a mensagem e repassamos
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({
                error: 'Erro ao processar login'
            }));

            throw new Error(errorData.error); // <-- aqui volta para o LoginForm como error.message
        }

        const body = await res.json();
        const { token } = loginResponseSchema.parse(body);

        return { token, role: data.role };

    } catch (error) {
        if (error instanceof z.ZodError) {
            throw new Error('Dados de login inválidos');
        }

        // Repassa mensagem correta para o LoginForm
        throw new Error(error.message || "Erro ao fazer login");
    }
}


    // MÉTODO PÚBLICO - Cria usuário sem necessidade de autenticação
    async createUserPublic(userData) {
        try {
            const data = userRegistrationSchema.parse(userData);

            const res = await fetch(`${API_URL}/usuarios/public`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
                throw new Error(errorData.error || `Falha ao criar usuário: ${res.status}`);
            }

            return await res.json();
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error('Dados de usuário inválidos: ' + error.errors.map(e => e.message).join(', '));
            }
            throw error;
        }
    }

    // Método para criar usuário com autenticação (para uso quando já logado)
    async createUser(userData, authToken) {
        try {
            const data = userRegistrationSchema.parse(userData);

            const res = await fetch(`${API_URL}/usuarios`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Erro desconhecido' }));
                throw new Error(errorData.error || `Falha ao criar usuário: ${res.status}`);
            }

            return await res.json();
        } catch (error) {
            if (error instanceof z.ZodError) {
                throw new Error('Dados de usuário inválidos');
            }
            throw error;
        }
    }
}

export default new AuthService();