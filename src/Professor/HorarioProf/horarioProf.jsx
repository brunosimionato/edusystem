import React, { useState, useEffect } from "react";
import {
  Calendar,
  Printer,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader,
  AlertCircle,
} from "lucide-react";
import { useTurmas } from "../../hooks/useTurmas";
import { useDisciplinas } from "../../hooks/useDisciplinasHorarios";
import { useProfessores } from "../../hooks/useProfessores";
import { useHorarios } from "../../hooks/useHorarios";
import { gerarRelatorioHorarioProfessor } from "../../Relatorios/horariosProf";
import "./horarioProf.css";

const HorariosProfe = () => {
  const [gradeExpandida, setGradeExpandida] = useState({});
  const [isAnimating, setIsAnimating] = useState({});
  const [professorLogadoId, setProfessorLogadoId] = useState(null);

  const { turmas, isLoading: isLoadingTurmas } = useTurmas();
  const { professores, isLoading: isLoadingProfessores } = useProfessores();
  const { disciplinas, isLoading: isLoadingDisciplinas } = useDisciplinas();
  const {
    horarios: horariosExistentes,
    isLoading: isLoadingHorarios,
    usingMock,
  } = useHorarios();

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

  // Encontrar o professor logado
  useEffect(() => {
    if (professores.length > 0 && !professorLogadoId) {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const professorEncontrado = professores.find(
        (prof) => prof.idUsuario === user.id || prof.usuario?.id === user.id
      );

      if (professorEncontrado) {
        console.log("👨‍🏫 Professor logado encontrado:", professorEncontrado);
        setProfessorLogadoId(professorEncontrado.id);
      } else if (professores[0]) {
        setProfessorLogadoId(professores[0].id);
      }
    }
  }, [professores, professorLogadoId]);

  // Agrupar horários por turma
  const horariosPorTurma = horariosExistentes.reduce((acc, horario) => {
    if (!acc[horario.idTurma]) {
      acc[horario.idTurma] = [];
    }
    acc[horario.idTurma].push(horario);
    return acc;
  }, {});

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

  const handlePrintHorario = (turmaId) => {
    const professorLogado = professores.find((p) => p.id === professorLogadoId);
    const turma = turmas.find((t) => t.id == turmaId);
    const horariosDaTurma = horariosPorTurma[turmaId] || [];

    if (!professorLogado) {
      alert("Professor não encontrado");
      return;
    }

    // Organizar os dados para o relatório
    const horariosProcessados = [];

    const horariosBase =
      turma?.turno === "Manhã" ? horariosManha : horariosTarde;

    horariosBase.forEach((h) => {
      horariosProcessados.push({
        label: `${h.inicio} - ${h.fim}`,
        periodo: h.periodo,
        isBreak: !!h.isBreak,
        dias: diasSemana.map((dia) => {
          const encontrado = horariosDaTurma.find(
            (x) => x.diaSemana === dia.numero && x.periodo === h.numero
          );

          if (!encontrado || h.isBreak) {
            return h.isBreak ? { isBreak: true } : null;
          }

          const disciplinaEncontrada = disciplinas.find(
            (d) => d.id === encontrado.idDisciplina
          );
          const professorEncontrado = professores.find(
            (p) => p.id === encontrado.idProfessor
          );

          return {
            idDisciplina: encontrado.idDisciplina,
            disciplina: disciplinaEncontrada,
            professor: professorEncontrado,
          };
        }),
      });
    });

    const turmasComHorarios = [
      {
        id: turmaId,
        nome: turma?.nome,
        turno: turma?.turno,
        horariosProcessados,
      },
    ];

    const dataHoraAgora = new Date().toLocaleString("pt-BR");

    // Usar a função importada do arquivo externo
    const html = gerarRelatorioHorarioProfessor({
      professor: professorLogado,
      turmasComHorarios,
      disciplinas,
      dataHoraAgora,
    });

    const old = document.getElementById("print-frame-turma");
    if (old) old.remove();

    const iframe = document.createElement("iframe");
    iframe.id = "print-frame-turma";
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
      }, 300);
    };
  };

  const renderTabelaHorarios = (turmaId) => {
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
      <div className="table-wrapper-visualizacao">
        <table className="horarios-table-visualizacao">
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
              <tr
                key={index}
                className={horario.isBreak ? "break-row-visualizacao" : ""}
              >
                <td className="horario-cell-visualizacao">
                  <div className="horario-info-visualizacao">
                    <span className="periodo-visualizacao">
                      {horario.periodo}
                    </span>
                    <span className="tempo-visualizacao">
                      {horario.inicio} - {horario.fim}
                    </span>
                  </div>
                </td>
                {diasSemana.map((dia) => (
                  <td key={dia.numero} className="materia-cell-visualizacao">
                    {horario.isBreak ? (
                      <span className="break-text-visualizacao">
                        {horario.periodo}
                      </span>
                    ) : (
                      <div className="materia-professor-view-visualizacao">
                        {(() => {
                          const h =
                            horariosMap[`${dia.numero}_${horario.numero}`];
                          if (!h) {
                            return (
                              <>
                                <span className="materia-nome-visualizacao">
                                  -
                                </span>
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
                              <span className="materia-nome-visualizacao">
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

  const getGradeDetailsClasses = (id) => {
    const baseClasses = "grade-details-container-visualizacao";
    const isExpanded = gradeExpandida[id];
    const isAnimatingClass = isAnimating[id] ? "professor-animating" : "";

    return `${baseClasses} ${
      isExpanded ? "professor-expanded" : ""
    } ${isAnimatingClass}`;
  };

  const getGradeCardClasses = (id) => {
    const baseClasses = "grade-card-visualizacao";
    const isAnimatingClass = isAnimating[id] ? "professor-animating" : "";

    return `${baseClasses} ${isAnimatingClass}`;
  };

  const isLoading =
    isLoadingHorarios ||
    isLoadingTurmas ||
    isLoadingDisciplinas ||
    isLoadingProfessores;

  if (isLoading) {
    return (
      <div className="visualizacao-horario-container">
        <div className="loading-state-visualizacao">
          <Loader size={48} className="spinner" />
          <h4>Carregando horários...</h4>
          <p>Aguarde enquanto buscamos os horários das turmas.</p>
        </div>
      </div>
    );
  }

  const turmasComHorarios = turmas.filter(
    (turma) =>
      horariosPorTurma[turma.id] && horariosPorTurma[turma.id].length > 0
  );

  return (
    <div className="visualizacao-horario-container">
      {/* Header com informações gerais */}
      <div className="professor-header-visualizacao">
        {usingMock && (
          <div className="connection-warning-visualizacao">
            <AlertCircle size={16} />
            <span>Modo offline - usando dados locais</span>
          </div>
        )}
      </div>

      <div className="visualizacao-horario-section">
        {turmasComHorarios.length === 0 ? (
          <div className="empty-state-visualizacao">
            <div className="empty-icon-visualizacao">
              <Calendar size={48} />
            </div>
            <h4>Nenhum horário encontrado</h4>
            <p>Não há horários cadastrados para nenhuma turma no momento.</p>
            <div className="empty-state-actions">
              <p>
                Entre em contato com a secretaria para cadastrar os horários.
              </p>
            </div>
          </div>
        ) : (
          <div className="turmas-list-visualizacao">
            <div className="turmas-count-visualizacao">
              {turmasComHorarios.length} turma(s) com horários cadastrados
            </div>

            {turmasComHorarios.map((turma) => {
              const isExpandido = gradeExpandida[turma.id];

              return (
                <div key={turma.id} className={getGradeCardClasses(turma.id)}>
                  <div className="grade-info-visualizacao">
                    <div className="grade-header-visualizacao">
                      <div
                        className="grade-basic-info-container-visualizacao clickable-visualizacao"
                        onClick={() => toggleGradeExpansao(turma.id)}
                      >
                        {isExpandido ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}
                        <div className="grade-avatar-visualizacao">
                          <Clock size={24} />
                        </div>
                        <div className="grade-basic-info-visualizacao">
                          <div className="grade-nome-periodo-container">
                            <h3 className="grade-nome-visualizacao">
                              {turma.nome}
                            </h3>
                            <span
                              className={`grade-periodo-visualizacao ${
                                turma.turno === "Manhã" ? "manha" : "tarde"
                              }`}
                            >
                              {turma.turno}
                            </span>
                          </div>
                          <p className="grade-horario-visualizacao">
                            {turma.turno === "Manhã"
                              ? "07:30 - 11:15"
                              : "13:00 - 17:00"}
                          </p>
                        </div>
                      </div>

                      <div className="grade-header-actions-visualizacao">
                        <button
                          className="action-button-visualizacao print-button-visualizacao"
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrintHorario(turma.id);
                          }}
                        >
                          <Printer size={16} /> Imprimir
                        </button>
                      </div>
                    </div>

                    <div className={getGradeDetailsClasses(turma.id)}>
                      <div className="grade-content-visualizacao">
                        {renderTabelaHorarios(turma.id)}
                      </div>
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

export default HorariosProfe;
