import React, { useState, useEffect } from "react";
import {
  Calendar,
  Printer,
  ChevronDown,
  ChevronRight,
  Clock,
} from "lucide-react";

import "./horarioProf.css";

const HorariosProfe = () => {
  const [horariosGrades, setHorariosGrades] = useState([]);
  const [gradeExpandida, setGradeExpandida] = useState({});

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
    // Simulação de dados - aqui você faria a busca das turmas do professor
    const gradesSimuladas = [
      {
        id: 1,
        turmaId: 1,
        turma: "1º ANO A",
        periodo: "manha",
        horarios: {
          "Segunda_0_materia": "Matemática",
          "Segunda_0_professor": "Prof. João Silva",
          "Segunda_1_materia": "Português",
          "Segunda_1_professor": "Prof. João Silva",
          "Terça_0_materia": "Matemática",
          "Terça_0_professor": "Prof. João Silva",
          "Quarta_2_materia": "Matemática",
          "Quarta_2_professor": "Prof. João Silva",
        },
      },
      {
        id: 2,
        turmaId: 3,
        turma: "2º ANO A",
        periodo: "tarde",
        horarios: {
          "Segunda_1_materia": "Matemática",
          "Segunda_1_professor": "Prof. João Silva",
          "Terça_1_materia": "Matemática",
          "Terça_1_professor": "Prof. João Silva",
          "Quinta_0_materia": "Matemática",
          "Quinta_0_professor": "Prof. João Silva",
          "Sexta_2_materia": "Matemática",
          "Sexta_2_professor": "Prof. João Silva",
        },
      },
      {
        id: 3,
        turmaId: 5,
        turma: "4º ANO A",
        periodo: "tarde",
        horarios: {
          "Segunda_0_materia": "Ciências",
          "Segunda_0_professor": "Prof. João Silva",
          "Quarta_1_materia": "Ciências",
          "Quarta_1_professor": "Prof. João Silva",
          "Sexta_0_materia": "Ciências",
          "Sexta_0_professor": "Prof. João Silva",
        },
      },
    ];
    setHorariosGrades(gradesSimuladas);
  }, []);

  const toggleGradeExpansao = (id) => {
    setGradeExpandida((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const renderTabelaHorarios = (horarios, periodo) => {
    const horariosParaUsar =
      periodo === "manha" ? horariosManha : horariosTarde;

    return (
      <div className="table-wrapper-visualizacao">
        <table className="horarios-table-visualizacao">
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
                  <td key={dia} className="materia-cell-visualizacao">
                    {horario.isBreak ? (
                      <span className="break-text-visualizacao">
                        {horario.periodo}
                      </span>
                    ) : (
                      <div className="materia-professor-view-visualizacao">
                        <span className="materia-nome-visualizacao">
                          {horarios[`${dia}_${index}_materia`] || "-"}
                        </span>
                        <span className="professor-nome-visualizacao">
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
    <div className="visualizacao-horario-container">
      <div className="visualizacao-horario-section">
        <div className="visualizacao-horario-section-header-with-button">
          <h3 className="visualizacao-horario-section-header-turmas">
            Minhas Turmas - Horários
          </h3>
        </div>

        {horariosGrades.length === 0 ? (
          <div className="empty-state-visualizacao">
            <div className="empty-icon-visualizacao">
              <Calendar size={48} />
            </div>
            <h4>Nenhum horário encontrado</h4>
            <p>
              Você ainda não possui turmas atribuídas ou não há horários
              cadastrados.
            </p>
          </div>
        ) : (
          <div className="turmas-list-visualizacao">
            {horariosGrades.map((grade) => {
              const isExpandido = gradeExpandida[grade.id];

              return (
                <div key={grade.id} className="grade-card-visualizacao">
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
                          <h3 className="grade-nome-visualizacao">
                            {grade.turma}
                          </h3>
                          <p className="grade-periodo-visualizacao">
                            {grade.periodo === "manha"
                              ? "Manhã (07:30 - 11:15)"
                              : "Tarde (13:00 - 17:00)"}
                          </p>
                        </div>
                      </div>

                      <div className="grade-header-actions-visualizacao">
                        <button
                          className="action-button-visualizacao print-button-visualizacao"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.print();
                          }}
                        >
                          <Printer size={16} /> Imprimir
                        </button>
                      </div>
                    </div>

                    {isExpandido && (
                      <div className="grade-details-container-visualizacao">
                        <div className="grade-content-visualizacao">
                          {renderTabelaHorarios(grade.horarios, grade.periodo)}
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

export default HorariosProfe;