import { useState } from "react";
import AlunoForm from "../../components/AlunoForm/alunoForm";

export default function CadastroAlunoPage() {
  const [mostrarEdicao, setMostrarEdicao] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);


  const handleFecharEdicao = () => {
    setMostrarEdicao(false);
    setAlunoSelecionado(null);
  };

  return (
    <div className="cadastro-aluno-page">
      <AlunoForm />

      {/* Modal de Edição */}
      {mostrarEdicao && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlunoForm aluno={alunoSelecionado} modo="edicao" />
            <button onClick={handleFecharEdicao}>Fechar</button>
          </div>
        </div>
      )}
    </div>
  );
}
