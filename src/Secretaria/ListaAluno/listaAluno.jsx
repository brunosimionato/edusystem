import React, { useState, useMemo, useEffect, useCallback } from "react";
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

  // Função para extrair informações da turma para ordenação
  const extrairInfoTurma = useCallback((nomeTurma) => {
    const info = {
      ano: 99,
      numero: 999,
      letra: ''
    };
    
    if (!nomeTurma) return info;
    
    // Padronizar: remover acentos e converter para minúsculas
    const nomePadronizado = nomeTurma
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
    
    // Tentar diferentes padrões de turma
    const padroes = [
      /(\d+)\s*[º°]\s*(\w+)/,  // "1º A", "2ºB"
      /turma\s*(\d+)\s*(\w*)/i, // "Turma 1 A", "Turma 2B"
      /(\d+)\s*ano\s*(\w*)/i,   // "1 ano A", "2anoB"
      /(\d+)\s*[a-z]*/,         // "1A", "2B", "10C"
      /(\d+)/,                  // "1", "2", "10"
    ];
    
    for (const padrao of padroes) {
      const match = nomePadronizado.match(padrao);
      if (match) {
        info.ano = parseInt(match[1], 10) || 99;
        info.letra = (match[2] || '').toUpperCase();
        info.numero = info.ano;
        break;
      }
    }
    
    return info;
  }, []);

  // Função para ordenar turmas por ordem crescente
  const ordenarTurmasCrescente = useCallback((turmasArray) => {
    if (!Array.isArray(turmasArray)) return [];
    
    return [...turmasArray].sort((a, b) => {
      const nomeA = a.nome || '';
      const nomeB = b.nome || '';
      
      // Extrair número e série da turma
      const infoA = extrairInfoTurma(nomeA);
      const infoB = extrairInfoTurma(nomeB);
      
      // Primeiro ordenar por ano (1º ano, 2º ano, etc.)
      if (infoA.ano !== infoB.ano) {
        return infoA.ano - infoB.ano;
      }
      
      // Se mesmo ano, ordenar por letra (A, B, C)
      if (infoA.letra !== infoB.letra) {
        return infoA.letra.localeCompare(infoB.letra);
      }
      
      // Por último, ordenar por turno
      const ordemTurno = { manhã: 1, manha: 1, tarde: 2, noite: 3, integral: 4 };
      const turnoA = ordemTurno[a.turno?.toLowerCase()] || 99;
      const turnoB = ordemTurno[b.turno?.toLowerCase()] || 99;
      
      return turnoA - turnoB;
    });
  }, [extrairInfoTurma]);

  const turmasFiltradas = useMemo(() => {
    let turmasParaFiltrar = turmas;

    if (filtro.trim()) {
      const termo = filtro.toLowerCase();
      turmasParaFiltrar = turmas
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
    }

    // Ordenar as turmas
    return ordenarTurmasCrescente(turmasParaFiltrar);
  }, [filtro, turmas, ordenarTurmasCrescente]);

  const handleEditAluno = async (aluno, turmaId) => {
    try {
      const alunoCompleto = await AlunoService.getById(aluno.id);

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

      setSelectedAluno(alunoNormalizado);
      setModalOpen(true);
    } catch (error) {
      console.error("❌ Erro ao carregar aluno:", error);
      alert("Erro ao carregar os dados completos do aluno.");
    }
  };

  const handleUpdateAluno = async (payload) => {
    // segurança extra
    if (!payload.id) {
      console.error("❌ ERRO: payload.id está vazio! Payload:", payload);
      alert("Erro interno: ID do aluno não encontrado.");
      return false;
    }

    try {
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
    refetch();
    handleCancelEdit();
  };

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") handleCancelEdit();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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
            {turmasFiltradas.map((turma, index) => (
              <TurmaCard
                key={turma.id}
                turma={turma}
                index={index}
                onEditAluno={handleEditAluno}
                onAlunoUpdated={refetch}
              />
            ))}
          </div>
        )}
      </div>

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