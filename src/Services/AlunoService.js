import { z } from "zod";
import { API_URL } from "../utils/env.js";

// MAPA DE DISCIPLINAS (ID → CHAVE INTERNA DO FORM)
const disciplinaMapFront = {
  1: "matematica",
  2: "ensinoGlobalizado",
  3: "portugues",
  4: "ciencias",
  5: "historia",
  6: "geografia",
  7: "ingles",
  8: "arte",
  9: "edFisica"
};

// Mapa reverso: nome → id
const disciplinaMapFrontRev = Object.fromEntries(
  Object.entries(disciplinaMapFront).map(([id, nome]) => [nome, Number(id)])
);

// CONVERTENDO HISTÓRICO DO BACK PARA O FORMULÁRIO
function converterHistoricoBackendParaFront(historico) {
  if (!Array.isArray(historico)) return [];

  const porAno = {};

  historico.forEach(h => {
    const ano = h.serie_concluida;

    if (!porAno[ano]) {
      porAno[ano] = {
        escolaAnterior: h.nome_escola,
        serieAnterior: ano,
        anoConclusao: h.ano_conclusao,
        notas: {
          ensinoGlobalizado: "",
          matematica: "",
          portugues: "",
          ciencias: "",
          historia: "",
          geografia: "",
          ingles: "",
          arte: "",
          edFisica: "",
        }
      };
    }

    const materia = disciplinaMapFront[h.id_disciplina];
    if (materia) {
      porAno[ano].notas[materia] = h.nota;
    }
  });

  return Object.values(porAno).sort((a, b) =>
    a.serieAnterior.localeCompare(b.serieAnterior)
  );
}

// SCHEMA DE ALUNO
export const alunoSchema = z.object({
  id: z.number(),
  nome: z.string(),
  cpf: z.string(),
  cns: z.string().nullable().optional(),
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
  serie: z.string().nullable().optional(),
  anoLetivo: z.string().nullable().optional(),
  turma: z.union([z.string(), z.number()]).nullable().optional(),
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),
  historicoEscolar: z.any().optional()
});

// SCHEMA PARA ENVIO AO BACKEND
export const novoAlunoSchema = z.object({
  nome: z.string(),
  cpf: z.string(),
  cns: z.string().nullable().optional(),
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
  historicoEscolar: z.any().nullable().optional()
});

class AlunoService {
  // Função auxiliar para verificar autenticação
  getAuthHeaders() {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuário não autenticado. Faça login novamente.");
    }
    
