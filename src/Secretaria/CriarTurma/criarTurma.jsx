import React, { useState } from "react";
import { Users, Plus, XCircle, Trash2, Printer } from "lucide-react";
import "./criarTurma.css";
import html2pdf from "html2pdf.js";
import { gerarRelatorioTurmas } from "../../Relatorios/listaTurma";

import { useTurmasComAlunos } from "../../hooks/useTurmasComAlunos";

import { useCreateTurma } from "./useCreateTurma";
import { useDeleteTurma } from "./useDeleteTurma";

const CriarTurma = () => {
  const { turmas, refetch } = useTurmasComAlunos();

  const { remove, isDeleting } = useDeleteTurma();

  const handleRemoveTurma = async (id) => {
    const turma = turmas.find((t) => t.id === id);

    if (turma && turma.alunosMatriculados > 0) {
      alert(
        `Não é possível remover a turma "${turma.nome}"\n\n` +
          `Para remover a turma, primeiro transfira ou remova todos os alunos vinculados.`
      );
      return;
    }

    const confirmar = window.confirm(
      `Deseja realmente remover a turma "${turma.nome}"?`
    );

    if (!confirmar) return;

    try {
      await remove(id);
      await refetch();
      alert(`Turma "${turma.nome}" removida com sucesso!`);
    } catch (err) {
      alert(err.message || "Erro ao remover turma");
    }
  };

  const handlePrintTurmas = (e) => {
    e?.stopPropagation?.();

    const dataHoraAgora = new Date().toLocaleString("pt-BR");

    const html = gerarRelatorioTurmas({
      turmas,
      dataHoraAgora,
    });

    const oldFrame = document.getElementById("print-frame");
    if (oldFrame) oldFrame.remove();

    // Cria o iframe oculto
    const iframe = document.createElement("iframe");
    iframe.id = "print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const frameWindow = iframe.contentWindow;
    const frameDoc = frameWindow.document;

    frameDoc.open();
    frameDoc.write(html);
    frameDoc.close();

    iframe.onload = () => {
      setTimeout(() => {
        frameWindow.focus();
        frameWindow.print();
      }, 150);
    };
  };

  // Ordenar turmas por nome (1º, 2º, 3º...)
  const turmasOrdenadas = [...turmas].sort((a, b) => {
    // Extrair números do nome da turma
    const numA = extrairNumeroTurma(a.nome);
    const numB = extrairNumeroTurma(b.nome);
    
    // Se ambos têm números, ordena numericamente
    if (numA !== null && numB !== null) {
      return numA - numB;
    }
    
    // Se só um tem número, o com número vem primeiro
    if (numA !== null && numB === null) return -1;
    if (numA === null && numB !== null) return 1;
    
    // Se nenhum tem número, ordena alfabeticamente
    return a.nome.localeCompare(b.nome);
  });

  // Função para extrair número do nome da turma
  function extrairNumeroTurma(nome) {
    // Procura por padrões como "1º", "1°", "1º ano", "1 ano", "Turma 1", etc.
    const match = nome.match(/(\d+)(?:º|°|ª)?/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  return (
    <div className="criar-turma-container">
      <NovaTurmaForm onCreated={refetch} />

      <div className="criar-turma-section">
        <div className="criar-turma-header-with-button">
          <h3 className="criar-turma-titulo-lista">
            Turmas Cadastradas ({turmasOrdenadas.length})
          </h3>
          <button
            className="criar-turma-print-button"
            onClick={handlePrintTurmas}
          >
            <Printer size={17} /> Imprimir
          </button>
        </div>

        {turmasOrdenadas.length === 0 ? (
          <div className="criar-turma-empty-state">
            <div className="criar-turma-empty-icon">
              <Users size={48} />
            </div>
            <h4>Nenhuma turma cadastrada</h4>
            <p>Cadastre a primeira turma usando o formulário acima.</p>
          </div>
        ) : (
          <div className="criar-turma-lista">
            {turmasOrdenadas.map((turma) => {
              const percentualOcupacao = (
                (turma.alunosMatriculados / turma.quantidadeMaxima) *
                100
              ).toFixed(0);

              return (
                <div key={turma.id} className="criar-turma-card">
                  <div className="criar-turma-info">
                    <div className="criar-turma-header">
                      <div className="criar-turma-header-info">
                        <h4 className="criar-turma-nome">{turma.nome}</h4>
                        <span
                          className={`criar-turma-turno criar-turno-${turma.turno.toLowerCase()}`}
                        >
                          {turma.turno}
                        </span>
                      </div>

                      <button
                        className="criar-turma-remove-button"
                        onClick={() => handleRemoveTurma(turma.id)}
                        title="Remover turma"
                        disabled={isDeleting}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>

                    <div className="criar-turma-details">
                      <span className="criar-turma-alunos-count">
                        <strong>{turma.alunosMatriculados}</strong> de{" "}
                        <strong>{turma.quantidadeMaxima}</strong> alunos
                        matriculados
                      </span>
                      <div className="criar-turma-progress-bar">
                        <div
                          className="criar-turma-progress-fill"
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
      alert(err.message || "Erro ao cadastrar turma");
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
    <div className="criar-turma-section">
      <h3 className="criar-turma-titulo-form">Nova Turma</h3>
      <form onSubmit={handleCreateTurma}>
        <div className="criar-turma-form-grid">
          <div className="criar-turma-form-group criar-half-width">
            <label htmlFor="criar-turma-nome">Nome da Turma*</label>
            <div className="criar-turma-input-wrapper">
              <input
                type="text"
                id="criar-turma-nome"
                className={`criar-turma-input ${
                  erros.nomeTurma ? "criar-input-error" : ""
                }`}
                value={nomeTurma}
                onChange={(e) => setNomeTurma(e.target.value)}
              />
            </div>
          </div>

          <div className="criar-turma-form-group criar-quarter-width">
            <label htmlFor="criar-turma-turno">Turno*</label>
            <div className="criar-turma-input-wrapper">
              <select
                id="criar-turma-turno"
                className={`criar-turma-select ${
                  erros.turno ? "criar-input-error" : ""
                }`}
                value={turno}
                onChange={(e) => setTurno(e.target.value)}
              >
                <option value=" ">Selecione</option>
                <option value="Manhã">Manhã</option>
                <option value="Tarde">Tarde</option>
              </select>
            </div>
          </div>

          <div className="criar-turma-form-group criar-quarter-width">
            <label htmlFor="criar-turma-qtd-maxima">Máximo de Alunos*</label>
            <div className="criar-turma-input-wrapper">
              <input
                type="number"
                id="criar-turma-qtd-maxima"
                className={`criar-turma-input ${
                  erros.quantidadeMaxima ? "criar-input-error" : ""
                }`}
                value={quantidadeMaxima}
                onChange={(e) => setQuantidadeMaxima(e.target.value)}
                min="1"
              />
            </div>
          </div>
        </div>

        <div className="criar-turma-form-actions">
          <button
            type="button"
            className="criar-turma-clear-button"
            onClick={() => handleClearForm(true)}
          >
            <XCircle size={17} /> Limpar
          </button>
          <button
            type="submit"
            className="criar-turma-submit-button"
            disabled={isCreating}
          >
            <Plus size={17} />{" "}
            {isCreating ? "Cadastrando..." : "Cadastrar Turma"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CriarTurma;