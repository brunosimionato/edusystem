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
  Calendar,
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
      email: "joao.carlos@escola.com",
      telefone: "(11) 99876-5432",
      formacao: "Licenciatura em História",
      status: "ativo",
      disciplinas: ["História", "Geografia"],
      turmas: [
        { id: 2, nome: "2º ANO A", turno: "manha", materia: "História" },
        { id: 3, nome: "2º ANO B", turno: "tarde", materia: "Geografia" },
      ],
    },
    {
      id: 3,
      nome: "Ana Paula Ferreira",
      email: "ana.paula@escola.com",
      telefone: "(11) 97654-3210",
      formacao: "Licenciatura em Português",
      status: "ativo",
      disciplinas: ["Português", "Literatura"],
      turmas: [
        { id: 1, nome: "1º ANO A", turno: "manha", materia: "Português" },
        { id: 3, nome: "2º ANO B", turno: "tarde", materia: "Literatura" },
        { id: 4, nome: "3º ANO A", turno: "manha", materia: "Português" },
      ],
    },
    {
      id: 4,
      nome: "Pedro Henrique Costa",
      email: "pedro.henrique@escola.com",
      telefone: "(11) 96543-2109",
      formacao: "Licenciatura em Educação Física",
      status: "inativo",
      disciplinas: ["Educação Física"],
      turmas: [
        { id: 1, nome: "1º ANO A", turno: "manha", materia: "Educação Física" },
        { id: 2, nome: "2º ANO A", turno: "manha", materia: "Educação Física" },
      ],
    },
    {
      id: 5,
      nome: "Carla Regina Souza",
      email: "carla.regina@escola.com",
      telefone: "(11) 95432-1098",
      formacao: "Licenciatura em Ciências Biológicas",
      status: "ativo",
      disciplinas: ["Ciências", "Biologia"],
      turmas: [
        { id: 2, nome: "2º ANO A", turno: "manha", materia: "Ciências" },
        { id: 3, nome: "2º ANO B", turno: "tarde", materia: "Biologia" },
        { id: 4, nome: "3º ANO A", turno: "manha", materia: "Biologia" },
      ],
    },
    {
      id: 6,
      nome: "Roberto Lima Nascimento",
      email: "roberto.lima@escola.com",
      telefone: "(11) 94321-0987",
      formacao: "Licenciatura em Inglês",
      status: "ativo",
      disciplinas: ["Inglês"],
      turmas: [
        { id: 1, nome: "1º ANO A", turno: "manha", materia: "Inglês" },
        { id: 4, nome: "3º ANO A", turno: "manha", materia: "Inglês" },
      ],
    },
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
      const emailMatch = professor.email
        ?.toLowerCase()
        .includes(filtro.toLowerCase());

      return nomeMatch || formacaoMatch || disciplinasMatch || emailMatch;
    });
  }, [filtro]);

  const toggleProfessor = (professorId) => {
    setProfessoresExpandidos((prev) => {
      const novaSet = new Set(prev);
      if (novaSet.has(professorId)) {
        novaSet.delete(professorId);
      } else {
        novaSet.add(professorId);
      }
      return novaSet;
    });
  };

  const handleEditarProfessor = (professorId) => {
    console.log("Editar professor:", professorId);
  };

  const handleToggleStatusProfessor = (professorId, statusAtual) => {
    console.log("Toggle status professor:", professorId, statusAtual);
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
                    <div
                      className="professor-header clickable"
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

                      <div className="professor-status-badges">
                        <span className={`status-badge ${professor.status}`}>
                          {professor.status === "ativo" ? "Ativo" : "Inativo"}
                        </span>
                        <span className="disciplinas-count">
                          {professor.disciplinas.length} disciplina
                          {professor.disciplinas.length !== 1 ? "s" : ""}
                        </span>
                        <span className="turmas-count">
                          {professor.turmas.length} turma
                          {professor.turmas.length !== 1 ? "s" : ""}
                        </span>
                      </div>

                      <button
                        className="print-professor-button"
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log(
                            `Imprimir dados do professor ${professor.nome}`
                          );
                        }}
                      >
                        Imprimir
                      </button>
                    </div>

                    {/* Detalhes Expandidos do Professor */}
                    {isExpandido && (
                      <div className="professor-details-container">
                        <div className="professor-lista-section" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '20px' }}>
                          {/* Disciplinas */}
                          <div className="professor-disciplinas">
                            <div className="section-title">
                              <BookOpen size={18} />
                              Disciplinas que leciona
                            </div>
                            <div className="disciplinas-list">
                              {professor.disciplinas.map((disciplina, index) => (
                                <span key={index} className="disciplina-tag">
                                  {disciplina}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Ações do Professor */}
                          <div className="professor-lista-actions-container">

                            <div className="professor-lista-actions">
                              <button
                                className="action-button-professor edit-button"
                                onClick={() => handleEditarProfessor(professor.id)}
                                title="Editar professor"
                              >
                                <Edit size={16} />
                                Editar
                              </button>

                              {professor.status === "ativo" ? (
                                <button
                                  className="action-button-professor deactivate-button"
                                  onClick={() =>
                                    handleToggleStatusProfessor(
                                      professor.id,
                                      professor.status
                                    )
                                  }
                                  title="Inativar professor"
                                >
                                  <UserX size={16} />
                                  Inativar
                                </button>
                              ) : (
                                <button
                                  className="action-button-professor activate-button"
                                  onClick={() =>
                                    handleToggleStatusProfessor(
                                      professor.id,
                                      professor.status
                                    )
                                  }
                                  title="Ativar professor"
                                >
                                  <UserCheck size={16} />
                                  Ativar
                                </button>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Turmas Vinculadas */}
                        <div className="professor-lista-section">
                          <div className="section-title">
                            <Users size={18} />
                            Turmas vinculadas
                          </div>
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
