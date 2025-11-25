import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Save,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Edit3,
  Loader,
  Wifi,
  WifiOff,
} from "lucide-react";
import "./notas.css";
import NotaService from "../../Services/NotaService";
import TurmaService from "../../Services/NotaTurmaService";
import AlunoService from "../../Services/AlunoService";
import DisciplinaService from "../../Services/DisciplinaService";
import TestService from "../../Services/TestService";

const CadastroNotas = () => {
  const [filtro, setFiltro] = useState("");
  const [turmasExpandidas, setTurmasExpandidas] = useState(new Set());
  const [turmasEditaveis, setTurmasEditaveis] = useState(new Set());
  const [anoLetivo, setAnoLetivo] = useState("2024");
  const [trimestreSelecionado, setTrimestreSelecionado] = useState("1");
  const [notas, setNotas] = useState({});
  const [errosValidacao, setErrosValidacao] = useState(new Set());
  const [turmas, setTurmas] = useState([]);
  const [disciplinas, setDisciplinas] = useState({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState({});
  const [connectionStatus, setConnectionStatus] = useState("testing");
  const [connectionError, setConnectionError] = useState("");
  const [idDisciplinaGlobalizada, setIdDisciplinaGlobalizada] = useState(null);

  // Carregar dados iniciais
  useEffect(() => {
    testarConexao();
  }, []);

  // No seu componente, atualize a função testarConexao:
  const testarConexao = async () => {
    try {
      setConnectionStatus("testing");
      console.log("🔍 Iniciando teste de conexão completo...");

      // Teste 1: Conexão básica
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

      if (baseResult.isHtml) {
        console.log("⚠️  Servidor retornando HTML na raiz");
      }

      // Teste 2: Endpoint específico de turmas
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

      if (turmasResult.isHtml) {
        setConnectionStatus("error");
        setConnectionError(
          "O servidor está retornando HTML em vez de JSON para /turmas. Provável problema de rota."
        );
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

  const testarAutenticacao = async () => {
    try {
      const status = await TestService.testAuth();
      if (status === 200) {
        setConnectionStatus("authenticated");
        carregarDadosIniciais();
      } else if (status === 401) {
        setConnectionStatus("unauthorized");
        setConnectionError("Não autenticado. Faça login novamente.");
      } else {
        setConnectionStatus("error");
        setConnectionError(`Erro de autenticação: ${status}`);
      }
    } catch (error) {
      setConnectionStatus("error");
      setConnectionError(`Erro na autenticação: ${error.message}`);
    }
  };

  // No componente CadastroNotas, atualize carregarDadosIniciais:
  const carregarDadosIniciais = async () => {
    setLoading(true);
    try {
      console.log("📦 Iniciando carregamento de dados...");

      // 1. Carregar turmas (sem alunos inicialmente)
      console.log("🔄 Carregando turmas...");
      const turmasData = await TurmaService.getAll();
      console.log("✅ Turmas carregadas:", turmasData);

      // 2. Carregar disciplinas
      console.log("🔄 Carregando disciplinas...");
      const disciplinasData = await DisciplinaService.getAll();
      const disciplinasMap = {};
      disciplinasData.forEach((disc) => {
        disciplinasMap[disc.id] = disc.nome;
      });
      setDisciplinas(disciplinasMap);
      console.log("✅ Disciplinas carregadas:", disciplinasMap);

      // 3. Carregar alunos para cada turma (em paralelo)
      console.log("🔄 Carregando alunos por turma...");
      const turmasComAlunosPromises = turmasData.map(async (turma) => {
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
      console.log("✅ Todas as turmas processadas:", turmasComAlunos);

      // 4. Carregar notas em background (não bloqueia)
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

    // Usamos Promise.all para carregar tudo em paralelo e não bloquear a interface
    const promises = [];

    for (const turma of turmasData) {
      for (const aluno of turma.alunos) {
        // Para cada aluno, criamos uma promise que carrega as notas
        const promise = NotaService.getByAluno(
          aluno.id,
          parseInt(anoLetivo),
          parseInt(trimestreSelecionado)
        )
          .then((notasAluno) => {
            // Processa as notas quando carregadas
            notasAluno.forEach((nota) => {
              const chave = `${aluno.id}-${trimestreSelecionado}`;
              if (!notasCarregadas[chave]) {
                notasCarregadas[chave] = {};
              }

              if (turma.tipo === "fundamental1") {
                // Fundamental I - Nota globalizada
                notasCarregadas[chave]["globalizada"] = nota.nota.toString();
              } else {
                // Fundamental II - Notas por disciplina
                const disciplinaKey = nota.idDisciplina;
                notasCarregadas[chave][disciplinaKey] = nota.nota.toString();
              }
            });
          })
          .catch((error) => {
            // Ignora erros silenciosamente - as notas ficarão em branco
            console.log(
              `ℹ️  Nenhuma nota encontrada para o aluno ${aluno.nome} (ID: ${aluno.id})`
            );
          });

        promises.push(promise);
      }
    }

    // Aguarda todas as promises completarem (mesmo que algumas falhem)
    await Promise.allSettled(promises);

    console.log("✅ Carregamento de notas concluído:", notasCarregadas);
    setNotas(notasCarregadas);
  };

  // Filtrar turmas baseado no termo de busca
  const turmasFiltradas = useMemo(() => {
    if (!filtro) return turmas;
    return turmas
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
  }, [filtro, turmas]);

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
        // Remove erros de validação da turma
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
      manhã: "notas-turno-manhã",
      tarde: "notas-turno-tarde",
    };
    return classes[turno] || "";
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

    // Remove erro de validação quando o campo é preenchido
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

  // Função para determinar a classe CSS baseada na nota
  const getNotaClass = (nota) => {
    const notaNum = parseFloat(nota);
    if (isNaN(notaNum) || nota === "") return "";
    return notaNum >= 60 ? "nota-aprovado" : "nota-reprovado";
  };

  // Função para verificar se todas as notas da turma estão preenchidas
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
        Object.keys(disciplinas).forEach((disciplinaId) => {
          const nota = getNotaAluno(aluno.id, disciplinaId);
          if (!nota || nota.trim() === "") {
            notasFaltando.push({
              aluno: aluno.nome,
              disciplina: disciplinas[disciplinaId],
              chave: `${aluno.id}-${disciplinaId}`,
            });
          }
        });
      }
    });

    return notasFaltando;
  };

  // Função para salvar notas de uma turma específica
  // Substitua apenas a função handleSalvarNotas no seu arquivo notas.jsx

  const handleSalvarNotas = async (turmaId) => {
    setSaving((prev) => ({ ...prev, [turmaId]: true }));

    try {
      const turma = turmas.find((t) => t.id === turmaId);
      const notasParaSalvar = [];

      console.log("📝 Preparando notas para salvar da turma:", turma.nome);

      // Coletar todas as notas da turma para salvar
      turma.alunos.forEach((aluno) => {
        const chave = `${aluno.id}-${trimestreSelecionado}`;
        const notasAluno = notas[chave];

        if (notasAluno) {
          if (turma.tipo === "fundamental1") {
            // Fundamental I - Nota globalizada
            if (
              notasAluno.globalizada &&
              notasAluno.globalizada.trim() !== ""
            ) {
              const notaValor = parseFloat(notasAluno.globalizada);

              // Validação: nota deve estar entre 0 e 100
              if (isNaN(notaValor) || notaValor < 0 || notaValor > 100) {
                console.error(
                  `❌ Nota inválida para ${aluno.nome}: ${notasAluno.globalizada}`
                );
                return;
              }

              notasParaSalvar.push({
                idAluno: aluno.id,
                idDisciplina: 0, // 0 para nota globalizada
                idTurma: turmaId,
                trimestre: parseInt(trimestreSelecionado),
                nota: Math.round(notaValor * 100) / 100, // Garante 2 casas decimais
                anoLetivo: parseInt(anoLetivo),
                tipo: "bimestral",
              });
            }
          } else {
            // Fundamental II - Notas por disciplina
            Object.keys(notasAluno).forEach((disciplinaId) => {
              if (
                disciplinaId !== "globalizada" &&
                notasAluno[disciplinaId] &&
                notasAluno[disciplinaId].trim() !== ""
              ) {
                const notaValor = parseFloat(notasAluno[disciplinaId]);
                const disciplinaIdNum = parseInt(disciplinaId);

                // Validação: nota deve estar entre 0 e 100
                if (isNaN(notaValor) || notaValor < 0 || notaValor > 100) {
                  console.error(
                    `❌ Nota inválida para ${aluno.nome} em disciplina ${disciplinaId}: ${notasAluno[disciplinaId]}`
                  );
                  return;
                }

                // Validação: disciplina deve existir
                if (!disciplinas[disciplinaIdNum]) {
                  console.error(
                    `❌ Disciplina ${disciplinaIdNum} não existe no sistema`
                  );
                  return;
                }

                notasParaSalvar.push({
                  idAluno: aluno.id,
                  idDisciplina: disciplinaIdNum,
                  idTurma: turmaId,
                  trimestre: parseInt(trimestreSelecionado),
                  nota: Math.round(notaValor * 100) / 100, // Garante 2 casas decimais
                  anoLetivo: parseInt(anoLetivo),
                  tipo: "bimestral",
                });
              }
            });
          }
        }
      });

      console.log("📤 Notas validadas para salvar:", notasParaSalvar);

      // Verifica se há notas para salvar
      if (notasParaSalvar.length === 0) {
        alert("Nenhuma nota para salvar!");
        return;
      }

      // Salvar cada nota com tratamento de erro individual
      const resultados = await Promise.allSettled(
        notasParaSalvar.map((notaData, index) => {
          console.log(
            `📤 [${index + 1}/${notasParaSalvar.length}] Salvando:`,
            notaData
          );
          return NotaService.create(notaData);
        })
      );

      // Analisa os resultados
      const sucessos = resultados.filter((r) => r.status === "fulfilled");
      const falhas = resultados.filter((r) => r.status === "rejected");

      console.log(`✅ ${sucessos.length} notas salvas com sucesso`);

      if (falhas.length > 0) {
        console.error("❌ Erros ao salvar notas:", falhas);

        // Mostra detalhes dos erros
        const mensagensErro = falhas
          .map((falha, index) => {
            const notaComErro = notasParaSalvar[resultados.indexOf(falha)];
            return `• Aluno ID ${notaComErro?.idAluno}, Disciplina ID ${
              notaComErro?.idDisciplina
            }: ${falha.reason?.message || "Erro desconhecido"}`;
          })
          .join("\n");

        alert(
          `Atenção!\n\n${sucessos.length} nota(s) salva(s) com sucesso.\n${falhas.length} nota(s) com erro:\n\n${mensagensErro}\n\nVerifique o console para mais detalhes.`
        );

        // Não remove do modo edição se houver erros
        return;
      }

      // Remove do modo edição apenas se todas as notas foram salvas
      setTurmasEditaveis((prev) => {
        const novaSet = new Set(prev);
        novaSet.delete(turmaId);
        return novaSet;
      });

      alert(`✅ Sucesso! ${sucessos.length} nota(s) salva(s).`);

      // Recarrega as notas da turma para refletir as mudanças
      await carregarNotasExistentes([turma]);
    } catch (error) {
      console.error("❌ Erro crítico ao salvar notas:", error);
      alert(`Erro ao salvar notas: ${error.message}`);
    } finally {
      setSaving((prev) => ({ ...prev, [turmaId]: false }));
    }
  };

  // Função para gerar boletins da turma específica
  const handleGerarBoletins = (turmaId, turmaNome) => {
    const turma = turmas.find((t) => t.id === turmaId);
    const notasFaltando = verificarNotasCompletas(turma);

    if (notasFaltando.length > 0) {
      // Adiciona os erros de validação visual
      const novosErros = new Set(errosValidacao);
      notasFaltando.forEach((item) => {
        novosErros.add(item.chave);
      });
      setErrosValidacao(novosErros);

      const mensagemErro =
        `Não é possível gerar os boletins da turma ${turmaNome}. Existem ${notasFaltando.length} nota(s) não preenchida(s):\n\n` +
        notasFaltando
          .map((item) => `• ${item.aluno} - ${item.disciplina}`)
          .join("\n") +
        `\n\nPreencha todas as notas desta turma antes de gerar os boletins.`;

      alert(mensagemErro);
      return;
    }

    // Remove todos os erros de validação da turma se tudo estiver preenchido
    const novosErros = new Set(errosValidacao);
    turma.alunos.forEach((aluno) => {
      if (turma.tipo === "fundamental1") {
        novosErros.delete(`${aluno.id}-globalizada`);
      } else {
        Object.keys(disciplinas).forEach((discId) => {
          novosErros.delete(`${aluno.id}-${discId}`);
        });
      }
    });
    setErrosValidacao(novosErros);

    // Aqui você pode integrar com o serviço de boletins quando estiver disponível
    console.log("Gerando boletins da turma:", turmaId, turmaNome);
    console.log(
      "Dados das notas:",
      turma.alunos.map((aluno) => ({
        aluno: aluno.nome,
        notas:
          turma.tipo === "fundamental1"
            ? { globalizada: getNotaAluno(aluno.id, "globalizada") }
            : Object.keys(disciplinas).reduce(
                (acc, discId) => ({
                  ...acc,
                  [discId]: getNotaAluno(aluno.id, discId),
                }),
                {}
              ),
      }))
    );

    alert(
      `Boletins gerados com sucesso!\n\nTurma: ${turmaNome}\nAno Letivo: ${anoLetivo}\nTrimestre: ${trimestreSelecionado}º\nAlunos: ${turma.alunos.length} boletim(s) gerado(s)`
    );
  };

  // Função para verificar se um input tem erro de validação
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
      {/* Indicador de Status de Conexão */}
      <div className={`connection-status ${connectionStatus}`}>
        {connectionStatus === "testing" && (
          <div className="status-testing">
            <Loader size={16} className="spinner" />
            Testando conexão com o servidor...
          </div>
        )}
        {connectionStatus === "connected" && (
          <div className="status-connected">
            <Wifi size={16} />
            Conectado ao servidor
          </div>
        )}
        {connectionStatus === "authenticated" && (
          <div className="status-authenticated">
            <Wifi size={16} />
            Conectado e autenticado
          </div>
        )}
        {connectionStatus === "unauthorized" && (
          <div className="status-unauthorized">
            <WifiOff size={16} />
            Não autenticado -{" "}
            <button onClick={() => (window.location.href = "/login")}>
              Fazer Login
            </button>
          </div>
        )}
        {connectionStatus === "error" && (
          <div className="status-error">
            <WifiOff size={16} />
            Erro de conexão: {connectionError}
            <button onClick={testarConexao} className="retry-button">
              Tentar Novamente
            </button>
          </div>
        )}
      </div>
      {/* Seção de Filtros */}
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
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
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

      {/* Lista de Turmas */}
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

                      {/* Botão para gerar boletins apenas desta turma */}
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

                    {/* Tabela de Notas Expandida */}
                    {isExpandida && (
                      <>
                        <div className="notas-table-container">
                          {/* Ensino Fundamental I - Globalizado */}
                          {turma.tipo === "fundamental1" && (
                            <>
                              <div className="notas-table-header notas-globalizada">
                                <span>Nome do Aluno</span>
                                <span>Nota</span>
                              </div>
                              {turma.alunos.map((aluno) => (
                                <div
                                  key={aluno.id}
                                  className="notas-aluno-row notas-globalizada"
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

                          {/* Ensino Fundamental II - Por Disciplinas */}
                          {turma.tipo === "fundamental2" && (
                            <>
                              <div className="notas-table-header notas-disciplinas">
                                <span>Nome do Aluno</span>
                                {Object.values(disciplinas).map(
                                  (discNome, index) => (
                                    <span key={index}>{discNome}</span>
                                  )
                                )}
                              </div>
                              {turma.alunos.map((aluno) => (
                                <div
                                  key={aluno.id}
                                  className="notas-aluno-row notas-disciplinas"
                                >
                                  <div className="notas-aluno-nome">
                                    {aluno.nome}
                                  </div>
                                  {Object.keys(disciplinas).map(
                                    (discId, index) => (
                                      <div
                                        key={index}
                                        className="notas-nota-input"
                                        data-label={disciplinas[discId]}
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

                        {/* Botões de Ação da Tabela - Abaixo da tabela */}
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
