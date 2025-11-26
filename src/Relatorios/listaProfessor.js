export function gerarRelatorioProfessor({
  professor,
  dataHoraAgora,
  formatarData,
}) {
  return `
<html>
<head>
    <title>RELATÓRIO DO PROFESSOR - ${professor.usuario?.nome}</title>

    <style>
        body {
            font-family: Arial, sans-serif;
            padding: 20px 25px;
            color: #333;
            line-height: 1.45;
        }

        h1, h2 {
            margin: 0;
            font-weight: bold;
        }

        .header-text-only {
            text-align: center;
        }

        .header-text-only h2 {
            font-size: 16px;
        }

        .header-text-only p {
            font-size: 13px;
            color: #555;
            margin: 2px 0;
        }


        .info-box {
            background: #f4f6fa;
            border-left: 5px solid #4a90e2;
            border-radius: 4px;
            padding: 12px 14px;
            margin-bottom: 18px;
        }

        .info-box h1 {
            font-size: 16px;
            color: #2c3e50;
        }

        .info-grid {
            margin-top: 10px;
            font-size: 13px;
        }

        .info-grid div {
            margin: 4px 0;
        }

        .subsection-title {
            margin-top: 20px;
            font-size: 15px;
            font-weight: bold;
            padding-bottom: 4px;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 10px;
            border: 1px solid #000;
        }

        th {
            background: #d9d9d9;
            color: #000;
            padding: 8px 4px;
            border: 1px solid #000;
            text-transform: uppercase;
            font-size: 12px;
        }

        td {
            padding: 7px 4px;
            border: 1px solid #000;
            text-align: center;
            font-size: 12px;
        }

        tr:nth-child(even) { background: #f2f2f2; }
        tr:nth-child(odd)  { background: #ffffff; }
        tr:hover { background: #e8f1ff; }

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

    <!-- CABEÇALHO -->
    <div class="header-text-only">
        <h2>ESCOLA EXPERIMENTAL EDUSYSTEM</h2>
        <p>RUA DO ALGORITMO, 342 – TECNOLOGIA – MODUS TOLLENS</p>
        <p>edusystem@email.com • (54) 9 9876-5432</p>
    </div>

    <!-- INFORMAÇÕES GERAIS -->
    <div class="info-box">
        <h1>RELATÓRIO DO PROFESSOR</h1>
        <p class="report-subtitle">${professor.usuario?.nome}</p>

        <div class="info-grid">
            <div><strong>Email:</strong> ${professor.usuario?.email}</div>
            <div><strong>CPF:</strong> ${professor.cpf}</div>
            <div><strong>Nascimento:</strong> ${formatarData(professor.nascimento)}</div>
            <div><strong>Telefone:</strong> ${professor.telefone}</div>

            <div style="margin-top:8px;">
                <strong>Endereço:</strong> 
                ${professor.logradouro}, nº ${professor.numero},
                ${professor.bairro}, ${professor.cidade} - ${professor.estado},
                CEP ${professor.cep}
            </div>

            <div style="margin-top:8px;">
                <strong>Formação Acadêmica:</strong> 
                ${professor.formacaoAcademica}
            </div>
        </div>
    </div>

    <!-- DISCIPLINAS -->
    <div class="subsection-title">Disciplinas que Leciona</div>
    <table>
        <thead>
            <tr>
                <th>Disciplina</th>
            </tr>
        </thead>
        <tbody>
            ${
              professor.disciplinas?.length
                ? professor.disciplinas
                    .map(
                      (disc) => `
                    <tr>
                        <td>${disc.nome}</td>
                    </tr>
                `
                    )
                    .join("")
                : `<tr><td>Nenhuma disciplina vinculada</td></tr>`
            }
        </tbody>
    </table>

    <!-- TURMAS -->
    <div class="subsection-title">Turmas que Leciona</div>
    <table>
        <thead>
            <tr>
                <th>Turma</th>
                <th>Disciplinas ministradas</th>
            </tr>
        </thead>
        <tbody>
            ${
              professor.turmas?.length
                ? professor.turmas
                    .map(
                      (turma) => `
                    <tr>
                        <td>${turma.nome}</td>
                        <td>${professor.disciplinas.map(d => d.nome).join(", ")}</td>
                    </tr>
                `
                    )
                    .join("")
                : `<tr><td colspan="2">Nenhuma turma vinculada</td></tr>`
            }
        </tbody>
    </table>

    <!-- RODAPÉ -->
    <div class="footer">
        Gerado automaticamente pelo EDU System — Impressão em ${dataHoraAgora}
    </div>

</body>
</html>
`;
}
