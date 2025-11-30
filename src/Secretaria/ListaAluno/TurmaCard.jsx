import { gerarRelatorioAlunos } from "../../Relatorios/listaAluno";
import React, { useState } from "react";
import { Edit, UserX, ChevronDown, ChevronUp, Printer } from "lucide-react";
import AlunoService from "../../Services/AlunoService";

function formatarData(data) {
  if (!data) return "-";
  const d = new Date(data);
  return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
}

const TurmaCard = ({ turma, onEditAluno, onAlunoUpdated }) => {
  const [isExpandida, setIsExpandida] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const toggleTurma = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setIsExpandida(!isExpandida);

    setTimeout(() => {
      setIsAnimating(false);
    }, 300);
  };

  const alunos = turma.alunos ?? [];

  const getTurnoClass = (turno) =>
    ({
      manha: "turno-manha",
      tarde: "turno-tarde",
      noite: "turno-noite",
      integral: "turno-integral",
    }[turno?.toLowerCase()] || "turno-manha");

  const qtdAtivos = alunos.filter(
    (a) => (a.status ?? "ativo") === "ativo"
  ).length;

  const getStatusTurma = () => {
    const capacidade = turma.quantidadeMaxima ?? 0;
    if (capacidade === 0) return "";

    const ocupacao = (qtdAtivos / capacidade) * 100;
    if (ocupacao >= 100) return "lotada";
    if (ocupacao >= 80) return "quase-lotada";
    return "";
  };

  const statusTurma = getStatusTurma();

  const percentualOcupacao = Math.min(
    100,
    Math.round((qtdAtivos / turma.quantidadeMaxima) * 100)
  );

  const handleEditClick = (e, aluno) => {
    e.stopPropagation();
    onEditAluno(aluno, turma.id);
  };

  const handleToggleStatus = async (e, aluno) => {
    e.stopPropagation();

    const confirmar = window.confirm(
      `Tem certeza que deseja remover o aluno "${aluno.nome}" da turma?`
    );
    if (!confirmar) return;

    try {
      await AlunoService.delete(aluno.id);
      if (onAlunoUpdated) onAlunoUpdated();
    } catch (error) {
      console.error("❌ Erro ao remover aluno:", error);
      alert("Erro ao remover aluno. Verifique o console.");
    }
  };

  const handlePrint = (e) => {
    e.stopPropagation();

    const dataHoraAgora = new Date().toLocaleString("pt-BR");

    const html = gerarRelatorioAlunos({
      turma,
      alunos,
      qtdAtivos,
      dataHoraAgora,
      formatarData,
    });

    const oldFrame = document.getElementById("print-frame");
    if (oldFrame) oldFrame.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "print-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow || iframe.contentDocument;
    const doc = frameDoc.document || frameDoc;

    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        frameDoc.focus();
        frameDoc.print();
      }, 150);
    };
  };

  return (
    <div className={`turma-card ${statusTurma} ${isAnimating ? "animating" : ""}`}>
      <div className="turma-info">
        <div className="turma-header clickable" onClick={toggleTurma}>
          {isExpandida ? (
            <ChevronDown size={20} style={{ color: "#64748b", flexShrink: 0 }} />
          ) : (
            <ChevronUp size={20} style={{ color: "#64748b", flexShrink: 0 }} />
          )}

          <h3 className="turma-nome-aluno">{turma.nome}</h3>

          <span className={`turma-turno ${getTurnoClass(turma.turno)}`}>
            {turma.turno}
          </span>

          <button
            className="print-alunos-turmas-button"
            onClick={handlePrint}
            title={`Imprimir lista de alunos da turma ${turma.nome}`}
          >
            <Printer size={17} /> Imprimir
          </button>
        </div>

        <div className="turma-details">
          <div className="alunos-count">
            {qtdAtivos} de {turma.quantidadeMaxima} alunos
          </div>
        </div>

        {/* Barra de progresso */}
        <div className="progress-bar">
          <div
            className="progress-fill-lista"
            style={{ 
              width: `${percentualOcupacao}%`,
              backgroundColor: "#64748b"
            }}
          ></div>
        </div>

        {/* Container com animação de expansão/colapso */}
        <div className={`alunos-container ${isExpandida ? "expanded" : "collapsed"}`}>
          {alunos.length === 0 ? (
            <div style={{ textAlign: "center", padding: "20px", color: "#64748b", fontStyle: "italic" }}>
              <p>Nenhum aluno cadastrado nesta turma.</p>
            </div>
          ) : (
            <div className="alunos-table-container">
              <div className="alunos-table-header">
                <span>Nome do Aluno</span>
                <span>Status</span>
                <span>Ações</span>
              </div>

              {alunos.map((aluno) => (
                <div key={aluno.id} className="aluno-row-lista-aluno">
                  <div
                    className={`aluno-nome ${
                      (aluno.status ?? "ativo") === "inativo" ? "inativo" : ""
                    }`}
                  >
                    {aluno.nome}
                  </div>

                  <div>
                    <span className={`status-badge ${aluno.status ?? "ativo"}`}>
                      {(aluno.status ?? "ativo") === "ativo"
                        ? "Ativo"
                        : "Inativo"}
                    </span>
                  </div>

                  <div className="aluno-actions">
                    <button
                      className="action-button-lista-aluno edit-button"
                      onClick={(e) => handleEditClick(e, aluno)}
                      title={`Editar ${aluno.nome}`}
                    >
                      <Edit size={16} />
                    </button>

                    <button
                      className="action-button-lista-aluno deactivate-button-aluno"
                      onClick={(e) => handleToggleStatus(e, aluno)}
                      title={`Excluir ${aluno.nome}`}
                    >
                      <UserX size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TurmaCard;