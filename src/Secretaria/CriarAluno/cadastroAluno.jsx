import { useState } from "react";

import AlunoForm from "../../components/AlunoForm/alunoForm";
import { useCreateAluno } from "../../hooks/useCreateAluno";

export default function CadastroAlunoPage() {
  const { create: createAluno } = useCreateAluno();

const handleCreate = async (payload) => {
  try {

    await createAluno(payload);

    alert("Aluno cadastrado com sucesso!");

    return true;

  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);

    const msg = error?.message?.toLowerCase() || "";

    if (msg.includes("cpf") || msg.includes("unique") || msg.includes("duplic")) {
      alert("Já existe um aluno cadastrado com esse CPF.");
    } else {
      alert("Erro ao cadastrar aluno: " + error.message);
    }

    throw error;
  }
};


  return (
    <div className="cadastro-aluno-page">
      <AlunoForm onSave={handleCreate} />
    </div>
  );
}
