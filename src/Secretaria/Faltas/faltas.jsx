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
} from "lucide-react";
import "./faltas.css";
import { useTurmasComAlunosFaltas } from "../../hooks/useTurmasComAlunosFaltas";
import FaltaService from "../../Services/FaltaService";

const Faltas = () => {
  const [filtro, setFiltro] = useState("");
  const [turmasExpandidas, setTurmasExpandidas] = useState(new Set());
  const [turmasEditaveis, setTurmasEditaveis] = useState(new Set());
  const [anoLetivo, setAnoLetivo] = useState("2024");
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [faltas, setFaltas] = useState({});
  const [errosValidacao, setErrosValidacao] = useState(new Set());
  const [salvando, setSalvando] = useState({});

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

  // Carregar faltas existentes quando a data mudar
  useEffect(() => {
    if (dataSelecionada) {
      carregarFaltasExistentes();
    }
  }, [dataSelecionada, turmasData]);

  const carregarFaltasExistentes = async () => {
    console.log("🔄 Carregando faltas existentes para:", dataSelecionada);

    const faltasCarregadas = {};

    try {
      // Para cada turma, carrega as faltas da data selecionada
      for (const turma of turmasData) {
        try {
          const faltasTurma = await FaltaService.getByTurma(
            turma.id,
            dataSelecionada
          );
          console.log(
            `✅ Faltas da turma ${turma.id} em ${dataSelecionada}:`,
            faltasTurma
          );

          // Processa as faltas carregadas
          faltasTurma.forEach((falta) => {
            if (turma.tipo === "fundamental1") {
              // Fundamental I - falta por dia
              const chave = `${falta.idAluno}-${dataSelecionada}`;
              faltasCarregadas[chave] = true;
            } else {
              // Fundamental II - falta por período
              const chave = `${falta.idAluno}-${dataSelecionada}-${falta.periodo}`;
              faltasCarregadas[chave] = true;
            }
          });
        } catch (error) {
          console.warn(
            `⚠️  Não foi possível carregar faltas da turma ${turma.id}:`,
            error
          );
        }
      }

      setFaltas(faltasCarregadas);
      console.log("✅ Faltas carregadas:", faltasCarregadas);
    } catch (error) {
      console.error("❌ Erro ao carregar faltas:", error);
    }
  };

  // Filtrar turmas baseado no termo de busca
  const turmasFiltradas = useMemo(() => {
    if (!filtro) return turmasData;
    return turmasData
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
        // Quando fecha a turma, também remove do modo edição
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
    const classes = {
      manhã: "faltas-turno-manhã",
      tarde: "faltas-turno-tarde",
    };
    return classes[turno] || "";
  };

  const handleFaltaChange = (alunoId, faltou, periodo = null) => {
    let chave;
    if (periodo) {
      // Para Fundamental II - falta por período
      chave = `${alunoId}-${dataSelecionada}-${periodo}`;
    } else {
      // Para Fundamental I - falta por dia
      chave = `${alunoId}-${dataSelecionada}`;
    }

    setFaltas((prev) => ({
      ...prev,
      [chave]: faltou,
    }));
  };

  const getFaltaAluno = (alunoId, periodo = null) => {
    let chave;
    if (periodo) {
      // Para Fundamental II - falta por período
      chave = `${alunoId}-${dataSelecionada}-${periodo}`;
    } else {
      // Para Fundamental I - falta por dia
      chave = `${alunoId}-${dataSelecionada}`;
    }
    return faltas[chave] || false;
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
      const faltasParaSalvar = [];

      console.log(
        `💾 Salvando faltas da turma ${turmaId} para ${dataSelecionada}`
      );

      // Coletar todas as faltas da turma para salvar
      turma.alunos.forEach((aluno) => {
        if (turma.tipo === "fundamental1") {
          // Fundamental I - falta por dia
          const faltou = getFaltaAluno(aluno.id);
          if (faltou) {
            faltasParaSalvar.push({
              idAluno: aluno.id,
              idTurma: turmaId,
              data: dataSelecionada,
              periodo: null,
              justificada: false,
              observacao: "Falta registrada no sistema",
            });
          }
        } else {
          // Fundamental II - faltas por período
          Object.keys(periodos).forEach((periodo) => {
            const faltou = getFaltaAluno(aluno.id, periodo);
            if (faltou) {
              faltasParaSalvar.push({
                idAluno: aluno.id,
                idTurma: turmaId,
                data: dataSelecionada,
                periodo: parseInt(periodo),
                justificada: false,
                observacao: `Falta no ${periodos[periodo]}`,
              });
            }
          });
        }
      });

      console.log("📤 Faltas para salvar:", faltasParaSalvar);

      // Salvar cada falta
      if (faltasParaSalvar.length > 0) {
        await FaltaService.createMultiple(faltasParaSalvar);
        console.log(`✅ ${faltasParaSalvar.length} faltas salvas com sucesso`);
      }

      // Remove do modo edição após salvar
      setTurmasEditaveis((prev) => {
        const novaSet = new Set(prev);
        novaSet.delete(turmaId);
        return novaSet;
      });

      alert(
        `Faltas salvas com sucesso! ${faltasParaSalvar.length} falta(s) registrada(s).`
      );
    } catch (error) {
      console.error("❌ Erro ao salvar faltas:", error);
      alert(`Erro ao salvar faltas: ${error.message}`);
    } finally {
      setSalvando((prev) => ({ ...prev, [turmaId]: false }));
    }
  };

  const handleGerarRelatorio = (turmaId, turmaNome) => {
    const turma = turmasData.find((t) => t.id === turmaId);

    let alunosComFalta = [];
    let alunosPresentes = [];
    let totalFaltas = 0;
    let detalheFaltas = {};

    if (turma.tipo === "fundamental1") {
      // Fundamental I - uma falta por dia
      alunosComFalta = turma.alunos.filter((aluno) => getFaltaAluno(aluno.id));
      alunosPresentes = turma.alunos.filter(
        (aluno) => !getFaltaAluno(aluno.id)
      );
      totalFaltas = alunosComFalta.length;
    } else {
      // Fundamental II - faltas por período
      turma.alunos.forEach((aluno) => {
        const faltasPorPeriodo = Object.keys(periodos).filter((periodo) =>
          getFaltaAluno(aluno.id, periodo)
        );
        if (faltasPorPeriodo.length > 0) {
          detalheFaltas[aluno.nome] = faltasPorPeriodo.map((p) => periodos[p]);
          totalFaltas += faltasPorPeriodo.length;
        }
      });

      alunosComFalta = Object.keys(detalheFaltas);
      alunosPresentes = turma.alunos.filter(
        (aluno) => !detalheFaltas[aluno.nome]
      );
    }

    console.log("Gerando relatório de faltas da turma:", turmaId, turmaNome);
    console.log("Data:", dataSelecionada);
    console.log("Alunos faltosos:", alunosComFalta);
    console.log(
      "Alunos presentes:",
      alunosPresentes.map((a) => a.nome)
    );

    let mensagem =
      `Relatório de Frequência - ${turmaNome}\n\n` +
      `Data: ${formatarData(dataSelecionada)}\n\n` +
      `Total de alunos: ${turma.alunos.length}\n`;

    if (turma.tipo === "fundamental1") {
      mensagem +=
        `Presentes: ${alunosPresentes.length}\n` +
        `Faltas: ${alunosComFalta.length}\n\n` +
        (alunosComFalta.length > 0
          ? `Alunos faltosos:\n${alunosComFalta
              .map((a) => `• ${a.nome}`)
              .join("\n")}`
          : "Todos os alunos presentes!");
    } else {
      mensagem +=
        `Alunos totalmente presentes: ${alunosPresentes.length}\n` +
        `Total de faltas por período: ${totalFaltas}\n` +
        `Alunos com faltas: ${alunosComFalta.length}\n\n`;

      if (alunosComFalta.length > 0) {
        mensagem += `Detalhes das faltas:\n`;
        Object.keys(detalheFaltas).forEach((aluno) => {
          mensagem += `• ${aluno}: ${detalheFaltas[aluno].join(", ")}\n`;
        });
      } else {
        mensagem += "Todos os alunos presentes em todos os períodos!";
      }
    }

    alert(mensagem);
  };

  // Calcular estatísticas de presença para uma turma
  const getEstatisticasTurma = (turma) => {
    const totalAlunos = turma.alunos.length;

    if (turma.tipo === "fundamental1") {
      // Fundamental I - uma falta por dia
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
        tipo: "dia",
      };
    } else {
      // Fundamental II - faltas por período
      let totalFaltas = 0;
      let alunosComFalta = 0;

      turma.alunos.forEach((aluno) => {
        const faltasPorPeriodo = Object.keys(periodos).filter((periodo) =>
          getFaltaAluno(aluno.id, periodo)
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
        tipo: "periodo",
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
        </div>
        <div className="faltas-form-grid">
          <div className="faltas-form-group faltas-third-width">
            <label htmlFor="anoLetivo">Ano Letivo</label>
            <select
              id="anoLetivo"
              className="faltas-select"
              value={anoLetivo}
              onChange={(e) => setAnoLetivo(e.target.value)}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>

          <div className="faltas-form-group faltas-third-width">
            <label htmlFor="dataAula">Data da Aula</label>
            <input
              id="dataAula"
              type="date"
              className="faltas-input"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
            />
          </div>

          <div className="faltas-form-group faltas-third-width">
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
                        <span className="faltas-stats">
                          {stats.presentes}/{stats.total} presentes (
                          {stats.percentual}%)
                        </span>
                      </div>

                      {/* Botão para gerar relatório apenas desta turma */}
                      <div className="faltas-actions">
                        <button
                          className="faltas-relatorio-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGerarRelatorio(turma.id, turma.nome);
                          }}
                          title={`Gerar relatório de frequência da turma ${turma.nome}`}
                        >
                          <Calendar size={16} />
                          Relatório
                        </button>
                      </div>
                    </div>

                    {/* Lista de Alunos Expandida */}
                    {isExpandida && (
                      <>
                        <div className="faltas-table-container">
                          {/* Fundamental I - Uma falta por dia */}
                          {turma.tipo === "fundamental1" && (
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
                                          name={`presenca-${aluno.id}`}
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
                                          name={`presenca-${aluno.id}`}
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

                          {/* Fundamental II - Faltas por período */}
                          {turma.tipo === "fundamental2" && (
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
                                              name={`presenca-${aluno.id}-${periodoKey}`}
                                              className="faltas-radio-input"
                                              checked={
                                                !getFaltaAluno(
                                                  aluno.id,
                                                  periodoKey
                                                )
                                              }
                                              onChange={() =>
                                                handleFaltaChange(
                                                  aluno.id,
                                                  false,
                                                  periodoKey
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
                                              name={`presenca-${aluno.id}-${periodoKey}`}
                                              className="faltas-radio-input"
                                              checked={getFaltaAluno(
                                                aluno.id,
                                                periodoKey
                                              )}
                                              onChange={() =>
                                                handleFaltaChange(
                                                  aluno.id,
                                                  true,
                                                  periodoKey
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
