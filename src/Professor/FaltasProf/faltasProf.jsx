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
} from "lucide-react";
import "./faltasProf.css";
import { useTurmasProfessor } from "../../hooks/useTurmasProfessor"; // Alterado
import FaltaService from "../../Services/FaltaService";

const FaltasProfessor = () => {
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

  // Usando o hook que filtra apenas as turmas do professor
  const {
    turmas: turmasData,
    refetch,
    hasError,
    isLoading,
    professor
  } = useTurmasProfessor(); // Alterado

  // Períodos de aula para Fundamental II
  const periodos = {
    1: "1º Período",
    2: "2º Período",
    3: "3º Período",
    4: "4º Período",
    5: "5º Período",
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

  // Determinar se a turma é Fundamental I (1-5) ou II (6-9)
  const getTipoTurma = useCallback((turmaNome) => {
    const match = turmaNome.match(/(\d+)/);
    if (match) {
      const serie = parseInt(match[1]);
      return serie <= 5 ? "fundamental1" : "fundamental2";
    }
    return "fundamental1";
  }, []);

  useEffect(() => {
    setFaltas({});
    setTurmasExpandidas({});
    setTurmasEditaveis(new Set());
    setIsAnimating({});

    if (dataSelecionada && turmasData && turmasData.length > 0) {
      carregarFaltasDoBanco();
    }
  }, [dataSelecionada, turmasData]);

  const carregarFaltasDoBanco = useCallback(async () => {
    if (!dataSelecionada || !turmasData || turmasData.length === 0) return;

    setCarregandoFaltas(true);

    try {
      const faltasDoBanco = await FaltaService.getAll({
        data_inicio: dataSelecionada,
        data_fim: dataSelecionada,
      });

      const novoEstadoFaltas = {};

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
  }, [dataSelecionada, turmasData]);

  const iniciarAnimacaoData = useCallback((novaDataCallback) => {
    setAnimandoData(true);

    setTimeout(() => {
      novaDataCallback();
    }, 100);

    setTimeout(() => {
      setAnimandoData(false);
    }, 400);
  }, []);

  const avancarData = useCallback(() => {
    const dataAtual = new Date(dataSelecionada);
    dataAtual.setDate(dataAtual.getDate() + 1);
    const novaData = dataAtual.toISOString().split("T")[0];

    if (!isDataFutura(novaData)) {
      iniciarAnimacaoData(() => {
        setDataSelecionada(novaData);
      });
    }
  }, [dataSelecionada, iniciarAnimacaoData]);

  const retrocederData = useCallback(() => {
    const dataAtual = new Date(dataSelecionada);
    dataAtual.setDate(dataAtual.getDate() - 1);
    const novaData = dataAtual.toISOString().split("T")[0];

    iniciarAnimacaoData(() => {
      setDataSelecionada(novaData);
    });
  }, [dataSelecionada, iniciarAnimacaoData]);

  const handleDataChange = useCallback((novaData) => {
    if (!isDataFutura(novaData)) {
      iniciarAnimacaoData(() => {
        setDataSelecionada(novaData);
      });
    }
  }, [iniciarAnimacaoData]);

  const isDataFutura = useCallback((data) => {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    const dataComparar = new Date(data + "T00:00:00");
    return dataComparar > hoje;
  }, []);

  // Filtrar turmas
  const turmasFiltradas = useMemo(() => {
    if (!turmasData) return [];
    
    let turmasParaFiltrar = turmasData;

    if (filtro.trim()) {
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
      return "fp-turno-manha";
    if (turnoLower === "tarde") return "fp-turno-tarde";
    if (turnoLower === "noite") return "fp-turno-noite";
    if (turnoLower === "integral") return "fp-turno-integral";
    return "";
  }, []);

  const handleFaltaChange = useCallback((alunoId, faltou, periodo = null) => {
    let chave;
    if (periodo !== null) {
      chave = `${alunoId}-${periodo}`;
    } else {
      chave = `${alunoId}`;
    }

    console.log(`✏️ Alterando falta: ${chave} = ${faltou}`);

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

  const handleSalvarFaltas = useCallback(async (turmaId) => {
    setSalvando((prev) => ({ ...prev, [turmaId]: true }));

    try {
      const turma = turmasData.find((t) => t.id === turmaId);
      const tipoTurma = getTipoTurma(turma.nome);

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

      await carregarFaltasDoBanco();
    } catch (error) {
      console.error("❌ Erro ao salvar:", error);
      alert(`Erro ao salvar faltas: ${error.message}`);
    } finally {
      setSalvando((prev) => ({ ...prev, [turmaId]: false }));
    }
  }, [turmasData, getTipoTurma, dataSelecionada, getFaltaAluno, carregarFaltasDoBanco]);

  if (isLoading) {
    return (
      <div className="fp-container">
        <div className="fp-loading-state">Carregando suas turmas...</div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="fp-container">
        <div className="fp-error-state">
          Erro ao carregar turmas. Tente novamente.
          <button onClick={refetch} className="fp-retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // Verificar se o professor não tem turmas vinculadas
  if (professor && turmasData.length === 0) {
    return (
      <div className="fp-container">
        <div className="fp-section">
          <div className="fp-section-header">
            <span>Registro de Faltas</span>
          </div>
          <div className="fp-empty-state">
            <div className="fp-empty-icon">
              <Users size={40} />
            </div>
            <h4>Nenhuma turma vinculada</h4>
            <p>
              Você não está vinculado a nenhuma turma no momento.
              Entre em contato com a coordenação para ser vinculado a uma turma.
            </p>
            {professor && (
              <div className="fp-professor-info">
                <small>Professor: {professor.nome}</small>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fp-container">
      {/* Seção de Filtros */}
      <div className="fp-section">
        <div className="fp-section-header">
          <span>Filtros e Configurações</span>
          {professor && (
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "normal" }}>
              Professor: {professor.nome}
            </span>
          )}
        </div>
        <div className="fp-form-grid">
          <div className="fp-form-group fp-third-width">
            <label>Ano Letivo</label>
            <select
              className="fp-select"
              value={anoLetivo}
              onChange={(e) => setAnoLetivo(e.target.value)}
              disabled={animandoData}
            >
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="fp-form-group fp-third-width">
            <label>Data da Aula</label>
            <div className="fp-data-navigation">
              <button
                className="fp-nav-button"
                onClick={retrocederData}
                title="Dia anterior"
                disabled={animandoData}
              >
                <ChevronLeft size={16} />
              </button>
              <input
                type="date"
                className="fp-input"
                value={dataSelecionada}
                onChange={(e) => handleDataChange(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                disabled={animandoData}
              />
              <button
                className="fp-nav-button"
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

          <div className="fp-form-group fp-third-width">
            <label>Buscar por turma ou aluno</label>
            <div className="fp-input-wrapper">
              <Search className="fp-input-icon" size={18} />
              <input
                type="text"
                className="fp-input fp-search-input"
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
      <div className="fp-section">
        <div className={`fp-section-header ${animandoData ? "fp-fading" : ""}`}>
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
          <div className="fp-empty-state">
            <div className="fp-empty-icon">
              <Users size={40} />
            </div>
            <h4>Nenhuma turma encontrada</h4>
            <p>
              Tente ajustar os filtros de busca ou verifique se há turmas
              cadastradas.
            </p>
          </div>
        ) : (
          <div className={`fp-turmas-list ${animandoData ? "fp-fading" : ""}`}>
            {turmasFiltradas.map((turma, index) => {
              const isExpandida = turmasExpandidas[turma.id];
              const isEditavel = turmasEditaveis.has(turma.id);
              const isSalvando = salvando[turma.id];
              const tipoTurma = getTipoTurma(turma.nome);

              return (
                <div
                  key={turma.id}
                  className={`fp-turma-card ${
                    isAnimating[turma.id] ? "fp-animating" : ""
                  }`}
                  style={animandoData ? { animationDelay: `${0.05 + index * 0.05}s` } : {}}
                >
                  <div className="fp-turma-info">
                    <div className="fp-turma-header-wrapper">
                      <div
                        className="fp-turma-header fp-clickable"
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
                        <h3 className="fp-turma-nome">{turma.nome}</h3>
                        <span
                          className={`fp-turma-turno ${getTurnoClass(
                            turma.turno
                          )}`}
                        >
                          {turma.turno}
                        </span>
                      </div>
                    </div>

                    <div className="fp-turma-details">
                      <div className="fp-alunos-count">
                        {turma.alunos.length} aluno
                        {turma.alunos.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div
                      className={`fp-alunos-container ${
                        isExpandida ? "fp-expanded" : "fp-collapsed"
                      }`}
                    >
                      <div className="fp-table-container">
                        {tipoTurma === "fundamental1" && (
                          <>
                            <div className="fp-table-header fp-globalizada">
                              <span>Nome do Aluno</span>
                              <span>Presente</span>
                              <span>Faltou</span>
                            </div>
                            <div className="fp-alunos-list">
                              {turma.alunos.map((aluno) => {
                                const faltou = getFaltaAluno(aluno.id);
                                return (
                                  <div
                                    key={aluno.id}
                                    className="fp-aluno-row fp-globalizada"
                                  >
                                    <div className="fp-aluno-nome">
                                      {aluno.nome}
                                    </div>
                                    <div className="fp-checkbox-container">
                                      <label className="fp-checkbox-wrapper">
                                        <input
                                          type="radio"
                                          name={`presenca-${aluno.id}-${dataSelecionada}`}
                                          className="fp-radio-input"
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
                                        <span className="fp-radio-custom fp-presente"></span>
                                      </label>
                                    </div>
                                    <div className="fp-checkbox-container">
                                      <label className="fp-checkbox-wrapper">
                                        <input
                                          type="radio"
                                          name={`presenca-${aluno.id}-${dataSelecionada}`}
                                          className="fp-radio-input"
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
                                        <span className="fp-radio-custom fp-falta"></span>
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
                            <div className="fp-table-header fp-periodos">
                              <span>Nome do Aluno</span>
                              {Object.values(periodos).map((periodo, index) => (
                                <span key={index}>{periodo}</span>
                              ))}
                            </div>
                            <div className="fp-alunos-list">
                              {turma.alunos.map((aluno) => (
                                <div
                                  key={aluno.id}
                                  className="fp-aluno-row fp-periodos"
                                >
                                  <div className="fp-aluno-nome">
                                    {aluno.nome}
                                  </div>
                                  {Object.keys(periodos).map(
                                    (periodoKey, index) => (
                                      <div
                                        key={index}
                                        className="fp-periodo-container"
                                        data-label={periodos[periodoKey]}
                                      >
                                        <div className="fp-periodo-opcoes">
                                          <label className="fp-checkbox-wrapper fp-mini">
                                            <input
                                              type="radio"
                                              name={`presenca-${aluno.id}-${dataSelecionada}-${periodoKey}`}
                                              className="fp-radio-input"
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
                                            <span className="fp-radio-custom fp-presente fp-mini"></span>
                                          </label>
                                          <label className="fp-checkbox-wrapper fp-mini">
                                            <input
                                              type="radio"
                                              name={`presenca-${aluno.id}-${dataSelecionada}-${periodoKey}`}
                                              className="fp-radio-input"
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
                                            <span className="fp-radio-custom fp-falta fp-mini"></span>
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

                      <div className="fp-table-actions">
                        {!isEditavel ? (
                          <button
                            className="fp-editar-button"
                            onClick={() => toggleEdicao(turma.id)}
                            title="Editar faltas"
                            disabled={isSalvando || animandoData}
                          >
                            <Edit3 size={16} />
                            Editar Faltas
                          </button>
                        ) : (
                          <button
                            className="fp-salvar-button"
                            onClick={() => handleSalvarFaltas(turma.id)}
                            title="Salvar faltas"
                            disabled={isSalvando || animandoData}
                          >
                            {isSalvando ? (
                              <Loader size={16} className="fp-spinner" />
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

export default FaltasProfessor;