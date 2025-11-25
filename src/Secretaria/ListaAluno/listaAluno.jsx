import { useState, useMemo, useEffect } from "react";
import { Search, Users, Loader, AlertCircle } from "lucide-react";

import TurmaCard from "./TurmaCard";
import "./listaAluno.css";
import { useTurmasComAlunos } from "../../hooks/useTurmasComAlunos";
import AlunoForm from "../../components/AlunoForm/alunoForm";
import AlunoService from "../../Services/AlunoService";

const ListaAlunos = () => {
  const [filtro, setFiltro] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAluno, setSelectedAluno] = useState(null);

  const { turmas, refetch, hasError, isLoading } = useTurmasComAlunos();

  const disciplinaMapFront = {
    1: "matematica",
    2: "ensinoGlobalizado",
    3: "portugues",
    4: "ciencias",
    5: "historia",
    6: "geografia",
    7: "ingles",
    8: "arte",
    9: "edFisica",
  };

  // Filtro otimizado
  const turmasFiltradas = useMemo(() => {
    if (!filtro.trim()) return turmas;

    const termo = filtro.toLowerCase();

    return turmas
      .filter((turma) => {
        const turmaNomeMatch = turma.nome.toLowerCase().includes(termo);
        const alunoNomeMatch = turma.alunos.some((aluno) =>
          aluno.nome.toLowerCase().includes(termo)
        );
        return turmaNomeMatch || alunoNomeMatch;
      })
      .map((turma) => ({
        ...turma,
        alunos: turma.alunos.filter(
          (aluno) =>
            aluno.nome.toLowerCase().includes(termo) ||
            turma.nome.toLowerCase().includes(termo)
        ),
      }))
      .filter((turma) => turma.alunos.length > 0);
  }, [filtro, turmas]);

  // -------------- EDITAR ALUNO ----------------
  const handleEditAluno = async (aluno, turmaId) => {
    try {
      console.log("🔍 Buscando dados completos do aluno:", aluno.id);

      const alunoCompleto = await AlunoService.getById(aluno.id);

      console.log("📥 Aluno completo recebido:", alunoCompleto);

      const alunoNormalizado = {
        id: alunoCompleto.id,
        nome: alunoCompleto.nome || "",
        cpf: alunoCompleto.cpf || "",
        cns: alunoCompleto.cns || "",
        nascimento: alunoCompleto.nascimento || "",
        genero: alunoCompleto.genero || "",
        religiao: alunoCompleto.religiao || "",
        telefone: alunoCompleto.telefone || "",

        logradouro: alunoCompleto.logradouro || "",
        numero: alunoCompleto.numero || "",
        bairro: alunoCompleto.bairro || "",
        cep: alunoCompleto.cep || "",
        cidade: alunoCompleto.cidade || "",
        estado: alunoCompleto.estado || "",

        responsavel1Nome: alunoCompleto.responsavel1Nome || "",
        responsavel1Cpf: alunoCompleto.responsavel1Cpf || "",
        responsavel1Telefone: alunoCompleto.responsavel1Telefone || "",
        responsavel1Parentesco: alunoCompleto.responsavel1Parentesco || "",

        responsavel2Nome: alunoCompleto.responsavel2Nome || "",
        responsavel2Cpf: alunoCompleto.responsavel2Cpf || "",
        responsavel2Telefone: alunoCompleto.responsavel2Telefone || "",
        responsavel2Parentesco: alunoCompleto.responsavel2Parentesco || "",

        turma: alunoCompleto.turma ?? turmaId ?? null,
        anoLetivo: alunoCompleto.anoLetivo ?? new Date().getFullYear(),

        historicoEscolar: alunoCompleto.historicoEscolar ?? [],

        alunoOutraEscola: (alunoCompleto.historicoEscolar?.length ?? 0) > 0,
      };

      console.log("📤 Aluno pronto para o formulário:", alunoNormalizado);

      setSelectedAluno(alunoNormalizado);
      setModalOpen(true);
    } catch (error) {
      console.error("❌ Erro ao carregar aluno:", error);
      alert("Erro ao carregar os dados completos do aluno.");
    }
  };

  // -------------- ATUALIZAR ALUNO ----------------
  const handleUpdateAluno = async (payload) => {
    console.log("📌 PAYLOAD RECEBIDO DO FORM:", payload);

    // segurança extra
    if (!payload.id) {
      console.error("❌ ERRO: payload.id está vazio! Payload:", payload);
      alert("Erro interno: ID do aluno não encontrado.");
      return false;
    }

    try {
      console.log("📤 Enviando atualização para backend:", payload);

      await AlunoService.update(payload.id, payload);

      alert("Aluno atualizado com sucesso!");

      handleAlunoSaved();

      return true;
    } catch (error) {
      console.error("❌ Erro ao atualizar aluno:", error);
      alert("Erro ao atualizar aluno.");
      return false;
    }
  };

  const handleCancelEdit = () => {
    setSelectedAluno(null);
    setModalOpen(false);
  };

  const handleAlunoSaved = () => {
    console.log("🔄 Recarregando lista após salvar...");
    refetch();
    handleCancelEdit();
  };

  // ESC para fechar modal
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleCancelEdit();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  // Estados de Loading
  if (isLoading) {
    return (
      <div className="cadastro-turma-form-container">
        <div className="loading-state">
          <Loader size={48} className="spinner" />
          <h4>Carregando turmas e alunos...</h4>
          <p>Aguarde enquanto buscamos os dados.</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="cadastro-turma-form-container">
        <div className="error-state">
          <AlertCircle size={48} />
          <h4>Erro ao carregar dados</h4>
          <p>Não foi possível carregar as turmas e alunos.</p>
          <button onClick={refetch} className="retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-turma-form-container">

      {/* FILTRO */}
      <div className="cadastro-turma-form-section">
        <div className="cadastro-turma-section-header">
          <span>Filtros de Busca</span>
          <span className="subtitle">
            {turmas.length} turma{turmas.length !== 1 ? "s" : ""} no total
          </span>
        </div>

        <div className="cadastro-turma-form-grid">
          <div className="cadastro-turma-form-group full-width">
            <label>Buscar por turma ou aluno</label>
            <div className="cadastro-turma-input-wrapper">
              <Search className="cadastro-turma-input-icon-aluno" size={18} />
              <input
                type="text"
                className="cadastro-turma-input search-input-lista-aluno"
                placeholder="Digite o nome da turma ou aluno..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
              {filtro && (
                <button
                  onClick={() => setFiltro("")}
                  className="clear-filter-button"
                  title="Limpar filtro"
                >
                  ×
                </button>
              )}
            </div>

            {filtro && (
              <div className="filter-info">
                Mostrando {turmasFiltradas.length} turma
                {turmasFiltradas.length !== 1 ? "s" : ""} filtrada
              </div>
            )}
          </div>
        </div>
      </div>

      {/* LISTA DE TURMAS */}
      <div className="cadastro-turma-form-section">
        <div className="cadastro-turma-section-header">
          <span>Turmas e Alunos</span>
          <span className="subtitle">
            {turmasFiltradas.length} turma
            {turmasFiltradas.length !== 1 ? "s" : ""} encontrada
            {filtro && " com filtro"}
          </span>
        </div>

        {turmasFiltradas.length === 0 ? (
          <div className="empty-state">
            <Users size={40} />
            <h4>
              {filtro
                ? "Nenhuma turma ou aluno encontrado"
                : "Nenhuma turma cadastrada"}
            </h4>
            <p>
              {filtro
                ? "Tente ajustar os termos da busca."
                : "Cadastre turmas e alunos para começar."}
            </p>
          </div>
        ) : (
          <div className="turmas-list-alunos">
            {turmasFiltradas.map((turma) => (
              <TurmaCard
                key={turma.id}
                turma={turma}
                onEditAluno={handleEditAluno}
                onAlunoUpdated={refetch}
              />
            ))}
          </div>
        )}
      </div>

      {/* MODAL DE EDIÇÃO */}
      {modalOpen && (
        <div className="modal-overlay" onClick={handleCancelEdit}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <AlunoForm
              initialData={selectedAluno}
              onSave={handleUpdateAluno}
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
