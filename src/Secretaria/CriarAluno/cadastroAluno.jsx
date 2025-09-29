import { useState } from "react";

import AlunoForm from "../../components/AlunoForm/alunoForm";

import { useDisciplinas } from "../../hooks/useDisciplinas";
import { useCreateAluno } from '../../hooks/useCreateAluno'
import { useCreateHistoricoEscolar } from '../../hooks/useCreateHistorico'


// mapeamento do nome interno, utilizado dentro dos objetos, para o nome exibido na interface e salvo no banco
const disciplinasMap = {
  portugues: "Português",
  matematica: "Matemática",
  ciencias: "Ciências",
  historia: "História",
  geografia: "Geografia",
  ingles: "Inglês",
  artes: "Artes",
  edFisica: "Educação Física",
  religiao: "Religião",
};


export default function CadastroAlunoPage() {
  const [mostrarEdicao, setMostrarEdicao] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);
  const { disciplinas } = useDisciplinas();
  const { create: createAluno } = useCreateAluno();
  const { create: createHistorico } = useCreateHistoricoEscolar();

  const handleCreate = async (payload) => {
    const aluno = await createAluno({
      nome: payload.nome,
      cns: payload.cns,
      nascimento: payload.dataNascimento,
      genero: payload.genero,
      religiao: payload.religiao,
      telefone: payload.telefone,
      logradouro: payload.rua,
      numero: payload.numero,
      bairro: payload.bairro,
      cep: payload.cep,
      cidade: payload.cidade,
      estado: payload.estado,
      responsavel1Nome: payload.nomeR1,
      responsavel1Cpf: payload.cpfR1,
      responsavel1Telefone: payload.telefoneR1,
      responsavel1Parentesco: payload.parentescoR1,
      responsavel2Nome: payload.nomeR2,
      responsavel2Cpf: payload.cpfR2,
      responsavel2Telefone: payload.telefoneR2,
      responsavel2Parentesco: payload.parentescoR2
    });

    if (payload.alunoOutraEscola) {
      // criar historicos escolares
      for (const ano of payload.historicoEscolar) {
        if (['1ano', '2ano', '3ano', '4ano', '5ano'].includes(ano.serieAnterior)) {
          await createHistorico({
            idAluno: aluno.id,
            // idDisciplina: , // não aplicável para 1º a 5º ano
            nomeEscola: ano.escolaAnterior,
            serieConcluida: ano.serieAnterior,
            nota: ano.notaConclusao,
            anoConclusao: Number.parseInt(ano.anoConclusao)
          });
        } else {
          for (const [key, valor] of Object.entries(ano.notas)) {
            const disciplinaId = disciplinas.find(d => d.nome === disciplinasMap[key])?.id;
            if (!disciplinaId) {
              console.error(`Disciplina não encontrada para a matéria: ${disciplinasMap[key]}`);
              continue; // pula para a próxima iteração se a disciplina não for encontrada
            }

            await createHistorico({
              idAluno: aluno.id,
              idDisciplina: disciplinaId,
              nomeEscola: ano.escolaAnterior,
              serieConcluida: ano.serieAnterior,
              nota: valor,
              anoConclusao: Number.parseInt(ano.anoConclusao)
            });
          }
        }
      }
    }

  }

  return (
    <div className="cadastro-aluno-page">
      <AlunoForm onSave={handleCreate} />
    </div>
  );
}