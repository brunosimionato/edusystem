import React, { useState, useMemo } from "react";
import {
  Search,
  Save,
  ChevronDown,
  ChevronRight,
  Edit3,
  Users,
} from "lucide-react";
import "./faltasProf.css";

const FaltasProfessor = () => {
  const [filtro, setFiltro] = useState("");
  const [turmasExpandidas, setTurmasExpandidas] = useState(new Set());
  const [turmasEditaveis, setTurmasEditaveis] = useState(new Set());
  const [anoLetivo, setAnoLetivo] = useState("2024");
  const [dataSelecionada, setDataSelecionada] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [faltas, setFaltas] = useState({});
  const [errosValidacao, setErrosValidacao] = useState(new Set());

  // Períodos de aula para Fundamental II
  const periodos = {
    1: "1º Período",
    2: "2º Período", 
    3: "3º Período",
    4: "4º Período",
    5: "5º Período"
  };

  // Dados mockados das turmas e alunos (mesmo do modelo de notas)
  const turmas = [
    // Ensino Fundamental I (1º ao 5º ano)
    {
      id: 1,
      nome: "1º ANO A",
      turno: "manhã",
      tipo: "fundamental1",
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
    // Ensino Fundamental II (6º ao 9º ano)
    {
      id: 4,
      nome: "6º ANO A",
      turno: "manhã",
      tipo: "fundamental2",
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
  }, [filtro]);

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
      manhã: "fp-turno-manhã",
      tarde: "fp-turno-tarde",
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
    
    setFaltas(prev => ({
      ...prev,
      [chave]: faltou
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
    const dataObj = new Date(data + 'T00:00:00');
    return dataObj.toLocaleDateString('pt-BR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleSalvarFaltas = (turmaId) => {
    console.log("Salvando faltas da turma:", turmaId, "Data:", dataSelecionada);
    console.log("Faltas:", faltas);
    
    // Remove do modo edição após salvar
    setTurmasEditaveis(prev => {
      const novaSet = new Set(prev);
      novaSet.delete(turmaId);
      return novaSet;
    });
    
    alert("Faltas salvas com sucesso!");
  };

  // Calcular estatísticas de presença para uma turma
  const getEstatisticasTurma = (turma) => {
    const totalAlunos = turma.alunos.length;
    
    if (turma.tipo === "fundamental1") {
      // Fundamental I - uma falta por dia
      const alunosFaltosos = turma.alunos.filter(aluno => getFaltaAluno(aluno.id)).length;
      const alunosPresentes = totalAlunos - alunosFaltosos;
      const percentualPresenca = totalAlunos > 0 ? (alunosPresentes / totalAlunos * 100).toFixed(1) : 0;
      
      return {
        total: totalAlunos,
        presentes: alunosPresentes,
        faltosos: alunosFaltosos,
        percentual: percentualPresenca,
        tipo: "dia"
      };
    } else {
      // Fundamental II - faltas por período
      let totalFaltas = 0;
      let alunosComFalta = 0;
      
      turma.alunos.forEach(aluno => {
        const faltasPorPeriodo = Object.keys(periodos).filter(periodo => 
          getFaltaAluno(aluno.id, periodo)
        ).length;
        
        if (faltasPorPeriodo > 0) {
          alunosComFalta++;
          totalFaltas += faltasPorPeriodo;
        }
      });
      
      const alunosPresentes = totalAlunos - alunosComFalta;
      const percentualPresenca = totalAlunos > 0 ? (alunosPresentes / totalAlunos * 100).toFixed(1) : 0;
      
      return {
        total: totalAlunos,
        presentes: alunosPresentes,
        faltosos: alunosComFalta,
        totalFaltasPeriodo: totalFaltas,
        percentual: percentualPresenca,
        tipo: "periodo"
      };
    }
  };

  return (
    <div className="fp-container">
      {/* Seção de Filtros */}
      <div className="fp-form-section">
        <div className="fp-section-header">
          <span>Filtros e Configurações</span>
        </div>
        <div className="fp-form-grid">
          <div className="fp-form-group fp-third-width">
            <label>Ano Letivo</label>
            <select
              className="fp-select"
              value={anoLetivo}
              onChange={(e) => setAnoLetivo(e.target.value)}
            >
              <option value="2024">2024</option>
              <option value="2023">2023</option>
              <option value="2022">2022</option>
            </select>
          </div>
          <div className="fp-form-group fp-third-width">
            <label>Data da Aula</label>
            <input
              type="date"
              className="fp-input"
              value={dataSelecionada}
              onChange={(e) => setDataSelecionada(e.target.value)}
            />
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
              />
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Turmas */}
      <div className="fp-form-section">
        <div className="fp-section-header">
          <span>Registro de Faltas - {anoLetivo} - {formatarData(dataSelecionada)}</span>
          <span className="fp-counter">
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
          <div className="fp-turmas-list">
            {turmasFiltradas.map((turma) => {
              const isExpandida = turmasExpandidas.has(turma.id);
              const isEditavel = turmasEditaveis.has(turma.id);
              const stats = getEstatisticasTurma(turma);
              
              return (
                <div key={turma.id} className="fp-turma-card">
                  <div className="fp-turma-info">
                    <div className="fp-turma-header">
                      <div 
                        className="fp-turma-header-left fp-clickable"
                        onClick={() => toggleTurma(turma.id)}
                      >
                        {isExpandida ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                        <h3 className="fp-turma-nome">{turma.nome}</h3>
                        <span className={`fp-turno ${getTurnoClass(turma.turno)}`}>
                          {turma.turno}
                        </span>
                      </div>
                    </div>
                    
                    {/* Lista de Alunos Expandida */}
                    {isExpandida && (
                      <>
                        <div className="fp-table-container">
                          {/* Fundamental I - Uma falta por dia */}
                          {turma.tipo === "fundamental1" && (
                            <>
                              <div className="fp-table-header fp-globalizada">
                                <span>Nome do Aluno</span>
                                <span>Presente</span>
                                <span>Faltou</span>
                              </div>
                              {turma.alunos.map((aluno) => {
                                const faltou = getFaltaAluno(aluno.id);
                                return (
                                  <div key={aluno.id} className="fp-aluno-row fp-globalizada">
                                    <div className="fp-aluno-nome">
                                      {aluno.nome}
                                    </div>
                                    <div className="fp-checkbox-container">
                                      <label className="fp-checkbox-wrapper">
                                        <input
                                          type="radio"
                                          name={`presenca-${aluno.id}`}
                                          className="fp-radio-input"
                                          checked={!faltou}
                                          onChange={() => handleFaltaChange(aluno.id, false)}
                                          disabled={!isEditavel}
                                        />
                                        <span className="fp-radio-custom fp-presente"></span>
                                      </label>
                                    </div>
                                    <div className="fp-checkbox-container">
                                      <label className="fp-checkbox-wrapper">
                                        <input
                                          type="radio"
                                          name={`presenca-${aluno.id}`}
                                          className="fp-radio-input"
                                          checked={faltou}
                                          onChange={() => handleFaltaChange(aluno.id, true)}
                                          disabled={!isEditavel}
                                        />
                                        <span className="fp-radio-custom fp-falta"></span>
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
                              <div className="fp-table-header fp-periodos">
                                <span>Nome do Aluno</span>
                                {Object.values(periodos).map((periodo, index) => (
                                  <span key={index}>{periodo}</span>
                                ))}
                              </div>
                              {turma.alunos.map((aluno) => (
                                <div key={aluno.id} className="fp-aluno-row fp-periodos">
                                  <div className="fp-aluno-nome">
                                    {aluno.nome}
                                  </div>
                                  {Object.keys(periodos).map((periodoKey, index) => (
                                    <div key={index} className="fp-periodo-container" data-label={periodos[periodoKey]}>
                                      <div className="fp-periodo-opcoes">
                                        <label className="fp-checkbox-wrapper fp-mini">
                                          <input
                                            type="radio"
                                            name={`presenca-${aluno.id}-${periodoKey}`}
                                            className="fp-radio-input"
                                            checked={!getFaltaAluno(aluno.id, periodoKey)}
                                            onChange={() => handleFaltaChange(aluno.id, false, periodoKey)}
                                            disabled={!isEditavel}
                                          />
                                          <span className="fp-radio-custom fp-presente fp-mini"></span>
                                        </label>
                                        <label className="fp-checkbox-wrapper fp-mini">
                                          <input
                                            type="radio"
                                            name={`presenca-${aluno.id}-${periodoKey}`}
                                            className="fp-radio-input"
                                            checked={getFaltaAluno(aluno.id, periodoKey)}
                                            onChange={() => handleFaltaChange(aluno.id, true, periodoKey)}
                                            disabled={!isEditavel}
                                          />
                                          <span className="fp-radio-custom fp-falta fp-mini"></span>
                                        </label>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              ))}
                            </>
                          )}
                        </div>

                        {/* Botões de Ação da Tabela */}
                        <div className="fp-table-actions">
                          {!isEditavel ? (
                            <button
                              className="fp-editar-button"
                              onClick={() => toggleEdicao(turma.id)}
                              title="Editar faltas"
                            >
                              <Edit3 size={16} />
                              Editar Faltas
                            </button>
                          ) : (
                            <button
                              className="fp-salvar-button"
                              onClick={() => handleSalvarFaltas(turma.id)}
                              title="Salvar faltas"
                            >
                              <Save size={16} />
                              Salvar Faltas
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

export default FaltasProfessor;