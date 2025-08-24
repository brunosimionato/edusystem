import React, { useState, useMemo } from "react";
import {
  Search,
  User,
  Edit,
  UserX,
  UserCheck,
  ArrowRightLeft,
  ChevronDown,
  ChevronRight,
  Users,
} from "lucide-react";
import "./listaAluno.css";

const ListaAlunos = () => {
  const [filtro, setFiltro] = useState("");
  const [turmasExpandidas, setTurmasExpandidas] = useState(new Set());

  // Dados mockados das turmas e alunos
  const turmas = [
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
  ];

  // Filtrar turmas baseado no termo de busca
  const turmasFiltradas = useMemo(() => {
    if (!filtro) return turmas;

    return turmas
      .filter((turma) => {
        // Filtrar por nome da turma
        const turmaNomeMatch = turma.nome
          .toLowerCase()
          .includes(filtro.toLowerCase());

        // Filtrar por nome dos alunos
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
  }, [filtro]);

  const toggleTurma = (turmaId) => {
    setTurmasExpandidas((prev) => {
      const novaSet = new Set(prev);
      if (novaSet.has(turmaId)) {
        novaSet.delete(turmaId);
      } else {
        novaSet.add(turmaId);
      }
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

  const handleEditarAluno = (alunoId) => {
    console.log("Editar aluno:", alunoId);
    // Implementar lógica de edição
  };

  const handleToggleStatusAluno = (alunoId, statusAtual) => {
    console.log("Toggle status aluno:", alunoId, statusAtual);
    // Implementar lógica de ativar/inativar
  };

  const handleRemanejarAluno = (alunoId) => {
    console.log("Remanejar aluno:", alunoId);
    // Implementar lógica de remanejamento
  };

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
          <span
            style={{ fontSize: "14px", color: "#64748b", fontWeight: "normal" }}
          >
            {turmasFiltradas.length} turma
            {turmasFiltradas.length !== 1 ? "s" : ""} encontrada
            {turmasFiltradas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {turmasFiltradas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={40} />
            </div>
            <h4>Nenhuma turma encontrada</h4>
            <p>
              Tente ajustar os filtros de busca ou verifique se há turmas
              cadastradas.
            </p>
          </div>
        ) : (
          <div className="turmas-list">
            {turmasFiltradas.map((turma) => {
              const alunosAtivos = turma.alunos.filter(
                (a) => a.status === "ativo"
              ).length;
              const percentualOcupacao =
                (alunosAtivos / turma.capacidade) * 100;
              const statusTurma = getStatusTurma(
                turma.alunos,
                turma.capacidade
              );
              const isExpandida = turmasExpandidas.has(turma.id);

              return (
                <div key={turma.id} className={`turma-card ${statusTurma}`}>
                  <div className="turma-info">
                    <div
                      className="turma-header clickable"
                      onClick={() => toggleTurma(turma.id)}
                    >
                      {isExpandida ? (
                        <ChevronDown size={20} />
                      ) : (
                        <ChevronRight size={20} />
                      )}
                      <h3 className="turma-nome-aluno">{turma.nome}</h3>
                      <span
                        className={`turma-turno ${getTurnoClass(turma.turno)}`}
                      >
                        {turma.turno}
                      </span>

                      {/* Botão de imprimir */}
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
                      <div className="alunos-count">
                        {alunosAtivos} de {turma.capacidade} vagas ocupadas (
                        {turma.alunos.length} alunos cadastrados)
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress-fill"
                          style={{
                            width: `${Math.min(percentualOcupacao, 100)}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    {/* Tabela de Alunos Expandida */}
                    {isExpandida && (
                      <div className="alunos-table-container">
                        <div className="alunos-table-header">
                          <span>Nome do Aluno</span>
                          <span>Status</span>
                          <span>Ações</span>
                        </div>

                        {turma.alunos.map((aluno) => (
                          <div key={aluno.id} className="aluno-row-lista-aluno">
                            <div
                              className={`aluno-nome ${
                                aluno.status === "inativo" ? "inativo" : ""
                              }`}
                            >
                              {aluno.nome}
                            </div>

                            <div>
                              <span className={`status-badge ${aluno.status}`}>
                                {aluno.status === "ativo" ? "Ativo" : "Inativo"}
                              </span>
                            </div>

                            <div className="aluno-actions">
                              <button
                                className="action-button-lista-aluno edit-button"
                                onClick={() => handleEditarAluno(aluno.id)}
                                title="Editar aluno"
                              >
                                <Edit size={16} />
                              </button>

                              {aluno.status === "ativo" ? (
                                <button
                                  className="action-button-lista-aluno deactivate-button"
                                  onClick={() =>
                                    handleToggleStatusAluno(
                                      aluno.id,
                                      aluno.status
                                    )
                                  }
                                  title="Inativar aluno"
                                >
                                  <UserX size={16} />
                                </button>
                              ) : (
                                <button
                                  className="action-button-lista-aluno activate-button"
                                  onClick={() =>
                                    handleToggleStatusAluno(
                                      aluno.id,
                                      aluno.status
                                    )
                                  }
                                  title="Ativar aluno"
                                >
                                  <UserCheck size={16} />
                                </button>
                              )}

                              <button
                                className="action-button-lista-aluno transfer-button"
                                onClick={() => handleRemanejarAluno(aluno.id)}
                                title="Remanejar aluno"
                              >
                                <ArrowRightLeft size={16} />
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
    </div>
  );
};

export default ListaAlunos;
