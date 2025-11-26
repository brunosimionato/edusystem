import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Save,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Edit3,
  Loader,
} from "lucide-react";
import "./notas.css";
import NotaService from "../../Services/NotaService";
import TurmaService from "../../Services/NotaTurmaService";
import AlunoService from "../../Services/AlunoService";
import DisciplinaService from "../../Services/DisciplinaService";
import TestService from "../../Services/TestService";
import { gerarBoletim, gerarBoletimLote } from "../../Relatorios/boletins";

const CadastroNotas = () => {
  const [filtro, setFiltro] = useState("");
  const [turmasExpandidas, setTurmasExpandidas] = useState(new Set());
  const [turmasEditaveis, setTurmasEditaveis] = useState(new Set());
  const [anoLetivo, setAnoLetivo] = useState("2025");
  const [trimestreSelecionado, setTrimestreSelecionado] = useState("1");
  const [notas, setNotas] = useState({});
  const [errosValidacao, setErrosValidacao] = useState(new Set());
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("testing");
  const [connectionError, setConnectionError] = useState("");

  // FUNÇÃO DE ORDENAÇÃO AVANÇADA
  const ordenarTurmas = (turmasArray) => {
    return turmasArray.sort((a, b) => {
      // Extrai números do nome (ex: "1º A" → 1, "6º B" → 6)
      const numA = parseInt(a.nome.match(/\d+/)?.[0]) || 0;
      const numB = parseInt(b.nome.match(/\d+/)?.[0]) || 0;
      
      if (numA !== 0 && numB !== 0) {
        if (numA !== numB) {
          return numA - numB;
        }
        return a.nome.localeCompare(b.nome, 'pt-BR');
      }

      return a.nome.localeCompare(b.nome, 'pt-BR', { numeric: true });
    });
  };

  const getTipoPorTurma = (turmaNome) => {
    if (!turmaNome) return "fundamental1";

    const primeiroCaractere = turmaNome.trim().charAt(0);
    console.log(
      `🔍 Turma: "${turmaNome}" → Primeiro caractere: "${primeiroCaractere}"`
    );

    if (["6", "7", "8", "9"].includes(primeiroCaractere)) {
      console.log("Classificado como Fundamental II (6º-9º)");
      return "fundamental2";
    }
    // Verifica se é 1, 2, 3, 4 ou 5
    else if (["1", "2", "3", "4", "5"].includes(primeiroCaractere)) {
      console.log("✅ Classificado como Fundamental I (1º-5º)");
      return "fundamental1";
    }

    console.log(
      "⚠️  Primeiro caractere não identificado, usando padrão Fundamental I"
    );
    return "fundamental1";
  };

  const formatarData = (dataString) => {
    if (!dataString) return "-";
    const data = new Date(dataString);
    return data.toLocaleDateString("pt-BR");
  };

  // Filtrar disciplinas por tipo de turma
  const getDisciplinasPorTipo = (tipoTurma) => {
    const disciplinasFiltradas = {};

    Object.keys(disciplinas).forEach((disciplinaId) => {
      // Para Fundamental II (6º-9º), remove a disciplina 2 (Ensino Globalizado)
      if (tipoTurma === "fundamental2" && disciplinaId === "2") {
        return; // Pula a disciplina 2
      }
      disciplinasFiltradas[disciplinaId] = disciplinas[disciplinaId];
    });

    return disciplinasFiltradas;
  };

  // Carregar dados iniciais
  useEffect(() => {
    testarConexao();
  }, []);

  const testarConexao = async () => {
    try {
      setConnectionStatus("testing");
      console.log("🔍 Iniciando teste de conexão completo...");

      const baseResult = await TestService.testConnection();
      console.log("✅ Teste base:", baseResult);

      if (!baseResult.ok) {
        setConnectionStatus("error");
        setConnectionError(
          `Não consegui conectar com o servidor: ${
            baseResult.error || "Verifique a URL"
          }`
        );
        return;
      }

      const turmasResult = await TestService.testTurmasEndpoint();
      console.log("✅ Teste /turmas:", turmasResult);

      if (turmasResult.status === 404) {
        setConnectionStatus("error");
        setConnectionError(
          "Endpoint /turmas não encontrado. Verifique as rotas do backend."
        );
        return;
      }

      if (turmasResult.status === 401) {
        setConnectionStatus("unauthorized");
        setConnectionError("Não autenticado. Faça login novamente.");
        return;
      }

      if (turmasResult.ok) {
        setConnectionStatus("authenticated");
        carregarDadosIniciais();
      } else {
        setConnectionStatus("error");
        setConnectionError(`Erro no servidor: ${turmasResult.status}`);
      }
    } catch (error) {
      console.error("❌ Erro no teste de conexão:", error);
      setConnectionStatus("error");
      setConnectionError(`Erro de rede: ${error.message}`);
    }
  };

  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      console.log("📦 Iniciando carregamento de dados...");

      // 1. Carregar turmas
      console.log("🔄 Carregando turmas...");
      const turmasData = await TurmaService.getAll();

      // Ordenar turmas ANTES de processar
      const turmasOrdenadas = ordenarTurmas(turmasData);
      
      // Determinar tipo baseado no PRIMEIRO CARACTERE do nome da turma
      const turmasComTipo = turmasOrdenadas.map((turma) => {
        const tipo = getTipoPorTurma(turma.nome);
        console.log(`🏫 Turma: ${turma.nome} → Tipo: ${tipo}`);
        return {
          ...turma,
          tipo: tipo,
        };
      });

      console.log("✅ Turmas carregadas e ordenadas:", turmasComTipo);

      // 2. Carregar disciplinas
      console.log("🔄 Carregando disciplinas...");
      const disciplinasData = await DisciplinaService.getAll();
      const disciplinasMap = {};
      disciplinasData.forEach((disc) => {
        disciplinasMap[disc.id] = disc.nome;
      });
      setDisciplinas(disciplinasMap);
      console.log("✅ Disciplinas carregadas:", disciplinasMap);

      // 3. Carregar alunos para cada turma
      console.log("🔄 Carregando alunos por turma...");
      const turmasComAlunosPromises = turmasComTipo.map(async (turma) => {
        try {
          const alunos = await AlunoService.getByTurma(turma.id);
          return {
            ...turma,
            alunos: alunos,
          };
        } catch (error) {
          console.warn(
            `⚠️  Não foi possível carregar alunos da turma ${turma.id}`
          );
          return { ...turma, alunos: [] };
        }
      });

      const turmasComAlunos = await Promise.allSettled(
        turmasComAlunosPromises
      ).then((results) =>
        results.map((result) =>
          result.status === "fulfilled" ? result.value : { alunos: [] }
        )
      );

      setTurmas(turmasComAlunos);
      console.log("Todas as turmas processadas e ordenadas:", turmasComAlunos);

      // 4. Carregar notas em background
      console.log("🔄 Iniciando carregamento de notas em background...");
      carregarNotasExistentes(turmasComAlunos);

      console.log(
        "🎉 Interface carregada! Notas serão carregadas em background."
      );
    } catch (error) {
      console.error("❌ Erro crítico ao carregar dados:", error);
      setConnectionStatus("error");
      setConnectionError(`Erro ao carregar dados: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const carregarNotasExistentes = async (turmasData) => {
    console.log("🔄 Iniciando carregamento de notas existentes...");

    const notasCarregadas = {};
    const promises = [];

    for (const turma of turmasData) {
      for (const aluno of turma.alunos) {
        const promise = NotaService.getByAluno(
          aluno.id,
          parseInt(anoLetivo), //
          parseInt(trimestreSelecionado)
        )
          .then((notasAluno) => {
            notasAluno.forEach((nota) => {
              const chave = `${aluno.id}-${trimestreSelecionado}`;
              if (!notasCarregadas[chave]) {
                notasCarregadas[chave] = {};
              }

              const notaFrontend = (nota.nota * 10).toFixed(1);

              if (turma.tipo === "fundamental1") {
                // 1º-5º ANO: Se for disciplina 2 (Globalizada), armazena como "globalizada"
                if (nota.idDisciplina === 2) {
                  notasCarregadas[chave]["globalizada"] = notaFrontend;
                }
              } else {
                // 6º-9º ANO: Armazena por disciplina (EXCETO disciplina 2)
                if (nota.idDisciplina !== 2) {
                  // ⚠️ IGNORA disciplina 2 para Fundamental II
                  const disciplinaKey = nota.idDisciplina;
                  notasCarregadas[chave][disciplinaKey] = notaFrontend;
                }
              }
            });
          })
          .catch((error) => {
            console.log(
              `Nenhuma nota encontrada para o aluno ${aluno.nome}`
            );
          });

        promises.push(promise);
      }
    }

    await Promise.allSettled(promises);
    console.log("✅ Carregamento de notas concluído:", notasCarregadas);
    setNotas(notasCarregadas);
  };

  // Filtrar turmas baseado no termo de busca
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
        alunos: turma.alunos.filter(
          (aluno) =>
            !filtro ||
            turma.nome.toLowerCase().includes(filtro.toLowerCase()) ||
            aluno.nome.toLowerCase().includes(filtro.toLowerCase())
        ),
      }));

    return ordenarTurmas(filtradas);
  }, [filtro, turmas]);

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
        setErrosValidacao((prev) => {
          const novosErros = new Set(prev);
          turmas
            .find((t) => t.id === turmaId)
            ?.alunos.forEach((aluno) => {
              if (
                turmas.find((t) => t.id === turmaId).tipo === "fundamental1"
              ) {
                novosErros.delete(`${aluno.id}-globalizada`);
              } else {
                Object.keys(disciplinas).forEach((discId) => {
                  novosErros.delete(`${aluno.id}-${discId}`);
                });
              }
            });
          return novosErros;
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
      manha: "notas-turno-manha",
      tarde: "notas-turno-tarde",
    };

    const t = turno
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();

    return classes[t] || "";
  };

  const getTipoClass = (tipo) => {
    return tipo === "fundamental1" ? "notas-tipo-fund1" : "notas-tipo-fund2";
  };

  const handleNotaChange = (alunoId, disciplina, valor) => {
    const chave = `${alunoId}-${trimestreSelecionado}`;
    setNotas((prev) => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [disciplina]: valor,
      },
    }));

    const chaveErro = `${alunoId}-${disciplina}`;
    if (valor && valor.trim() !== "") {
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
    return notaNum >= 60 ? "nota-aprovado" : "nota-reprovado";
  };

  const verificarNotasCompletas = (turma) => {
    const notasFaltando = [];

    turma.alunos.forEach((aluno) => {
      if (turma.tipo === "fundamental1") {
        const nota = getNotaAluno(aluno.id, "globalizada");
        if (!nota || nota.trim() === "") {
          notasFaltando.push({
            aluno: aluno.nome,
            disciplina: "Nota Global",
            chave: `${aluno.id}-globalizada`,
          });
        }
      } else if (turma.tipo === "fundamental2") {
        const disciplinasFiltradas = getDisciplinasPorTipo("fundamental2");
        Object.keys(disciplinasFiltradas).forEach((disciplinaId) => {
          const nota = getNotaAluno(aluno.id, disciplinaId);
          if (!nota || nota.trim() === "") {
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
  };

  const handleSalvarNotas = async (turmaId) => {
    setSaving((prev) => ({ ...prev, [turmaId]: true }));

    try {
      const turma = turmas.find((t) => t.id === turmaId);
      const notasParaProcessar = [];

      console.log(
        "📝 Preparando notas para salvar da turma:",
        turma.nome,
        "Tipo:",
        turma.tipo
      );

      const notasExistentes = await NotaService.getByTurma(
        turmaId,
        parseInt(anoLetivo),
        parseInt(trimestreSelecionado)
      );

      console.log("📊 Notas existentes encontradas:", notasExistentes);

      // Criar um mapa rápido para verificar se a nota já existe
      const mapaNotasExistentes = {};
      notasExistentes.forEach((nota) => {
        const chave = `${nota.idAluno}-${nota.idDisciplina}`;
        mapaNotasExistentes[chave] = nota;
      });

      turma.alunos.forEach((aluno) => {
        const chave = `${aluno.id}-${trimestreSelecionado}`;
        const notasAluno = notas[chave];

        if (notasAluno) {
          if (turma.tipo === "fundamental1") {
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

              const chaveNotaExistente = `${aluno.id}-2`; // ID 2 para Ensino Globalizado
              const notaExistente = mapaNotasExistentes[chaveNotaExistente];

              notasParaProcessar.push({
                operacao: notaExistente ? "update" : "create",
                dados: {
                  idAluno: aluno.id,
                  idDisciplina: 2,
                  idTurma: turmaId,
                  trimestre: parseInt(trimestreSelecionado),
                  nota: Math.round(notaValor), // SEM casas decimais
                  anoLetivo: parseInt(anoLetivo),
                },
                idNotaExistente: notaExistente?.id,
              });
            }
          } else {
            // 6º ao 9º ANO - NOTAS POR DISCIPLINA (EXCETO DISCIPLINA 2)
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
                    nota: Math.round(notaValor), // SEM casas decimais
                    anoLetivo: parseInt(anoLetivo),
                  },
                  idNotaExistente: notaExistente?.id,
                });
              }
            });
          }
        }
      });

      console.log("📤 Notas para processar:", notasParaProcessar);

      if (notasParaProcessar.length === 0) {
        alert("Nenhuma nota para salvar!");
        return;
      }

      const resultados = await Promise.allSettled(
        notasParaProcessar.map((item, index) => {
          console.log(
            `📤 [${index + 1}/${notasParaProcessar.length}] Processando (${
              item.operacao
            }):`,
            item.dados
          );

          if (item.operacao === "update") {
            return NotaService.update(item.idNotaExistente, item.dados);
          } else {
            return NotaService.create(item.dados);
          }
        })
      );

      const sucessos = resultados.filter((r) => r.status === "fulfilled");
      const falhas = resultados.filter((r) => r.status === "rejected");

      console.log(`✅ ${sucessos.length} notas processadas com sucesso`);
      console.log(`❌ ${falhas.length} notas com erro`);

      if (falhas.length > 0) {
        console.error("❌ Erros ao processar notas:", falhas);

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

      // Recarrega as notas da turma para refletir as mudanças
      await carregarNotasExistentes([turma]);
    } catch (error) {
      console.error("❌ Erro crítico ao salvar notas:", error);
      alert(`Erro ao salvar notas: ${error.message}`);
    } finally {
      setSaving((prev) => ({ ...prev, [turmaId]: false }));
    }
  };

  const handleGerarBoletins = (turmaId, turmaNome) => {
    const turma = turmas.find((t) => t.id === turmaId);
    const notasFaltando = verificarNotasCompletas(turma);

    // Impede geração caso faltem notas
    if (notasFaltando.length > 0) {
      const novosErros = new Set(errosValidacao);
      notasFaltando.forEach((item) => novosErros.add(item.chave));
      setErrosValidacao(novosErros);

      alert(
        `Não é possível gerar os boletins da turma ${turmaNome}. Existem ${notasFaltando.length} nota(s) não preenchida(s):\n\n` +
          notasFaltando
            .map((item) => `• ${item.aluno} - ${item.disciplina}`)
            .join("\n") +
          `\n\nPreencha todas as notas desta turma antes de gerar os boletins.`
      );
      return;
    }

    // Limpa erros de validação antes de gerar
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

    // Montar estrutura de alunos + notas para o relatório
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

    const dataHoraAgora = new Date().toLocaleString("pt-BR");

    // Gerar HTML completo de todos os boletins
    const boletinsHTML = gerarBoletimLote({
      turma,
      alunosComNotas,
      disciplinas,
      anoLetivo,
      trimestre: trimestreSelecionado,
      dataHoraAgora,
      formatarData,
    });

    // Criar iframe oculto para imprimir
    const oldFrame = document.getElementById("print-boletim-frame");
    if (oldFrame) oldFrame.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "print-boletim-frame";
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    document.body.appendChild(iframe);

    const frameDoc = iframe.contentWindow || iframe.contentDocument;
    const doc = frameDoc.document || frameDoc;

    // Escrever boletins dentro do iframe
    doc.open();
    doc.write(boletinsHTML);
    doc.close();

    // Após carregar, imprime
    iframe.onload = () => {
      setTimeout(() => {
        frameDoc.focus();
        frameDoc.print();
      }, 200);
    };
  };

  const temErroValidacao = (alunoId, disciplina) => {
    return errosValidacao.has(`${alunoId}-${disciplina}`);
  };

  if (loading) {
    return (
      <div className="notas-container">
        <div className="notas-loading">
          <Loader size={32} className="notas-spinner" />
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="notas-container">
      <div className="notas-form-section">
        <div className="notas-section-header">
          <span>Filtros e Configurações</span>
        </div>
        <div className="notas-form-grid">
          <div className="notas-form-group notas-third-width">
            <label>Ano Letivo</label>
            <select
              className="notas-select"
              value={anoLetivo}
              onChange={(e) => setAnoLetivo(e.target.value)}
            >
              <option value="2025">2025</option>{" "}
            </select>
          </div>
          <div className="notas-form-group notas-third-width">
            <label>Trimestre</label>
            <select
              className="notas-select"
              value={trimestreSelecionado}
              onChange={(e) => setTrimestreSelecionado(e.target.value)}
            >
              <option value="1">1º Trimestre</option>
              <option value="2">2º Trimestre</option>
              <option value="3">3º Trimestre</option>
            </select>
          </div>
          <div className="notas-form-group notas-third-width">
            <label>Buscar por turma ou aluno</label>
            <div className="notas-input-wrapper">
              <Search className="notas-input-icon" size={18} />
              <input
                type="text"
                className="notas-input notas-search-input"
                placeholder="Digite para buscar..."
                value={filtro}
                onChange={(e) => setFiltro(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="notas-form-section">
        <div className="notas-section-header">
          <span>
            Cadastro de Notas - {anoLetivo} - {trimestreSelecionado}º Trimestre
          </span>
          <span className="notas-counter">
            {turmasFiltradas.length} turma
            {turmasFiltradas.length !== 1 ? "s" : ""} encontrada
            {turmasFiltradas.length !== 1 ? "s" : ""}
          </span>
        </div>

        {turmasFiltradas.length === 0 ? (
          <div className="notas-empty-state">
            <div className="notas-empty-icon">
              <BookOpen size={40} />
            </div>
            <h4>Nenhuma turma encontrada</h4>
            <p>
              Tente ajustar os filtros de busca ou verifique se há turmas
              cadastradas.
            </p>
          </div>
        ) : (
          <div className="notas-turmas-list">
            {turmasFiltradas.map((turma) => {
              const isExpandida = turmasExpandidas.has(turma.id);
              const isEditavel = turmasEditaveis.has(turma.id);
              const isSaving = saving[turma.id];
              const disciplinasFiltradas = getDisciplinasPorTipo(turma.tipo);

              return (
                <div key={turma.id} className="notas-turma-card">
                  <div className="notas-turma-info">
                    <div className="notas-turma-header">
                      <div
                        className="notas-turma-header-left notas-clickable"
                        onClick={() => toggleTurma(turma.id)}
                      >
                        {isExpandida ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                        <h3 className="notas-turma-nome">{turma.nome}</h3>

                        <span
                          className={`notas-turno ${getTurnoClass(
                            turma.turno
                          )}`}
                        >
                          {turma.turno}
                        </span>
                      </div>

                      <div className="notas-actions">
                        <button
                          className="notas-boletins-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleGerarBoletins(turma.id, turma.nome);
                          }}
                          title={`Gerar boletins apenas da turma ${turma.nome}`}
                        >
                          <BookOpen size={16} />
                          Gerar Boletins
                        </button>
                      </div>
                    </div>

                    {isExpandida && (
                      <>
                        <div className="notas-table-container">
                          {turma.tipo === "fundamental1" && (
                            <>
                              <div className="notas-table-header notas-globalizada">
                                <span>Nome do Aluno</span>
                                <span>Nota Global</span>
                              </div>
                              {turma.alunos.map((aluno) => (
                                <div
                                  key={aluno.id}
                                  className="notas-aluno-row notas-globalizadas"
                                >
                                  <div className="notas-aluno-nome">
                                    {aluno.nome}
                                  </div>
                                  <div className="notas-nota-input">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      className={`notas-input-nota ${getNotaClass(
                                        getNotaAluno(aluno.id, "globalizada")
                                      )} ${
                                        temErroValidacao(
                                          aluno.id,
                                          "globalizada"
                                        )
                                          ? "notas-error"
                                          : ""
                                      }`}
                                      placeholder="0.0"
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
                                      disabled={!isEditavel || isSaving}
                                    />
                                  </div>
                                </div>
                              ))}
                            </>
                          )}

                          {turma.tipo === "fundamental2" && (
                            <>
                              <div className="notas-table-header-d notas-disciplinas">
                                <span>Nome do Aluno</span>
                                {Object.values(disciplinasFiltradas).map(
                                  (discNome, index) => (
                                    <span key={index}>{discNome}</span>
                                  )
                                )}
                              </div>
                              {turma.alunos.map((aluno) => (
                                <div
                                  key={aluno.id}
                                  className="notas-aluno-row notas-disciplinas-d"
                                >
                                  <div className="notas-aluno-nome">
                                    {aluno.nome}
                                  </div>
                                  {Object.keys(disciplinasFiltradas).map(
                                    (discId, index) => (
                                      <div
                                        key={index}
                                        className="notas-nota-input"
                                        data-label={
                                          disciplinasFiltradas[discId]
                                        }
                                      >
                                        <input
                                          type="number"
                                          min="0"
                                          max="100"
                                          step="0.1"
                                          className={`notas-input-nota ${getNotaClass(
                                            getNotaAluno(aluno.id, discId)
                                          )} ${
                                            temErroValidacao(aluno.id, discId)
                                              ? "notas-error"
                                              : ""
                                          }`}
                                          placeholder="0.0"
                                          value={getNotaAluno(aluno.id, discId)}
                                          onChange={(e) =>
                                            handleNotaChange(
                                              aluno.id,
                                              discId,
                                              e.target.value
                                            )
                                          }
                                          disabled={!isEditavel || isSaving}
                                        />
                                      </div>
                                    )
                                  )}
                                </div>
                              ))}
                            </>
                          )}
                        </div>

                        <div className="notas-table-actions">
                          {!isEditavel ? (
                            <button
                              className="notas-editar-button"
                              onClick={() => toggleEdicao(turma.id)}
                              title="Editar notas"
                              disabled={isSaving}
                            >
                              <Edit3 size={16} />
                              Editar Notas
                            </button>
                          ) : (
                            <button
                              className="notas-salvar-button"
                              onClick={() => handleSalvarNotas(turma.id)}
                              title="Salvar notas"
                              disabled={isSaving}
                            >
                              {isSaving ? (
                                <Loader size={16} className="notas-spinner" />
                              ) : (
                                <Save size={16} />
                              )}
                              {isSaving ? "Salvando..." : "Salvar Notas"}
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

export default CadastroNotas;