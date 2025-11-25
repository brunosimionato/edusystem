import { useState, useMemo, useEffect } from "react";
import {
  Search,
  User,
  Edit,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Printer,
  BookOpen,
} from "lucide-react";
import "./listaProfe.css";
import ProfeForm from "../../components/ProfeForm/profeForm";
import ProfessorService from "../../Services/ProfessorService";

// 🔥 IMPORTAÇÃO DO RELATÓRIO DE PROFESSOR
import { gerarRelatorioProfessor } from "../../Relatorios/listaProfessor";

const ListaProfe = () => {
  const [filtro, setFiltro] = useState("");
  const [professores, setProfessores] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [professorSelecionado, setProfessorSelecionado] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfessores = async () => {
    setIsLoading(true);
    try {
      const data = await ProfessorService.getAll();
      const professoresComStatus = data.map((prof) => ({
        ...prof,
        status: prof.status || "ativo",
      }));
      setProfessores(
  professoresComStatus.filter((prof) => prof.status === "ativo")
);
    } catch (error) {
      console.error("Erro ao buscar professores:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfessores();
  }, []);

  const professoresFiltrados = useMemo(() => {
    if (!filtro) return professores;
    const filtroLower = filtro.toLowerCase();

    return professores.filter((professor) => {
      const nomeMatch = professor.usuario?.nome?.toLowerCase().includes(filtroLower);
      const formacaoMatch = (professor.formacaoAcademica || "").toLowerCase().includes(filtroLower);

      const disciplinasMatch = (professor.disciplinas || []).some(
        (disc) => (typeof disc === "object" ? disc.nome : disc).toLowerCase().includes(filtroLower)
      );

      const turmasMatch = (professor.turmas || []).some(
        (turma) => (typeof turma === "object" ? turma.nome : turma).toLowerCase().includes(filtroLower)
      );

      return nomeMatch || formacaoMatch || disciplinasMatch || turmasMatch;
    });
  }, [filtro, professores]);

  const handleEditarProfessor = (professor) => {
    setProfessorSelecionado(professor);
    setModalAberto(true);
  };

  const handleFecharModal = () => {
    setModalAberto(false);
    setProfessorSelecionado(null);
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") handleFecharModal();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, []);

  /** ============================================================
   *   🖨️ FUNÇÃO DE IMPRESSÃO – COM IFRAME IGUAL AOS ALUNOS
   *  ============================================================ */
  const handlePrintProfessor = (professor) => {
    const dataHoraAgora = new Date().toLocaleString("pt-BR");

    const html = gerarRelatorioProfessor({
      professor,
      dataHoraAgora,
      formatarData: (d) => new Date(d).toLocaleDateString("pt-BR"),
    });

    // Remove iframe antigo
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
    <div className="cadastro-turma-form-container">
      {/* Filtros */}
      <div className="cadastro-turma-form-section">
        <div className="cadastro-turma-section-header">
          <span>Filtros de Busca</span>
        </div>
        <div className="cadastro-turma-form-grid">
          <div className="cadastro-turma-form-group full-width">
            <label>Buscar por professor, formação, disciplina ou turma</label>
            <div className="cadastro-turma-input-wrapper">
              <Search className="cadastro-turma-input-icon-professor" size={18} />
              <input
                type="text"
                className="cadastro-turma-input search-input-lista-professor"
                placeholder="Digite o nome do professor..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista */}
      <div className="cadastro-turma-form-section">
        <div className="cadastro-turma-section-header">
          <span>Professores Cadastrados</span>
          <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "normal" }}>
            {isLoading
              ? "Carregando..."
              : `${professoresFiltrados.length} professor(es) encontrado(s)`}
          </span>
        </div>

        {isLoading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Carregando professores...</p>
          </div>
        ) : professoresFiltrados.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <GraduationCap size={40} />
            </div>
            <h4>Nenhum professor encontrado</h4>
          </div>
        ) : (
          <div className="professores-list">
            {professoresFiltrados.map((professor) => (
              <ProfessorCard
                key={professor.id}
                professor={professor}
                onEditar={() => handleEditarProfessor(professor)}
                onImprimir={() => handlePrintProfessor(professor)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {modalAberto && (
        <div
          className="modal-overlay"
          onClick={(e) => {
            if (e.target.classList.contains("modal-overlay")) handleFecharModal();
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

const ProfessorCard = ({ professor, onEditar, onImprimir }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const disciplinas = useMemo(() => {
    return (professor.disciplinas || []).map((disc) =>
      typeof disc === "object" ? disc : { id: disc, nome: disc }
    );
  }, [professor.disciplinas]);

  const turmas = useMemo(() => {
    return (professor.turmas || []).map((turma) =>
      typeof turma === "object" ? turma : { id: turma, nome: turma }
    );
  }, [professor.turmas]);

  return (
    <div className={`professor-card ${professor.status}`}>
      <div className="professor-info">
        <div className="professor-header">
          <div
            className="professor-basic-info-container clickable"
            onClick={() => setIsExpanded((p) => !p)}
          >
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
            <div className="professor-avatar">
              <User size={24} />
            </div>
            <div className="professor-basic-info">
              <h3 className="professor-nome">
                {professor.usuario?.nome || "Nome não informado"}
              </h3>
              <p className="professor-formacao">
                {professor.formacaoAcademica || "Formação não informada"}
              </p>
            </div>
          </div>

          <div className="professor-header-actions">
            <button className="action-button-professor edit-button-profe" onClick={onEditar}>
              <Edit size={16} /> Editar
            </button>

            <button className="action-button-professor print-button-profe" onClick={onImprimir}>
              <Printer size={17} /> Imprimir
            </button>
          </div>
        </div>

        {isExpanded && (
          <div className="professor-details-container">
            {disciplinas.length > 0 && (
              <div className="professor-lista-section">
                <div className="section-title">
                  <BookOpen size={16} />
                  Disciplinas que Leciona
                </div>
                <div className="disciplinas-list">
                  {disciplinas.map((disciplina) => (
                    <span key={disciplina.id} className="disciplina-tag">
                      {disciplina.nome}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {turmas.length > 0 && (
              <div className="professor-lista-section">
                <div className="turmas-table-container">
                  <div className="turmas-table-header">
                    <span>Turma</span>
                    <span>Matéria</span>
                  </div>

                  {turmas.map((turma) => (
                    <div key={turma.id} className="turma-row">
                      <span className="turma-nome-prof">{turma.nome}</span>
                      <span className="turma-materia-prof">
                        {disciplinas.map((d) => d.nome).join(", ")}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaProfe;
