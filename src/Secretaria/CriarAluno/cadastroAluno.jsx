import { useState } from "react";

import AlunoForm from "../../components/AlunoForm/alunoForm";

import { useDisciplinas } from "../../hooks/useDisciplinas";
import { useCreateAluno } from '../../hooks/useCreateAluno'
import { useCreateHistoricoEscolar } from '../../hooks/useCreateHistoricoEscolar'


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
  const { create: createHistoricoEscolar } = useCreateHistoricoEscolar();

  const handleCreate = async (payload) => {
      try {
        // Mapear campos do frontend para o backend
        const alunoData = {
          nome: payload.nome,
          cns: payload.cns,
          nascimento: payload.dataNascimento, // Converter para Date se necessário
          genero: payload.genero,
          religiao: payload.religiao || null,
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
          responsavel2Nome: payload.nomeR2 || null,
          responsavel2Cpf: payload.cpfR2 || null,
          responsavel2Telefone: payload.telefoneR2 || null,
          responsavel2Parentesco: payload.parentescoR2 || null
        };    

    const aluno = await createAluno(alunoData);
    
    // Criar histórico escolar se necessário
    if (payload.alunoOutraEscola && payload.historicoEscolar) {
      for (const historico of payload.historicoEscolar) {
        await createHistoricoEscolar({
          idAluno: aluno.id,
          idDisciplina: historico.idDisciplina || null, // Mapear disciplinas
          nomeEscola: historico.escolaAnterior,
          serieConcluida: historico.serieAnterior,
          nota: parseFloat(historico.notaConclusao || historico.notas?.portugues || 0),
          anoConclusao: parseInt(historico.anoConclusao)
        });
      }
    }
    
    alert('Aluno cadastrado com sucesso!');
  } catch (error) {
    console.error('Erro ao cadastrar aluno:', error);
    alert(`Erro: ${error.message}`);
  }
};

  

  return (
    <div className="cadastro-aluno-page">
      <AlunoForm onSave={handleCreate} />
    </div>
  );
}