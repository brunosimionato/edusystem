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

      return true; // ✅ Indica sucesso

    } catch (error) {
      console.error("Erro ao cadastrar aluno:", error);

      // Se erro for CPF duplicado (unique constraint)
      if (error?.message?.toLowerCase().includes("cpf")) {
        alert("Já existe um aluno cadastrado com esse CPF.");
      } else {
        alert("Erro ao cadastrar aluno: " + error.message);
      }

      throw error; // ✅ devolve erro para o Form não limpar
    }
  };

  return (
    <div className="cadastro-aluno-page">
      <AlunoForm onSave={handleCreate} />
    </div>
  );
}
