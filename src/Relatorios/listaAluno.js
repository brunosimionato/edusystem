export function gerarRelatorioAlunos({
  turma,
  alunos,
  qtdAtivos,
  dataHoraAgora,
  formatarData,
}) {
  return `
<html>
<head>
    <title>LISTA DE ALUNOS - ${turma.nome}</title>

    <style>

        /* ===========================
                GERAIS
        ============================ */
        body {
            font-family: Arial, sans-serif;
            padding: 20px 25px;
            padding-bottom: 70px; /* espaço para o footer */
            color: #333;
            line-height: 1.45;
            min-height: 100vh;
            position: relative;
        }

        h1, h2 {
            margin: 0;
            font-weight: bold;
        }

        /* ===========================
                CABEÇALHO
        ============================ */
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

        .divider {
            height: 1px;
            border: 0;
            background: #aaa;
            margin: 15px auto 18px;
            width: 90%;
        }

        /* ===========================
                INFO BOX
        ============================ */
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

        .report-subtitle {
            font-size: 14px;
            color: #444;
            margin: 4px 0 12px;
        }

        .info-box p {
            font-size: 12px;
            margin: 3px 0;
        }

        /* ===========================
                TABELA
        ============================ */
        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            margin-top: 10px;
            border: 1px solid #000;
            page-break-inside: auto;
        }

        th {
            background: #d9d9d9;
            padding: 8px 4px;
            border: 1px solid #000;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.4px;
        }

        td {
            padding: 7px 4px;
            border: 1px solid #000;
            text-align: center;
            font-size: 12px;
        }

        tr {
            page-break-inside: avoid;
        }

        tr:nth-child(even) { background: #f2f2f2; }
        tr:nth-child(odd)  { background: #ffffff; }
        tr:hover { background: #e8f1ff; }

        /* ===========================
                FOOTER FIXO
        ============================ */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 6px 0;
            text-align: center;
            font-size: 12px;
            color: #555;
            background: #fff;
            border-top: 1px solid #aaa;
        }

        @media print {
            @page { margin: 5mm; }
            body { padding-bottom: 80px; }
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

    <hr class="divider" />

    <!-- INFORMAÇÕES DA TURMA -->
    <div class="info-box">
        <h1>LISTA DE ALUNOS</h1>
        <div class="report-subtitle">${turma.nome.toUpperCase()}</div>

        <p><strong>Turno:</strong> ${turma.turno}</p>
        <p><strong>Total de alunos:</strong> ${alunos.length}</p>
        <p><strong>Capacidade:</strong> ${qtdAtivos} de ${turma.quantidadeMaxima} vagas ocupadas</p>
    </div>

    <!-- TABELA -->
    <table>
        <thead>
            <tr>
                <th>Nome</th>
                <th>CPF</th>
                <th>Nascimento</th>
            </tr>
        </thead>

        <tbody>
            ${alunos
              .map(
                (aluno) => `
                    <tr>
                        <td>${aluno.nome}</td>
                        <td>${aluno.cpf || "-"}</td>
                        <td>${formatarData(aluno.nascimento)}</td>
                    </tr>
                `
              )
              .join("")}
        </tbody>
    </table>

    <!-- FOOTER FIXO -->
    <div class="footer">
        Gerado automaticamente pelo EDU System — Impressão em ${dataHoraAgora}
    </div>

</body>
</html>
`;
}
