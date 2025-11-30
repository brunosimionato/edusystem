import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  Search,
  Save,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Edit3,
  Loader,
  RefreshCw,
} from "lucide-react";
import "./notas.css";
import NotaService from "../../Services/NotaService";
import TurmaService from "../../Services/NotaTurmaService";
import AlunoService from "../../Services/AlunoService";
import DisciplinaService from "../../Services/DisciplinaService";
import { gerarBoletim, gerarBoletimLote } from "../../Relatorios/boletins";

const ANO_LETIVO = "2025";
const ANIMATION_DURATION = 800;
const EXPANSION_ANIMATION_DURATION = 300;

const NotasSecretaria = () => {
  const [filtro, setFiltro] = useState("");
  const [turmasExpandidas, setTurmasExpandidas] = useState({});
  const [turmasEditaveis, setTurmasEditaveis] = useState(new Set());
  const [anoLetivo, setAnoLetivo] = useState(ANO_LETIVO);
  const [trimestreSelecionado, setTrimestreSelecionado] = useState("1");
  const [notas, setNotas] = useState({});
  const [errosValidacao, setErrosValidacao] = useState(new Set());
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [isAnimating, setIsAnimating] = useState({});
  const [animandoTrimestre, setAnimandoTrimestre] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState("testing");
  const [connectionError, setConnectionError] = useState("");

  useEffect(() => {
    setAnimandoTrimestre(true);
    const timer = setTimeout(() => {
      setAnimandoTrimestre(false);
    }, ANIMATION_DURATION);

    return () => clearTimeout(timer);
  }, [trimestreSelecionado]);

  const getTipoPorTurma = useCallback((turmaNome) => {
    if (!turmaNome) return "fundamental1";
    const primeiroCaractere = turmaNome.trim().charAt(0);
    return ["6", "7", "8", "9"].includes(primeiroCaractere)
      ? "fundamental2"
      : "fundamental1";
  }, []);

  const getDisciplinasPorTipo = useCallback(
    (tipoTurma) => {
      const disciplinasFiltradas = {};
      Object.keys(disciplinas).forEach((disciplinaId) => {
        if (!(tipoTurma === "fundamental2" && disciplinaId === "2")) {
          disciplinasFiltradas[disciplinaId] = disciplinas[disciplinaId];
        }
      });
      return disciplinasFiltradas;
    },
    [disciplinas]
  );

  const getTurnoClass = useCallback((turno) => {
    const turnoLower = turno?.toLowerCase();
    const turnoClasses = {
      manhã: "cn-turno-manha",
      manha: "cn-turno-manha",
      tarde: "cn-turno-tarde",
      noite: "cn-turno-noite",
      integral: "cn-turno-integral",
    };
    return turnoClasses[turnoLower] || "";
  }, []);

  const handleTrimestreChange = useCallback(
    (novoTrimestre) => {
      if (novoTrimestre === trimestreSelecionado) return;

      setAnimandoTrimestre(true);
      setTimeout(() => {
        setTrimestreSelecionado(novoTrimestre);
      }, 100);
      setTimeout(() => {
        setAnimandoTrimestre(false);
      }, ANIMATION_DURATION);
    },
    [trimestreSelecionado]
  );

  const toggleTurmaExpansao = useCallback(
    (turmaId) => {
      if (isAnimating[turmaId]) return;

      setIsAnimating((prev) => ({ ...prev, [turmaId]: true }));
      setTurmasExpandidas((prev) => ({
        ...prev,
        [turmaId]: !prev[turmaId],
      }));

      setTimeout(() => {
        setIsAnimating((prev) => ({ ...prev, [turmaId]: false }));
      }, EXPANSION_ANIMATION_DURATION);
    },
    [isAnimating]
  );

  const toggleEdicao = useCallback((turmaId) => {
    setTurmasEditaveis((prev) => {
      const novaSet = new Set(prev);
      novaSet.has(turmaId) ? novaSet.delete(turmaId) : novaSet.add(turmaId);
      return novaSet;
    });
  }, []);

  const handleNotaChange = useCallback(
    (alunoId, disciplina, valor) => {
      let valorLimpo = valor.replace(/[^\d.,]/g, "").replace(",", ".");

      if (valorLimpo.length > 3) {
        valorLimpo = valorLimpo.slice(0, 3);
      }

      if (valorLimpo) {
        const numero = parseFloat(valorLimpo);
        if (numero > 100) valorLimpo = "100";
        else if (numero < 0) valorLimpo = "0";
      }

      const chave = `${alunoId}-${trimestreSelecionado}`;
      setNotas((prev) => ({
        ...prev,
        [chave]: {
          ...prev[chave],
          [disciplina]: valorLimpo,
        },
      }));

      const chaveErro = `${alunoId}-${disciplina}`;
      if (valorLimpo && valorLimpo.trim() !== "") {
        setErrosValidacao((prev) => {
          const novosErros = new Set(prev);
          novosErros.delete(chaveErro);
          return novosErros;
        });
      }
    },
    [trimestreSelecionado]
  );

  const getNotaAluno = useCallback(
    (alunoId, disciplina) => {
      const chave = `${alunoId}-${trimestreSelecionado}`;
      return notas[chave]?.[disciplina] || "";
    },
    [notas, trimestreSelecionado]
  );

  const getNotaClass = useCallback((nota) => {
    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || nota === "") return "";
    return notaNum >= 60 ? "cn-nota-aprovado" : "cn-nota-reprovado";
  }, []);

  const temErroValidacao = useCallback(
    (alunoId, disciplina) => {
      return errosValidacao.has(`${alunoId}-${disciplina}`);
    },
    [errosValidacao]
  );

  useEffect(() => {
    testarConexao();
  }, []);

