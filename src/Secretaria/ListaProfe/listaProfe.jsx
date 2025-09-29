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
  Printer,
  XCircle,
} from "lucide-react";
import "./listaProfe.css";
import ProfeForm from "../../components/ProfeForm/profeForm";
import ProfessorService from "../../Services/ProfessorService";

const ListaProfe = () => {
  const [filtro, setFiltro] = useState("");
  const [professores, setProfessores] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] = useState(null);

  // Extrai fetch para poder chamar depois (após salvar)
  const fetchProfessores = async () => {
    try {
      const data = await ProfessorService.getAll();
      const professoresComStatus = data.map((prof) => ({
        ...prof,
        status: prof.status || "ativo",
      }));
      setProfessores(professoresComStatus);
    } catch (error) {
      console.error(error);
    }
  };

  // Buscar professores ao montar
  useEffect(() => {
    fetchProfessores();
  }, []);

  // Filtro de professores
  const professoresFiltrados = useMemo(() => {
    if (!filtro) return professores;
    return professores.filter((professor) => {
      const nomeMatch = professor.usuario?.nome?.toLowerCase().includes(filtro.toLowerCase());
      const formacaoMatch = (professor.formacaoAcademica || "").toLowerCase().includes(filtro.toLowerCase());
      const disciplinaMatch = (professor.disciplina?.nome || "").toLowerCase().includes(filtro.toLowerCase());
      return nomeMatch || formacaoMatch || disciplinaMatch;
    });
  }, [filtro, professores]);

  // Abrir modal de edição
  const handleEditarProfessor = (professor) => {
    setProfessorSelecionado(professor);
    setModalAberto(true);
  };

  // Fechar modal
  const handleFecharModal = () => {
    setModalAberto(false);
    setProfessorSelecionado(null);
  };

  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        handleFecharModal();
      }
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  // Alterar status professor (localmente)
  const handleToggleStatusProfessor = (professorId) => {
    setProfessores((prev) =>
      prev.map((prof) =>
        prof.id === professorId ? { ...prof, status: prof.status === "ativo" ? "inativo" : "ativo" } : prof
      )
    );
  };

  const handleImprimirProfessor = (professorId) => console.log("Imprimir professor:", professorId);

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
              <Search className="cadastro-turma-input-icon-professor" size={18} />
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
          <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "normal" }}>
            {professoresFiltrados.length} professor{professoresFiltrados.length !== 1 ? "es" : ""} encontrado
            {professoresFiltrados.length !== 1 ? "s" : ""}
          </span>
        </div>

        {professoresFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <GraduationCap size={40} />
            </div>
            <h4>Nenhum professor encontrado</h4>
            <p>Tente ajustar os filtros de busca ou verifique se há professores cadastrados.</p>
          </div>
        ) : (
          <div className="professores-list">
            {professoresFiltrados.map((professor) => (
              <ProfessorCard
                key={professor.id}
                professor={professor}
                onToggleStatus={handleToggleStatusProfessor}
                onEditar={() => handleEditarProfessor(professor)}
                onImprimir={handleImprimirProfessor}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal do formulário */}
      {modalAberto && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("modal-overlay")) {
              handleFecharModal();
            }
          }}
        >
          <div className="modal-content">
            <ProfeForm
              key={professorSelecionado ? `edit-${professorSelecionado.id}` : "create"}
              professor={professorSelecionado}
              isEditing={Boolean(professorSelecionado)}
              onClose={handleFecharModal}
              onSaved={() => {
                fetchProfessores();
                handleFecharModal();
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ProfessorCard = ({ professor, onToggleStatus, onEditar, onImprimir }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <div className={`professor-card ${professor.status}`}>
      <div className="professor-info">
        <div className="professor-header">
          <div className="professor-basic-info-container clickable" onClick={() => setIsExpanded((p) => !p)}>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            <div className="professor-avatar">
              <User size={24} />
            </div>
            <div className="professor-basic-info">
              <h3 className="professor-nome">{professor.usuario?.nome}</h3>
              <p className="professor-formacao">{professor.formacaoAcademica}</p>
            </div>
          </div>

          <div className="professor-header-actions">
            <button
              className="action-button-professor edit-button-profe"
              onClick={(e) => {
                e.stopPropagation();
                onEditar(professor);
              }}
            >
              <Edit size={16} /> Editar
            </button>

            {professor.status === "ativo" ? (
              <button
                className="action-button-professor deactivate-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(professor.id);
                }}
              >
                <UserX size={16} /> Inativar
              </button>
            ) : (
              <button
                className="action-button-professor activate-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleStatus(professor.id);
                }}
              >
                <UserCheck size={16} /> Ativar
              </button>
            )}

            <button
              className="action-button-professor print-button-profe"
              onClick={(e) => {
                e.stopPropagation();
                onImprimir(professor.id);
              }}
            >
              <Printer size={17} /> Imprimir
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="professor-details-container">
            <div className="professor-lista-section">
              <div className="turmas-table-container">
                <div className="turmas-table-header">
                  <span>Turma</span>
                  <span>Matéria</span>
                  {(professor.turmas || []).map((turma) => (
                    <div key={turma.id || turma} className="turma-row">
                      <span className="turma-nome-prof">{turma.nome || turma}</span>
                      <span className="turma-materia-prof">{turma.materia || ""}</span>
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
};

export default ListaProfe;
