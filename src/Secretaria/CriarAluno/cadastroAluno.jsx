// src/pages/CadastroAluno/CadastroAlunoPage.jsx
import { useState } from "react";

import AlunoForm from "../../components/AlunoForm/alunoForm";
import { useCreateAluno } from "../../hooks/useCreateAluno";

export default function CadastroAlunoPage() {
  const { create: createAluno } = useCreateAluno();

const handleCreate = async (payload) => {
  try {
    console.log("📤 Enviando para o backend:", payload);

    await createAluno(payload);

    alert("Aluno cadastrado com sucesso!");

    return true; // sucesso → form limpa

  } catch (error) {
    console.error("Erro ao cadastrar aluno:", error);

    const msg = error?.message?.toLowerCase() || "";

    // 🔥 Verifica se o backend enviou erro de CPF duplicado
    if (msg.includes("cpf") || msg.includes("unique") || msg.includes("duplic")) {
      alert("Já existe um aluno cadastrado com esse CPF.");
    } else {
      alert("Erro ao cadastrar aluno: " + error.message);
    }

    // 🔥 Impede o cadastro e evita limpar o formulário
    throw error;
  }
};


  return (
    <div className="cadastro-aluno-page">
      <AlunoForm onSave={handleCreate} />
    </div>
  );
}
