import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Search, Users, ChevronDown, ChevronUp, Printer } from "lucide-react";

import "./listaTurma.css";
import { useTurmasProfessor } from "../../hooks/useTurmasProfessor";
import { useAuth } from "../../context/AuthContext";
import { gerarRelatorioAlunosProfessor } from "../../Relatorios/listaAlunoProf";

const ListaTurmas = () => {
  const [filtro, setFiltro] = useState("");
  const { user } = useAuth();

  const { turmas, refetch, hasError, isLoading } = useTurmasProfessor();

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

  const calcularIdade = useCallback((dataNascimento) => {
    if (!dataNascimento) return "-";

    try {
      // Tenta converter para Date, aceita vários formatos
      const data = new Date(dataNascimento);
      if (isNaN(data.getTime())) return "-";

      const hoje = new Date();
      let idade = hoje.getFullYear() - data.getFullYear();
      const mes = hoje.getMonth() - data.getMonth();

      if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
        idade--;
      }
      return idade;
    } catch (error) {
      console.error("Erro ao calcular idade:", error);
      return "-";
    }
  }, []);

  // Função para formatar data
  const formatarData = useCallback((data) => {
    if (!data) return "-";

    try {
      const date = new Date(data);
      if (isNaN(date.getTime())) return "-";

      return date.toLocaleDateString("pt-BR");
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "-";
    }
  }, []);

  // Função para obter a data de nascimento do aluno (tenta diferentes campos)
  const obterDataNascimento = useCallback((aluno) => {
    return (
      aluno.dataNascimento ||
      aluno.data_nascimento ||
      aluno.nascimento ||
      aluno.dt_nascimento ||
      aluno.birthdate
    );
  }, []);

  // Função para obter a capacidade da turma (tenta diferentes campos)
  const obterCapacidade = useCallback((turma) => {
    return (
      turma.capacidade ||
      turma.capacity ||
      turma.limite_alunos ||
      turma.limiteAlunos ||
      turma.max_alunos ||
      turma.maxAlunos ||
      30
    );
  }, []);

  const handlePrint = useCallback((turma, e) => {
    if (e) e.stopPropagation();

    const alunos = turma.alunos || [];
    const capacidade = obterCapacidade(turma);
    const dataHoraAgora = new Date().toLocaleString("pt-BR");

    const html = gerarRelatorioAlunosProfessor({
      turma: {
        ...turma,
        capacidade: capacidade,
      },
      alunos: alunos,
      qtdAtivos: alunos.length,
      dataHoraAgora: dataHoraAgora,
      formatarData: formatarData,
    });

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
  }, [obterCapacidade, formatarData]);

  const turmasFiltradas = useMemo(() => {
    let turmasParaFiltrar = turmas;

    if (filtro.trim()) {
      turmasParaFiltrar = turmas
        .filter((turma) => {
          const turmaNomeMatch = turma.nome
            ?.toLowerCase()
            .includes(filtro.toLowerCase());
          const alunoNomeMatch = turma.alunos?.some((aluno) =>
            aluno.nome?.toLowerCase().includes(filtro.toLowerCase())
          );
          return turmaNomeMatch || alunoNomeMatch;
        })
        .map((turma) => ({
          ...turma,
          alunos: turma.alunos?.filter(
            (aluno) =>
              !filtro ||
              turma.nome?.toLowerCase().includes(filtro.toLowerCase()) ||
              aluno.nome?.toLowerCase().includes(filtro.toLowerCase())
          ),
        }));
    }

    // Ordenar as turmas
    return ordenarTurmasCrescente(turmasParaFiltrar);
  }, [filtro, turmas, ordenarTurmasCrescente]);

  const TurmaCardProfessor = React.memo(({ turma, index }) => {
    const [expanded, setExpanded] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);

    const capacidade = obterCapacidade(turma);
    const alunosCount = turma.alunos?.length || 0;
    const percentualOcupacao =
      capacidade > 0 ? (alunosCount / capacidade) * 100 : 0;

    const getStatusClass = useCallback(() => {
      if (percentualOcupacao >= 100) return "professor-turma-lotada";
      if (percentualOcupacao >= 80) return "professor-turma-quase-lotada";
      return "";
    }, [percentualOcupacao]);

    const getTurnoClass = useCallback((turno) => {
      const turnoLower = turno?.toLowerCase();
      if (turnoLower === "manhã" || turnoLower === "manha")
        return "professor-turno-manha";
      if (turnoLower === "tarde") return "professor-turno-tarde";
      if (turnoLower === "noite") return "professor-turno-noite";
      if (turnoLower === "integral") return "professor-turno-integral";
      return "";
    }, []);

    const handleToggle = () => {
      if (isAnimating) return;

      setIsAnimating(true);
      setExpanded(!expanded);

      setTimeout(() => {
        setIsAnimating(false);
      }, 300);
    };

    return (
      <div
        className={`professor-turma-card ${getStatusClass()} ${
          isAnimating ? "professor-animating" : ""
        }`}
        style={{ animationDelay: index !== undefined ? `${0.05 + index * 0.05}s` : '0s' }}
      >
        <div className="professor-turma-info">
          <div className="professor-turma-header-wrapper">
            <div
              className="professor-turma-header professor-clickable"
              onClick={handleToggle}
            >
              {expanded ? (
                <ChevronUp
                  size={20}
                  style={{ color: "#64748b", flexShrink: 0 }}
                />
              ) : (
                <ChevronDown
                  size={20}
                  style={{ color: "#64748b", flexShrink: 0 }}
                />
              )}
              <h3 className="professor-turma-nome">{turma.nome}</h3>
              <span
                className={`professor-turma-turno ${getTurnoClass(
                  turma.turno
                )}`}
              >
                {turma.turno}
              </span>
            </div>

            {/* BOTÃO IMPRIMIR SEMPRE VISÍVEL */}
            <button
              className="professor-print-button"
              onClick={(e) => handlePrint(turma, e)}
              title="Imprimir"
            >
              <Printer size={16} />
              Imprimir
            </button>
          </div>

          <div className="professor-turma-details">
            <div className="professor-alunos-count">
              {alunosCount} de {capacidade} alunos
            </div>
            <div className="professor-progress-bar">
              <div
                className="professor-progress-fill"
                style={{
                  width: `${Math.min(percentualOcupacao, 100)}%`,
                  backgroundColor: "#64748b",
                }}
              />
            </div>
          </div>

          <div
            className={`professor-alunos-container ${
              expanded ? "professor-expanded" : "professor-collapsed"
            }`}
          >
            {turma.alunos && turma.alunos.length > 0 ? (
              <div className="professor-alunos-table-container">
                <div className="professor-alunos-table-header">
                  <span>Nome</span>
                  <span>Data de Nascimento</span>
                  <span>Idade</span>
                </div>
                <div className="professor-alunos-list">
                  {turma.alunos.map((aluno) => {
                    const dataNascimento = obterDataNascimento(aluno);
                    const idade = calcularIdade(dataNascimento);

                    return (
                      <div key={aluno.id} className="professor-aluno-row">
                        <span className="professor-aluno-nome">
                          {aluno.nome}
                        </span>
                        <span className="professor-aluno-data-nascimento">
                          {formatarData(dataNascimento)}
                        </span>
                        <span className="professor-aluno-idade">
                          {typeof idade === "number" ? `${idade} anos` : idade}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="professor-empty-alunos-message">
                <p>Nenhum aluno matriculado nesta turma.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  });

  if (isLoading) {
    return (
      <div className="professor-container">
        <div className="professor-loading-state">Carregando suas turmas...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="professor-container">
        <div className="professor-error-state">
          Erro ao carregar turmas. Tente novamente.
          <button onClick={refetch} className="professor-retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="professor-container">
      {/* Seção de Filtros */}
      <div className="professor-section">
        <div className="professor-section-header">
          <span>Filtros de Busca</span>
        </div>
        <div className="professor-form-grid">
          <div className="professor-form-group professor-full-width">
            <label>Buscar por turma ou aluno</label>
            <div className="professor-input-wrapper">
              <Search className="professor-input-icon" size={18} />
              <input
                type="text"
                className="professor-input professor-search-input"
                placeholder="Digite o nome da turma ou do aluno..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Turmas do Professor */}
      <div className="professor-section">
        <div className="professor-section-header">
          <span>Minhas Turmas</span>
          <span
            style={{ fontSize: "14px", color: "#64748b", fontWeight: "normal" }}
          >
            {turmasFiltradas.length} turma
            {turmasFiltradas.length !== 1 ? "s" : ""} encontrada
            {turmasFiltradas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {turmas.length === 0 ? (
          <div className="professor-empty-state">
            <div className="professor-empty-icon">
              <Users size={40} />
            </div>
            <h4>Nenhuma turma vinculada</h4>
            <p>Você não está vinculado a nenhuma turma no momento.</p>
            <div
              style={{ marginTop: "10px", fontSize: "12px", color: "#64748b" }}
            >
              ID do usuário: {user?.id}
            </div>
          </div>
        ) : turmasFiltradas.length === 0 ? (
          <div className="professor-empty-state">
            <div className="professor-empty-icon">
              <Search size={40} />
            </div>
            <h4>Nenhuma turma encontrada</h4>
            <p>Tente ajustar os filtros de busca.</p>
          </div>
        ) : (
          <div className="professor-turmas-list">
            {turmasFiltradas.map((turma, index) => (
              <TurmaCardProfessor key={turma.id} turma={turma} index={index} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ListaTurmas;