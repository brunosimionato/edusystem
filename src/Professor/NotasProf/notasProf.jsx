import React, { useState, useMemo, useEffect } from "react";
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
import "./notasProf.css";
import NotaService from "../../Services/NotaService";
import DisciplinaService from "../../Services/DisciplinaService";
import { useTurmasProfessor } from "../../hooks/useTurmasProfessor";

const NotasProfe = () => {
  const [filtro, setFiltro] = useState("");
  const [turmasExpandidas, setTurmasExpandidas] = useState({});
  const [turmasEditaveis, setTurmasEditaveis] = useState(new Set());
  const [anoLetivo, setAnoLetivo] = useState("2025");
  const [trimestreSelecionado, setTrimestreSelecionado] = useState("1");
  const [notas, setNotas] = useState({});
  const [errosValidacao, setErrosValidacao] = useState(new Set());
  const [disciplinas, setDisciplinas] = useState({});
  const [saving, setSaving] = useState({});
  const [isAnimating, setIsAnimating] = useState({});
  const [animandoTrimestre, setAnimandoTrimestre] = useState(false);

  const { turmas, isLoading, refetch, professor } = useTurmasProfessor();

  useEffect(() => {
    setAnimandoTrimestre(true);
    const timer = setTimeout(() => {
      setAnimandoTrimestre(false);
    }, 600);

    return () => clearTimeout(timer);
  }, [trimestreSelecionado]);

  const ordenarTurmas = (turmasArray) => {
    return turmasArray.sort((a, b) => {
      const numA = parseInt(a.nome.match(/\d+/)?.[0]) || 0;
      const numB = parseInt(b.nome.match(/\d+/)?.[0]) || 0;

      if (numA !== 0 && numB !== 0) {
        if (numA !== numB) {
          return numA - numB;
        }
        return a.nome.localeCompare(b.nome, "pt-BR");
      }

      return a.nome.localeCompare(b.nome, "pt-BR", { numeric: true });
    });
  };

  const getTipoPorTurma = (turmaNome) => {
    if (!turmaNome) return "fundamental1";

    const primeiroCaractere = turmaNome.trim().charAt(0);

    if (["6", "7", "8", "9"].includes(primeiroCaractere)) {
      return "fundamental2";
    } else if (["1", "2", "3", "4", "5"].includes(primeiroCaractere)) {
      return "fundamental1";
    }

    console.log(
      "⚠️  Primeiro caractere não identificado, usando padrão Fundamental I"
    );
    return "fundamental1";
  };

  const getDisciplinasPorTipo = (tipoTurma) => {
    const disciplinasFiltradas = {};

    Object.keys(disciplinas).forEach((disciplinaId) => {
      if (tipoTurma === "fundamental2" && disciplinaId === "2") {
        return;
      }
      disciplinasFiltradas[disciplinaId] = disciplinas[disciplinaId];
    });

    return disciplinasFiltradas;
  };

  React.useEffect(() => {
    const carregarDisciplinas = async () => {
      try {
        const disciplinasData = await DisciplinaService.getAll();
        const disciplinasMap = {};
        disciplinasData.forEach((disc) => {
          disciplinasMap[disc.id] = disc.nome;
        });
        setDisciplinas(disciplinasMap);
      } catch (error) {
        console.error("Erro ao carregar disciplinas:", error);
      }
    };

    carregarDisciplinas();
  }, []);

  React.useEffect(() => {
    if (turmas.length > 0) {
      carregarNotasExistentes(turmas);
    }
  }, [turmas, anoLetivo, trimestreSelecionado]);

  const carregarNotasExistentes = async (turmasData) => {
    const notasCarregadas = {};
    const promises = [];

    for (const turma of turmasData) {
      const tipo = getTipoPorTurma(turma.nome);

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

              if (tipo === "fundamental1") {
                if (nota.idDisciplina === 2) {
                  notasCarregadas[chave]["globalizada"] = notaFrontend;
                }
              } else {
                if (nota.idDisciplina !== 2) {
                  const disciplinaKey = nota.idDisciplina;
                  notasCarregadas[chave][disciplinaKey] = notaFrontend;
                }
              }
            });
          })
          .catch((error) => {
            console.log(`Nenhuma nota encontrada para o aluno ${aluno.nome}`);
          });

        promises.push(promise);
      }
    }

    await Promise.allSettled(promises);
    setNotas(notasCarregadas);
  };

  const turmasFiltradas = useMemo(() => {
    if (!filtro) return ordenarTurmas(turmas);

    const filtradas = turmas
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
        tipo: getTipoPorTurma(turma.nome),
        alunos: turma.alunos.filter(
          (aluno) =>
            !filtro ||
            turma.nome.toLowerCase().includes(filtro.toLowerCase()) ||
            aluno.nome.toLowerCase().includes(filtro.toLowerCase())
        ),
      }));

    return ordenarTurmas(filtradas);
  }, [filtro, turmas]);

  const toggleTurmaExpansao = (turmaId) => {
    if (isAnimating[turmaId]) return;

    setIsAnimating((prev) => ({ ...prev, [turmaId]: true }));
    setTurmasExpandidas((prev) => ({
      ...prev,
      [turmaId]: !prev[turmaId],
    }));

    setTimeout(() => {
      setIsAnimating((prev) => ({ ...prev, [turmaId]: false }));
    }, 300);
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
    const turnoLower = turno?.toLowerCase();
    if (turnoLower === "manhã" || turnoLower === "manha")
      return "nt-turno-manha";
    if (turnoLower === "tarde") return "nt-turno-tarde";
    if (turnoLower === "noite") return "nt-turno-noite";
    if (turnoLower === "integral") return "nt-turno-integral";
    return "";
  };

  const handleNotaChange = (alunoId, disciplina, valor) => {
    let valorLimpo = valor.replace(/[^\d.,]/g, "");
    valorLimpo = valorLimpo.replace(",", ".");

    if (valorLimpo.length > 3) {
      valorLimpo = valorLimpo.slice(0, 3);
    }

    if (valorLimpo !== "") {
      const numero = parseFloat(valorLimpo);
      if (numero > 100) {
        valorLimpo = "100";
      } else if (numero < 0) {
        valorLimpo = "0";
      }
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
  };

  const getNotaAluno = (alunoId, disciplina) => {
    const chave = `${alunoId}-${trimestreSelecionado}`;
    return notas[chave]?.[disciplina] || "";
  };

  const getNotaClass = (nota) => {
    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || nota === "") return "";
    return notaNum >= 60 ? "nt-nota-aprovado" : "nt-nota-reprovado";
  };

  const handleSalvarNotas = async (turmaId) => {
    setSaving((prev) => ({ ...prev, [turmaId]: true }));

    try {
      const turma = turmas.find((t) => t.id === turmaId);
      if (!turma) {
        alert("Turma não encontrada!");
        return;
      }

      const notasParaProcessar = [];
      const tipo = getTipoPorTurma(turma.nome);

      const notasExistentes = await NotaService.getByTurma(
        turmaId,
        parseInt(anoLetivo),
        parseInt(trimestreSelecionado)
      );

      const mapaNotasExistentes = {};
      notasExistentes.forEach((nota) => {
        const chave = `${nota.idAluno}-${nota.idDisciplina}`;
        mapaNotasExistentes[chave] = nota;
      });

      turma.alunos.forEach((aluno) => {
        const chave = `${aluno.id}-${trimestreSelecionado}`;
        const notasAluno = notas[chave];

        if (notasAluno) {
          if (tipo === "fundamental1") {
            if (
              notasAluno.globalizada &&
              notasAluno.globalizada.trim() !== ""
            ) {
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
          } else {
            Object.keys(notasAluno).forEach((disciplinaId) => {
              if (disciplinaId === "2") return;

              if (
                notasAluno[disciplinaId] &&
                notasAluno[disciplinaId].trim() !== ""
              ) {
                const notaValor = parseFloat(notasAluno[disciplinaId]);
                const disciplinaIdNum = parseInt(disciplinaId);

                if (isNaN(notaValor) || notaValor < 0 || notaValor > 100) {
                  console.error(
                    `❌ Nota inválida para ${aluno.nome} em disciplina ${disciplinaId}: ${notasAluno[disciplinaId]}`
                  );
                  return;
                }

                if (!disciplinas[disciplinaIdNum]) {
                  console.error(
                    `❌ Disciplina ${disciplinaIdNum} não existe no sistema`
                  );
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
              }
            });
          }
        }
      });

      if (notasParaProcessar.length === 0) {
        alert("Nenhuma nota para salvar!");
        return;
      }

      const resultados = await Promise.allSettled(
        notasParaProcessar.map((item) => {
          if (item.operacao === "update") {
            return NotaService.update(item.idNotaExistente, item.dados);
          } else {
            return NotaService.create(item.dados);
          }
        })
      );

      const sucessos = resultados.filter((r) => r.status === "fulfilled");
      const falhas = resultados.filter((r) => r.status === "rejected");

      if (falhas.length > 0) {
        const mensagensErro = falhas
          .map((falha) => {
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

      alert(`${sucessos.length} nota(s) salva(s).`);

      await carregarNotasExistentes([turma]);
    } catch (error) {
      console.error("❌ Erro crítico ao salvar notas:", error);
      alert(`Erro ao salvar notas: ${error.message}`);
    } finally {
      setSaving((prev) => ({ ...prev, [turmaId]: false }));
    }
  };

  const temErroValidacao = (alunoId, disciplina) => {
    return errosValidacao.has(`${alunoId}-${disciplina}`);
  };

  if (isLoading) {
    return (
      <div className="nt-container">
        <div className="nt-loading-state">
          <Loader size={48} className="nt-spinner" />
          <h4>Carregando turmas...</h4>
          <p>Aguarde enquanto buscamos as turmas do professor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nt-container">
      {/* Seção de Filtros */}
      <div className="nt-section">
        <div className="nt-section-header">
          <span>Filtros e Configurações</span>
        </div>
        <div className="nt-form-grid">
          <div className="nt-form-group nt-third-width">
            <label>Ano Letivo</label>
            <select
              className="nt-select"
              value={anoLetivo}
              onChange={(e) => setAnoLetivo(e.target.value)}
            >
              <option value="2025">2025</option>
            </select>
          </div>
          <div className="nt-form-group nt-third-width">
            <label>Trimestre</label>
            <select
              className="nt-select"
              value={trimestreSelecionado}
              onChange={(e) => setTrimestreSelecionado(e.target.value)}
            >
              <option value="1">1º Trimestre</option>
              <option value="2">2º Trimestre</option>
              <option value="3">3º Trimestre</option>
            </select>
          </div>
          <div className="nt-form-group nt-third-width">
            <label>Buscar por turma ou aluno</label>
            <div className="nt-input-wrapper">
              <Search className="nt-input-icon" size={18} />
              <input
                type="text"
                className="nt-input nt-search-input"
                placeholder="Digite para buscar..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="nt-section">
        <div
          className={`nt-section-header ${
            animandoTrimestre ? "nt-smooth-fade" : ""
          }`}
        >
          <span>
            Lançamento de Notas - {anoLetivo} - {trimestreSelecionado}º
            Trimestre
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
          <div
            className={`nt-empty-state ${
              animandoTrimestre ? "nt-smooth-fade" : ""
            }`}
          >
            <div className="nt-empty-icon">
              <BookOpen size={40} />
            </div>
            <h4>Nenhuma turma encontrada</h4>
            <p>
              {turmas.length === 0
                ? "Você não está vinculado a nenhuma turma no momento."
                : "Tente ajustar os filtros de busca."}
            </p>
            <button className="nt-refresh-button" onClick={refetch}>
              <RefreshCw size={16} />
              Tentar novamente
            </button>
          </div>
        ) : (
          <div
            className={`nt-turmas-list ${
              animandoTrimestre ? "nt-smooth-fade" : ""
            }`}
          >
            {turmasFiltradas.map((turma) => {
              const isExpandida = turmasExpandidas[turma.id];
              const isEditavel = turmasEditaveis.has(turma.id);
              const isSaving = saving[turma.id];
              const tipo = getTipoPorTurma(turma.nome);
              const disciplinasFiltradas = getDisciplinasPorTipo(tipo);

              return (
                <div
                  key={turma.id}
                  className={`nt-turma-card ${
                    isAnimating[turma.id] ? "nt-animating" : ""
                  } ${animandoTrimestre ? "nt-smooth-fade" : ""}`}
                >
                  <div className="nt-turma-info">
                    <div className="nt-turma-header-wrapper">
                      <div
                        className="nt-turma-header nt-clickable"
                        onClick={() => toggleTurmaExpansao(turma.id)}
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
                        <h3 className="nt-turma-nome">{turma.nome}</h3>
                        <span
                          className={`nt-turma-turno ${getTurnoClass(
                            turma.turno
                          )}`}
                        >
                          {turma.turno}
                        </span>
                      </div>
                    </div>

                    <div className="nt-turma-details">
                      <div className="nt-alunos-count">
                        {turma.alunos.length} aluno
                        {turma.alunos.length !== 1 ? "s" : ""}
                      </div>
                    </div>

                    <div
                      className={`nt-alunos-container ${
                        isExpandida ? "nt-expanded" : "nt-collapsed"
                      }`}
                    >
                      {turma.alunos && turma.alunos.length > 0 ? (
                        <div className="nt-turma-content">
                          <div className="nt-table-container">
                            {tipo === "fundamental1" && (
                              <>
                                <div className="nt-table-header nt-globalizada">
                                  <span>Nome do Aluno</span>
                                  <span>Nota Global</span>
                                </div>
                                <div className="nt-alunos-list">
                                  {turma.alunos.map((aluno) => (
                                    <div
                                      key={aluno.id}
                                      className="nt-aluno-row nt-globalizada"
                                    >
                                      <div className="nt-aluno-nome">
                                        {aluno.nome}
                                      </div>
                                      <div className="nt-nota-input-global">
                                        <input
                                          type="text"
                                          inputMode="decimal"
                                          pattern="[0-9]{0,2}[,.]?[0-9]{0,1}"
                                          maxLength="3"
                                          className={`nt-input-nota ${getNotaClass(
                                            getNotaAluno(
                                              aluno.id,
                                              "globalizada"
                                            )
                                          )} ${
                                            temErroValidacao(
                                              aluno.id,
                                              "globalizada"
                                            )
                                              ? "nt-error"
                                              : ""
                                          }`}
                                          placeholder="00,0"
                                          value={getNotaAluno(
                                            aluno.id,
                                            "globalizada"
                                          )}
                                          onChange={(e) =>
                                            handleNotaChange(
                                              aluno.id,
                                              "globalizada",
                                              e.target.value
                                            )
                                          }
                                          onKeyPress={(e) => {
                                            if (!/[\d,.]/.test(e.key)) {
                                              e.preventDefault();
                                            }
                                          }}
                                          disabled={!isEditavel || isSaving}
                                        />
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}

                            {tipo === "fundamental2" && (
                              <>
                                <div className="nt-table-header nt-disciplinas">
                                  <span>Nome do Aluno</span>
                                  {Object.values(disciplinasFiltradas).map(
                                    (discNome, index) => (
                                      <span key={index}>{discNome}</span>
                                    )
                                  )}
                                </div>
                                <div className="nt-alunos-list">
                                  {turma.alunos.map((aluno) => (
                                    <div
                                      key={aluno.id}
                                      className="nt-aluno-row nt-disciplinas"
                                    >
                                      <div className="nt-aluno-nome">
                                        {aluno.nome}
                                      </div>
                                      {Object.keys(disciplinasFiltradas).map(
                                        (discId, index) => (
                                          <div
                                            key={index}
                                            className="nt-nota-input"
                                            data-label={
                                              disciplinasFiltradas[discId]
                                            }
                                          >
                                            <input
                                              type="text"
                                              inputMode="decimal"
                                              pattern="[0-9]{0,2}[,.]?[0-9]{0,1}"
                                              maxLength="3"
                                              className={`nt-input-nota ${getNotaClass(
                                                getNotaAluno(aluno.id, discId)
                                              )} ${
                                                temErroValidacao(
                                                  aluno.id,
                                                  discId
                                                )
                                                  ? "nt-error"
                                                  : ""
                                              }`}
                                              placeholder="00,0"
                                              value={getNotaAluno(
                                                aluno.id,
                                                discId
                                              )}
                                              onChange={(e) =>
                                                handleNotaChange(
                                                  aluno.id,
                                                  discId,
                                                  e.target.value
                                                )
                                              }
                                              onKeyPress={(e) => {
                                                if (!/[\d,.]/.test(e.key)) {
                                                  e.preventDefault();
                                                }
                                              }}
                                              disabled={!isEditavel || isSaving}
                                            />
                                          </div>
                                        )
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>

                          <div className="nt-turma-actions">
                            {!isEditavel ? (
                              <button
                                className="nt-editar-button"
                                onClick={() => toggleEdicao(turma.id)}
                                title="Editar notas"
                                disabled={isSaving}
                              >
                                <Edit3 size={16} />
                                Editar Notas
                              </button>
                            ) : (
                              <button
                                className="nt-salvar-button"
                                onClick={() => handleSalvarNotas(turma.id)}
                                title="Salvar notas"
                                disabled={isSaving}
                              >
                                {isSaving ? (
                                  <Loader size={16} className="nt-spinner" />
                                ) : (
                                  <Save size={16} />
                                )}
                                {isSaving ? "Salvando..." : "Salvar Notas"}
                              </button>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="nt-empty-alunos-message">
                          <p>Nenhum aluno matriculado nesta turma.</p>
                        </div>
                      )}
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

export default NotasProfe;
