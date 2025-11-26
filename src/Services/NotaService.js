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
      console.log('📤 Criando nota (ORIGINAL 0-100):', notaData);
      
      const notaAjustada = {
        ...notaData,
        nota: parseFloat((notaData.nota / 10).toFixed(2))
      };
      
      delete notaAjustada.tipo;
      
      if (notaAjustada.idDisciplina === 0) {
        notaAjustada.idDisciplina = 1;
      }

      console.log('📤 Criando nota (CONVERTIDA 0-10):', notaAjustada);

      const response = await fetch(`${API_URL}/notas`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notaAjustada),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('❌ Erro no NotaService.create:', error);
      throw error;
    }
  }
  
  async update(id, notaData) {
    try {
      const token = localStorage.getItem('token');
      
      const notaAjustada = {
        ...notaData,
        nota: notaData.nota !== undefined ? parseFloat((notaData.nota / 10).toFixed(2)) : undefined
      };
      delete notaAjustada.tipo;
      
      const response = await fetch(`${API_URL}/notas/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(notaAjustada),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
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

  async getMediasTrimestrais(alunoId, anoLetivo) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notas/aluno/${alunoId}/medias?anoLetivo=${anoLetivo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar médias: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar médias:', error);
      throw error;
    }
  }

  async getSituacaoFinal(alunoId, anoLetivo) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notas/aluno/${alunoId}/situacao?anoLetivo=${anoLetivo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar situação: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar situação:', error);
      throw error;
    }
  }

  async getBoletimCompleto(alunoId, anoLetivo) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/notas/aluno/${alunoId}/boletim?anoLetivo=${anoLetivo}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Erro ao buscar boletim: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erro ao buscar boletim:', error);
      throw error;
    }
  }
}

export default new NotaService();