import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Save,
  ChevronDown,
  ChevronUp,
  Edit3,
  Users,
  Loader,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Calendar,
} from "lucide-react";
import "./faltas.css";
import { useTurmasComAlunosFaltas } from "../../hooks/useTurmasComAlunosFaltas";
import FaltaService from "../../Services/FaltaService";
import { gerarRelatorioFaltas } from "../../Relatorios/faltas";

const FaltasSecretaria = () => {
  const [filtro, setFiltro] = useState("");
  const [turmasExpandidas, setTurmasExpandidas] = useState({});
  const [turmasEditaveis, setTurmasEditaveis] = useState(new Set());
  const [anoLetivo, setAnoLetivo] = useState("2025");
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [faltas, setFaltas] = useState({});
  const [salvando, setSalvando] = useState({});
  const [carregandoFaltas, setCarregandoFaltas] = useState(false);
  const [isAnimating, setIsAnimating] = useState({});
  const [animandoData, setAnimandoData] = useState(false);

  const {
    turmas: turmasData,
    refetch,
    hasError,
    isLoading,
  } = useTurmasComAlunosFaltas();

  // Períodos de aula para Fundamental II
  const periodos = {
    1: "1º Período",
    2: "2º Período",
    3: "3º Período",
    4: "4º Período",
    5: "5º Período",
  };

  // Determinar se a turma é Fundamental I (1-5) ou II (6-9)
  const getTipoTurma = useCallback((turmaNome) => {
    const match = turmaNome.match(/(\d+)/);
    if (match) {
      const serie = parseInt(match[1]);
      return serie <= 5 ? "fundamental1" : "fundamental2";
    }
    return "fundamental1";
  }, []);

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

  useEffect(() => {
    setFaltas({});
    setTurmasExpandidas({});
    setTurmasEditaveis(new Set());
    setIsAnimating({});

    if (dataSelecionada && turmasData && turmasData.length > 0) {
      carregarFaltasDoBanco();
    }
  }, [dataSelecionada, turmasData]);

  const carregarFaltasDoBanco = async () => {
    if (!dataSelecionada || !turmasData || turmasData.length === 0) return;

    setCarregandoFaltas(true);

    try {
      const faltasDoBanco = await FaltaService.getAll({
        data_inicio: dataSelecionada,
        data_fim: dataSelecionada,
      });

      const novoEstadoFaltas = {};

      // Preencher apenas com as faltas que existem no banco para ESTA data
      faltasDoBanco.forEach((falta) => {
        if (falta.periodo !== null && falta.periodo !== undefined) {
          // Fundamental II - falta por período
          const chave = `${falta.idAluno}-${falta.periodo}`;
          novoEstadoFaltas[chave] = true;
        } else {
          // Fundamental I - falta geral
          const chave = `${falta.idAluno}`;
          novoEstadoFaltas[chave] = true;
        }
      });

      setFaltas(novoEstadoFaltas);
    } catch (error) {
      console.error("❌ Erro ao carregar faltas:", error);
      alert("Erro ao carregar faltas do banco de dados");
    } finally {
      setCarregandoFaltas(false);
    }
  };

  const iniciarAnimacaoData = (novaDataCallback) => {
    setAnimandoData(true);

    setTimeout(() => {
      novaDataCallback();
    }, 100);

    setTimeout(() => {
      setAnimandoData(false);
    }, 400);
  };

  const avancarData = () => {
    const dataAtual = new Date(dataSelecionada);
    dataAtual.setDate(dataAtual.getDate() + 1);
    const novaData = dataAtual.toISOString().split("T")[0];

    if (!isDataFutura(novaData)) {
      iniciarAnimacaoData(() => {
        setDataSelecionada(novaData);
      });
    }
  };

  const retrocederData = () => {
    const dataAtual = new Date(dataSelecionada);
    dataAtual.setDate(dataAtual.getDate() - 1);
    const novaData = dataAtual.toISOString().split("T")[0];

    iniciarAnimacaoData(() => {
      setDataSelecionada(novaData);
    });
  };

  const handleDataChange = (novaData) => {
    if (!isDataFutura(novaData)) {
      iniciarAnimacaoData(() => {
        setDataSelecionada(novaData);
      });
    }
  };

  const isDataFutura = (data) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataComparar = new Date(data + "T00:00:00");
    return dataComparar > hoje;
  };

  // Filtrar turmas
  const turmasFiltradas = useMemo(() => {
    if (!turmasData) return [];
    
    let turmasParaFiltrar = turmasData;
    
    // Aplicar filtro se houver
    if (filtro) {
      turmasParaFiltrar = turmasData
        .filter((turma) => {
          const turmaNomeMatch = turma.nome
            .toLowerCase()
            .includes(filtro.toLowerCase());
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
    }
    
    // Ordenar as turmas
    return ordenarTurmasCrescente(turmasParaFiltrar);
  }, [filtro, turmasData, ordenarTurmasCrescente]);

  const toggleTurma = useCallback((turmaId) => {
    if (isAnimating[turmaId]) return;

    setIsAnimating((prev) => ({ ...prev, [turmaId]: true }));
    setTurmasExpandidas((prev) => ({
      ...prev,
      [turmaId]: !prev[turmaId],
    }));

    setTimeout(() => {
      setIsAnimating((prev) => ({ ...prev, [turmaId]: false }));
    }, 300);
  }, [isAnimating]);

  const toggleEdicao = useCallback((turmaId) => {
    setTurmasEditaveis((prev) => {
      const novaSet = new Set(prev);
      if (novaSet.has(turmaId)) {
        novaSet.delete(turmaId);
      } else {
        novaSet.add(turmaId);
      }
      return novaSet;
    });
  }, []);

  const getTurnoClass = useCallback((turno) => {
    const turnoLower = turno?.toLowerCase();
    if (turnoLower === "manhã" || turnoLower === "manha")
      return "fs-turno-manha";
    if (turnoLower === "tarde") return "fs-turno-tarde";
    if (turnoLower === "noite") return "fs-turno-noite";
    if (turnoLower === "integral") return "fs-turno-integral";
    return "";
  }, []);

  const handleFaltaChange = useCallback((alunoId, faltou, periodo = null) => {
    let chave;
    if (periodo !== null) {
      chave = `${alunoId}-${periodo}`;
    } else {
      chave = `${alunoId}`;
    }

    setFaltas((prev) => {
      const novoEstado = { ...prev };

      if (faltou) {
        novoEstado[chave] = true;
      } else {
        delete novoEstado[chave];
      }

      return novoEstado;
    });
  }, []);

  const getFaltaAluno = useCallback((alunoId, periodo = null) => {
    let chave;
    if (periodo !== null) {
      chave = `${alunoId}-${periodo}`;
    } else {
      chave = `${alunoId}`;
    }

    return !!faltas[chave];
  }, [faltas]);

  const formatarData = useCallback((data) => {
    const dataObj = new Date(data + "T00:00:00");
    return dataObj.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }, []);

  const handleSalvarFaltas = async (turmaId) => {
    setSalvando((prev) => ({ ...prev, [turmaId]: true }));

    try {
      const turma = turmasData.find((t) => t.id === turmaId);
      const tipoTurma = getTipoTurma(turma.nome);

      // Buscar faltas existentes no banco para ESTA DATA
      const faltasExistentes = await FaltaService.getAll({
        data_inicio: dataSelecionada,
        data_fim: dataSelecionada,
      });

      const alunosTurmaIds = new Set(turma.alunos.map((aluno) => aluno.id));
      const faltasExistentesTurma = faltasExistentes.filter((falta) =>
        alunosTurmaIds.has(falta.idAluno)
      );

      const operacoes = [];

      if (tipoTurma === "fundamental1") {
        // Fundamental I
        turma.alunos.forEach((aluno) => {
          const faltaNoFrontend = getFaltaAluno(aluno.id);
          const faltaNoBanco = faltasExistentesTurma.find(
            (f) => f.idAluno === aluno.id && f.periodo === null
          );

          if (faltaNoFrontend && !faltaNoBanco) {
            operacoes.push({
              tipo: "criar",
              dados: {
                idAluno: aluno.id,
                data: dataSelecionada,
                periodo: null,
              },
            });
          } else if (!faltaNoFrontend && faltaNoBanco) {
            operacoes.push({
              tipo: "deletar",
              id: faltaNoBanco.id,
            });
          }
        });
      } else {
        // Fundamental II
        turma.alunos.forEach((aluno) => {
          Object.keys(periodos).forEach((periodo) => {
            const periodoNum = parseInt(periodo);
            const faltaNoFrontend = getFaltaAluno(aluno.id, periodoNum);
            const faltaNoBanco = faltasExistentesTurma.find(
              (f) => f.idAluno === aluno.id && f.periodo === periodoNum
            );

            console.log(
              `${
                aluno.nome
              } (P${periodoNum}): Frontend=${faltaNoFrontend}, Banco=${!!faltaNoBanco}`
            );

            if (faltaNoFrontend && !faltaNoBanco) {
              operacoes.push({
                tipo: "criar",
                dados: {
                  idAluno: aluno.id,
                  data: dataSelecionada,
                  periodo: periodoNum,
                },
              });
            } else if (!faltaNoFrontend && faltaNoBanco) {
              operacoes.push({
                tipo: "deletar",
                id: faltaNoBanco.id,
              });
            }
          });
        });
      }

      // Executar operações
      let criadas = 0;
      let removidas = 0;

      // Primeiro remover
      for (const op of operacoes.filter((o) => o.tipo === "deletar")) {
        await FaltaService.delete(op.id);
        removidas++;
      }

      // Depois criar
      for (const op of operacoes.filter((o) => o.tipo === "criar")) {
        await FaltaService.create(op.dados);
        criadas++;
      }

      // Mostrar resultado
      if (criadas > 0 || removidas > 0) {
        alert(
          `Faltas salvas!\n• ${criadas} falta(s) registrada(s)\n• ${removidas} falta(s) removida(s)`
        );
      } else {
        alert("Nenhuma falta alterada.");
      }

      // Sai do modo edição
      setTurmasEditaveis((prev) => {
        const novo = new Set(prev);
        novo.delete(turmaId);
        return novo;
      });

      // Recarregar do banco para sincronizar
      await carregarFaltasDoBanco();
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      alert(`Erro ao salvar faltas: ${error.message}`);
    } finally {
      setSalvando((prev) => ({ ...prev, [turmaId]: false }));
    }
  };

  const handleGerarRelatorioPDF = useCallback((turmaId, turmaNome) => {
    const turma = turmasData.find((t) => t.id === turmaId);
    if (!turma) return;
    
    const tipoTurma = getTipoTurma(turma.nome);

    // Preparar dados dos alunos com faltas
    const alunosComFaltas = turma.alunos.map((aluno) => {
      if (tipoTurma === "fundamental1") {
        const faltou = getFaltaAluno(aluno.id);
        return {
          nome: aluno.nome,
          faltou: faltou,
          totalFaltas: faltou ? 1 : 0,
          faltasPeriodos: {},
        };
      } else {
        const faltasPeriodos = {};
        let totalFaltas = 0;

        Object.keys(periodos).forEach((periodoKey) => {
          const faltouPeriodo = getFaltaAluno(aluno.id, parseInt(periodoKey));
          faltasPeriodos[periodoKey] = faltouPeriodo;
          if (faltouPeriodo) totalFaltas++;
        });

        return {
          nome: aluno.nome,
          faltou: totalFaltas > 0,
          totalFaltas: totalFaltas,
          faltasPeriodos: faltasPeriodos,
        };
      }
    });

    const dataHoraAgora = new Date().toLocaleString("pt-BR");

    // GERAR HTML COMPLETO
    const relatorioHTML = gerarRelatorioFaltas({
      turma: {
        ...turma,
        tipo: tipoTurma,
      },
      alunosComFaltas,
      dataSelecionada,
      periodos,
      dataHoraAgora,
      formatarData,
    });

    // CRIAR IFRAME INVISÍVEL
    const oldFrame = document.getElementById("print-faltas-frame");
    if (oldFrame) oldFrame.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "print-faltas-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow || iframe.contentDocument;
    const doc = frameDoc.document || frameDoc;

    // ESCREVER RELATÓRIO DENTRO DO IFRAME
    doc.open();
    doc.write(relatorioHTML);
    doc.close();

    // APÓS CARREGAR, IMPRIME
    iframe.onload = () => {
      setTimeout(() => {
        frameDoc.focus();
        frameDoc.print();
      }, 200);
    };
  }, [turmasData, getTipoTurma, getFaltaAluno, dataSelecionada, periodos, formatarData]);

  // Estados de loading e error
  if (isLoading) {
    return (
      <div className="fs-container">
        <div className="fs-loading-state">Carregando turmas...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="fs-container">
        <div className="fs-error-state">
          Erro ao carregar turmas. Tente novamente.
          <button onClick={refetch} className="fs-retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fs-container">
      {/* Seção de Filtros */}
      <div className="fs-section">
        <div className="fs-section-header">
          <span>Filtros e Configurações</span>
        </div>
        <div className="fs-form-grid">
          <div className="fs-form-group fs-third-width">
            <label>Ano Letivo</label>
            <select
              className="fs-select"
              value={anoLetivo}
              onChange={(e) => setAnoLetivo(e.target.value)}
              disabled={animandoData}
            >
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="fs-form-group fs-third-width">
            <label>Data da Aula</label>
            <div className="fs-data-navigation">
              <button
                className="fs-nav-button"
                onClick={retrocederData}
                title="Dia anterior"
                disabled={animandoData}
              >
                <ChevronLeft size={16} />
              </button>
              <input
                type="date"
                className="fs-input"
                value={dataSelecionada}
                onChange={(e) => handleDataChange(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                disabled={animandoData}
              />
              <button
                className="fs-nav-button"
                onClick={avancarData}
                disabled={isDataFutura(dataSelecionada) || animandoData}
                title={
                  isDataFutura(dataSelecionada)
                    ? "Não é possível registrar faltas para datas futuras"
                    : "Próximo dia"
                }
              >
                <ChevronRightIcon size={16} />
              </button>
            </div>
          </div>

          <div className="fs-form-group fs-third-width">
            <label>Buscar por turma ou aluno</label>
            <div className="fs-input-wrapper">
              <Search className="fs-input-icon" size={18} />
              <input
                type="text"
                className="fs-input fs-search-input"
                placeholder="Digite para buscar..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
                disabled={animandoData}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="fs-section">
        <div className={`fs-section-header ${animandoData ? "fs-fading" : ""}`}>
          <span>
            Registro de Faltas - {anoLetivo} - {formatarData(dataSelecionada)}
          </span>
          <span
            style={{ fontSize: "14px", color: "#64748b", fontWeight: "normal" }}
          >
            {turmasFiltradas.length} turma
            {turmasFiltradas.length !== 1 ? "s" : ""} encontrada
            {turmasFiltradas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {turmasFiltradas.length === 0 ? (
          <div className="fs-empty-state">
            <div className="fs-empty-icon">
              <Users size={40} />
            </div>
            <h4>Nenhuma turma encontrada</h4>
            <p>
              Tente ajustar os filtros de busca ou verifique se há turmas
              cadastradas.
            </p>
          </div>
        ) : (
          <div className={`fs-turmas-list ${animandoData ? "fs-fading" : ""}`}>
            {turmasFiltradas.map((turma, index) => {
              const isExpandida = turmasExpandidas[turma.id];
              const isEditavel = turmasEditaveis.has(turma.id);
              const isSalvando = salvando[turma.id];
              const tipoTurma = getTipoTurma(turma.nome);

              return (
                <div
                  key={turma.id}
                  className={`fs-turma-card ${
                    isAnimating[turma.id] ? "fs-animating" : ""
                  }`}
                  style={
                    animandoData ? { animationDelay: `${0.05 + index * 0.05}s` } : {}
                  }
                >
                  <div className="fs-turma-info">
                    <div className="fs-turma-header-wrapper">
                      <div
                        className="fs-turma-header fs-clickable"
                        onClick={() => toggleTurma(turma.id)}
                      >
                        {isExpandida ? (
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
                        <h3 className="fs-turma-nome">{turma.nome}</h3>
                        <span
                          className={`fs-turma-turno ${getTurnoClass(
                            turma.turno
                          )}`}
                        >
                          {turma.turno}
                        </span>
                      </div>

                      {/* Botão de Relatório - ADICIONADO PARA SECRETARIA */}
                      <div className="fs-turma-actions">
                        <button
                          className="fs-relatorio-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGerarRelatorioPDF(turma.id, turma.nome);
                          }}
                          title={`Gerar relatório de frequência da turma ${turma.nome}`}
                          disabled={animandoData}
                        >
                          <Calendar size={16} />
                          Relatório
                        </button>
                      </div>
                    </div>

                    <div className="fs-turma-details">
                      <div className="fs-alunos-count">
                        {turma.alunos.length} aluno
                        {turma.alunos.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div
                      className={`fs-alunos-container ${
                        isExpandida ? "fs-expanded" : "fs-collapsed"
                      }`}
                    >
                      <div className="fs-table-container">
                        {tipoTurma === "fundamental1" && (
                          <>
                            <div className="fs-table-header fs-globalizada">
                              <span>Nome do Aluno</span>
                              <span>Presente</span>
                              <span>Faltou</span>
                            </div>
                            <div className="fs-alunos-list">
                              {turma.alunos.map((aluno) => {
                                const faltou = getFaltaAluno(aluno.id);
                                return (
                                  <div
                                    key={aluno.id}
                                    className="fs-aluno-row fs-globalizada"
                                  >
                                    <div className="fs-aluno-nome">
                                      {aluno.nome}
                                    </div>
                                    <div className="fs-checkbox-container">
                                      <label className="fs-checkbox-wrapper">
                                        <input
                                          type="radio"
                                          name={`presenca-${aluno.id}-${dataSelecionada}`}
                                          className="fs-radio-input"
                                          checked={!faltou}
                                          onChange={() =>
                                            handleFaltaChange(aluno.id, false)
                                          }
                                          disabled={
                                            !isEditavel ||
                                            isSalvando ||
                                            animandoData
                                          }
                                        />
                                        <span className="fs-radio-custom fs-presente"></span>
                                      </label>
                                    </div>
                                    <div className="fs-checkbox-container">
                                      <label className="fs-checkbox-wrapper">
                                        <input
                                          type="radio"
                                          name={`presenca-${aluno.id}-${dataSelecionada}`}
                                          className="fs-radio-input"
                                          checked={faltou}
                                          onChange={() =>
                                            handleFaltaChange(aluno.id, true)
                                          }
                                          disabled={
                                            !isEditavel ||
                                            isSalvando ||
                                            animandoData
                                          }
                                        />
                                        <span className="fs-radio-custom fs-falta"></span>
                                      </label>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </>
                        )}

                        {tipoTurma === "fundamental2" && (
                          <>
                            <div className="fs-table-header fs-periodos">
                              <span>Nome do Aluno</span>
                              {Object.values(periodos).map((periodo, index) => (
                                <span key={index}>{periodo}</span>
                              ))}
                            </div>
                            <div className="fs-alunos-list">
                              {turma.alunos.map((aluno) => (
                                <div
                                  key={aluno.id}
                                  className="fs-aluno-row fs-periodos"
                                >
                                  <div className="fs-aluno-nome">
                                    {aluno.nome}
                                  </div>
                                  {Object.keys(periodos).map(
                                    (periodoKey, index) => (
                                      <div
                                        key={index}
                                        className="fs-periodo-container"
                                        data-label={periodos[periodoKey]}
                                      >
                                        <div className="fs-periodo-opcoes">
                                          <label className="fs-checkbox-wrapper fs-mini">
                                            <input
                                              type="radio"
                                              name={`presenca-${aluno.id}-${dataSelecionada}-${periodoKey}`}
                                              className="fs-radio-input"
                                              checked={
                                                !getFaltaAluno(
                                                  aluno.id,
                                                  parseInt(periodoKey)
                                                )
                                              }
                                              onChange={() =>
                                                handleFaltaChange(
                                                  aluno.id,
                                                  false,
                                                  parseInt(periodoKey)
                                                )
                                              }
                                              disabled={
                                                !isEditavel ||
                                                isSalvando ||
                                                animandoData
                                              }
                                            />
                                            <span className="fs-radio-custom fs-presente fs-mini"></span>
                                          </label>
                                          <label className="fs-checkbox-wrapper fs-mini">
                                            <input
                                              type="radio"
                                              name={`presenca-${aluno.id}-${dataSelecionada}-${periodoKey}`}
                                              className="fs-radio-input"
                                              checked={getFaltaAluno(
                                                aluno.id,
                                                parseInt(periodoKey)
                                              )}
                                              onChange={() =>
                                                handleFaltaChange(
                                                  aluno.id,
                                                  true,
                                                  parseInt(periodoKey)
                                                )
                                              }
                                              disabled={
                                                !isEditavel ||
                                                isSalvando ||
                                                animandoData
                                              }
                                            />
                                            <span className="fs-radio-custom fs-falta fs-mini"></span>
                                          </label>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ))}
                            </div>
                          </>
                        )}
                      </div>

                      <div className="fs-table-actions">
                        {!isEditavel ? (
                          <button
                            className="fs-editar-button"
                            onClick={() => toggleEdicao(turma.id)}
                            title="Editar faltas"
                            disabled={isSalvando || animandoData}
                          >
                            <Edit3 size={16} />
                            Editar Faltas
                          </button>
                        ) : (
                          <button
                            className="fs-salvar-button"
                            onClick={() => handleSalvarFaltas(turma.id)}
                            title="Salvar faltas"
                            disabled={isSalvando || animandoData}
                          >
                            {isSalvando ? (
                              <Loader size={16} className="fs-spinner" />
                            ) : (
                              <Save size={16} />
                            )}
                            {isSalvando ? "Salvando..." : "Salvar Faltas"}
                          </button>
                        )}
                      </div>
                    </div>
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

export default FaltasSecretaria;