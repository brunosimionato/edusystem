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
} from "lucide-react";

import "./horario.css";
const Horarios = () => {
  const [turmaSelecionada, setTurmaSelecionada] = useState("");
  const [turmas, setTurmas] = useState([]);
  const [periodoSelecionado, setPeriodoSelecionado] = useState("");
  const [horarios, setHorarios] = useState({});
  const [horariosGrades, setHorariosGrades] = useState([]);
  const [gradeExpandida, setGradeExpandida] = useState({});
  const [gradeEditando, setGradeEditando] = useState(null);
  const [horariosEdicao, setHorariosEdicao] = useState({});
  const [erros, setErros] = useState({
    turmaSelecionada: false,
    periodoSelecionado: false,
  });

  const horariosManha = [
    { inicio: "07:30", fim: "08:15", periodo: "1º Período" },
    { inicio: "08:15", fim: "09:00", periodo: "2º Período" },
    { inicio: "09:00", fim: "09:45", periodo: "3º Período" },
    { inicio: "09:15", fim: "09:30", periodo: "Lanche", isBreak: true },
    { inicio: "09:45", fim: "10:00", periodo: "Recreio", isBreak: true },
    { inicio: "10:00", fim: "10:45", periodo: "4º Período" },
    { inicio: "10:45", fim: "11:30", periodo: "5º Período" },
  ];

  const horariosTarde = [
    { inicio: "13:00", fim: "13:45", periodo: "1º Período" },
    { inicio: "13:45", fim: "14:30", periodo: "2º Período" },
    { inicio: "14:30", fim: "15:15", periodo: "3º Período" },
    { inicio: "15:00", fim: "14:15", periodo: "Lanche", isBreak: true },
    { inicio: "15:15", fim: "15:30", periodo: "Recreio", isBreak: true },
    { inicio: "15:30", fim: "16:15", periodo: "4º Período" },
    { inicio: "16:15", fim: "17:00", periodo: "5º Período" },
  ];

  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];

  useEffect(() => {
    const turmasSimuladas = [
      { id: 1, nome: "1º ANO A", turno: "Manhã" },
      { id: 2, nome: "1º ANO B", turno: "Manhã" },
      { id: 3, nome: "2º ANO A", turno: "Tarde" },
      { id: 4, nome: "3º ANO A", turno: "Manhã" },
      { id: 5, nome: "4º ANO A", turno: "Tarde" },
      { id: 6, nome: "5º ANO A", turno: "Manhã" },
    ];
    setTurmas(turmasSimuladas);
  }, []);

  const handleSelecionarTurma = (e) => {
    setTurmaSelecionada(e.target.value);
    setHorarios({});
  };

  
  const handleAdicionarHorario = (event) => {
    event.preventDefault();
    let temErro = false;
    const novosErros = {
      turmaSelecionada: false,
      periodoSelecionado: false,
    };

    if (!turmaSelecionada) {
      novosErros.turmaSelecionada = true;
      temErro = true;
    }

    if (!periodoSelecionado) {
      novosErros.periodoSelecionado = true;
      temErro = true;
    }

    setErros(novosErros);

    if (temErro) {
      alert("Por favor, selecione uma turma e um período.");
      return;
    }

    const turmaInfo = turmas.find((t) => t.id == turmaSelecionada);
    const novaGrade = {
      id: Date.now(),
      turmaId: turmaSelecionada,
      turma: turmaInfo?.nome || "",
      periodo: periodoSelecionado,
      horarios: { ...horarios },
    };

    setHorariosGrades((prev) => [...prev, novaGrade]);
    handleClearForm(false);
    alert("Grade de horários cadastrada com sucesso!");
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
    setHorarios({});
    setErros({
      turmaSelecionada: false,
      periodoSelecionado: false,
    });
  };

  const handleMateriaChange = (dia, index, valor, tipo) => {
    const key = `${dia}_${index}_${tipo}`;
    setHorarios((prev) => ({
      ...prev,
      [key]: valor,
    }));
  };

  const handleRemoverGrade = (id) => {
    const confirmar = window.confirm(
      "Deseja realmente remover esta grade de horários?"
    );
    if (!confirmar) return;
    setHorariosGrades((prev) => prev.filter((grade) => grade.id !== id));
  };

  const toggleGradeExpansao = (id) => {
    setGradeExpandida((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const iniciarEdicao = (grade) => {
    setGradeEditando(grade.id);
    setHorariosEdicao({ ...grade.horarios });
  };

  const salvarEdicao = (gradeId) => {
    setHorariosGrades((prev) =>
      prev.map((grade) =>
        grade.id === gradeId
          ? { ...grade, horarios: { ...horariosEdicao } }
          : grade
      )
    );
    setGradeEditando(null);
    setHorariosEdicao({});
    alert("Grade de horários atualizada com sucesso!");
  };

  const handleEditarOuSalvar = (grade) => {
    if (gradeEditando === grade.id) {
      // Está editando, então salvar
      salvarEdicao(grade.id);
    } else {
      // Não está editando, então iniciar edição
      iniciarEdicao(grade);
      setGradeExpandida((prev) => ({
        ...prev,
        [grade.id]: true,
      }));
    }
  };

  const handleMateriaEdicaoChange = (dia, index, valor, tipo) => {
    const key = `${dia}_${index}_${tipo}`;
    setHorariosEdicao((prev) => ({
      ...prev,
      [key]: valor,
    }));
  };

  const horariosAtivos =
    periodoSelecionado === "manha" ? horariosManha : horariosTarde;

  const renderTabelaHorarios = (
    horarios,
    periodo,
    isEdicao = false,
    gradeId = null
  ) => {
    const horariosParaUsar =
      periodo === "manha" ? horariosManha : horariosTarde;

    return (
      <div className="table-wrapper">
        <table className="horarios-table">
          <thead>
            <tr>
              <th>Horário</th>
              {diasSemana.map((dia) => (
                <th key={dia}>{dia}</th>
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
                  <td key={dia} className="materia-cell">
                    {horario.isBreak ? (
                      <span className="break-text">{horario.periodo}</span>
                    ) : isEdicao ? (
                      <div className="materia-professor-inputs">
                        <input
                          type="text"
                          placeholder="Matéria"
                          className="input-materia"
                          value={
                            horariosEdicao[`${dia}_${index}_materia`] || ""
                          }
                          onChange={(e) =>
                            handleMateriaEdicaoChange(
                              dia,
                              index,
                              e.target.value,
                              "materia"
                            )
                          }
                        />
                        <input
                          type="text"
                          placeholder="Professor"
                          className="input-materia"
                          value={
                            horariosEdicao[`${dia}_${index}_professor`] || ""
                          }
                          onChange={(e) =>
                            handleMateriaEdicaoChange(
                              dia,
                              index,
                              e.target.value,
                              "professor"
                            )
                          }
                        />
                      </div>
                    ) : (
                      <div className="materia-professor-view">
                        <span className="materia-nome">
                          {horarios[`${dia}_${index}_materia`] || "-"}
                        </span>
                        <span className="materia-nome">
                          {horarios[`${dia}_${index}_professor`] || ""}
                        </span>
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

  return (
    <div className="cadastro-horario-form-container">
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
                    {turmas.map((turma) => (
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
                    <option value="">Selecione um Período</option>
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
              >
                <Plus size={17} /> Cadastrar Horário
              </button>
            </div>
          </form>
        </div>

        {turmaSelecionada && (
          <div className="horarios-table-div-container">
            <div className="horarios-table-container">
              <div className="table-wrapper">
                <table className="horarios-table">
                  <thead>
                    <tr>
                      <th>Horário</th>
                      {diasSemana.map((dia) => (
                        <th key={dia}>{dia}</th>
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
                          <td key={dia} className="materia-cell">
                            {horario.isBreak ? (
                              <span className="break-text">
                                {horario.periodo}
                              </span>
                            ) : (
                              <div className="materia-professor-inputs">
                                <input
                                  type="text"
                                  placeholder="Matéria"
                                  className="input-materia"
                                  value={
                                    horarios[`${dia}_${index}_materia`] || ""
                                  }
                                  onChange={(e) =>
                                    handleMateriaChange(
                                      dia,
                                      index,
                                      e.target.value,
                                      "materia"
                                    )
                                  }
                                />
                                <input
                                  type="text"
                                  placeholder="Professor"
                                  className="input-professor"
                                  value={
                                    horarios[`${dia}_${index}_professor`] || ""
                                  }
                                  onChange={(e) =>
                                    handleMateriaChange(
                                      dia,
                                      index,
                                      e.target.value,
                                      "professor"
                                    )
                                  }
                                />
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

      <div className="cadastro-horario-form-section">
        <div className="cadastro-horario-section-header-with-button">
          <h3 className="cadastro-horario-section-header-turmas">
            Horários Cadastrados
          </h3>
        </div>

        {horariosGrades.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Calendar size={48} />
            </div>
            <h4>Nenhum horário cadastrado</h4>
            <p>Cadastre o primeiro horário usando o formulário acima.</p>
          </div>
        ) : (
          <div className="turmas-list">
            {horariosGrades.map((grade) => {
              const isExpandido = gradeExpandida[grade.id];

              return (
                <div key={grade.id} className="grade-card">
                  <div className="grade-info">
                    {/* Header com informações e botões */}
                    <div className="grade-header">
                      {/* Lado esquerdo: ícone de expansão + avatar + info */}
                      <div
                        className="grade-basic-info-container clickable"
                        onClick={() => toggleGradeExpansao(grade.id)}
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
                          <h3 className="grade-nome">{grade.turma}</h3>
                          <p className="grade-periodo">
                            {grade.periodo === "manha"
                              ? "Manhã (07:30 - 11:15)"
                              : "Tarde (13:00 - 17:00)"}
                          </p>
                        </div>
                      </div>

                      {/* Lado direito: botões */}
                      <div className="grade-header-actions">
                        <button
                          className={`action-button-horarios ${
                            gradeEditando === grade.id
                              ? "save-button-horarios"
                              : "edit-button-horarios"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditarOuSalvar(grade);
                          }}
                        >
                          {gradeEditando === grade.id ? (
                            <>
                              <Save size={16} /> Salvar
                            </>
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
                            handleRemoverGrade(grade.id);
                          }}
                        >
                          <Trash2 size={17} /> Remover
                        </button>
                        <button
                          className="action-button-horarios print-button-horarios"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.print();
                          }}
                        >
                          <Printer size={16} /> Imprimir
                        </button>
                      </div>
                    </div>

                    {/* Detalhes expandidos */}
                    {isExpandido && (
                      <div className="grade-details-container">
                        <div className="grade-content">
                          {renderTabelaHorarios(
                            gradeEditando === grade.id
                              ? horariosEdicao
                              : grade.horarios,
                            grade.periodo,
                            gradeEditando === grade.id,
                            grade.id
                          )}
                        </div>
                      </div>
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

export default Horarios;