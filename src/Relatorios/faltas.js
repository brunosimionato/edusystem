export function gerarRelatorioFaltas({
    turma,
    alunosComFaltas,
    dataSelecionada,
    periodos,
    dataHoraAgora,
    formatarData,
}) {
    const dataEmissao = new Date().toLocaleDateString('pt-BR');

    return `
<html>
<head>
    <title>RELATÓRIO DE FREQUÊNCIA - ${turma.nome}</title>

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
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #64748B;
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
            font-size: 20px;
            font-weight: 700;
            color: #111827;
            margin-bottom: 15px;
            text-align: center;
            padding: 12px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .data-info {
            font-size: 16px;
            color: #64748B;
            font-weight: 600;
            margin-top: 4px;
        }

        /* ===========================
                INFORMAÇÕES DA TURMA
        ============================ */
        .turma-info {
            display: grid;
            grid-template-columns: 1fr 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
            padding: 15px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .info-item {
            display: flex;
            flex-direction: column;
            align-items: left;
        }

        .info-label {
            font-size: 12px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            margin-bottom: 4px;
        }

        .info-value {
            font-size: 14px;
            font-weight: 600;
            color: #111827;
        }

        /* ===========================
                ESTATÍSTICAS
        ============================ */
        .estatisticas {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 20px;
        }

        .estatistica-item {
            background: white;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            text-align: center;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .estatistica-numero {
            font-size: 24px;
            font-weight: 700;
            color: #64748B;
            margin-bottom: 4px;
        }

        .estatistica-label {
            font-size: 11px;
            color: #6b7280;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* ===========================
                TABELA DE FREQUÊNCIA
        ============================ */
        .table-container {
            margin: 20px 0;
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
            padding: 12px 8px;
            font-weight: 600;
            color: white;
            text-align: left;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* LARGURAS DAS COLUNAS */
        th:nth-child(1),
        td:nth-child(1) {
            width: ${turma.tipo === "fundamental1" ? '60%' : '40%'};
            text-align: left;
            padding-left: 15px;
        }

        ${turma.tipo === "fundamental2" ? `
            th:nth-child(2),
            td:nth-child(2) { width: 10%; text-align: center; }
            th:nth-child(3),
            td:nth-child(3) { width: 10%; text-align: center; }
            th:nth-child(4),
            td:nth-child(4) { width: 10%; text-align: center; }
            th:nth-child(5),
            td:nth-child(5) { width: 10%; text-align: center; }
            th:nth-child(6),
            td:nth-child(6) { width: 10%; text-align: center; }
            th:nth-child(7),
            td:nth-child(7) { width: 10%; text-align: center; }
        ` : `
            th:nth-child(2),
            td:nth-child(2) { width: 20%; text-align: center; }
            th:nth-child(3),
            td:nth-child(3) { width: 20%; text-align: center; }
        `}

        td {
            padding: 10px 8px;
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
            word-wrap: break-word;
        }

        tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        .aluno-nome {
            font-weight: 600;
            color: #111827;
        }

        .presente {
            color: #059669;
            font-weight: 700;
            background: #f0fdf4 !important;
        }

        .faltou {
            color: #dc2626;
            font-weight: 700;
            background: #fef2f2 !important;
        }

        .total-faltas {
            font-weight: 700;
            color: #374151;
            background: #f8fafc !important;
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
                IMPRESSÃO
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
                margin-bottom: 15px;
                padding-bottom: 10px;
            }
            
            .turma-info {
                margin-bottom: 15px;
                background: transparent;
                border: 1px solid #d1d5db;
            }

            .estatisticas {
                margin-bottom: 15px;
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

            .assinaturas {
                margin-bottom: 20px;
            }

            .graduation-logo {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                border: 3px solid #64748B !important;
                background: #f8fafc !important;
            }

            table {
                table-layout: fixed !important;
            }

            .presente {
                background: #f0fdf4 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .faltou {
                background: #fef2f2 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .total-faltas {
                background: #f8fafc !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
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

    <!-- TÍTULO PRINCIPAL -->
    <div class="main-title">
        RELATÓRIO DE FREQUÊNCIA
        <div class="data-info">${formatarData(dataSelecionada)}</div>
    </div>

    <!-- INFORMAÇÕES DA TURMA -->
    <div class="turma-info">
        <div class="info-item">
            <span class="info-label">Turma</span>
            <span class="info-value">${turma.nome}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Turno</span>
            <span class="info-value">${turma.turno}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Tipo</span>
            <span class="info-value">${turma.tipo === "fundamental1" ? "Fundamental I" : "Fundamental II"}</span>
        </div>
    </div>

    <!-- ESTATÍSTICAS -->
    <div class="estatisticas">
        <div class="estatistica-item">
            <div class="estatistica-numero">${alunosComFaltas.length}</div>
            <div class="estatistica-label">Total de Alunos</div>
        </div>
        <div class="estatistica-item">
            <div class="estatistica-numero">${alunosComFaltas.filter(a => a.totalFaltas > 0).length}</div>
            <div class="estatistica-label">Alunos com Faltas</div>
        </div>
        <div class="estatistica-item">
            <div class="estatistica-numero">${alunosComFaltas.reduce((total, aluno) => total + aluno.totalFaltas, 0)}</div>
            <div class="estatistica-label">Total de Faltas</div>
        </div>
    </div>

    <!-- TABELA DE FREQUÊNCIA -->
    <div class="table-container">
        ${turma.tipo === "fundamental1" ? `
            <table>
                <thead>
                    <tr>
                        <th>Nome do Aluno</th>
                        <th>Status</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${alunosComFaltas.map(aluno => `
                        <tr>
                            <td class="aluno-nome">${aluno.nome}</td>
                            <td class="${aluno.faltou ? 'faltou' : 'presente'}">
                                ${aluno.faltou ? 'FALTOU' : 'PRESENTE'}
                            </td>
                            <td class="total-faltas">${aluno.totalFaltas}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        ` : `
            <table>
                <thead>
                    <tr>
                        <th>Nome do Aluno</th>
                        <th>1º</th>
                        <th>2º</th>
                        <th>3º</th>
                        <th>4º</th>
                        <th>5º</th>
                        <th>Total</th>
                    </tr>
                </thead>
                <tbody>
                    ${alunosComFaltas.map(aluno => `
                        <tr>
                            <td class="aluno-nome">${aluno.nome}</td>
                            <td class="${aluno.faltasPeriodos['1'] ? 'faltou' : 'presente'}">
                                ${aluno.faltasPeriodos['1'] ? 'F' : 'P'}
                            </td>
                            <td class="${aluno.faltasPeriodos['2'] ? 'faltou' : 'presente'}">
                                ${aluno.faltasPeriodos['2'] ? 'F' : 'P'}
                            </td>
                            <td class="${aluno.faltasPeriodos['3'] ? 'faltou' : 'presente'}">
                                ${aluno.faltasPeriodos['3'] ? 'F' : 'P'}
                            </td>
                            <td class="${aluno.faltasPeriodos['4'] ? 'faltou' : 'presente'}">
                                ${aluno.faltasPeriodos['4'] ? 'F' : 'P'}
                            </td>
                            <td class="${aluno.faltasPeriodos['5'] ? 'faltou' : 'presente'}">
                                ${aluno.faltasPeriodos['5'] ? 'F' : 'P'}
                            </td>
                            <td class="total-faltas">${aluno.totalFaltas}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `}
    </div>
    
    <!-- FOOTER - ESTICADO NA LARGURA -->
    <div class="footer">
        <p>Gerado automaticamente pelo EduSystem — Impresso em ${dataHoraAgora}</p>
    </div>

</body>
</html>
`;
}

// Função para gerar relatório em lote (toda a turma)
export function gerarRelatorioFaltasLote({
    turmasComFaltas,
    dataSelecionada,
    periodos,
    dataHoraAgora,
    formatarData,
}) {
    // Gerar HTML para cada turma
    const relatoriosHTML = turmasComFaltas.map(turmaData =>
        gerarRelatorioFaltas({
            turma: turmaData.turma,
            alunosComFaltas: turmaData.alunosComFaltas,
            dataSelecionada,
            periodos,
            dataHoraAgora,
            formatarData,
        })
    ).join('<div style="page-break-after: always;"></div>');

    return relatoriosHTML;
}