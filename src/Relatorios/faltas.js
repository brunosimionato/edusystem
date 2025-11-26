export function gerarRelatorioFaltas({
    turma,
    alunosComFaltas,
    dataSelecionada,
    periodos,
    dataHoraAgora,
    formatarData,
}) {
    return `
<html>
<head>
    <title>RELATÓRIO DE FREQUÊNCIA - ${turma.nome}</title>

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

        .stats-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 10px;
            margin-top: 10px;
        }

        .stat-item {
            background: white;
            padding: 8px;
            border-radius: 4px;
            border: 1px solid #ddd;
        }

        .stat-number {
            font-size: 18px;
            font-weight: bold;
            color: #2c3e50;
        }

        .stat-label {
            font-size: 11px;
            color: #666;
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

        .faltou { 
            background: #ffebee !important; 
            color: #c62828;
            font-weight: bold;
        }

        .presente { 
            background: #e8f5e8 !important; 
            color: #2e7d32;
        }

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
        <h1>RELATÓRIO DE FREQUÊNCIA</h1>
        <div class="report-subtitle">${turma.nome.toUpperCase()} - ${formatarData(dataSelecionada)}</div>

        <p><strong>Turno:</strong> ${turma.turno}</p>
        <p><strong>Tipo:</strong> ${turma.tipo === "fundamental1" ? "Fundamental I (1º-5º)" : "Fundamental II (6º-9º)"}</p>
        <p><strong>Data:</strong> ${formatarData(dataSelecionada)}</p>

        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${alunosComFaltas.length}</div>
                <div class="stat-label">TOTAL DE ALUNOS</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${alunosComFaltas.filter(a => a.totalFaltas === 0).length}</div>
                <div class="stat-label">TOTALMENTE PRESENTES</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${alunosComFaltas.filter(a => a.totalFaltas > 0).length}</div>
                <div class="stat-label">COM FALTAS</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${alunosComFaltas.reduce((total, aluno) => total + aluno.totalFaltas, 0)}</div>
                <div class="stat-label">TOTAL DE FALTAS</div>
            </div>
        </div>
    </div>

    <!-- TABELA DE FALTAS -->
    <table>
        <thead>
            <tr>
                <th>Nome do Aluno</th>
                ${turma.tipo === "fundamental2"
            ? Object.values(periodos).map(periodo => `<th>${periodo}</th>`).join("")
            : '<th>Status</th>'
        }
                <th>Total Faltas</th>
            </tr>
        </thead>

        <tbody>
            ${alunosComFaltas
            .map(aluno => {
                if (turma.tipo === "fundamental1") {
                    return `
                    <tr>
                        <td>${aluno.nome}</td>
                        <td class="${aluno.faltou ? 'faltou' : 'presente'}">
                            ${aluno.faltou ? 'FALTOU' : 'PRESENTE'}
                        </td>
                        <td>${aluno.totalFaltas}</td>
                    </tr>
                  `;
                } else {
                    return `
                    <tr>
                        <td>${aluno.nome}</td>
                        ${Object.keys(periodos).map(periodoKey => `
                          <td class="${aluno.faltasPeriodos[periodoKey] ? 'faltou' : 'presente'}">
                            ${aluno.faltasPeriodos[periodoKey] ? 'F' : 'P'}
                          </td>
                        `).join("")}
                        <td>${aluno.totalFaltas}</td>
                    </tr>
                  `;
                }
            })
            .join("")}
        </tbody>
    </table>

    <!-- LEGENDA -->
    ${turma.tipo === "fundamental2" ? `
    <div style="margin-top: 20px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
        <h3 style="margin: 0 0 8px 0; font-size: 14px; color: #856404;">LEGENDA:</h3>
        <p style="margin: 2px 0; font-size: 12px;"><strong>P:</strong> Presente | <strong>F:</strong> Faltou</p>
    </div>
    ` : ''}

    <!-- FOOTER FIXO -->
    <div class="footer">
        Gerado automaticamente pelo EDU System — Impressão em ${dataHoraAgora}
    </div>

</body>
</html>
`;
}