export function gerarRelatorioTurmas({ turmas, dataHoraAgora }) {
    return `
<html>
<head>
    <title>Relatório de Turmas</title>

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

        .divider {
            height: 1px;
            border: 0;
            background: #aaa;
            margin: 15px auto 18px;
            width: 90%;
        }

.info-box {
    background: #f4f6fa;
    border-left: 5px solid #4a90e2;
    border-radius: 4px;
    padding: 5px;
    margin-bottom: 10px;
}

.info-box h1 {
    font-size: 18px;
    color: #2c3e50;
    margin-bottom: 2px; /* 🔥 Aproxima do texto abaixo */
}

.info-box p {
    margin-top: 0;   /* 🔥 Remove espaço para cima */
    padding: 2px 5px; /* top/bottom menor */
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
            font-weight: bold;
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
        }

        @media print {
            @page { margin: 5mm; }
        }
    </style>
</head>

<body>

    <div class="header-text-only">
        <h2>ESCOLA EXPERIMENTAL EDUSYSTEM</h2>
        <p>RUA DO ALGORITMO, 342 – TECNOLOGIA – MODUS TOLLENS</p>
        <p>edusystem@email.com • (54) 9 9876-5432</p>
    </div>

    <hr class="divider" />

    <div class="info-box">
        <h1>RELATÓRIO DE TURMAS</h1>
        <p>Total de turmas: <strong>${turmas.length}</strong></p>
    </div>

    <table>
        <thead>
            <tr>
                <th>Nome</th>
                <th>Turno</th>
                <th>Máximo</th>
                <th>Matriculados</th>
                <th>Ocupação</th>
            </tr>
        </thead>

        <tbody>
            ${turmas
            .map((turma) => {
                const percentual = (
                    (turma.alunosMatriculados / turma.quantidadeMaxima) * 100
                ).toFixed(0);

                return `
                <tr>
                    <td>${turma.nome}</td>
                    <td>${turma.turno}</td>
                    <td>${turma.quantidadeMaxima}</td>
                    <td>${turma.alunosMatriculados}</td>
                    <td>${percentual}%</td>
                </tr>
            `;
            })
            .join("")}
        </tbody>
    </table>

    <div class="footer">
        Gerado automaticamente pelo EDU System — Impressão em ${dataHoraAgora}
    </div>

</body>
</html>
`;
}
