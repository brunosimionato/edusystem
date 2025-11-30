export function gerarRelatorioTurmas({ turmas, dataHoraAgora }) {
    return `
<html>
<head>
    <title>RELATÓRIO DE TURMAS</title>

    <style>
        /* ===========================
                RESET E CONFIGURAÇÕES
        ============================ */
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Inter', 'Segoe UI', system-ui, sans-serif;
            padding: 20px;
            color: #111827;
            line-height: 1.5;
            background: #ffffff;
            max-width: 800px;
            margin: 0 auto;
            position: relative;
            min-height: 100vh;
        }

        /* ===========================
                CABEÇALHO
        ============================ */
        .header {
            display: flex;
            align-items: center;
            gap: 20px;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #64748B;
            position: relative;
        }

        .logo-container {
            display: flex;
            align-items: center;
            justify-content: center;
            min-width: 80px;
            min-height: 80px;
        }

        .graduation-logo {
            font-family: 'Lucida Sans', 'Lucida Sans Regular', 'Lucida Grande', 'Lucida Sans Unicode', Geneva, Verdana, sans-serif;
            font-size: 48px;
            color: #64748B;
            display: flex;
            align-items: center;
            justify-content: center;
            width: 80px;
            height: 80px;
            background: #f8fafc;
            border-radius: 50%;
            border: 3px solid #64748B;
            box-shadow: 0 4px 8px rgba(100, 116, 139, 0.2);
        }

        .school-info-container {
            flex: 1;
            text-align: left;
        }

        .school-name {
            font-size: 24px;
            font-weight: 700;
            color: #64748B;
            margin-bottom: 8px;
        }

        .school-info {
            font-size: 14px;
            color: #6b7280;
            margin: 4px 0;
            font-weight: 500;
        }

        /* ===========================
                TÍTULO PRINCIPAL
        ============================ */
        .main-title {
            font-size: 17px;
            font-weight: 670;
            color: #111827;
            margin-bottom: 15px;
            text-align: left;
            margin-top: -8px;
        }

        /* ===========================
                INFORMAÇÕES RESUMO
        ============================ */
        .resumo-info {
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
            text-align: center;
            flex: 1;
        }

        .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .info-value {
            font-size: 16px;
            color: #374151;
            font-weight: 600;
        }

        .info-value strong {
            color: #111827;
            font-size: 18px;
        }

        /* ===========================
                TABELAS
        ============================ */
        .table-section {
            margin-bottom: 30px;
        }

        .section-title {
            font-size: 16px;
            font-weight: 670;
            color: #111827;
            margin-bottom: 12px;
            padding-bottom: 8px;
            border-bottom: 2px solid #64748B;
        }

        .table-container {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
            table-layout: fixed;
        }

        thead {
            background: #64748B;
        }

        th {
            padding: 12px 16px;
            font-weight: 600;
            color: white;
            text-align: center;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        td {
            padding: 10px 16px;
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
        }

        tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        tbody tr:hover {
            background: #f3f4f6;
        }

        /* ===========================
                LARGURAS DAS COLUNAS
        ============================ */
        .col-nome {
            width: 40%;
        }

        .col-turno {
            width: 20%;
        }

        .col-capacidade {
            width: 20%;
            text-align: center;
        }

        .col-matriculados {
            width: 20%;
            text-align: center;
        }

        /* Alinhamento do conteúdo das células */
        td.col-nome {
            text-align: center;
        }

        td.col-turno {
            text-align: center;
        }

        td.col-capacidade,
        td.col-matriculados {
            text-align: center;
        }

        /* ===========================
                FOOTER - ESTICADO NA LARGURA
        ============================ */
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            padding: 12px 0;
            text-align: center;
            font-size: 13px;
            font-weight: 500;
            background: #ffffff;
            border-top: 2px solid #e5e7eb;
        }

        .footer p {
            margin: 0;
            line-height: 1.4;
        }

        /* ===========================
                IMPRESSÃO - FOOTER ESTICADO
        ============================ */
        @media print {
            @page { 
                margin: 15mm;
                margin-bottom: 5mm;
            }
            
            body {
                padding: 0;
                max-width: none;
                border: none;
                box-shadow: none;
            }
            
            .header {
                margin-bottom: 20px;
                padding-bottom: 15px;
            }
            
            .resumo-info {
                margin-bottom: 20px;
                background: transparent;
                border: 1px solid #d1d5db;
            }

            .table-container {
                border: 1px solid #d1d5db;
                box-shadow: none;
            }

            thead {
                background: #64748B !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .footer {
                position: fixed;
                bottom: 0mm;
                left: 0mm;
                right: 0mm;
                padding: 8px 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                border-top: 2px solid #e5e7eb;
                font-size: 12px;
                background: #ffffff !important;
            }

            /* Garantir que o conteúdo não fique por baixo do footer */
            .table-section:last-child {
                margin-bottom: 25px;
            }

            .graduation-logo {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                border: 3px solid #64748B !important;
                background: #f8fafc !important;
            }
        }

    </style>

</head>
<body>

    <!-- CABEÇALHO COM LOGO NO LADO ESQUERDO -->
    <div class="header">
        <div class="logo-container">
            <div class="graduation-logo">🎓</div>
        </div>
        <div class="school-info-container">
            <div class="school-name">ESCOLA EXPERIMENTAL EDUSYSTEM</div>
            <div class="school-info">RUA DO ALGORITMO, 342 – TECNOLOGIA – MODUS TOLLENS</div>
            <div class="school-info">edusystem@email.com • (54) 9 9876-5432</div>
        </div>
    </div>

    <!-- TÍTULO PRINCIPAL UNIFICADO -->
    <div class="main-title">RELATÓRIO DE TURMAS</div>

    <!-- INFORMAÇÕES DE RESUMO -->
    <div class="resumo-info">
        <div class="info-item">
            <span class="info-label">TOTAL DE TURMAS</span>
            <span class="info-value"><strong>${turmas.length}</strong></span>
        </div>
        <div class="info-item">
            <span class="info-label">CAPACIDADE TOTAL</span>
            <span class="info-value"><strong>${turmas.reduce((total, turma) => total + turma.quantidadeMaxima, 0)}</strong> alunos</span>
        </div>
        <div class="info-item">
            <span class="info-label">TOTAL DE ALUNOS</span>
            <span class="info-value"><strong>${turmas.reduce((total, turma) => total + turma.alunosMatriculados, 0)}</strong></span>
        </div>
    </div>

    <!-- LISTA DE TURMAS -->
    <div class="table-section">
        <div class="section-title">Lista de Turmas</div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="col-nome">Nome da Turma</th>
                        <th class="col-turno">Turno</th>
                        <th class="col-capacidade">Capacidade</th>
                        <th class="col-matriculados">Matriculados</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      turmas.length
                        ? turmas
                            .map(
                              (turma) => `
                                <tr>
                                    <td class="col-nome">${turma.nome}</td>
                                    <td class="col-turno">${turma.turno}</td>
                                    <td class="col-capacidade">${turma.quantidadeMaxima}</td>
                                    <td class="col-matriculados">${turma.alunosMatriculados}</td>
                                </tr>
                                `
                            )
                            .join("")
                        : `<tr><td colspan="4">Nenhuma turma cadastrada</td></tr>`
                    }
                </tbody>
            </table>
        </div>
    </div>

    <!-- FOOTER - ESTICADO NA LARGURA -->
    <div class="footer">
        <p>Gerado automaticamente pelo EduSystem — Impresso em ${dataHoraAgora}</p>
    </div>

</body>
</html>
`;
}