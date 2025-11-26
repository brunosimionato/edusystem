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


// SCHEMA DE ALUNO (sem histórico — histórico fica livre)

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
  createdAt: z.union([z.string(), z.date()]).optional(),
  updatedAt: z.union([z.string(), z.date()]).optional(),

  historicoEscolar: z.any().optional()
});


// SCHEMA PARA ENVIO AO BACKEND (sem validação de histórico)

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

  async getAll() {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/alunos`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Erro ao buscar alunos");

    const body = await res.json();
    return body.map(alunoSchema.parse);
  }


  // GET BY ID 

  async getById(id) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/alunos/${id}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Erro ao buscar aluno");

    const body = await res.json();

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
  }

  async getByTurma(idTurma) {
    const token = localStorage.getItem("token");

    const res = await fetch(`${API_URL}/alunos/turma/${idTurma}`, {
      headers: { "Authorization": `Bearer ${token}` }
    });

    if (!res.ok) throw new Error("Erro ao buscar alunos por turma");

    return await res.json();
  }


  // CREATE
async create(alunoData) {
  const token = localStorage.getItem("token");

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

    turma: Number(alunoData.turma),

    historicoEscolar: alunoData.historicoEscolar ?? null
  };

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
  const msg = await res.json().catch(() => null);



  throw new Error("Erro ao criar aluno");
}


  const body = await res.json();
  return alunoSchema.parse(body);
}


// UPDATE
async update(id, updateData) {
    const token = localStorage.getItem("token");

    let historicoConvertido = null;

    if (Array.isArray(updateData.historicoEscolar)) {
        historicoConvertido = [];

        updateData.historicoEscolar.forEach(item => {
            const ano = item.serieAnterior;
            const escola = item.escolaAnterior;
            const anoConclusao = item.anoConclusao;

            Object.entries(item.notas).forEach(([materia, nota]) => {
                if (nota !== "" && nota !== null) {
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
