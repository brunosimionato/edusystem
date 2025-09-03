import React, { useState, useMemo } from "react";
import {
  Search,
  User,
  Edit,
  UserX,
  UserCheck,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  BookOpen,
  Users,
} from "lucide-react";
import "./listaProfe.css";

const ListaProfe = () => {
  const [filtro, setFiltro] = useState("");
  const [professoresExpandidos, setProfessoresExpandidos] = useState(new Set());

  const professores = [
    {
      id: 1,
      nome: "Maria Silva Santos",
      formacao: "Licenciatura em Matemática",
      status: "ativo",
      disciplinas: ["Matemática", "Geometria"],
      turmas: [
        { id: 1, nome: "1º ANO A", turno: "manha", materia: "Matemática" },
        { id: 2, nome: "2º ANO A", turno: "manha", materia: "Geometria" },
        { id: 4, nome: "3º ANO A", turno: "manha", materia: "Matemática" },
      ],
    },
    {
      id: 2,
      nome: "João Carlos Oliveira",
      formacao: "Licenciatura em História",
      status: "ativo",
      disciplinas: ["História", "Geografia"],
      turmas: [
        { id: 2, nome: "2º ANO A", turno: "manha", materia: "História" },
        { id: 3, nome: "2º ANO B", turno: "tarde", materia: "Geografia" },
      ],
    },
    // Adicione outros professores aqui...
  ];

  const professoresFiltrados = useMemo(() => {
    if (!filtro) return professores;
    return professores.filter((professor) => {
      const nomeMatch = professor.nome
        .toLowerCase()
        .includes(filtro.toLowerCase());
      const formacaoMatch = professor.formacao
        .toLowerCase()
        .includes(filtro.toLowerCase());
      const disciplinasMatch = professor.disciplinas.some((disciplina) =>
        disciplina.toLowerCase().includes(filtro.toLowerCase())
      );
      return nomeMatch || formacaoMatch || disciplinasMatch;
    });
  }, [filtro, professores]);

  const toggleProfessor = (professorId) => {
    setProfessoresExpandidos((prev) => {
      const novaSet = new Set(prev);
      if (novaSet.has(professorId)) novaSet.delete(professorId);
      else novaSet.add(professorId);
      return novaSet;
    });
  };

  const handleEditarProfessor = (professorId) =>
    console.log("Editar professor:", professorId);
  const handleToggleStatusProfessor = (professorId, statusAtual) =>
    console.log("Toggle status professor:", professorId, statusAtual);
  const handleImprimirProfessor = (professorId) =>
    console.log("Imprimir professor:", professorId);

  return (
    <div className="cadastro-turma-form-container">
      {/* Seção de Filtros */}
      <div className="cadastro-turma-form-section">
        <div className="cadastro-turma-section-header">
          <span>Filtros de Busca</span>
        </div>
        <div className="cadastro-turma-form-grid">
          <div className="cadastro-turma-form-group full-width">
            <label>Buscar por professor, formação ou disciplina</label>
            <div className="cadastro-turma-input-wrapper">
              <Search
                className="cadastro-turma-input-icon-professor"
                size={18}
              />
              <input
                type="text"
                className="cadastro-turma-input search-input-lista-professor"
                placeholder="Digite o nome do professor, formação ou disciplina..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Professores */}
      <div className="cadastro-turma-form-section">
        <div className="cadastro-turma-section-header">
          <span>Professores Cadastrados</span>
          <span
            style={{ fontSize: "14px", color: "#64748b", fontWeight: "normal" }}
          >
            {professoresFiltrados.length} professor
            {professoresFiltrados.length !== 1 ? "es" : ""} encontrado
            {professoresFiltrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {professoresFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <GraduationCap size={40} />
            </div>
            <h4>Nenhum professor encontrado</h4>
            <p>
              Tente ajustar os filtros de busca ou verifique se há professores
              cadastrados.
            </p>
          </div>
        ) : (
          <div className="professores-list">
            {professoresFiltrados.map((professor) => {
              const isExpandido = professoresExpandidos.has(professor.id);

              return (
                <div
                  key={professor.id}
                  className={`professor-card ${professor.status}`}
                >
                  <div className="professor-info">
                    {/* Header com botões */}
                    {/* Header com avatar, informações e botões */}
                    <div className="professor-header">
                      {/* Lado esquerdo: avatar + info */}
                      <div
                        className="professor-basic-info-container clickable"
                        onClick={() => toggleProfessor(professor.id)}
                      >
                        {isExpandido ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                        <div className="professor-avatar">
                          <User size={24} />
                        </div>
                        <div className="professor-basic-info">
                          <h3 className="professor-nome">{professor.nome}</h3>
                          <p className="professor-formacao">
                            {professor.formacao}
                          </p>
                        </div>
                      </div>

                      {/* Lado direito: botões */}
                      <div className="professor-header-actions">
                        <button
                          className="action-button-professor edit-button-profe"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditarProfessor(professor.id);
                          }}
                        >
                          <Edit size={16} /> Editar
                        </button>

                        {professor.status === "ativo" ? (
                          <button
                            className="action-button-professor deactivate-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatusProfessor(
                                professor.id,
                                professor.status
                              );
                            }}
                          >
                            <UserX size={16} /> Inativar
                          </button>
                        ) : (
                          <button
                            className="action-button-professor activate-button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleToggleStatusProfessor(
                                professor.id,
                                professor.status
                              );
                            }}
                          >
                            <UserCheck size={16} /> Ativar
                          </button>
                        )}
                                              <button
                          className="action-button-professor print-button-profe"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleImprimirProfessor(professor.id);
                          }}
                        >
                          <BookOpen size={16} /> Imprimir
                        </button>

                      </div>
                    </div>

                    {/* Detalhes expandidos */}
                    {isExpandido && (
                      <div className="professor-details-container">
                        <div className="professor-lista-section">
                          <div className="turmas-table-container">
                            <div className="turmas-table-header">
                              <span>Turma</span>
                              <span>Matéria</span>
                            </div>
                            {professor.turmas.map((turma) => (
                              <div key={turma.id} className="turma-row">
                                <span className="turma-nome-prof">
                                  {turma.nome}
                                </span>
                                <span className="turma-materia-prof">
                                  {turma.materia}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>
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

export default ListaProfe;
