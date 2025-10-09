import { useState, useMemo, useEffect } from "react";
import {
  Search,
  Users,
} from "lucide-react";

import TurmaCard from "../../Secretaria/ListaAluno/TurmaCard";

import "./listaTurma.css";
import { useTurmas } from "../../hooks/useTurmas";
import AlunoForm from "../../components/AlunoForm/alunoForm";

const ListaTurmas = () => {
  const [filtro, setFiltro] = useState("");

  const { turmas, refetch, hasError, isLoading } = useTurmas({ withAlunos: true });


  // Filtrar turmas baseado no termo de busca (usa turmasState agora)
  const turmasFiltradas = useMemo(() => {
    if (!filtro) return turmas;
    return turmas
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
  }, [filtro, turmas]);

  // Modal control
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState(null);
  const [selectedTurmaId, setSelectedTurmaId] = useState(null);

  const handleDeclaracaoAluno = (alunoId) => {
    console.log("Declaração aluno:", alunoId);
  };

  // Atualiza o aluno no estado após salvar no formulário
  const handleSaveAluno = (payload) => {
    /*
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
    */
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
          <div className="cadastro-turma-form-group-prof full-width">
            <label>Buscar por turma ou aluno</label>
            <div className="cadastro-turma-input-wrapper">
              <Search className="cadastro-turma-input-icon-aluno" size={18} />
              <input
                type="text"
                className="cadastro-turma-input search-turma-input"
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
            {turmasFiltradas.map((turma) => (
              <TurmaCard key={turma.id} turma={turma} />
            ))}
          </div>
        )}
      </div>

      {/* Overlay / Modal com o formulário */}
      {modalOpen && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AlunoForm
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

export default ListaTurmas;