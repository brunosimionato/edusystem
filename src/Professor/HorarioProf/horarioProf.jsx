import React, { useState, useEffect } from "react";
import {
  Calendar,
  Printer,
  ChevronDown,
  ChevronRight,
  Clock,
  Loader,
  AlertCircle,
  User,
} from "lucide-react";
import { useHorariosPorProfessor } from "../../hooks/useHorarios";
import { useTurmas } from "../../hooks/useTurmas";
import { useDisciplinas } from "../../hooks/useDisciplinasHorarios";
import { useProfessores } from "../../hooks/useProfessores";
import { gerarRelatorioHorarioProfessor } from "../../Relatorios/horariosProf";
import "./horarioProf.css";

const HorariosProfe = () => {
  const [horariosGrades, setHorariosGrades] = useState([]);
  const [gradeExpandida, setGradeExpandida] = useState({});
  const [professorLogadoId, setProfessorLogadoId] = useState(null);

  const { professores, isLoading: isLoadingProfessores } = useProfessores();
  const {
    horarios: horariosExistentes,
    isLoading: isLoadingHorarios,
    error: errorHorarios,
    usingMock,
  } = useHorariosPorProfessor(professorLogadoId);

  const { turmas, isLoading: isLoadingTurmas } = useTurmas();
  const { disciplinas, isLoading: isLoadingDisciplinas } = useDisciplinas();

  const horariosManhã = [
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

  useEffect(() => {
    if (professores.length > 0 && !professorLogadoId) {
      setProfessorLogadoId(professores[0].id);
    }
  }, [professores, professorLogadoId]);

  // Processar horários do professor logado
  useEffect(() => {
    if (
      !professorLogadoId ||
      !horariosExistentes.length ||
      !turmas.length ||
      !disciplinas.length
    ) {
      setHorariosGrades([]);
      return;
    }

    // Agrupar horários por turma
    const horariosPorTurma = horariosExistentes.reduce((acc, horario) => {
      if (!acc[horario.idTurma]) {
        acc[horario.idTurma] = [];
      }
      acc[horario.idTurma].push(horario);
      return acc;
    }, {});

    // Criar estrutura de grades para exibição
    const gradesFormatadas = Object.entries(horariosPorTurma).map(
      ([turmaId, horariosDaTurma]) => {
        const turma = turmas.find((t) => t.id == turmaId);

        // Criar objeto de horários no formato esperado pelo componente
        const horariosFormatados = {};

        horariosDaTurma.forEach((horario) => {
          const disciplina = disciplinas.find(
            (d) => d.id === horario.idDisciplina
          );
          const professor = professores.find(
            (p) => p.id === horario.idProfessor
          );

          const materiaNome =
            disciplina?.nome ||
            horario.disciplina?.nome ||
            `Disciplina ${horario.idDisciplina}`;
          const professorNome =
            professor?.usuario?.nome ||
            professor?.nome ||
            horario.professor?.usuario?.nome ||
            `Professor ${horario.idProfessor}`;

          horariosFormatados[
            `${horario.diaSemana}_${horario.periodo}_materia`
          ] = materiaNome;
          horariosFormatados[
            `${horario.diaSemana}_${horario.periodo}_professor`
          ] = professorNome;
        });

        return {
          id: parseInt(turmaId),
          turmaId: parseInt(turmaId),
          turma: turma?.nome || `Turma ${turmaId}`,
          periodo: turma?.turno?.toLowerCase().includes("tarde")
            ? "tarde"
            : "manhã",
          horarios: horariosFormatados,
        };
      }
    );

    setHorariosGrades(gradesFormatadas);
  }, [horariosExistentes, turmas, disciplinas, professores, professorLogadoId]);

  // Função para obter classes CSS da grade expandida
  const getGradeDetailsClasses = (id) => {
    const baseClasses = "grade-details-container-visualizacao";
    const isExpanded = gradeExpandida[id];

    return `${baseClasses} ${isExpanded ? "professor-expanded" : ""}`;
  };

  const getGradeCardClasses = (id) => {
    const baseClasses = "grade-card-visualizacao";
    return `${baseClasses} ${gradeExpandida[id] ? "professor-animating" : ""}`;
  };

  // Função para imprimir horário individual de uma turma
  const handlePrintHorarioTurma = (grade) => {
    const professorLogado = professores.find((p) => p.id === professorLogadoId);
    if (!professorLogado) return;

    const turma = turmas.find((t) => t.id === grade.turmaId);

    // Processar horários para esta turma específica
    const horariosBase =
      grade.periodo === "manhã" ? horariosManhã : horariosTarde;
    const horariosProcessados = horariosBase.map((h) => {
      return {
        label: `${h.inicio} - ${h.fim}`,
        periodo: h.periodo,
        isBreak: !!h.isBreak,
        dias: diasSemana.map((dia) => {
          if (h.isBreak) return null;

          const materia = grade.horarios[`${dia.numero}_${h.numero}_materia`];
          if (!materia || materia === "-") return null;

          // Encontrar a disciplina correspondente
          const disciplina = disciplinas.find((d) => d.nome === materia);

          return {
            idDisciplina: disciplina?.id,
            disciplina: disciplina,
            materiaNome: materia,
          };
        }),
      };
    });

    const turmaComHorarios = [
      {
        id: grade.id,
        nome: grade.turma,
        turno: turma?.turno || (grade.periodo === "manhã" ? "Manhã" : "Tarde"),
        disciplinas: [
          ...new Set(
            Object.values(grade.horarios).filter(
              (val, index, arr) =>
                typeof val === "string" &&
                !val.includes("_professor") &&
                val !== "-" &&
                arr.indexOf(val) === index
            )
          ),
        ],
        horariosProcessados,
      },
    ];

    const dataHoraAgora = new Date().toLocaleString("pt-BR");

    // Usar sua função de relatório existente
    const html = gerarRelatorioHorarioProfessor({
      professor: professorLogado,
      turmasComHorarios: turmaComHorarios,
      disciplinas,
      dataHoraAgora,
    });

    // Criar iframe para impressão
    const oldIframe = document.getElementById("print-frame-turma");
    if (oldIframe) oldIframe.remove();

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
      }, 600);
    };
  };

  const toggleGradeExpansao = (id) => {
    setGradeExpandida((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderTabelaHorarios = (horarios, periodo) => {
    const horariosParaUsar =
      periodo === "manhã" ? horariosManhã : horariosTarde;

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
                        <span className="materia-nome-visualizacao">
                          {horarios[
                            `${dia.numero}_${horario.numero}_materia`
                          ] || "-"}
                        </span>
                        <span className="professor-nome-visualizacao">
                          {horarios[
                            `${dia.numero}_${horario.numero}_professor`
                          ] || ""}
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

  // Estados de loading
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
          <p>Aguarde enquanto buscamos seus horários.</p>
        </div>
      </div>
    );
  }

  if (errorHorarios) {
    return (
      <div className="visualizacao-horario-container">
        <div className="error-state-visualizacao">
          <AlertCircle size={48} />
          <h4>Erro ao carregar horários</h4>
          <p>Não foi possível carregar seus horários. Tente novamente.</p>
          <button
            className="retry-button-visualizacao"
            onClick={() => window.location.reload()}
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  const professorLogado = professores.find((p) => p.id === professorLogadoId);

  return (
    <div className="visualizacao-horario-container">
      <div className="visualizacao-horario-section">
        {horariosGrades.length === 0 ? (
          <div className="empty-state-visualizacao">
            <div className="empty-icon-visualizacao">
              <Calendar size={48} />
            </div>
            <h4>Nenhum horário encontrado</h4>
            <p>
              {professorLogadoId
                ? "Você não possui horários cadastrados para nenhuma turma no momento."
                : "Carregando informações do professor..."}
            </p>
            {professorLogadoId && (
              <div className="empty-state-actions">
                <p>
                  Entre em contato com a secretaria para cadastrar seus
                  horários.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="turmas-list-visualizacao">
            <div className="turmas-count-visualizacao">
              {horariosGrades.length} turma(s) com horários cadastrados
            </div>

            {horariosGrades.map((grade) => {
              const isExpandido = gradeExpandida[grade.id];

              return (
                <div key={grade.id} className={getGradeCardClasses(grade.id)}>
                  <div className="grade-info-visualizacao">
                    <div className="grade-header-visualizacao">
                      <div
                        className="grade-basic-info-container-visualizacao clickable-visualizacao"
                        onClick={() => toggleGradeExpansao(grade.id)}
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
                              {grade.turma}
                            </h3>
                            <span
                              className={`grade-periodo-visualizacao ${
                                grade.periodo === "manhã" ? "manha" : "tarde"
                              }`}
                            >
                              {grade.periodo === "manhã" ? "Manhã" : "Tarde"}
                            </span>
                          </div>
                          <p className="grade-horario-visualizacao">
                            {grade.periodo === "manhã"
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
                            handlePrintHorarioTurma(grade);
                          }}
                        >
                          <Printer size={16} /> Imprimir
                        </button>
                      </div>
                    </div>

                    <div className={getGradeDetailsClasses(grade.id)}>
                      <div className="grade-content-visualizacao">
                        {renderTabelaHorarios(grade.horarios, grade.periodo)}
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
