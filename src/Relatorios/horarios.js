export function gerarRelatorioHorarioTurma({ turma, horarios, professores, disciplinas, dataHoraAgora }) {
    return `
  <html>
  <head>
      <title>HORÁRIO DA TURMA - ${turma.nome}</title>

<style>
    body {
        font-family: Arial, sans-serif;
        padding: 25px;
        color: #333;
        line-height: 1.45;
        min-height: 100vh;
        position: relative;
    }

    h1, h2, h3 {
        margin: 0;
        font-weight: bold;
    }

    .header {
        text-align: center;
        margin-bottom: 10px;
    }

    .header h2 {
        font-size: 18px;
        margin-bottom: 3px;
    }

    .header p {
        font-size: 13px;
        margin: 1px 0;
    }

    .divider {
        height: 1px;
        background: #999;
        border: none;
        margin: 15px 0 20px;
    }

    .info-box {
        background: #f4f6fa;
        border-left: 5px solid #4a90e2;
        padding: 12px 14px;
        margin-bottom: 20px;
        border-radius: 4px;
    }

    table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 10px;
        font-size: 13px;
        border: 1px solid #000;
        page-break-inside: auto;
    }

    tr {
        page-break-inside: avoid;
    }

    th {
        background: #d9d9d9;
        padding: 7px;
        border: 1px solid #000;
        font-weight: bold;
    }

    td {
        padding: 6px;
        border: 1px solid #000;
        text-align: center;
    }

    .break-row {
        background: #f0f0f0;
        font-style: italic;
        color: #666;
    }

    /* === FOOTER FIXO === */
        .footer {
            width: 100%;
            text-align: center;
            font-size: 12px;
            color: #555;
            position: fixed;
            bottom: 10px;
            left: 0;
        }

        @media print {
            @page { margin: 5mm; }
        }
</style>

  </head>

  <body>

      <div class="header">
          <h2>ESCOLA EXPERIMENTAL EDUSYSTEM</h2>
          <p>RUA DO ALGORITMO, 342 – TECNOLOGIA – MODUS TOLLENS</p>
          <p>edusystem@email.com • (54) 9 9876-5432</p>
      </div>

      <hr class="divider"/>

      <div class="info-box">
          <h1>HORÁRIO DA TURMA</h1>
          <p class="info-label"><strong>Turma:</strong> ${turma.nome}</p>
          <p class="info-label"><strong>Turno:</strong> ${turma.turno}</p>
          <p class="info-label"><strong>Período:</strong> ${turma.turno === "Manhã" ? "07:30 - 11:15" : "13:00 - 17:00"}</p>
      </div>

      <table>
          <thead>
              <tr>
                  <th>Horário</th>
                  <th>Segunda</th>
                  <th>Terça</th>
                  <th>Quarta</th>
                  <th>Quinta</th>
                  <th>Sexta</th>
              </tr>
          </thead>

          <tbody>
              ${horarios.map((linha) => {
        return `
                  <tr class="${linha.isBreak ? "break-row" : ""}">
                      <td>${linha.label}</td>
                      ${linha.dias
                .map((d) => {
                    if (d === null) {
                        return `<td>-</td>`;
                    }

                    const disc = disciplinas.find((x) => x.id === d.idDisciplina);
                    const prof = professores.find((x) => x.id === d.idProfessor);

                    return `
                              <td>
                                  <strong>${disc?.nome || "?"}</strong><br>
                                  <small>${prof?.usuario?.nome || prof?.nome || "?"}</small>
                              </td>
                          `;
                })
                .join("")}
                  </tr>
                `;
    }).join("")}
          </tbody>
      </table>

      <div class="footer">
          Gerado automaticamente pelo EDU System — Impressão em ${dataHoraAgora}
      </div>

  </body>
  </html>
  `;
}
