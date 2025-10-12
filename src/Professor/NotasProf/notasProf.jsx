import React, { useState, useMemo } from "react";
import {
  Search,
  Save,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Edit3,
} from "lucide-react";
import "./notasProf.css";


const NotasProfe = () => {
  const [filtro, setFiltro] = useState("");
  const [turmasExpandidas, setTurmasExpandidas] = useState(new Set());
  const [turmasEditaveis, setTurmasEditaveis] = useState(new Set());
  const [anoLetivo, setAnoLetivo] = useState("2024");
  const [trimestreSelecionado, setTrimestreSelecionado] = useState("1");
  const [notas, setNotas] = useState({});
  const [errosValidacao, setErrosValidacao] = useState(new Set());

  // Disciplinas do 6º ao 9º ano
  const disciplinas = {
    portugues: "Português",
    matematica: "Matemática",
    ciencias: "Ciências",
    historia: "História",
    geografia: "Geografia",
    ingles: "Inglês",
    artes: "Artes",
    edFisica: "Educação Física",
    religiao: "Religião"
  };

  // Dados mockados das turmas e alunos
  const turmas = [
    // Ensino Fundamental I (1º ao 5º ano) - Ensino Globalizado
    {
      id: 1,
      nome: "1º ANO A",
      turno: "manhã",
      tipo: "fundamental1", // ensino globalizado
      alunos: [
        { id: 1, nome: "Ana Silva" },
        { id: 2, nome: "Bruno Costa" },
        { id: 3, nome: "Carlos Mendes" },
        { id: 4, nome: "Diana Oliveira" },
        { id: 5, nome: "Eduardo Santos" },
      ],
    },
    {
      id: 2,
      nome: "3º ANO B",
      turno: "tarde",
      tipo: "fundamental1",
      alunos: [
        { id: 6, nome: "Fernanda Lima" },
        { id: 7, nome: "Gabriel Rocha" },
        { id: 8, nome: "Helena Cardoso" },
        { id: 9, nome: "Igor Ferreira" },
      ],
    },
    {
      id: 3,
      nome: "5º ANO A",
      turno: "manhã",
      tipo: "fundamental1",
      alunos: [
        { id: 10, nome: "Julia Alves" },
        { id: 11, nome: "Lucas Barbosa" },
        { id: 12, nome: "Maria João" },
      ],
    },
    // Ensino Fundamental II (6º ao 9º ano) - Por Disciplinas
    {
      id: 4,
      nome: "6º ANO A",
      turno: "manhã",
      tipo: "fundamental2", // por disciplinas
      alunos: [
        { id: 13, nome: "Nicolas Pereira" },
        { id: 14, nome: "Olga Nascimento" },
        { id: 15, nome: "Paulo Dias" },
        { id: 16, nome: "Queila Monteiro" },
      ],
    },
    {
      id: 5,
      nome: "8º ANO B",
      turno: "tarde",
      tipo: "fundamental2",
      alunos: [
        { id: 17, nome: "Rafael Torres" },
        { id: 18, nome: "Sofia Campos" },
        { id: 19, nome: "Tiago Oliveira" },
      ],
    },
    {
      id: 6,
      nome: "9º ANO A",
      turno: "manhã",
      tipo: "fundamental2",
      alunos: [
        { id: 20, nome: "Ursula Santos" },
        { id: 21, nome: "Victor Lima" },
        { id: 22, nome: "Wagner Silva" },
        { id: 23, nome: "Ximena Costa" },
      ],
    },
  ];

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
        setTurmasEditaveis(prevEdit => {
          const novaEditSet = new Set(prevEdit);
          novaEditSet.delete(turmaId);
          return novaEditSet;
        });
        // Remove erros de validação da turma
        setErrosValidacao(prev => {
          const novosErros = new Set(prev);
          turmas.find(t => t.id === turmaId)?.alunos.forEach(aluno => {
            if (turmas.find(t => t.id === turmaId).tipo === "fundamental1") {
              novosErros.delete(`${aluno.id}-globalizada`);
            } else {
              Object.keys(disciplinas).forEach(disc => {
                novosErros.delete(`${aluno.id}-${disc}`);
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
      manhã: "notas-turno-manha",
      tarde: "notas-turno-tarde",
    };
    return classes[turno] || "";
  };

  const handleNotaChange = (alunoId, disciplina, valor) => {
    const chave = `${alunoId}-${trimestreSelecionado}`;
    setNotas(prev => ({
      ...prev,
      [chave]: {
        ...prev[chave],
        [disciplina]: valor
      }
    }));

    // Remove erro de validação quando o campo é preenchido
    const chaveErro = `${alunoId}-${disciplina}`;
    if (valor && valor.trim() !== '') {
      setErrosValidacao(prev => {
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
    
    turma.alunos.forEach(aluno => {
      if (turma.tipo === "fundamental1") {
        const nota = getNotaAluno(aluno.id, 'globalizada');
        if (!nota || nota.trim() === '') {
          notasFaltando.push({ 
            aluno: aluno.nome, 
            disciplina: 'Nota Global',
            chave: `${aluno.id}-globalizada`
          });
        }
      } else if (turma.tipo === "fundamental2") {
        Object.keys(disciplinas).forEach(disciplinaKey => {
          const nota = getNotaAluno(aluno.id, disciplinaKey);
          if (!nota || nota.trim() === '') {
            notasFaltando.push({ 
              aluno: aluno.nome, 
              disciplina: disciplinas[disciplinaKey],
              chave: `${aluno.id}-${disciplinaKey}`
            });
          }
        });
      }
    });
    
    return notasFaltando;
  };

  // Função para gerar boletins da turma específica
  const handleGerarBoletins = (turmaId, turmaNome) => {
    const turma = turmas.find(t => t.id === turmaId);
    const notasFaltando = verificarNotasCompletas(turma);
    
    if (notasFaltando.length > 0) {
      // Adiciona os erros de validação visual
      const novosErros = new Set(errosValidacao);
      notasFaltando.forEach(item => {
        novosErros.add(item.chave);
      });
      setErrosValidacao(novosErros);

      const mensagemErro = `Não é possível gerar os boletins da turma ${turmaNome}. Existem ${notasFaltando.length} nota(s) não preenchida(s):\n\n` +
        notasFaltando.map(item => `• ${item.aluno} - ${item.disciplina}`).join('\n') +
        `\n\nPreencha todas as notas desta turma antes de gerar os boletins.`;
      
      alert(mensagemErro);
      return;
    }
    
    // Remove todos os erros de validação da turma se tudo estiver preenchido
    const novosErros = new Set(errosValidacao);
    turma.alunos.forEach(aluno => {
      if (turma.tipo === "fundamental1") {
        novosErros.delete(`${aluno.id}-globalizada`);
      } else {
        Object.keys(disciplinas).forEach(disc => {
          novosErros.delete(`${aluno.id}-${disc}`);
        });
      }
    });
    setErrosValidacao(novosErros);
    
    // Gera apenas os boletins dos alunos da turma específica
    const alunosDaTurma = turma.alunos.map(aluno => aluno.nome).join(', ');
    
    console.log("Gerando boletins apenas da turma:", turmaId, turmaNome, "Trimestre:", trimestreSelecionado);
    console.log("Alunos da turma:", alunosDaTurma);
    console.log("Notas da turma para boletins:", 
      turma.alunos.map(aluno => ({
        aluno: aluno.nome,
        notas: turma.tipo === "fundamental1" 
          ? { globalizada: getNotaAluno(aluno.id, 'globalizada') }
          : Object.keys(disciplinas).reduce((acc, disc) => ({
              ...acc,
              [disc]: getNotaAluno(aluno.id, disc)
            }), {})
      }))
    );
    
    alert(`Boletins gerados com sucesso!\n\nTurma: ${turmaNome}\nAno Letivo: ${anoLetivo}\nTrimestre: ${trimestreSelecionado}º\nAlunos: ${turma.alunos.length} boletim(s) gerado(s)`);
  };

  const handleSalvarNotas = (turmaId) => {
    console.log("Salvando notas da turma:", turmaId, "Ano:", anoLetivo, "Trimestre:", trimestreSelecionado);
    console.log("Notas:", notas);
    
    // Remove do modo edição após salvar
    setTurmasEditaveis(prev => {
      const novaSet = new Set(prev);
      novaSet.delete(turmaId);
      return novaSet;
    });
    
    alert("Notas salvas com sucesso!");
  };

  // Função para verificar se um input tem erro de validação
  const temErroValidacao = (alunoId, disciplina) => {
    return errosValidacao.has(`${alunoId}-${disciplina}`);
  };

  return (
    <div className="notas-container">
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
          <span>Cadastro de Notas - {anoLetivo} - {trimestreSelecionado}º Trimestre</span>
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
                        <span className={`notas-turno ${getTurnoClass(turma.turno)}`}>
                          {turma.turno}
                        </span>
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
                                <div key={aluno.id} className="notas-aluno-row notas-globalizada">
                                  <div className="notas-aluno-nome">
                                    {aluno.nome}
                                  </div>
                                  <div className="notas-nota-input">
                                    <input
                                      type="number"
                                      min="0"
                                      max="100"
                                      step="0.1"
                                      className={`notas-input-nota ${getNotaClass(getNotaAluno(aluno.id, 'globalizada'))} ${temErroValidacao(aluno.id, 'globalizada') ? 'notas-error' : ''}`}
                                      placeholder="0.0"
                                      value={getNotaAluno(aluno.id, 'globalizada')}
                                      onChange={(e) => handleNotaChange(aluno.id, 'globalizada', e.target.value)}
                                      disabled={!isEditavel}
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
                                {Object.values(disciplinas).map((disc, index) => (
                                  <span key={index}>{disc}</span>
                                ))}
                              </div>
                              {turma.alunos.map((aluno) => (
                                <div key={aluno.id} className="notas-aluno-row notas-disciplinas">
                                  <div className="notas-aluno-nome">
                                    {aluno.nome}
                                  </div>
                                  {Object.keys(disciplinas).map((discKey, index) => (
                                    <div key={index} className="notas-nota-input" data-label={disciplinas[discKey]}>
                                      <input
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        className={`notas-input-nota ${getNotaClass(getNotaAluno(aluno.id, discKey))} ${temErroValidacao(aluno.id, discKey) ? 'notas-error' : ''}`}
                                        placeholder="0.0"
                                        value={getNotaAluno(aluno.id, discKey)}
                                        onChange={(e) => handleNotaChange(aluno.id, discKey, e.target.value)}
                                        disabled={!isEditavel}
                                      />
                                    </div>
                                  ))}
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
                            >
                              <Edit3 size={16} />
                              Editar Notas
                            </button>
                          ) : (
                            <button
                              className="notas-salvar-button"
                              onClick={() => handleSalvarNotas(turma.id)}
                              title="Salvar notas"
                            >
                              <Save size={16} />
                              Salvar Notas
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

export default NotasProfe;