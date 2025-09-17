import { useState } from "react";
import { Users, Plus, XCircle, Trash2, Printer } from "lucide-react";
import "./criarTurma.css";

import { useTurmas } from "./useTurma";
import { useCreateTurma } from "./useCreateTurma";
import { useDeleteTurma } from "./useDeleteTurma";

const CriarTurma = () => {
  const { turmas, hasError, isLoading, refetch } = useTurmas();
  const { remove, isDeleting } = useDeleteTurma();

  const handleRemoveTurma = async (id) => {
    const turma = turmas.find((t) => t.id === id);

    if (turma && turma.alunosMatriculados > 0) {
      const confirmar = window.confirm(
        `A turma "${turma.nome}" possui ${turma.alunosMatriculados} alunos matriculados. Deseja realmente removê-la?`
      );
      if (!confirmar) return;
    } else {
      const confirmar = window.confirm(
        `Deseja realmente remover a turma "${turma.nome}"?`
      );
      if (!confirmar) return;
    }

    try {
      await remove(id);
      await refetch();
    } catch (err) {
      alert(err.message || 'Erro ao remover turma');
    }
  };

  const handlePrintTurmas = () => {
    window.print();
  };

  return (
    <div className="cadastro-turma-form-container">
      <NovaTurmaForm onCreated={refetch} />

      <div className="cadastro-turma-form-section">
        <div className="cadastro-turma-section-header-with-button">
          <h3 className="cadastro-turma-section-header-turmas">
            Turmas Cadastradas
          </h3>
          <button
            className="print-turmas-button green-button"
            onClick={handlePrintTurmas}
          >
            <Printer size={17} /> Imprimir
          </button>
        </div>

        {turmas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={48} />
            </div>
            <h4>Nenhuma turma cadastrada</h4>
            <p>Cadastre a primeira turma usando o formulário acima.</p>
          </div>
        ) : (
          <div className="cadastro-turmas-list">
            {turmas.map((turma) => {
              const percentualOcupacao = (
                (turma.alunosMatriculados / turma.quantidadeMaxima) *
                100
              ).toFixed(0);

              return (
                <div key={turma.id} className="cadastro-turma-card">
                  <div className="turma-info">
                    <div className="turma-header">
                      <div className="turma-header-info">
                        <h4 className="turma-nome">{turma.nome}</h4>
                        <span
                          className={`turma-turno turno-${turma.turno.toLowerCase()}`}
                        >
                          {turma.turno}
                        </span>
                      </div>

                      <button
                        className="remove-turma-button"
                        onClick={() => handleRemoveTurma(turma.id)}
                        title="Remover turma"
                        disabled={isDeleting}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="turma-details">
                      <span className="alunos-count">
                        <strong>{turma.alunosMatriculados}</strong> de{" "}
                        <strong>{turma.quantidadeMaxima}</strong> alunos matriculados
                      </span>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{ width: `${percentualOcupacao}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const NovaTurmaForm = ({ onCreated }) => {
  const [nomeTurma, setNomeTurma] = useState("");
  const [turno, setTurno] = useState("");
  const [quantidadeMaxima, setQuantidadeMaxima] = useState("");

  const [erros, setErros] = useState({
    nomeTurma: false,
    turno: false,
    quantidadeMaxima: false,
  });

  const { create, isCreating } = useCreateTurma();

  const handleCreateTurma = async (event) => {
    event.preventDefault();

    let temErro = false;
    const novosErros = {
      nomeTurma: false,
      turno: false,
      quantidadeMaxima: false,
    };

    if (!nomeTurma.trim()) {
      novosErros.nomeTurma = true;
      temErro = true;
    }

    if (!turno.trim() || turno === " ") {
      novosErros.turno = true;
      temErro = true;
    }

    if (!quantidadeMaxima || parseInt(quantidadeMaxima) <= 0) {
      novosErros.quantidadeMaxima = true;
      temErro = true;
    }

    setErros(novosErros);

    if (temErro) {
      alert("Por favor, preencha corretamente os campos obrigatórios.");
      return;
    }

    try {
      await create({
        nome: nomeTurma,
        turno,
        quantidadeMaxima: parseInt(quantidadeMaxima),
        anoEscolar: new Date().getFullYear(),
        serie: "N/A",
      });
      await onCreated?.();
      handleClearForm(false);
      alert("Turma cadastrada com sucesso!");
    } catch (err) {
      alert(err.message || 'Erro ao cadastrar turma');
    }
  };

  const handleClearForm = (confirmar = true) => {
    if (confirmar) {
      const querLimpar = window.confirm(
        "Tem certeza que deseja limpar o formulário?"
      );
      if (!querLimpar) return;
    }

    setNomeTurma("");
    setTurno("");
    setQuantidadeMaxima("");
    setErros({
      nomeTurma: false,
      turno: false,
      quantidadeMaxima: false,
    });
  };

  return (
    <div className="cadastro-turma-form-section">
      <h3 className="cadastro-turma-section-header">Nova Turma</h3>
      <form onSubmit={handleCreateTurma}>
        <div className="cadastro-turma-form-grid">
          <div className="cadastro-turma-form-group half-width">
            <label htmlFor="nomeTurma">Nome da Turma*</label>
            <div className="cadastro-turma-input-wrapper">
              <input
                type="text"
                id="nomeTurma"
                className={`cadastro-turma-input ${erros.nomeTurma ? "input-error" : ""}`}
                value={nomeTurma}
                onChange={(e) => setNomeTurma(e.target.value)}
              />
            </div>
          </div>

          <div className="cadastro-turma-form-group quarter-width">
            <label htmlFor="turno">Turno*</label>
            <div className="cadastro-turma-input-wrapper">
              <select
                id="turno"
                className={`cadastro-turma-select ${erros.turno ? "input-error" : ""}`}
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
              >
                <option value=" ">Selecione</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
              </select>
            </div>
          </div>

          <div className="cadastro-turma-form-group quarter-width">
            <label htmlFor="quantidadeMaxima">Máximo de Alunos*</label>
            <div className="cadastro-turma-input-wrapper">
              <input
                type="number"
                id="quantidadeMaxima"
                className={`cadastro-turma-input ${erros.quantidadeMaxima ? "input-error" : ""}`}
                value={quantidadeMaxima}
                onChange={(e) => setQuantidadeMaxima(e.target.value)}
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="cadastro-turma-form-actions">
          <button
            type="button"
            className="cadastro-turma-clear-button red-button"
            onClick={() => handleClearForm(true)}
          >
            <XCircle size={17} /> Limpar
          </button>
          <button
            type="submit"
            className="cadastro-turma-submit-button blue-button"
            disabled={isCreating}
          >
            <Plus size={17} /> {isCreating ? 'Cadastrando...' : 'Cadastrar Turma'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CriarTurma;