    return {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    };
  }

  // Função auxiliar para tratar erros de API
  async handleResponse(res) {
    if (!res.ok) {
      let errorMessage = `Erro ${res.status}: ${res.statusText}`;
      
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorData.error || errorMessage;
        
        // Verifica erros específicos
        if (errorMessage.toLowerCase().includes("cpf")) {
          errorMessage = "CPF já cadastrado no sistema.";
        } else if (errorMessage.toLowerCase().includes("foreign key") || 
                   errorMessage.toLowerCase().includes("constraint") ||
                   errorMessage.toLowerCase().includes("viola restrição")) {
          errorMessage = "Não é possível excluir este aluno. Existem registros vinculados que impedem a exclusão.";
        } else if (res.status === 401) {
          errorMessage = "Sessão expirada. Faça login novamente.";
          localStorage.removeItem("token");
        } else if (res.status === 403) {
          errorMessage = "Você não tem permissão para realizar esta ação.";
        }
      } catch (e) {
        // Não conseguiu parsear JSON, mantém a mensagem original
      }
      
      throw new Error(errorMessage);
    }
    
    // Se for 204 No Content, retorna sucesso sem corpo
    if (res.status === 204) {
      return { success: true, message: "Operação realizada com sucesso" };
    }
    
    return await res.json();
  }

  // GET ALL (simples, sem filtro de ativos)
  async getAll() {
    try {
      const res = await fetch(`${API_URL}/alunos`, {
        headers: this.getAuthHeaders()
      });
      
      const data = await this.handleResponse(res);
      return data.map(alunoSchema.parse);
    } catch (error) {
      console.error("Erro ao buscar alunos:", error);
      throw error;
    }
  }

  // GET BY ID
  async getById(id) {
    try {
      const res = await fetch(`${API_URL}/alunos/${id}`, {
        headers: this.getAuthHeaders()
      });
      
      const body = await this.handleResponse(res);

      // Se vier histórico do backend, normaliza antes
      if (Array.isArray(body.historicoEscolar)) {
        // normaliza para o formato uniforme
        body.historicoEscolar = body.historicoEscolar.map(h => ({
          id_historico: h.id,
          id_disciplina: h.idDisciplina,
          nome_escola: h.nomeEscola,
          serie_concluida: h.serieConcluida,
          nota: h.nota,
          ano_conclusao: h.anoConclusao,
        }));

        // converte pro formato do formulário
        body.historicoEscolar = converterHistoricoBackendParaFront(body.historicoEscolar);
      }

      // valida apenas os campos do aluno (não valida histórico)
      return alunoSchema.parse(body);
    } catch (error) {
      console.error(`Erro ao buscar aluno ID ${id}:`, error);
      throw error;
    }
  }

  // GET BY TURMA (simples, sem filtro de ativos)
  async getByTurma(idTurma) {
    try {
      const res = await fetch(`${API_URL}/alunos/turma/${idTurma}`, {
        headers: this.getAuthHeaders()
      });
      
      const data = await this.handleResponse(res);
      
      // Processa histórico escolar para cada aluno
      return data.map(aluno => {
        if (Array.isArray(aluno.historicoEscolar)) {
          aluno.historicoEscolar = converterHistoricoBackendParaFront(aluno.historicoEscolar);
        }
        return alunoSchema.parse(aluno);
      });
    } catch (error) {
      console.error(`Erro ao buscar alunos da turma ${idTurma}:`, error);
      throw error;
    }
  }

  // CREATE
  async create(alunoData) {
    try {
      // Prepara dados para backend
      const backendData = {
        nome: alunoData.nome,
        cpf: alunoData.cpf,
        cns: alunoData.cns || null,
        nascimento: alunoData.nascimento,
        genero: alunoData.genero,
        religiao: alunoData.religiao || null,
        telefone: alunoData.telefone,
        logradouro: alunoData.logradouro,
        numero: alunoData.numero,
        bairro: alunoData.bairro,
        cep: alunoData.cep,
        cidade: alunoData.cidade,
        estado: alunoData.estado,
        responsavel1Nome: alunoData.responsavel1Nome,
        responsavel1Cpf: alunoData.responsavel1Cpf,
        responsavel1Telefone: alunoData.responsavel1Telefone,
        responsavel1Parentesco: alunoData.responsavel1Parentesco,
        responsavel2Nome: alunoData.responsavel2Nome || null,
        responsavel2Cpf: alunoData.responsavel2Cpf || null,
        responsavel2Telefone: alunoData.responsavel2Telefone || null,
        responsavel2Parentesco: alunoData.responsavel2Parentesco || null,
        turma: Number(alunoData.turma) || null,
        historicoEscolar: alunoData.historicoEscolar ?? null
      };

      // Valida dados
      const validatedData = novoAlunoSchema.parse(backendData);

      // Se houver histórico, converte para formato do backend
      if (Array.isArray(validatedData.historicoEscolar) && validatedData.historicoEscolar.length > 0) {
        const historicoConvertido = [];

        validatedData.historicoEscolar.forEach(item => {
          const ano = item.serieAnterior;
          const escola = item.escolaAnterior;
          const anoConclusao = item.anoConclusao;

          Object.entries(item.notas).forEach(([materia, nota]) => {
            if (nota !== "" && nota !== null && disciplinaMapFrontRev[materia]) {
              historicoConvertido.push({
                id_disciplina: disciplinaMapFrontRev[materia],
                nome_escola: escola,
                serie_concluida: ano,
                ano_conclusao: anoConclusao,
                nota: Number(nota)
              });
            }
          });
        });

        validatedData.historicoEscolar = historicoConvertido.length > 0 ? historicoConvertido : null;
      }

      const res = await fetch(`${API_URL}/alunos`, {
        method: "POST",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(validatedData),
      });

      const data = await this.handleResponse(res);
      return alunoSchema.parse(data);
    } catch (error) {
      console.error("Erro ao criar aluno:", error);
      throw error;
    }
  }

  // UPDATE
  async update(id, updateData) {
    try {
      let historicoConvertido = null;

      // Converte histórico escolar para formato do backend
      if (Array.isArray(updateData.historicoEscolar) && updateData.historicoEscolar.length > 0) {
        historicoConvertido = [];

        updateData.historicoEscolar.forEach(item => {
          const ano = item.serieAnterior;
          const escola = item.escolaAnterior;
          const anoConclusao = item.anoConclusao;

          Object.entries(item.notas).forEach(([materia, nota]) => {
            if (nota !== "" && nota !== null && disciplinaMapFrontRev[materia]) {
              historicoConvertido.push({
                id_disciplina: disciplinaMapFrontRev[materia],
                nome_escola: escola,
                serie_concluida: ano,
                ano_conclusao: anoConclusao,
                nota: Number(nota)
              });
            }
          });
        });
      }

      const backendData = {
        nome: updateData.nome,
        cpf: updateData.cpf,
        cns: updateData.cns || null,
        nascimento: updateData.nascimento,
        genero: updateData.genero,
        religiao: updateData.religiao || null,
        telefone: updateData.telefone,
        logradouro: updateData.logradouro,
        numero: updateData.numero,
        bairro: updateData.bairro,
        cep: updateData.cep,
        cidade: updateData.cidade,
        estado: updateData.estado,
        responsavel1Nome: updateData.responsavel1Nome,
        responsavel1Cpf: updateData.responsavel1Cpf,
        responsavel1Telefone: updateData.responsavel1Telefone,
        responsavel1Parentesco: updateData.responsavel1Parentesco,
        responsavel2Nome: updateData.responsavel2Nome || null,
        responsavel2Cpf: updateData.responsavel2Cpf || null,
        responsavel2Telefone: updateData.responsavel2Telefone || null,
        responsavel2Parentesco: updateData.responsavel2Parentesco || null,
        turma: Number(updateData.turma) || null,
        historicoEscolar: historicoConvertido
      };

      const validatedData = novoAlunoSchema.parse(backendData);

      const res = await fetch(`${API_URL}/alunos/${id}`, {
        method: "PUT",
        headers: this.getAuthHeaders(),
        body: JSON.stringify(validatedData),
      });

      const data = await this.handleResponse(res);
      return alunoSchema.parse(data);
    } catch (error) {
      console.error(`Erro ao atualizar aluno ID ${id}:`, error);
      throw error;
    }
  }

  // DELETE
  async delete(id) {
    try {
      console.log("Excluindo aluno ID:", id);
      
      const res = await fetch(`${API_URL}/alunos/${id}`, {
        method: "DELETE",
        headers: this.getAuthHeaders()
      });

      const result = await this.handleResponse(res);
      console.log("Aluno excluído com sucesso:", result);
      return result;
    } catch (error) {
      console.error(`Erro ao excluir aluno ID ${id}:`, error);
      throw error;
    }
  }

  // Verificar se CPF já existe
  async checkCpfExists(cpf, excludeId = null) {
    try {
      const queryParams = new URLSearchParams({ cpf });
      if (excludeId) {
        queryParams.append('excludeId', excludeId);
      }

      const res = await fetch(`${API_URL}/alunos/check-cpf?${queryParams}`, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse(res);
      return data.exists || false;
    } catch (error) {
      console.error("Erro ao verificar CPF:", error);
      return false;
    }
  }

  // Busca com filtros
  async search(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== undefined && value !== '') {
          queryParams.append(key, value);
        }
      });

      const url = queryParams.toString() 
        ? `${API_URL}/alunos/search?${queryParams}`
        : `${API_URL}/alunos/search`;

      const res = await fetch(url, {
        headers: this.getAuthHeaders()
      });

      const data = await this.handleResponse(res);
      return data.map(alunoSchema.parse);
    } catch (error) {
      console.error("Erro ao buscar alunos com filtros:", error);
      throw error;
    }
  }
}

export default new AlunoService();