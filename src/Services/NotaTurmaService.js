import { z } from 'zod';

import { API_URL } from '../utils/env.js'

import { alunoSchema } from './AlunoService.js';

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

const turmaWithAlunosSchema = turmaSchema.extend({
    alunos: z.array(alunoSchema)
});

class TurmaService {
  async getAll() {
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/turmas`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      const turmas = await response.json();
      
      return turmas.map(turma => ({
        id: turma.id,
        nome: turma.nome,
        turno: turma.turno,
        serie: turma.serie,
        tipo: this.determinarTipoTurma(turma.serie),
        alunos: turma.alunos || []
      }));
    } catch (error) {
      console.error('❌ Erro no TurmaService.getAll:', error);
      throw error;
    }
  }

  async create(turmaData) {
    try {
      const token = localStorage.getItem('token');
      console.log('📤 Criando turma:', turmaData);
      
      const response = await fetch(`${API_URL}/turmas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(turmaData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const novaTurma = await response.json();
      return novaTurma;
    } catch (error) {
      console.error('❌ Erro no TurmaService.create:', error);
      throw error;
    }
  }

  determinarTipoTurma(serie) {
    if (!serie) return 'fundamental1';
    
    if (serie.includes('1º') || serie.includes('2º') || serie.includes('3º') || 
        serie.includes('4º') || serie.includes('5º')) {
      return 'fundamental1';
    }
    
    if (serie.includes('6º') || serie.includes('7º') || serie.includes('8º') || 
        serie.includes('9º')) {
      return 'fundamental2';
    }
    
    return 'fundamental1';
  }
}

export default new TurmaService();