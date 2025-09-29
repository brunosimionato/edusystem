import { z } from 'zod'

import { API_URL } from '../utils/env.js'

const roleSchema = z.enum(['professor', 'secretaria', 'aluno'])

const loginPayload = z.object({
    email: z.email(),
    password: z.string(),
    role: roleSchema
})

const loginResponse = z.object({
    token: z.string()
})

class AuthService {
    async login(payload) {
        const data = loginPayload.parse(payload)

        const res = await fetch(API_URL + '/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })

        if (!res.ok) {
            throw new Error('Login failed')
        }

        const body = await res.json()
        const { token } = loginResponse.parse(body)

        return { token, role: data.role }
    }
}

export default new AuthService()