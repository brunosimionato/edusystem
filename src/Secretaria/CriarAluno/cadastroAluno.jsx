// src/Secretaria/CriarAluno/cadastroAluno.jsx
import React, { useState } from "react";
import AlunoForm from "../../components/AlunoForm/alunoForm";
import "../../components/AlunoForm/alunoForm.css";

export default function CadastroAlunoPage() {
  const [mostrarEdicao, setMostrarEdicao] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] = useState(null);

  // Exemplo: simula clique no botão editar
  const handleEditarAluno = (aluno) => {
    setAlunoSelecionado(aluno);
    setMostrarEdicao(true);
  };

  const handleFecharEdicao = () => {
    setMostrarEdicao(false);
    setAlunoSelecionado(null);
  };

  return (
    <div className="cadastro-aluno-page">

      {/* Formulário principal */}
      <AlunoForm />

      {/* Modal de Edição */}
      {mostrarEdicao && (
        <div className="modal-overlay">
          <div className="modal-content">
            <AlunoForm aluno={alunoSelecionado} modo="edicao" />
          </div>
        </div>
      )}
    </div>
  );
}
