// src/services/NotaService.js
import { API_URL } from '../utils/env.js';

class NotaService {
  async getByAluno(alunoId, anoLetivo, trimestre) {
    try {
      const token = localStorage.getItem('token');
      const url = new URL(`${API_URL}/notas`);
      url.searchParams.append('idAluno', alunoId);
      url.searchParams.append('anoLetivo', anoLetivo);
      if (trimestre) {
        url.searchParams.append('trimestre', trimestre);
      }

      console.log(`🔍 Buscando notas do aluno ${alunoId}:`, url.toString());

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      console.log(`📊 Status das notas do aluno ${alunoId}:`, response.status);

      if (!response.ok) {
        console.warn(`⚠️  Não foi possível carregar notas do aluno ${alunoId}: ${response.status}`);
        return [];
      }

      const notas = await response.json();
      console.log(`✅ Notas do aluno ${alunoId}:`, notas);
      return notas;

    } catch (error) {
      console.warn(`⚠️  Erro ao buscar notas do aluno ${alunoId}:`, error.message);
      return [];
    }
  }

  async getByTurma(turmaId, anoLetivo, trimestre) {
    try {
      const token = localStorage.getItem('token');
      const url = new URL(`${API_URL}/notas`);
      url.searchParams.append('idTurma', turmaId);
      url.searchParams.append('anoLetivo', anoLetivo);
      if (trimestre) {
        url.searchParams.append('trimestre', trimestre);
      }

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn(`⚠️  Não foi possível carregar notas da turma ${turmaId}: ${response.status}`);
        return [];
      }

      return await response.json();
    } catch (error) {
      console.warn(`⚠️  Erro ao buscar notas da turma ${turmaId}:`, error.message);
      return [];
    }
  }

  async create(notaData) {
    try {
      const token = localStorage.getItem('token');
      console.log('📤 Criando nota:', notaData);
      
      // Valida se todos os campos obrigatórios estão presentes
      if (!notaData.idTurma) {
        throw new Error('idTurma é obrigatório para criar uma nota');
      }

      const response = await fetch(`${API_URL}/notas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notaData),
      });

      console.log('📊 Status da criação da nota:', response.status);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const notaCriada = await response.json();
      console.log('✅ Nota criada:', notaCriada);
      return notaCriada;

    } catch (error) {
      console.error('❌ Erro no NotaService.create:', error);
      throw error;
    }
  }

  async update(id, notaData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notas/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notaData),
      });

      if (!response.ok) {
        throw new Error(`Erro ao atualizar nota: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro no NotaService.update:', error);
      throw error;
    }
  }

  async delete(id) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao deletar nota: ${response.statusText}`);
      }

      return true;
    } catch (error) {
      console.error('Erro no NotaService.delete:', error);
      throw error;
    }
  }
}

export default new NotaService();