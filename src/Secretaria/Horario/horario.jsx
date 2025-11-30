import React, { useState, useEffect } from "react";
import {
  Calendar,
  Plus,
  XCircle,
  Printer,
  Edit,
  ChevronDown,
  ChevronRight,
  Trash2,
  Clock,
  Save,
  Loader,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

import "./horario.css";
import { useTurmasParaHorarios } from "../../hooks/useTurmasParaHorarios";
import { useProfessores } from "../../hooks/useProfessores";
import { useDisciplinas } from "../../hooks/useDisciplinasHorarios";
import { useHorarios } from "../../hooks/useHorarios";
import { gerarRelatorioHorarioTurma } from "../../Relatorios/horarios";

const Horarios = () => {
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [periodoSelecionado, setPeriodoSelecionado] = useState("manha");
  const [horariosInput, setHorariosInput] = useState({});
  const [gradeExpandida, setGradeExpandida] = useState({});
  const [gradeEditando, setGradeEditando] = useState(null);
  const [horariosEdicao, setHorariosEdicao] = useState({});
  const [erros, setErros] = useState({
    turmaSelecionada: false,
    periodoSelecionado: false,
  });
  const [isAnimating, setIsAnimating] = useState({});
  const [turmaSalva, setTurmaSalva] = useState(null);
  const [horariosPorTurma, setHorariosPorTurma] = useState({});
  const [salvandoTurma, setSalvandoTurma] = useState(null);

  const {
    turmas,
    isLoading: isLoadingTurmas,
    error: errorTurmas,
  } = useTurmasParaHorarios();
  const { professores, isLoading: isLoadingProfessores } = useProfessores();
  const { disciplinas, isLoading: isLoadingDisciplinas } = useDisciplinas();
  const {
    horarios: horariosExistentes,
    isLoading: isLoadingHorarios,
    createHorario,
    updateHorario,
    deleteHorario,
    refetch: refetchHorarios,
    usingMock,
    tryReconnect,
  } = useHorarios();

  // Recalcular horariosPorTurma quando horariosExistentes mudar
  useEffect(() => {
    const horariosAgrupados = horariosExistentes.reduce((acc, horario) => {
      if (!acc[horario.idTurma]) {
        acc[horario.idTurma] = [];
      }
      acc[horario.idTurma].push(horario);
      return acc;
    }, {});
    setHorariosPorTurma(horariosAgrupados);
  }, [horariosExistentes]);

  const horariosManha = [
    { inicio: "07:30", fim: "08:15", periodo: "1º Período", numero: 1 },
    { inicio: "08:15", fim: "09:00", periodo: "2º Período", numero: 2 },
    { inicio: "09:00", fim: "09:45", periodo: "3º Período", numero: 3 },
    { inicio: "09:15", fim: "09:30", periodo: "Lanche", isBreak: true },
    { inicio: "09:45", fim: "10:00", periodo: "Recreio", isBreak: true },
    { inicio: "10:00", fim: "10:45", periodo: "4º Período", numero: 4 },
    { inicio: "10:45", fim: "11:30", periodo: "5º Período", numero: 5 },
  ];

  const horariosTarde = [
    { inicio: "13:00", fim: "13:45", periodo: "1º Período", numero: 1 },
    { inicio: "13:45", fim: "14:30", periodo: "2º Período", numero: 2 },
    { inicio: "14:30", fim: "15:15", periodo: "3º Período", numero: 3 },
    { inicio: "15:00", fim: "15:15", periodo: "Lanche", isBreak: true },
    { inicio: "15:15", fim: "15:30", periodo: "Recreio", isBreak: true },
    { inicio: "15:30", fim: "16:15", periodo: "4º Período", numero: 4 },
    { inicio: "16:15", fim: "17:00", periodo: "5º Período", numero: 5 },
  ];

  const diasSemana = [
    { nome: "Segunda", numero: 1 },
    { nome: "Terça", numero: 2 },
    { nome: "Quarta", numero: 3 },
    { nome: "Quinta", numero: 4 },
    { nome: "Sexta", numero: 5 },
  ];

  const handleSelecionarTurma = (e) => {
    setTurmaSelecionada(e.target.value);
    setHorariosInput({});
  };

  const handleAdicionarHorario = async (event) => {
    event.preventDefault();

    if (!turmaSelecionada || !periodoSelecionado) {
      setErros({
        turmaSelecionada: !turmaSelecionada,
        periodoSelecionado: !periodoSelecionado,
      });
      alert("Por favor, selecione uma turma e um período.");
      return;
    }

    try {
      const horariosParaCriar = [];
      const horariosAtivos =
        periodoSelecionado === "manha" ? horariosManha : horariosTarde;

      diasSemana.forEach((dia) => {
        horariosAtivos.forEach((horario) => {
          if (!horario.isBreak) {
            const materiaKey = `${dia.numero}_${horario.numero}_materia`;
            const professorKey = `${dia.numero}_${horario.numero}_professor`;

            const disciplinaId = horariosInput[materiaKey];
            const professorId = horariosInput[professorKey];

            if (disciplinaId && professorId) {
              horariosParaCriar.push({
                idTurma: parseInt(turmaSelecionada),
                idProfessor: parseInt(professorId),
                idDisciplina: parseInt(disciplinaId),
                diaSemana: dia.numero,
                periodo: horario.numero,
              });
            }
          }
        });
      });

      if (horariosParaCriar.length === 0) {
        alert("Por favor, preencha pelo menos um horário antes de salvar.");
        return;
      }

      let horariosCriados = 0;
      let errosCriacao = [];

      for (const horarioData of horariosParaCriar) {
        try {
          await createHorario(horarioData);
          horariosCriados++;
        } catch (error) {
          console.error(`Erro ao criar horário:`, horarioData, error);
          errosCriacao.push(
            `Erro no ${horarioData.diaSemana}º dia, ${horarioData.periodo}º período: ${error.message}`
          );
        }
      }

      if (errosCriacao.length > 0) {
        alert(
          `Alguns horários foram criados (${horariosCriados}), mas ocorreram erros:\n\n${errosCriacao.join(
            "\n"
          )}`
        );
      } else {
        alert(
          `Grade de horários cadastrada com sucesso! ${horariosCriados} horários criados.`
        );
      }

      handleClearForm(false);
      refetchHorarios();
    } catch (error) {
      console.error("Erro ao processar horários:", error);
      alert(`Erro ao salvar horários: ${error.message}`);
    }
  };

  const handleClearForm = (confirmar = true) => {
    if (confirmar) {
      const querLimpar = window.confirm(
        "Tem certeza que deseja limpar o formulário?"
      );
      if (!querLimpar) return;
    }

    setTurmaSelecionada("");
    setPeriodoSelecionado("manha");
    setHorariosInput({});
    setErros({
      turmaSelecionada: false,
      periodoSelecionado: false,
    });
  };

  const handleMateriaChange = (diaNumero, periodoNumero, valor, tipo) => {
    const key = `${diaNumero}_${periodoNumero}_${tipo}`;
    setHorariosInput((prev) => ({
      ...prev,
      [key]: valor,
    }));
  };

  const handleRemoverGrade = async (turmaId) => {
    const confirmar = window.confirm(
      "Deseja realmente remover todos os horários desta turma?"
    );
    if (!confirmar) return;

    try {
      const horariosDaTurma = horariosPorTurma[turmaId] || [];

      for (const horario of horariosDaTurma) {
        await deleteHorario(horario.id);
      }

      alert("Horários removidos com sucesso!");
      refetchHorarios();
    } catch (error) {
      console.error("Erro ao remover horários:", error);
      alert(`Erro ao remover horários: ${error.message}`);
    }
  };

  const toggleGradeExpansao = (turmaId) => {
    if (isAnimating[turmaId]) return;

    setIsAnimating((prev) => ({ ...prev, [turmaId]: true }));
    setGradeExpandida((prev) => ({
      ...prev,
      [turmaId]: !prev[turmaId],
    }));

    setTimeout(() => {
      setIsAnimating((prev) => ({ ...prev, [turmaId]: false }));
    }, 300);
  };

  const iniciarEdicao = (turmaId) => {
    setGradeEditando(turmaId);
    const horariosDaTurma = horariosPorTurma[turmaId] || [];
    const horariosMap = {};

    horariosDaTurma.forEach((h) => {
      horariosMap[`${h.diaSemana}_${h.periodo}_materia`] = h.idDisciplina;
      horariosMap[`${h.diaSemana}_${h.periodo}_professor`] = h.idProfessor;
    });

    setHorariosEdicao(horariosMap);
  };

  const salvarEdicao = async (turmaId) => {
    setSalvandoTurma(turmaId);

    try {
      const turma = turmas.find((t) => t.id == turmaId);
      const horariosAtivos =
        turma?.turno?.toLowerCase() === "manhã" ? horariosManha : horariosTarde;

      const horariosParaCriar = [];

      diasSemana.forEach((dia) => {
        horariosAtivos.forEach((horario) => {
          if (!horario.isBreak) {
            const materiaKey = `${dia.numero}_${horario.numero}_materia`;
            const professorKey = `${dia.numero}_${horario.numero}_professor`;

            const disciplinaId = horariosEdicao[materiaKey];
            const professorId = horariosEdicao[professorKey];

            if (disciplinaId && professorId) {
              horariosParaCriar.push({
                idTurma: parseInt(turmaId),
                idProfessor: parseInt(professorId),
                idDisciplina: parseInt(disciplinaId),
                diaSemana: dia.numero,
                periodo: horario.numero,
              });
            }
          }
        });
      });

      const horariosAntigos = horariosPorTurma[turmaId] || [];

      // Primeiro deleta os horários antigos
      for (const horario of horariosAntigos) {
        await deleteHorario(horario.id);
      }

      // Depois cria os novos horários
      for (const horarioData of horariosParaCriar) {
        await createHorario(horarioData);
      }

      // PRIMEIRO: Atualiza o estado para sair do modo de edição
      setGradeEditando(null);
      setHorariosEdicao({});

      // DEPOIS: Recarrega os horários em segundo plano
      refetchHorarios();

      // FINALMENTE: Mostra o alerta (não bloqueante)
      setTimeout(() => {
        alert("Horários atualizados com sucesso!");
      }, 100);
    } catch (error) {
      console.error("Erro ao atualizar horários:", error);
      alert(`Erro ao atualizar horários: ${error.message}`);

      // Em caso de erro, também sai do modo de edição
      setGradeEditando(null);
      setHorariosEdicao({});
    } finally {
      setSalvandoTurma(null);
    }
  };

  const handleEditarOuSalvar = (turmaId) => {
    if (gradeEditando === turmaId) {
      salvarEdicao(turmaId);
    } else {
      iniciarEdicao(turmaId);
      setGradeExpandida((prev) => ({
        ...prev,
        [turmaId]: true,
      }));
    }
  };

  const handleMateriaEdicaoChange = (diaNumero, periodoNumero, valor, tipo) => {
    const key = `${diaNumero}_${periodoNumero}_${tipo}`;
    setHorariosEdicao((prev) => ({
      ...prev,
      [key]: valor,
    }));
  };

  const handlePrintHorario = (turmaId) => {
    const turma = turmas.find((t) => t.id == turmaId);
    const horariosDaTurma = horariosPorTurma[turmaId] || [];

    const horariosProcessados = [];

    const horariosBase =
      turma.turno === "Manhã" ? horariosManha : horariosTarde;

    horariosBase.forEach((h) => {
      horariosProcessados.push({
        label: `${h.inicio} - ${h.fim}`,
        isBreak: !!h.isBreak,
        dias: diasSemana.map((dia) => {
          const encontrado = horariosDaTurma.find(
            (x) => x.diaSemana === dia.numero && x.periodo === h.numero
          );

          return h.isBreak ? null : encontrado || null;
        }),
      });
    });

    const dataHoraAgora = new Date().toLocaleString("pt-BR");

    const html = gerarRelatorioHorarioTurma({
      turma,
      horarios: horariosProcessados,
      professores,
      disciplinas,
      dataHoraAgora,
    });

    const old = document.getElementById("print-frame");
    if (old) old.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "print-frame";
    iframe.style.position = "fixed";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow.document;
    doc.open();
    doc.write(html);
    doc.close();

    iframe.onload = () => {
      setTimeout(() => {
        doc.defaultView.print();
      }, 200);
    };
  };

  const handleReconectar = async () => {
    try {
      const reconectado = await tryReconnect();
      if (reconectado) {
        alert("Conexão com o servidor restaurada!");
        refetchHorarios();
      } else {
        alert(
          "Não foi possível conectar com o servidor. Verifique sua conexão."
        );
      }
    } catch (error) {
      console.error("Erro ao reconectar:", error);
      alert("Erro ao tentar reconectar com o servidor.");
    }
  };

  const horariosAtivos =
    periodoSelecionado === "manha" ? horariosManha : horariosTarde;

  const turmasDisponiveis = turmas.filter(
    (turma) =>
      !horariosPorTurma[turma.id] || horariosPorTurma[turma.id].length === 0
  );

  const renderTabelaHorarios = (turmaId, isEdicao = false) => {
    const turma = turmas.find((t) => t.id == turmaId);
    const periodo = turma?.turno?.toLowerCase() === "manhã" ? "manha" : "tarde";
    const horariosParaUsar =
      periodo === "manha" ? horariosManha : horariosTarde;
    const horariosDaTurma = horariosPorTurma[turmaId] || [];

    const horariosMap = {};
    horariosDaTurma.forEach((h) => {
      const key = `${h.diaSemana}_${h.periodo}`;
      horariosMap[key] = h;
    });

    return (
      <div className="table-wrapper">
        <table className="horarios-table">
          <thead>
            <tr>
              <th>Horário</th>
              {diasSemana.map((dia) => (
                <th key={dia.numero}>{dia.nome}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {horariosParaUsar.map((horario, index) => (
              <tr key={index} className={horario.isBreak ? "break-row" : ""}>
                <td className="horario-cell">
                  <div className="horario-info">
                    <span className="periodo">{horario.periodo}</span>
                    <span className="tempo">
                      {horario.inicio} - {horario.fim}
                    </span>
                  </div>
                </td>
                {diasSemana.map((dia) => (
                  <td key={dia.numero} className="materia-cell">
                    {horario.isBreak ? (
                      <span className="break-text">{horario.periodo}</span>
                    ) : isEdicao ? (
                      <div className="materia-professor-inputs">
                        <select
                          className="input-materia"
                          value={
                            horariosEdicao[
                              `${dia.numero}_${horario.numero}_materia`
                            ] || ""
                          }
                          onChange={(e) =>
                            handleMateriaEdicaoChange(
                              dia.numero,
                              horario.numero,
                              e.target.value,
                              "materia"
                            )
                          }
                        >
                          <option value="">Selecione a disciplina</option>
                          {disciplinas.map((disciplina) => (
                            <option key={disciplina.id} value={disciplina.id}>
                              {disciplina.nome}
                            </option>
                          ))}
                        </select>
                        <select
                          className="input-materia"
                          value={
                            horariosEdicao[
                              `${dia.numero}_${horario.numero}_professor`
                            ] || ""
                          }
                          onChange={(e) =>
                            handleMateriaEdicaoChange(
                              dia.numero,
                              horario.numero,
                              e.target.value,
                              "professor"
                            )
                          }
                        >
                          <option value="">Selecione o professor</option>
                          {professores.map((professor) => (
                            <option key={professor.id} value={professor.id}>
                              {professor.usuario?.nome || professor.nome}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : (
                      <div className="materia-professor-view">
                        {(() => {
                          const h =
                            horariosMap[`${dia.numero}_${horario.numero}`];
                          if (!h) {
                            return (
                              <>
                                <span className="materia-nome">-</span>
                                <span className="professor-nome-visualizacao"></span>
                              </>
                            );
                          }

                          const disciplinaEncontrada = disciplinas.find(
                            (d) => d.id === h.idDisciplina
                          );
                          const professorEncontrado = professores.find(
                            (p) => p.id === h.idProfessor
                          );

                          return (
                            <>
                              <span className="materia-nome">
                                {disciplinaEncontrada?.nome ||
                                  h.disciplina?.nome ||
                                  `Disciplina ${h.idDisciplina}`}
                              </span>
                              <span className="professor-nome-visualizacao">
                                {professorEncontrado?.usuario?.nome ||
                                  professorEncontrado?.nome ||
                                  h.professor?.usuario?.nome ||
                                  `Professor ${h.idProfessor}`}
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (isLoadingTurmas) {
    return (
      <div className="cadastro-horario-form-container">
        <div className="loading-state">
          <Loader size={48} className="spinner" />
          <h4>Carregando dados...</h4>
          <p>Aguarde enquanto buscamos as turmas e professores.</p>
        </div>
      </div>
    );
  }

  if (errorTurmas) {
    return (
      <div className="cadastro-horario-form-container">
        <div className="error-state">
          <AlertCircle size={48} />
          <h4>Erro ao carregar dados</h4>
          <p>Não foi possível carregar as turmas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-horario-form-container">
      {/* Status de conexão */}
      {usingMock && (
        <div className="connection-status">
          <div className="connection-warning">
            <AlertCircle size={16} />
            <span>Modo offline - usando dados locais</span>
            <button onClick={handleReconectar} className="reconnect-btn">
              <RefreshCw size={14} />
              Reconectar
            </button>
          </div>
        </div>
      )}

      {/* FORMULÁRIO DE NOVO HORÁRIO */}
      <div className="cadastro-horario-form-section">
        <h3 className="cadastro-horario-section-header">Novo Horário</h3>

        <div className="form-fields-container">
          <form onSubmit={handleAdicionarHorario}>
            <div className="cadastro-horario-form-grid">
              <div className="cadastro-horario-form-group half-width">
                <label htmlFor="turma">Turma*</label>
                <div className="cadastro-horario-input-wrapper">
                  <select
                    id="turma"
                    className={`cadastro-horario-select ${
                      erros.turmaSelecionada ? "input-error" : ""
                    }`}
                    value={turmaSelecionada}
                    onChange={handleSelecionarTurma}
                  >
                    <option value="">Selecione uma turma</option>
                    {turmasDisponiveis.map((turma) => (
                      <option key={turma.id} value={turma.id}>
                        {turma.nome} - {turma.turno}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="cadastro-horario-form-group half-width">
                <label htmlFor="periodo">Período*</label>
                <div className="cadastro-horario-input-wrapper">
                  <select
                    id="periodo"
                    className={`cadastro-horario-select ${
                      erros.periodoSelecionado ? "input-error" : ""
                    }`}
                    value={periodoSelecionado}
                    onChange={(e) => setPeriodoSelecionado(e.target.value)}
                  >
                    <option value="manha">Manhã (07:30 - 11:15)</option>
                    <option value="tarde">Tarde (13:00 - 17:00)</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="cadastro-horario-form-actions">
              <button
                type="button"
                className="cadastro-horario-clear-button red-button"
                onClick={() => handleClearForm(true)}
              >
                <XCircle size={17} /> Limpar
              </button>
              <button
                type="submit"
                className="cadastro-horario-submit-button blue-button"
                disabled={isLoadingHorarios}
              >
                {isLoadingHorarios ? (
                  <>
                    <Loader size={17} className="spinner" /> Salvando...
                  </>
                ) : (
                  <>
                    <Plus size={17} /> Cadastrar Horário
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* TABELA DE HORÁRIOS PARA PREENCHIMENTO */}
        {turmaSelecionada && (
          <div className="horarios-table-div-container">
            <div className="horarios-table-container">
              <div className="table-wrapper">
                <table className="horarios-table">
                  <thead>
                    <tr>
                      <th>Horário</th>
                      {diasSemana.map((dia) => (
                        <th key={dia.numero}>{dia.nome}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {horariosAtivos.map((horario, index) => (
                      <tr
                        key={index}
                        className={horario.isBreak ? "break-row" : ""}
                      >
                        <td className="horario-cell">
                          <div className="horario-info">
                            <span className="periodo">{horario.periodo}</span>
                            <span className="tempo">
                              {horario.inicio} - {horario.fim}
                            </span>
                          </div>
                        </td>
                        {diasSemana.map((dia) => (
                          <td key={dia.numero} className="materia-cell">
                            {horario.isBreak ? (
                              <span className="break-text">
                                {horario.periodo}
                              </span>
                            ) : (
                              <div className="materia-professor-inputs">
                                <select
                                  className="input-materia"
                                  value={
                                    horariosInput[
                                      `${dia.numero}_${horario.numero}_materia`
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleMateriaChange(
                                      dia.numero,
                                      horario.numero,
                                      e.target.value,
                                      "materia"
                                    )
                                  }
                                >
                                  <option value="">
                                    Selecione a disciplina
                                  </option>
                                  {disciplinas.map((disciplina) => (
                                    <option
                                      key={disciplina.id}
                                      value={disciplina.id}
                                    >
                                      {disciplina.nome}
                                    </option>
                                  ))}
                                </select>
                                <select
                                  className="input-professor"
                                  value={
                                    horariosInput[
                                      `${dia.numero}_${horario.numero}_professor`
                                    ] || ""
                                  }
                                  onChange={(e) =>
                                    handleMateriaChange(
                                      dia.numero,
                                      horario.numero,
                                      e.target.value,
                                      "professor"
                                    )
                                  }
                                >
                                  <option value="">
                                    Selecione o professor
                                  </option>
                                  {professores.map((professor) => (
                                    <option
                                      key={professor.id}
                                      value={professor.id}
                                    >
                                      {professor.usuario?.nome ||
                                        professor.nome}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HORÁRIOS CADASTRADOS */}
      <div className="cadastro-horario-form-section">
        <div className="cadastro-horario-section-header-with-button">
          <h3 className="cadastro-horario-section-header-turmas">
            Horários Cadastrados
          </h3>
        </div>

        {isLoadingHorarios ? (
          <div className="loading-state">
            <Loader size={32} className="spinner" />
            <p>Carregando horários...</p>
          </div>
        ) : Object.keys(horariosPorTurma).length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={48} />
            </div>
            <h4>Nenhum horário cadastrado</h4>
            <p>Cadastre o primeiro horário usando o formulário acima.</p>
          </div>
        ) : (
          <div className="turmas-list">
            {Object.entries(horariosPorTurma).map(
              ([turmaId, horariosDaTurma]) => {
                const turma = turmas.find((t) => t.id == turmaId);
                const isExpandido = gradeExpandida[turmaId];
                const foiSalvaAgora = turmaSalva === turmaId;
                const estaSalvando = salvandoTurma === turmaId;

                return (
                  <div
                    key={turmaId}
                    className={`grade-card ${
                      isAnimating[turmaId] ? "professor-animating" : ""
                    }`}
                  >
                    <div className="grade-info">
                      <div className="grade-header">
                        <div
                          className={`grade-basic-info-container clickable ${
                            foiSalvaAgora ? "grade-header-salvo" : ""
                          }`}
                          onClick={() => toggleGradeExpansao(turmaId)}
                        >
                          {isExpandido ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                          <div className="grade-avatar">
                            <Clock size={24} />
                          </div>
                          <div className="grade-basic-info">
                            <h3 className="grade-nome">
                              {turma?.nome || `Turma ${turmaId}`}
                            </h3>
                            <p className="grade-periodo">
                              {turma?.turno === "Manhã"
                                ? "Manhã (07:30 - 11:15)"
                                : "Tarde (13:00 - 17:00)"}
                            </p>
                          </div>
                        </div>

                        <div className="grade-header-actions">
                          <button
                            className={`action-button-horarios ${
                              gradeEditando === turmaId
                                ? "save-button-horarios"
                                : "edit-button-horarios"
                            }`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarOuSalvar(turmaId);
                            }}
                            disabled={estaSalvando}
                          >
                            {gradeEditando === turmaId ? (
                              estaSalvando ? (
                                <>
                                  <Loader size={16} className="spinner" />{" "}
                                  Salvando...
                                </>
                              ) : (
                                <>
                                  <Save size={16} /> Salvar
                                </>
                              )
                            ) : (
                              <>
                                <Edit size={16} /> Editar
                              </>
                            )}
                          </button>
                          <button
                            className="action-button-horarios remove-button-horarios"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleRemoverGrade(turmaId);
                            }}
                            disabled={estaSalvando}
                          >
                            <Trash2 size={17} /> Remover
                          </button>
                          <button
                            className="action-button-horarios print-button-horarios"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePrintHorario(turmaId);
                            }}
                            disabled={estaSalvando}
                          >
                            <Printer size={16} /> Imprimir
                          </button>
                        </div>
                      </div>

                      <div
                        className={`grade-details-container ${
                          isExpandido ? "professor-expanded" : ""
                        } ${isAnimating[turmaId] ? "professor-animating" : ""}`}
                      >
                        <div className="grade-content">
                          {renderTabelaHorarios(
                            turmaId,
                            gradeEditando === turmaId
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Horarios;