const testarConexao = async () => {
  try {
    setConnectionStatus("testing");
    // Carrega diretamente ou faz um teste simples
    setConnectionStatus("authenticated");
    carregarDadosIniciais();
  } catch (error) {
    console.error("❌ Erro na conexão:", error);
    setConnectionStatus("error");
    setConnectionError(`Erro de rede: ${error.message}`);
  }
};

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      const [turmasData, disciplinasData] = await Promise.all([
        TurmaService.getAll(),
        DisciplinaService.getAll(),
      ]);

      const turmasComTipo = turmasData.map((turma) => ({
        ...turma,
        tipo: getTipoPorTurma(turma.nome),
      }));

      const disciplinasMap = {};
      disciplinasData.forEach((disc) => {
        disciplinasMap[disc.id] = disc.nome;
      });
      setDisciplinas(disciplinasMap);

      const turmasComAlunos = await Promise.allSettled(
        turmasComTipo.map(async (turma) => {
          try {
            const alunos = await AlunoService.getByTurma(turma.id);
            return { ...turma, alunos };
          } catch (error) {
            console.warn(
              `⚠️ Não foi possível carregar alunos da turma ${turma.id}`
            );
            return { ...turma, alunos: [] };
          }
        })
      ).then((results) =>
        results.map((result) =>
          result.status === "fulfilled" ? result.value : { alunos: [] }
        )
      );

      setTurmas(turmasComAlunos);
      carregarNotasExistentes(turmasComAlunos);
    } catch (error) {
      console.error("❌ Erro crítico ao carregar dados:", error);
      setConnectionStatus("error");
      setConnectionError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const carregarNotasExistentes = async (turmasData) => {
    const notasCarregadas = {};
    const promises = [];

    for (const turma of turmasData) {
      for (const aluno of turma.alunos) {
        const promise = NotaService.getByAluno(
          aluno.id,
          parseInt(anoLetivo),
          parseInt(trimestreSelecionado)
        )
          .then((notasAluno) => {
            notasAluno.forEach((nota) => {
              const chave = `${aluno.id}-${trimestreSelecionado}`;
              if (!notasCarregadas[chave]) {
                notasCarregadas[chave] = {};
              }

              const notaFrontend = (nota.nota * 10).toFixed(1);

              if (turma.tipo === "fundamental1" && nota.idDisciplina === 2) {
                notasCarregadas[chave]["globalizada"] = notaFrontend;
              } else if (
                turma.tipo === "fundamental2" &&
                nota.idDisciplina !== 2
              ) {
                notasCarregadas[chave][nota.idDisciplina] = notaFrontend;
              }
            });
          })
          .catch(() => {
            console.log(`Nenhuma nota encontrada para o aluno ${aluno.nome}`);
          });

        promises.push(promise);
      }
    }

    await Promise.allSettled(promises);
    setNotas(notasCarregadas);
  };

  const turmasFiltradas = useMemo(() => {
    if (!filtro.trim()) return turmas;

    const filtroLower = filtro.toLowerCase();
    return turmas
      .filter(
        (turma) =>
          turma.nome.toLowerCase().includes(filtroLower) ||
          turma.alunos.some((aluno) =>
            aluno.nome.toLowerCase().includes(filtroLower)
          )
      )
      .map((turma) => ({
        ...turma,
        alunos: turma.alunos.filter(
          (aluno) =>
            !filtro ||
            turma.nome.toLowerCase().includes(filtroLower) ||
            aluno.nome.toLowerCase().includes(filtroLower)
        ),
      }));
  }, [filtro, turmas]);

  const handleSalvarNotas = async (turmaId) => {
    setSaving((prev) => ({ ...prev, [turmaId]: true }));

    try {
      const turma = turmas.find((t) => t.id === turmaId);
      if (!turma) return;

      const notasExistentes = await NotaService.getByTurma(
        turmaId,
        parseInt(anoLetivo),
        parseInt(trimestreSelecionado)
      );

      const mapaNotasExistentes = {};
      notasExistentes.forEach((nota) => {
        mapaNotasExistentes[`${nota.idAluno}-${nota.idDisciplina}`] = nota;
      });

      const notasParaProcessar = [];

      turma.alunos.forEach((aluno) => {
        const chave = `${aluno.id}-${trimestreSelecionado}`;
        const notasAluno = notas[chave];

        if (!notasAluno) return;

        if (turma.tipo === "fundamental1") {
          processarNotaGlobalizada(
            aluno,
            turmaId,
            notasAluno,
            mapaNotasExistentes,
            notasParaProcessar
          );
        } else {
          processarNotasFundamental2(
            aluno,
            turmaId,
            notasAluno,
            mapaNotasExistentes,
            notasParaProcessar
          );
        }
      });

      if (notasParaProcessar.length === 0) {
        alert("Nenhuma nota para salvar!");
        return;
      }

      const resultados = await Promise.allSettled(
        notasParaProcessar.map((item) =>
          item.operacao === "update"
            ? NotaService.update(item.idNotaExistente, item.dados)
            : NotaService.create(item.dados)
        )
      );

      const sucessos = resultados.filter((r) => r.status === "fulfilled");
      const falhas = resultados.filter((r) => r.status === "rejected");

      if (falhas.length > 0) {
        const mensagensErro = falhas
          .map((falha, index) => {
            const notaComErro = notasParaProcessar[resultados.indexOf(falha)];
            return `• Aluno ID ${notaComErro?.dados.idAluno}, Disciplina ID ${
              notaComErro?.dados.idDisciplina
            } (${notaComErro?.operacao}): ${
              falha.reason?.message || "Erro desconhecido"
            }`;
          })
          .join("\n");

        alert(
          `Atenção!\n\n${sucessos.length} nota(s) processada(s) com sucesso.\n${falhas.length} nota(s) com erro:\n\n${mensagensErro}`
        );
        return;
      }

      setTurmasEditaveis((prev) => {
        const novaSet = new Set(prev);
        novaSet.delete(turmaId);
        return novaSet;
      });

      alert(`Sucesso! ${sucessos.length} nota(s) salva(s)/atualizada(s).`);
      await carregarNotasExistentes([turma]);
    } catch (error) {
      console.error("❌ Erro crítico ao salvar notas:", error);
      alert(`Erro ao salvar notas: ${error.message}`);
    } finally {
      setSaving((prev) => ({ ...prev, [turmaId]: false }));
    }
  };

  const processarNotaGlobalizada = (
    aluno,
    turmaId,
    notasAluno,
    mapaNotasExistentes,
    notasParaProcessar
  ) => {
    if (notasAluno.globalizada?.trim()) {
      const notaValor = parseFloat(notasAluno.globalizada);
      if (isNaN(notaValor) || notaValor < 0 || notaValor > 100) {
        console.error(
          `❌ Nota inválida para ${aluno.nome}: ${notasAluno.globalizada}`
        );
        return;
      }

      const chaveNotaExistente = `${aluno.id}-2`;
      const notaExistente = mapaNotasExistentes[chaveNotaExistente];

      notasParaProcessar.push({
        operacao: notaExistente ? "update" : "create",
        dados: {
          idAluno: aluno.id,
          idDisciplina: 2,
          idTurma: turmaId,
          trimestre: parseInt(trimestreSelecionado),
          nota: Math.round(notaValor),
          anoLetivo: parseInt(anoLetivo),
        },
        idNotaExistente: notaExistente?.id,
      });
    }
  };

  const processarNotasFundamental2 = (
    aluno,
    turmaId,
    notasAluno,
    mapaNotasExistentes,
    notasParaProcessar
  ) => {
    Object.keys(notasAluno).forEach((disciplinaId) => {
      if (disciplinaId === "2" || !notasAluno[disciplinaId]?.trim()) return;

      const notaValor = parseFloat(notasAluno[disciplinaId]);
      const disciplinaIdNum = parseInt(disciplinaId);

      if (isNaN(notaValor) || notaValor < 0 || notaValor > 100) {
        console.error(
          `❌ Nota inválida para ${aluno.nome} em disciplina ${disciplinaId}: ${notasAluno[disciplinaId]}`
        );
        return;
      }

      if (!disciplinas[disciplinaIdNum]) {
        console.error(`❌ Disciplina ${disciplinaIdNum} não existe no sistema`);
        return;
      }

      const chaveNotaExistente = `${aluno.id}-${disciplinaIdNum}`;
      const notaExistente = mapaNotasExistentes[chaveNotaExistente];

      notasParaProcessar.push({
        operacao: notaExistente ? "update" : "create",
        dados: {
          idAluno: aluno.id,
          idDisciplina: disciplinaIdNum,
          idTurma: turmaId,
          trimestre: parseInt(trimestreSelecionado),
          nota: Math.round(notaValor),
          anoLetivo: parseInt(anoLetivo),
        },
        idNotaExistente: notaExistente?.id,
      });
    });
  };

  const verificarNotasCompletas = useCallback(
    (turma) => {
      const notasFaltando = [];

      turma.alunos.forEach((aluno) => {
        if (turma.tipo === "fundamental1") {
          if (!getNotaAluno(aluno.id, "globalizada")?.trim()) {
            notasFaltando.push({
              aluno: aluno.nome,
              disciplina: "Nota Global",
              chave: `${aluno.id}-globalizada`,
            });
          }
        } else if (turma.tipo === "fundamental2") {
          const disciplinasFiltradas = getDisciplinasPorTipo("fundamental2");
          Object.keys(disciplinasFiltradas).forEach((disciplinaId) => {
            if (!getNotaAluno(aluno.id, disciplinaId)?.trim()) {
              notasFaltando.push({
                aluno: aluno.nome,
                disciplina: disciplinasFiltradas[disciplinaId],
                chave: `${aluno.id}-${disciplinaId}`,
              });
            }
          });
        }
      });

      return notasFaltando;
    },
    [getNotaAluno, getDisciplinasPorTipo]
  );

  const handleGerarBoletins = useCallback(
    (turmaId, turmaNome) => {
      const turma = turmas.find((t) => t.id === turmaId);
      const notasFaltando = verificarNotasCompletas(turma);

      if (notasFaltando.length > 0) {
        const novosErros = new Set(errosValidacao);
        notasFaltando.forEach((item) => novosErros.add(item.chave));
        setErrosValidacao(novosErros);

        alert(
          `Não é possível gerar os boletins da turma ${turmaNome}.\nExistem ${notasFaltando.length} nota(s) não preenchida(s).`
        );
        return;
      }

      const novosErros = new Set(errosValidacao);
      turma.alunos.forEach((aluno) => {
        if (turma.tipo === "fundamental1") {
          novosErros.delete(`${aluno.id}-globalizada`);
        } else {
          Object.keys(disciplinas).forEach((discId) =>
            novosErros.delete(`${aluno.id}-${discId}`)
          );
        }
      });
      setErrosValidacao(novosErros);

      const alunosComNotas = turma.alunos.map((aluno) => {
        const chave = `${aluno.id}-${trimestreSelecionado}`;
        return {
          aluno,
          notas:
            turma.tipo === "fundamental1"
              ? { globalizada: notas[chave]?.globalizada || " - " }
              : Object.keys(getDisciplinasPorTipo("fundamental2")).reduce(
                  (acc, discId) => ({
                    ...acc,
                    [discId]: notas[chave]?.[discId] || " - ",
                  }),
                  {}
                ),
        };
      });

      const boletinsHTML = gerarBoletimLote({
        turma,
        alunosComNotas,
        disciplinas,
        anoLetivo,
        trimestre: trimestreSelecionado,
        dataHoraAgora: new Date().toLocaleString("pt-BR"),
        formatarData: (dataString) =>
          dataString ? new Date(dataString).toLocaleDateString("pt-BR") : "-",
      });

      imprimirBoletim(boletinsHTML);
    },
    [
      turmas,
      verificarNotasCompletas,
      errosValidacao,
      disciplinas,
      trimestreSelecionado,
      notas,
      getDisciplinasPorTipo,
      anoLetivo,
    ]
  );

  const imprimirBoletim = (htmlContent) => {
    const oldFrame = document.getElementById("print-boletim-frame");
    if (oldFrame) oldFrame.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "print-boletim-frame";
    iframe.style.cssText =
      "position:fixed;right:0;bottom:0;width:0;height:0;border:0;";
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow || iframe.contentDocument;
    const doc = frameDoc.document || frameDoc;

    doc.open();
    doc.write(htmlContent);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        frameDoc.focus();
        frameDoc.print();
      }, 200);
    };
  };

  if (loading) {
    return (
      <div className="cn-container">
        <div className="cn-loading-state">
          <Loader size={48} className="cn-spinner" />
          <h4>Carregando dados...</h4>
          <p>Aguarde enquanto buscamos as turmas e alunos.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cn-container">
      {/* Seção de Filtros */}
      <div className="cn-section">
        <div className="cn-section-header">
          <span>Filtros e Configurações</span>
        </div>
        <div className="cn-form-grid">
          <div className="cn-form-group cn-third-width">
            <label>Ano Letivo</label>
            <select
              className="cn-select"
              value={anoLetivo}
              onChange={(e) => setAnoLetivo(e.target.value)}
            >
              <option value={ANO_LETIVO}>{ANO_LETIVO}</option>
            </select>
          </div>
          <div className="cn-form-group cn-third-width">
            <label>Trimestre</label>
            <select
              className="cn-select"
              value={trimestreSelecionado}
              onChange={(e) => handleTrimestreChange(e.target.value)}
              disabled={animandoTrimestre}
            >
              <option value="1">1º Trimestre</option>
              <option value="2">2º Trimestre</option>
              <option value="3">3º Trimestre</option>
            </select>
          </div>
          <div className="cn-form-group cn-third-width">
            <label>Buscar por turma ou aluno</label>
            <div className="cn-input-wrapper">
              <Search className="cn-input-icon" size={18} />
              <input
                type="text"
                className="cn-input cn-search-input"
                placeholder="Digite para buscar..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="cn-section">
        <div
          className={`cn-section-header ${
            animandoTrimestre ? "cn-trimestre-change" : ""
          }`}
        >
          <span>
            Lançamento de Notas - {anoLetivo} - {trimestreSelecionado}º
            Trimestre
          </span>
          <span className="cn-turmas-count">
            {turmasFiltradas.length} turma
            {turmasFiltradas.length !== 1 ? "s" : ""} encontrada
            {turmasFiltradas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {turmasFiltradas.length === 0 ? (
          <div
            className={`cn-empty-state ${
              animandoTrimestre ? "cn-trimestre-change" : ""
            }`}
          >
            <div className="cn-empty-icon">
              <BookOpen size={40} />
            </div>
            <h4>Nenhuma turma encontrada</h4>
            <p>
              {turmas.length === 0
                ? "Não há turmas cadastradas no momento."
                : "Tente ajustar os filtros de busca."}
            </p>
            <button
              className="cn-refresh-button"
              onClick={carregarDadosIniciais}
            >
              <RefreshCw size={16} />
              Tentar novamente
            </button>
          </div>
        ) : (
          <div
            className={`cn-turmas-list ${
              animandoTrimestre ? "cn-trimestre-change" : ""
            }`}
          >
            {turmasFiltradas.map((turma, index) => (
              <TurmaCard
                key={turma.id}
                turma={turma}
                index={index}
                animandoTrimestre={animandoTrimestre}
                isAnimating={isAnimating}
                isExpandida={turmasExpandidas[turma.id]}
                isEditavel={turmasEditaveis.has(turma.id)}
                isSaving={saving[turma.id]}
                disciplinasFiltradas={getDisciplinasPorTipo(turma.tipo)}
                onToggleExpansao={toggleTurmaExpansao}
                onToggleEdicao={toggleEdicao}
                onSalvarNotas={handleSalvarNotas}
                onGerarBoletins={handleGerarBoletins}
                getNotaAluno={getNotaAluno}
                getNotaClass={getNotaClass}
                handleNotaChange={handleNotaChange}
                temErroValidacao={temErroValidacao}
                getTurnoClass={getTurnoClass}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


const TurmaCard = React.memo(
  ({
    turma,
    index,
    animandoTrimestre,
    isAnimating,
    isExpandida,
    isEditavel,
    isSaving,
    disciplinasFiltradas,
    onToggleExpansao,
    onToggleEdicao,
    onSalvarNotas,
    onGerarBoletins,
    getNotaAluno,
    getNotaClass,
    handleNotaChange,
    temErroValidacao,
    getTurnoClass,
  }) => {
    return (
      <div
        className={`cn-turma-card ${
          isAnimating[turma.id] ? "cn-animating" : ""
        }`}
        style={
          animandoTrimestre ? { animationDelay: `${0.05 + index * 0.05}s` } : {}
        }
      >
        <div className="cn-turma-info">
          <div className="cn-turma-header-wrapper">
            <div
              className="cn-turma-header cn-clickable"
              onClick={() => onToggleExpansao(turma.id)}
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
              <h3 className="cn-turma-nome">{turma.nome}</h3>
              <span className={`cn-turma-turno ${getTurnoClass(turma.turno)}`}>
                {turma.turno}
              </span>
            </div>
          </div>

          <div className="cn-turma-details">
            <div className="cn-alunos-count">
              {turma.alunos.length} aluno{turma.alunos.length !== 1 ? "s" : ""}
            </div>
          </div>

          <div
            className={`cn-alunos-container ${
              isExpandida ? "cn-expanded" : "cn-collapsed"
            }`}
          >
            {turma.alunos && turma.alunos.length > 0 ? (
              <div className="cn-turma-content">
                <div className="cn-table-container">
                  {turma.tipo === "fundamental1" ? (
                    <NotasGlobalizadas
                      alunos={turma.alunos}
                      isEditavel={isEditavel}
                      isSaving={isSaving}
                      getNotaAluno={getNotaAluno}
                      getNotaClass={getNotaClass}
                      handleNotaChange={handleNotaChange}
                      temErroValidacao={temErroValidacao}
                    />
                  ) : (
                    <NotasPorDisciplina
                      alunos={turma.alunos}
                      disciplinasFiltradas={disciplinasFiltradas}
                      isEditavel={isEditavel}
                      isSaving={isSaving}
                      getNotaAluno={getNotaAluno}
                      getNotaClass={getNotaClass}
                      handleNotaChange={handleNotaChange}
                      temErroValidacao={temErroValidacao}
                    />
                  )}
                </div>

                <div className="cn-turma-actions">
                  <button
                    className="cn-boletins-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onGerarBoletins(turma.id, turma.nome);
                    }}
                    title={`Gerar boletins da turma ${turma.nome}`}
                  >
                    <BookOpen size={16} />
                    Gerar Boletins
                  </button>

                  {!isEditavel ? (
                    <button
                      className="cn-editar-button"
                      onClick={() => onToggleEdicao(turma.id)}
                      title="Editar notas"
                      disabled={isSaving}
                    >
                      <Edit3 size={16} />
                      Editar Notas
                    </button>
                  ) : (
                    <button
                      className="cn-salvar-button"
                      onClick={() => onSalvarNotas(turma.id)}
                      title="Salvar notas"
                      disabled={isSaving}
                    >
                      {isSaving ? (
                        <Loader size={16} className="cn-spinner" />
                      ) : (
                        <Save size={16} />
                      )}
                      {isSaving ? "Salvando..." : "Salvar Notas"}
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="cn-empty-alunos-message">
                <p>Nenhum aluno matriculado nesta turma.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

// Componente para notas globalizadas
const NotasGlobalizadas = React.memo(
  ({
    alunos,
    isEditavel,
    isSaving,
    getNotaAluno,
    getNotaClass,
    handleNotaChange,
    temErroValidacao,
  }) => {
    return (
      <>
        <div className="cn-table-header cn-globalizada">
          <span>Nome do Aluno</span>
          <span>Nota Global</span>
        </div>
        <div className="cn-alunos-list">
          {alunos.map((aluno) => (
            <div key={aluno.id} className="cn-aluno-row cn-globalizada">
              <div className="cn-aluno-nome">{aluno.nome}</div>
              <div className="cn-nota-input-global">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]{0,2}[,.]?[0-9]{0,1}"
                  maxLength="3"
                  className={`cn-input-nota ${getNotaClass(
                    getNotaAluno(aluno.id, "globalizada")
                  )} ${
                    temErroValidacao(aluno.id, "globalizada") ? "cn-error" : ""
                  }`}
                  placeholder="00,0"
                  value={getNotaAluno(aluno.id, "globalizada")}
                  onChange={(e) =>
                    handleNotaChange(aluno.id, "globalizada", e.target.value)
                  }
                  onKeyPress={(e) =>
                    !/[\d,.]/.test(e.key) && e.preventDefault()
                  }
                  disabled={!isEditavel || isSaving}
                />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }
);

// Componente para notas por disciplina
const NotasPorDisciplina = React.memo(
  ({
    alunos,
    disciplinasFiltradas,
    isEditavel,
    isSaving,
    getNotaAluno,
    getNotaClass,
    handleNotaChange,
    temErroValidacao,
  }) => {
    return (
      <>
        <div className="cn-table-header cn-disciplinas">
          <span>Nome do Aluno</span>
          {Object.values(disciplinasFiltradas).map((discNome, index) => (
            <span key={index}>{discNome}</span>
          ))}
        </div>
        <div className="cn-alunos-list">
          {alunos.map((aluno) => (
            <div key={aluno.id} className="cn-aluno-row cn-disciplinas">
              <div className="cn-aluno-nome">{aluno.nome}</div>
              {Object.keys(disciplinasFiltradas).map((discId, index) => (
                <div
                  key={index}
                  className="cn-nota-input"
                  data-label={disciplinasFiltradas[discId]}
                >
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]{0,2}[,.]?[0-9]{0,1}"
                    maxLength="3"
                    className={`cn-input-nota ${getNotaClass(
                      getNotaAluno(aluno.id, discId)
                    )} ${temErroValidacao(aluno.id, discId) ? "cn-error" : ""}`}
                    placeholder="00,0"
                    value={getNotaAluno(aluno.id, discId)}
                    onChange={(e) =>
                      handleNotaChange(aluno.id, discId, e.target.value)
                    }
                    onKeyPress={(e) =>
                      !/[\d,.]/.test(e.key) && e.preventDefault()
                    }
                    disabled={!isEditavel || isSaving}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      </>
    );
  }
);

export default NotasSecretaria;