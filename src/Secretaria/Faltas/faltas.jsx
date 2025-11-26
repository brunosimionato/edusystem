import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Save,
  ChevronDown,
  ChevronRight,
  Calendar,
  Edit3,
  Users,
  Loader,
  AlertCircle,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
} from "lucide-react";
import "./faltas.css";
import { useTurmasComAlunosFaltas } from "../../hooks/useTurmasComAlunosFaltas";
import FaltaService from "../../Services/FaltaService";
import { gerarRelatorioFaltas } from "../../Relatorios/faltas";

const Faltas = () => {
  const [filtro, setFiltro] = useState("");
  const [turmasExpandidas, setTurmasExpandidas] = useState(new Set());
  const [turmasEditaveis, setTurmasEditaveis] = useState(new Set());
  const [anoLetivo, setAnoLetivo] = useState("2025");
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [faltas, setFaltas] = useState({});
  const [salvando, setSalvando] = useState({});
  const [carregandoFaltas, setCarregandoFaltas] = useState(false);

  // Carregar turmas e alunos
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
  const getTipoTurma = (turmaNome) => {
    const match = turmaNome.match(/(\d+)/);
    if (match) {
      const serie = parseInt(match[1]);
      return serie <= 5 ? "fundamental1" : "fundamental2";
    }
    return "fundamental1";
  };

  useEffect(() => {
    console.log("🔄 Data mudou para:", dataSelecionada);

    // 1. ZERA COMPLETAMENTE as faltas no frontend
    setFaltas({});
    setTurmasExpandidas(new Set());
    setTurmasEditaveis(new Set());

    // 2. Carrega as faltas do banco para a nova data
    if (dataSelecionada && turmasData && turmasData.length > 0) {
      carregarFaltasDoBanco();
    }
  }, [dataSelecionada, turmasData]);

  const carregarFaltasDoBanco = async () => {
    if (!dataSelecionada || !turmasData || turmasData.length === 0) return;

    console.log("📋 Buscando faltas no banco para:", dataSelecionada);
    setCarregandoFaltas(true);

    try {
      const faltasDoBanco = await FaltaService.getAll({
        data_inicio: dataSelecionada,
        data_fim: dataSelecionada,
      });

      console.log("✅ Faltas encontradas no banco:", faltasDoBanco);

      // Criar mapa de faltas VAZIO para esta data
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

      console.log("🗺️ Estado de faltas carregado:", novoEstadoFaltas);
      setFaltas(novoEstadoFaltas);
    } catch (error) {
      console.error("❌ Erro ao carregar faltas:", error);
      alert("Erro ao carregar faltas do banco de dados");
    } finally {
      setCarregandoFaltas(false);
    }
  };

  const avancarData = () => {
    const dataAtual = new Date(dataSelecionada);
    dataAtual.setDate(dataAtual.getDate() + 1);
    const novaData = dataAtual.toISOString().split("T")[0];

    if (!isDataFutura(novaData)) {
      setDataSelecionada(novaData);
    }
  };

  const retrocederData = () => {
    const dataAtual = new Date(dataSelecionada);
    dataAtual.setDate(dataAtual.getDate() - 1);
    const novaData = dataAtual.toISOString().split("T")[0];
    setDataSelecionada(novaData);
  };

  const handleDataChange = (novaData) => {
    if (!isDataFutura(novaData)) {
      setDataSelecionada(novaData);
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
    if (!filtro) return turmasData || [];
    return (turmasData || [])
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
  }, [filtro, turmasData]);

  const toggleTurma = (turmaId) => {
    setTurmasExpandidas((prev) => {
      const novaSet = new Set(prev);
      if (novaSet.has(turmaId)) {
        novaSet.delete(turmaId);
        setTurmasEditaveis((prevEdit) => {
          const novaEditSet = new Set(prevEdit);
          novaEditSet.delete(turmaId);
          return novaEditSet;
        });
      } else {
        novaSet.add(turmaId);
      }
      return novaSet;
    });
  };

  const toggleEdicao = (turmaId) => {
    setTurmasEditaveis((prev) => {
      const novaSet = new Set(prev);
      if (novaSet.has(turmaId)) {
        novaSet.delete(turmaId);
      } else {
        novaSet.add(turmaId);
      }
      return novaSet;
    });
  };

  const getTurnoClass = (turno) => {
    const turnoLower = turno?.toLowerCase() || "";
    if (turnoLower.includes("manhã") || turnoLower.includes("manha"))
      return "faltas-turno-manha";
    if (turnoLower.includes("tarde")) return "faltas-turno-tarde";
    return "faltas-turno-padrao";
  };

  const handleFaltaChange = (alunoId, faltou, periodo = null) => {
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
  };

  const getFaltaAluno = (alunoId, periodo = null) => {
    let chave;
    if (periodo !== null) {
      chave = `${alunoId}-${periodo}`;
    } else {
      chave = `${alunoId}`;
    }

    return !!faltas[chave];
  };

  const formatarData = (data) => {
    const dataObj = new Date(data + "T00:00:00");
    return dataObj.toLocaleDateString("pt-BR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleSalvarFaltas = async (turmaId) => {
    setSalvando((prev) => ({ ...prev, [turmaId]: true }));

    try {
      const turma = turmasData.find((t) => t.id === turmaId);
      const tipoTurma = getTipoTurma(turma.nome);

      console.log(`💾 Salvando turma ${turma.nome} para ${dataSelecionada}`);

      // Buscar faltas existentes no banco para ESTA DATA
      const faltasExistentes = await FaltaService.getAll({
        data_inicio: dataSelecionada,
        data_fim: dataSelecionada,
      });

      const alunosTurmaIds = new Set(turma.alunos.map((aluno) => aluno.id));
      const faltasExistentesTurma = faltasExistentes.filter((falta) =>
        alunosTurmaIds.has(falta.idAluno)
      );

      console.log(
        `📊 Banco: ${faltasExistentesTurma.length} faltas existentes`
      );

      const operacoes = [];

      if (tipoTurma === "fundamental1") {
        // Fundamental I
        turma.alunos.forEach((aluno) => {
          const faltaNoFrontend = getFaltaAluno(aluno.id);
          const faltaNoBanco = faltasExistentesTurma.find(
            (f) => f.idAluno === aluno.id && f.periodo === null
          );

          console.log(
            `👦 ${
              aluno.nome
            }: Frontend=${faltaNoFrontend}, Banco=${!!faltaNoBanco}`
          );

          if (faltaNoFrontend && !faltaNoBanco) {
            // Criar falta
            operacoes.push({
              tipo: "criar",
              dados: {
                idAluno: aluno.id,
                data: dataSelecionada,
                periodo: null,
              },
            });
          } else if (!faltaNoFrontend && faltaNoBanco) {
            // Remover falta
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
              `👦 ${
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

      console.log(`🔄 Executando ${operacoes.length} operações`);

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

      // Sair do modo edição
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

  const handleGerarRelatorioPDF = (turmaId, turmaNome) => {
    const turma = turmasData.find((t) => t.id === turmaId);
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

    // GERAR HTML COMPLETO (igual aos boletins)
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

    // CRIAR IFRAME INVISÍVEL (igual aos boletins)
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
  };

  // Calcular estatísticas
  const getEstatisticasTurma = (turma) => {
    const totalAlunos = turma.alunos.length;
    const tipoTurma = getTipoTurma(turma.nome);

    if (tipoTurma === "fundamental1") {
      const alunosFaltosos = turma.alunos.filter((aluno) =>
        getFaltaAluno(aluno.id)
      ).length;
      const alunosPresentes = totalAlunos - alunosFaltosos;
      const percentualPresenca =
        totalAlunos > 0
          ? ((alunosPresentes / totalAlunos) * 100).toFixed(1)
          : 0;

      return {
        total: totalAlunos,
        presentes: alunosPresentes,
        faltosos: alunosFaltosos,
        percentual: percentualPresenca,
        tipo: "fundamental1",
      };
    } else {
      let totalFaltas = 0;
      let alunosComFalta = 0;

      turma.alunos.forEach((aluno) => {
        const faltasPorPeriodo = Object.keys(periodos).filter((periodo) =>
          getFaltaAluno(aluno.id, parseInt(periodo))
        ).length;
        if (faltasPorPeriodo > 0) {
          alunosComFalta++;
          totalFaltas += faltasPorPeriodo;
        }
      });

      const alunosPresentes = totalAlunos - alunosComFalta;
      const percentualPresenca =
        totalAlunos > 0
          ? ((alunosPresentes / totalAlunos) * 100).toFixed(1)
          : 0;

      return {
        total: totalAlunos,
        presentes: alunosPresentes,
        faltosos: alunosComFalta,
        totalFaltasPeriodo: totalFaltas,
        percentual: percentualPresenca,
        tipo: "fundamental2",
      };
    }
  };

  // Estados de loading e error
  if (isLoading) {
    return (
      <div className="faltas-container">
        <div className="faltas-loading">
          <Loader size={32} className="faltas-spinner" />
          <p>Carregando turmas e alunos...</p>
        </div>
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="faltas-container">
        <div className="faltas-error">
          <AlertCircle size={32} />
          <p>Erro ao carregar dados das turmas</p>
          <button onClick={refetch} className="faltas-retry-button">
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="faltas-container">
      {/* Seção de Filtros */}
      <div className="faltas-form-section">
        <div className="faltas-section-header">
          <span>Filtros e Configurações</span>
          {carregandoFaltas && (
            <div className="faltas-carregando-faltas">
              <Loader size={16} className="faltas-spinner" />
              <span>Carregando faltas para {dataSelecionada}...</span>
            </div>
          )}
        </div>
        <div className="faltas-form-grid">
          <div className="faltas-form-group faltas-ano-width">
            <label htmlFor="anoLetivo">Ano Letivo</label>
            <select
              id="anoLetivo"
              className="faltas-select"
              value={anoLetivo}
              onChange={(e) => setAnoLetivo(e.target.value)}
            >
              <option value="2025">2025</option>
            </select>
          </div>

          <div className="faltas-form-group faltas-data-width">
            <label htmlFor="dataAula">Data da Aula</label>
            <div className="faltas-data-navigation">
              <button
                className="faltas-nav-button"
                onClick={retrocederData}
                title="Dia anterior"
              >
                <ChevronLeft size={16} />
              </button>

              <input
                id="dataAula"
                type="date"
                className="faltas-input faltas-data-input"
                value={dataSelecionada}
                onChange={(e) => handleDataChange(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
              />

              <button
                className="faltas-nav-button"
                onClick={avancarData}
                disabled={isDataFutura(dataSelecionada)}
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

          <div className="faltas-form-group faltas-busca-width">
            <label htmlFor="filtroBusca">Buscar por turma ou aluno</label>
            <div className="faltas-input-wrapper">
              <Search className="faltas-input-icon" size={18} />
              <input
                id="filtroBusca"
                type="text"
                className="faltas-input faltas-search-input"
                placeholder="Digite para buscar..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="faltas-form-section">
        <div className="faltas-section-header">
          <span>
            Registro de Faltas - {anoLetivo} - {formatarData(dataSelecionada)}
          </span>
          <span className="faltas-counter">
            {turmasFiltradas.length} turma
            {turmasFiltradas.length !== 1 ? "s" : ""} encontrada
            {turmasFiltradas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {turmasFiltradas.length === 0 ? (
          <div className="faltas-empty-state">
            <div className="faltas-empty-icon">
              <Users size={40} />
            </div>
            <h4>Nenhuma turma encontrada</h4>
            <p>
              Tente ajustar os filtros de busca ou verifique se há turmas
              cadastradas.
            </p>
          </div>
        ) : (
          <div className="faltas-turmas-list">
            {turmasFiltradas.map((turma) => {
              const isExpandida = turmasExpandidas.has(turma.id);
              const isEditavel = turmasEditaveis.has(turma.id);
              const isSalvando = salvando[turma.id];
              const stats = getEstatisticasTurma(turma);
              const tipoTurma = getTipoTurma(turma.nome);

              return (
                <div key={turma.id} className="faltas-turma-card">
                  <div className="faltas-turma-info">
                    <div className="faltas-turma-header">
                      <div
                        className="faltas-turma-header-left faltas-clickable"
                        onClick={() => toggleTurma(turma.id)}
                      >
                        {isExpandida ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                        <h3 className="faltas-turma-nome">{turma.nome}</h3>
                        <span
                          className={`faltas-turno ${getTurnoClass(
                            turma.turno
                          )}`}
                        >
                          {turma.turno}
                        </span>
                      </div>

                      <div className="faltas-actions">
                        <button
                          className="faltas-relatorio-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGerarRelatorioPDF(turma.id, turma.nome);
                          }}
                          title={`Gerar relatório de frequência da turma ${turma.nome}`}
                        >
                          <Calendar size={16} />
                          Relatório PDF
                        </button>
                      </div>
                    </div>

                    {/* Lista de Alunos Expandida */}
                    {isExpandida && (
                      <>
                        <div className="faltas-table-container">
                          {/* Fundamental I (1º-5º) - Uma falta por dia */}
                          {tipoTurma === "fundamental1" && (
                            <>
                              <div className="faltas-table-header faltas-globalizada">
                                <span>Nome do Aluno</span>
                                <span>Presente</span>
                                <span>Faltou</span>
                              </div>
                              {turma.alunos.map((aluno) => {
                                const faltou = getFaltaAluno(aluno.id);
                                return (
                                  <div
                                    key={aluno.id}
                                    className="faltas-aluno-row faltas-globalizada"
                                  >
                                    <div className="faltas-aluno-nome">
                                      {aluno.nome}
                                    </div>
                                    <div className="faltas-checkbox-container">
                                      <label className="faltas-checkbox-wrapper">
                                        <input
                                          type="radio"
                                          name={`presenca-${aluno.id}-${dataSelecionada}`}
                                          className="faltas-radio-input"
                                          checked={!faltou}
                                          onChange={() =>
                                            handleFaltaChange(aluno.id, false)
                                          }
                                          disabled={!isEditavel || isSalvando}
                                        />
                                        <span className="faltas-radio-custom faltas-presente"></span>
                                      </label>
                                    </div>
                                    <div className="faltas-checkbox-container">
                                      <label className="faltas-checkbox-wrapper">
                                        <input
                                          type="radio"
                                          name={`presenca-${aluno.id}-${dataSelecionada}`}
                                          className="faltas-radio-input"
                                          checked={faltou}
                                          onChange={() =>
                                            handleFaltaChange(aluno.id, true)
                                          }
                                          disabled={!isEditavel || isSalvando}
                                        />
                                        <span className="faltas-radio-custom faltas-falta"></span>
                                      </label>
                                    </div>
                                  </div>
                                );
                              })}
                            </>
                          )}

                          {/* Fundamental II (6º-9º) - Faltas por período */}
                          {tipoTurma === "fundamental2" && (
                            <>
                              <div className="faltas-table-header faltas-periodos">
                                <span>Nome do Aluno</span>
                                {Object.values(periodos).map(
                                  (periodo, index) => (
                                    <span key={index}>{periodo}</span>
                                  )
                                )}
                              </div>
                              {turma.alunos.map((aluno) => (
                                <div
                                  key={aluno.id}
                                  className="faltas-aluno-row faltas-periodos"
                                >
                                  <div className="faltas-aluno-nome">
                                    {aluno.nome}
                                  </div>
                                  {Object.keys(periodos).map(
                                    (periodoKey, index) => (
                                      <div
                                        key={index}
                                        className="faltas-periodo-container"
                                        data-label={periodos[periodoKey]}
                                      >
                                        <div className="faltas-periodo-opcoes">
                                          <label className="faltas-checkbox-wrapper faltas-mini">
                                            <input
                                              type="radio"
                                              name={`presenca-${aluno.id}-${dataSelecionada}-${periodoKey}`}
                                              className="faltas-radio-input"
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
                                                !isEditavel || isSalvando
                                              }
                                            />
                                            <span className="faltas-radio-custom faltas-presente faltas-mini"></span>
                                          </label>
                                          <label className="faltas-checkbox-wrapper faltas-mini">
                                            <input
                                              type="radio"
                                              name={`presenca-${aluno.id}-${dataSelecionada}-${periodoKey}`}
                                              className="faltas-radio-input"
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
                                                !isEditavel || isSalvando
                                              }
                                            />
                                            <span className="faltas-radio-custom faltas-falta faltas-mini"></span>
                                          </label>
                                        </div>
                                      </div>
                                    )
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                        </div>

                        {/* Botões de Ação da Tabela */}
                        <div className="faltas-table-actions">
                          {!isEditavel ? (
                            <button
                              className="faltas-editar-button"
                              onClick={() => toggleEdicao(turma.id)}
                              title="Editar faltas"
                              disabled={isSalvando}
                            >
                              <Edit3 size={16} />
                              Editar Faltas
                            </button>
                          ) : (
                            <button
                              className="faltas-salvar-button"
                              onClick={() => handleSalvarFaltas(turma.id)}
                              title="Salvar faltas"
                              disabled={isSalvando}
                            >
                              {isSalvando ? (
                                <Loader size={16} className="faltas-spinner" />
                              ) : (
                                <Save size={16} />
                              )}
                              {isSalvando ? "Salvando..." : "Salvar Faltas"}
                            </button>
                          )}
                        </div>
                      </>
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

export default Faltas;
