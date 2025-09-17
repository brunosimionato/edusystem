import { useState, useMemo, useEffect } from "react";
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
} from "lucide-react";

import "./listaProfe.css";

import ProfessorService from "../../Services/ProfessorService";

const ListaProfe = () => {
  const [filtro, setFiltro] = useState("");
  const [professores, setProfessores] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfessores = async () => {
      setIsLoading(true);
      try {
        const data = await ProfessorService.getAll();
        setProfessores(data);
      } catch (error) {
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfessores();
  }, []);

  const professoresFiltrados = useMemo(() => {
    if (!filtro) return professores;
    return professores.filter((professor) => {
      const nomeMatch = professor.usuario.nome
        .toLowerCase()
        .includes(filtro.toLowerCase());
      const formacaoMatch = professor.formacaoAcademica
        .toLowerCase()
        .includes(filtro.toLowerCase());
      const disciplinaMatch = professor.disciplina.nome
        .toLowerCase()
        .includes(filtro.toLowerCase());
      return nomeMatch || formacaoMatch || disciplinaMatch;
    });
  }, [filtro, professores]);

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
            {professoresFiltrados.map((professor) => (
              <ProfessorCard key={professor.id} professor={professor} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Componente que representa um cartão de professor
 * @param {Object} param0 - Props do componente
 * @param {Professor} param0.professor - Dados do professor
 * @returns {JSX.Element}
 */
const ProfessorCard = ({ professor }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleEditarProfessor = (professorId) =>
    console.log("Editar professor:", professorId);
  const handleToggleStatusProfessor = (professorId, statusAtual) =>
    console.log("Toggle status professor:", professorId, statusAtual);
  const handleImprimirProfessor = (professorId) =>
    console.log("Imprimir professor:", professorId);


  return (
    <div className={`professor-card ${professor.status}`}>
      <div className="professor-info">
        {/* Header com botões */}
        {/* Header com avatar, informações e botões */}
        <div className="professor-header">
          {/* Lado esquerdo: avatar + info */}
          <div
            className="professor-basic-info-container clickable"
            onClick={() => setIsExpanded(p => !p)}
          >
            {isExpanded ? (
              <ChevronDown size={20} />
            ) : (
              <ChevronRight size={20} />
            )}
            <div className="professor-avatar">
              <User size={24} />
            </div>
            <div className="professor-basic-info">
              <h3 className="professor-nome">{professor.usuario.nome}</h3>
              <p className="professor-formacao">
                {professor.formacaoAcademica}
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
        {isExpanded && (
          <div className="professor-details-container">
            <div className="professor-lista-section">
              <div className="turmas-table-container">
                <div className="turmas-table-header">
                  <span>Turma</span>
                  <span>Matéria</span>
                  {(professor.turmas || []).map((turma) => (
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
          </div>
        )}
      </div>
    </div>
  );
}


export default ListaProfe;