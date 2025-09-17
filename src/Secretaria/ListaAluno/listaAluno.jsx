import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Edit,
  UserX,
  UserCheck,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  Users,
  Settings,
} from "lucide-react";
import "./listaAluno.css";
import CadastroAluno from "../../components/AlunoForm/alunoForm"; // ajuste o caminho se necessário

const ListaAlunos = () => {
  const [filtro, setFiltro] = useState("");
  const [turmasExpandidas, setTurmasExpandidas] = useState(new Set());

  // Agora em state para permitir atualização após edição
  const [turmasState, setTurmasState] = useState([
    {
      id: 1,
      nome: "1º ANO A",
      turno: "manha",
      capacidade: 30,
      alunos: [
        { id: 1, nome: "Ana Silva", status: "ativo" },
        { id: 2, nome: "Bruno Costa", status: "ativo" },
        { id: 3, nome: "Carlos Mendes", status: "inativo" },
        { id: 4, nome: "Diana Oliveira", status: "ativo" },
        { id: 5, nome: "Eduardo Santos", status: "ativo" },
      ],
    },
    {
      id: 2,
      nome: "2º ANO A",
      turno: "manha",
      capacidade: 25,
      alunos: [
        { id: 6, nome: "Fernanda Lima", status: "ativo" },
        { id: 7, nome: "Gabriel Rocha", status: "ativo" },
        { id: 8, nome: "Helena Cardoso", status: "inativo" },
        { id: 9, nome: "Igor Ferreira", status: "ativo" },
      ],
    },
    {
      id: 3,
      nome: "2º ANO B",
      turno: "tarde",
      capacidade: 20,
      alunos: [
        { id: 10, nome: "Julia Alves", status: "ativo" },
        { id: 11, nome: "Lucas Barbosa", status: "ativo" },
        { id: 12, nome: "Maria João", status: "ativo" },
        { id: 13, nome: "Nicolas Pereira", status: "inativo" },
        { id: 14, nome: "Olga Nascimento", status: "ativo" },
        { id: 15, nome: "Paulo Dias", status: "ativo" },
      ],
    },
    {
      id: 4,
      nome: "3º ANO A",
      turno: "manha",
      capacidade: 28,
      alunos: [
        { id: 16, nome: "Queila Monteiro", status: "ativo" },
        { id: 17, nome: "Rafael Torres", status: "ativo" },
        { id: 18, nome: "Sofia Campos", status: "ativo" },
      ],
    },
  ]);

  // Filtrar turmas baseado no termo de busca (usa turmasState agora)
  const turmasFiltradas = useMemo(() => {
    if (!filtro) return turmasState;
    return turmasState
      .filter((turma) => {
        const turmaNomeMatch = turma.nome.toLowerCase().includes(filtro.toLowerCase());
        const alunoNomeMatch = turma.alunos.some((aluno) =>
          aluno.nome.toLowerCase().includes(filtro.toLowerCase())
        );
        return turmaNomeMatch || alunoNomeMatch;
      })
      .map((turma) => ({
        ...turma,
        alunos: turma.alunos.filter(
          (aluno) =>
            !filtro ||
            turma.nome.toLowerCase().includes(filtro.toLowerCase()) ||
            aluno.nome.toLowerCase().includes(filtro.toLowerCase())
        ),
      }));
  }, [filtro, turmasState]);

  const toggleTurma = (turmaId) => {
    setTurmasExpandidas((prev) => {
      const novaSet = new Set(prev);
      if (novaSet.has(turmaId)) novaSet.delete(turmaId);
      else novaSet.add(turmaId);
      return novaSet;
    });
  };

  const getTurnoClass = (turno) => {
    const classes = {
      manha: "turno-manha",
      tarde: "turno-tarde",
      noite: "turno-noite",
      integral: "turno-integral",
    };
    return classes[turno] || "";
  };

  const getStatusTurma = (alunos, capacidade) => {
    const alunosAtivos = alunos.filter((a) => a.status === "ativo").length;
    const percentual = (alunosAtivos / capacidade) * 100;
    if (percentual >= 100) return "lotada";
    if (percentual >= 80) return "quase-lotada";
    return "";
  };

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState(null);

  // abrir modal de edição (recebe turmaId e alunoId)
  const handleEditarAluno = (turmaId, alunoId) => {
    const turma = turmasState.find((t) => t.id === turmaId);
    if (!turma) return;
    const aluno = turma.alunos.find((a) => a.id === alunoId);
    if (!aluno) return;
    // Se tiver mais dados (historico etc) inclua aqui. Passa o objeto que o formulário espera.
    setSelectedAluno({ ...aluno });
    setSelectedTurmaId(turmaId);
    setModalOpen(true);
  };

  const handleToggleStatusAluno = (alunoId, statusAtual) => {
    setTurmasState((prev) =>
      prev.map((turma) => ({
        ...turma,
        alunos: turma.alunos.map((a) =>
          a.id === alunoId ? { ...a, status: a.status === "ativo" ? "inativo" : "ativo" } : a
        ),
      }))
    );
  };

  const handleRemanejarAluno = (alunoId) => {
    console.log("Remanejar aluno:", alunoId);
  };

  const handleDeclaracaoAluno = (alunoId) => {
    console.log("Declaração aluno:", alunoId);
  };

  // Atualiza o aluno no estado após salvar no formulário
  const handleSaveAluno = (payload) => {
    // payload é todo o objeto retornado pelo formulário
    // Se o aluno tiver id, atualizamos; caso contrário trata como novo cadastro
    if (selectedAluno && selectedAluno.id) {
      setTurmasState((prev) =>
        prev.map((turma) =>
          turma.id === selectedTurmaId
            ? {
                ...turma,
                alunos: turma.alunos.map((a) => (a.id === selectedAluno.id ? { ...a, ...payload } : a)),
              }
            : turma
        )
      );
    } else {
      // exemplo simples: inserir novo aluno na primeira turma
      const novoId = Date.now();
      setTurmasState((prev) => {
        if (prev.length === 0) return prev;
        const copia = [...prev];
        copia[0] = { ...copia[0], alunos: [{ id: novoId, ...payload }, ...copia[0].alunos] };
        return copia;
      });
    }

    // fechar modal
    setModalOpen(false);
    setSelectedAluno(null);
    setSelectedTurmaId(null);
  };

  const handleCancelEdit = () => {
    setModalOpen(false);
    setSelectedAluno(null);
    setSelectedTurmaId(null);
  };

// Fecha tela com ESC
useEffect(() => {
  if (!modalOpen) return;

  const onKeyDown = (e) => {
    if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  window.addEventListener("keydown", onKeyDown);
  return () => window.removeEventListener("keydown", onKeyDown);
}, [modalOpen]); // roda quando modalOpen muda

  return (
    <div className="cadastro-turma-form-container">
      {/* Seção de Filtros */}
      <div className="cadastro-turma-form-section">
        <div className="cadastro-turma-section-header">
          <span>Filtros de Busca</span>
        </div>
        <div className="cadastro-turma-form-grid">
          <div className="cadastro-turma-form-group full-width">
            <label>Buscar por turma ou aluno</label>
            <div className="cadastro-turma-input-wrapper">
              <Search className="cadastro-turma-input-icon-aluno" size={18} />
              <input
                type="text"
                className="cadastro-turma-input search-input-lista-aluno"
                placeholder="Digite o nome da turma ou do aluno..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="cadastro-turma-form-section">
        <div className="cadastro-turma-section-header">
          <span>Turmas Cadastradas</span>
          <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "normal" }}>
            {turmasFiltradas.length} turma{turmasFiltradas.length !== 1 ? "s" : ""} encontrada{turmasFiltradas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {turmasFiltradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={40} />
            </div>
            <h4>Nenhuma turma encontrada</h4>
            <p>Tente ajustar os filtros de busca ou verifique se há turmas cadastradas.</p>
          </div>
        ) : (
          <div className="turmas-list-alunos">
            {turmasFiltradas.map((turma) => {
              const alunosAtivos = turma.alunos.filter((a) => a.status === "ativo").length;
              const percentualOcupacao = (alunosAtivos / turma.capacidade) * 100;
              const statusTurma = getStatusTurma(turma.alunos, turma.capacidade);
              const isExpandida = turmasExpandidas.has(turma.id);

              return (
                <div key={turma.id} className={`turma-card ${statusTurma}`}>
                  <div className="turma-info">
                    <div className="turma-header clickable" onClick={() => toggleTurma(turma.id)}>
                      {isExpandida ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      <h3 className="turma-nome-aluno">{turma.nome}</h3>
                      <span className={`turma-turno ${getTurnoClass(turma.turno)}`}>{turma.turno}</span>

                      <button
                        className="print-alunos-turmas-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(`Imprimir alunos da turma ${turma.nome}`);
                        }}
                      >
                        Imprimir
                      </button>
                    </div>

                    <div className="turma-details">
                      <div className="alunos-count">{alunosAtivos} de {turma.capacidade} vagas ocupadas ({turma.alunos.length} alunos cadastrados)</div>
                      <div className="progress-bar">
                        <div className="progress-fill" style={{ width: `${Math.min(percentualOcupacao, 100)}%` }}></div>
                      </div>
                    </div>

                    {isExpandida && (
                      <div className="alunos-table-container">
                        <div className="alunos-table-header">
                          <span>Nome do Aluno</span>
                          <span>Status</span>
                          <span>Ações</span>
                        </div>

                        {turma.alunos.map((aluno) => (
                          <div key={aluno.id} className="aluno-row-lista-aluno">
                            <div className={`aluno-nome ${aluno.status === "inativo" ? "inativo" : ""}`}>{aluno.nome}</div>
                            <div>
                              <span className={`status-badge ${aluno.status}`}>{aluno.status === "ativo" ? "Ativo" : "Inativo"}</span>
                            </div>
                            <div className="aluno-actions">
                              <button
                                className="action-button-lista-aluno edit-button"
                                onClick={() => handleEditarAluno(turma.id, aluno.id)}
                                title="Editar aluno"
                              >
                                <Edit size={16} />
                              </button>

                              {aluno.status === "ativo" ? (
                                <button className="action-button-lista-aluno deactivate-button" onClick={() => handleToggleStatusAluno(aluno.id, aluno.status)} title="Inativar aluno">
                                  <UserX size={16} />
                                </button>
                              ) : (
                                <button className="action-button-lista-aluno activate-button" onClick={() => handleToggleStatusAluno(aluno.id, aluno.status)} title="Ativar aluno">
                                  <UserCheck size={16} />
                                </button>
                              )}

                              <button className="action-button-lista-aluno transfer-button" onClick={() => handleRemanejarAluno(aluno.id)} title="Remanejar aluno">
                                <ArrowRightLeft size={16} />
                              </button>

                              <button className="action-button-lista-aluno declaracao-button" onClick={() => handleDeclaracaoAluno(aluno.id)} title="Declaração de matrícula">
                                <Settings size={17} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Overlay / Modal com o formulário */}
      {modalOpen && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <CadastroAluno
              initialData={selectedAluno}
              onSave={handleSaveAluno}
              onCancel={handleCancelEdit}
              mode="edit"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ListaAlunos;
