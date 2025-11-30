export function gerarBoletim({
    turma,
    aluno,
    notas,
    disciplinas,
    anoLetivo,
    trimestre,
    dataHoraAgora,
    formatarData,
}) {
    const calcularSituacao = (nota) => {
        const notaNum = parseFloat(nota);
        if (isNaN(notaNum)) return ' - ';
        return notaNum >= 60 ? 'Aprovado' : 'Reprovado';
    };

    const getNotaDisciplina = (disciplinaId) => {
        return notas[disciplinaId] || ' - ';
    };

    const dataEmissao = new Date().toLocaleDateString('pt-BR');

    return `
<html>
<head>
    <title>BOLETIM - ${aluno.nome} - ${turma.nome}</title>

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

        .trimestre-info {
            font-size: 16px;
            color: #64748B;
            font-weight: 600;
            margin-top: 4px;
        }

        /* ===========================
                INFORMAÇÕES DO ALUNO
        ============================ */
        .aluno-info {
            display: grid;
            grid-template-columns: 2fr 1fr 1fr;
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
                TABELA DE NOTAS
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
            width: 60%; /* Disciplina */
            text-align: left;
            padding-left: 15px;
        }

        th:nth-child(2),
        td:nth-child(2) {
            width: 20%; /* Nota */
            text-align: center;
        }

        th:nth-child(3),
        td:nth-child(3) {
            width: 20%; /* Situação */
            text-align: center;
        }

        td {
            padding: 10px 8px;
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
            word-wrap: break-word;
        }

        tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        .disciplina-nome {
            font-weight: 600;
            color: #111827;
        }

        .nota {
            font-weight: 600;
            color: #374151;
        }

        .situacao-aprovado {
            color: #059669;
            font-weight: 700;
        }

        .situacao-reprovado {
            color: #dc2626;
            font-weight: 700;
        }

        .situacao-indefinido {
            color: #6b7280;
            font-weight: 500;
        }

        /* ===========================
                OBSERVAÇÕES
        ============================ */
        .observacoes {
            margin: 20px 0;
            padding: 15px;
            background: #fff9e6;
            border-radius: 8px;
            border: 1px solid #fbbf24;
        }

        .observacoes h3 {
            font-size: 14px;
            margin-bottom: 10px;
            color: #d97706;
            font-weight: 700;
        }

        .observacoes ul {
            margin: 0;
            padding-left: 20px;
            font-size: 13px;
            color: #92400e;
        }

        .observacoes li {
            margin-bottom: 6px;
            line-height: 1.4;
        }

        /* ===========================
                ASSINATURAS
        ============================ */
        .assinaturas {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin: 30px 0 20px;
            padding-top: 40px;
        }

        .assinatura {
            text-align: center;
        }

        .linha-assinatura {
            border-bottom: 1px solid #374151;
            margin-bottom: 8px;
            padding-top: 40px;
        }

        .assinatura p {
            font-size: 12px;
            color: #6b7280;
            margin: 0;
            font-weight: 500;
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
            
            .aluno-info {
                margin-bottom: 15px;
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

            .observacoes {
                background: #fff9e6 !important;
                border: 1px solid #fbbf24 !important;
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
        BOLETIM ESCOLAR
        <div class="trimestre-info">${anoLetivo} - ${trimestre}º TRIMESTRE</div>
    </div>

    <!-- INFORMAÇÕES DO ALUNO -->
    <div class="aluno-info">
        <div class="info-item">
            <span class="info-label">Aluno</span>
            <span class="info-value">${aluno.nome}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Turma</span>
            <span class="info-value">${turma.nome}</span>
        </div>
        <div class="info-item">
            <span class="info-label">Turno</span>
            <span class="info-value">${turma.turno}</span>
        </div>
    </div>

    <!-- TABELA DE NOTAS -->
    <div class="table-container">
        ${turma.tipo === 'fundamental1' ? `
            <table>
                <thead>
                    <tr>
                        <th>Componente Curricular</th>
                        <th>Nota</th>
                        <th>Situação</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="disciplina-nome">ENSINO GLOBALIZADO</td>
                        <td class="nota">${notas.globalizada || ' - '}</td>
                        <td class="situacao-${calcularSituacao(notas.globalizada).toLowerCase()}">
                            ${calcularSituacao(notas.globalizada)}
                        </td>
                    </tr>
                </tbody>
            </table>
        ` : `
            <table>
                <thead>
                    <tr>
                        <th>Disciplina</th>
                        <th>Nota</th>
                        <th>Situação</th>
                    </tr>
                </thead>
                <tbody>
                    ${Object.keys(disciplinas)
                        .filter(discId => discId !== '2') // Remove Ensino Globalizado
                        .map(discId => {
                            const nota = getNotaDisciplina(discId);
                            const situacao = calcularSituacao(nota);
                            return `
                                <tr>
                                    <td class="disciplina-nome">${disciplinas[discId]}</td>
                                    <td class="nota">${nota}</td>
                                    <td class="situacao-${situacao.toLowerCase()}">
                                        ${situacao}
                                    </td>
                                </tr>
                            `;
                        }).join('')}
                </tbody>
            </table>
        `}
    </div>

    <!-- OBSERVAÇÕES -->
    <div class="observacoes">
        <h3>Observações:</h3>
        <ul>
            <li>Escala de avaliação: 0 a 100 pontos</li>
            <li>Média para aprovação: 60 pontos</li>
        </ul>
    </div>

    <!-- ASSINATURAS -->
    <div class="assinaturas">
        <div class="assinatura">
            <div class="linha-assinatura"></div>
            <p>Coordenação Pedagógica</p>
        </div>
        <div class="assinatura">
            <div class="linha-assinatura"></div>
            <p>Direção</p>
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

// Função para gerar boletim em lote (toda a turma)
export function gerarBoletimLote({
    turma,
    alunosComNotas,
    disciplinas,
    anoLetivo,
    trimestre,
    dataHoraAgora,
    formatarData,
}) {
    // Gerar HTML para cada aluno
    const boletinsHTML = alunosComNotas.map(({ aluno, notas }) =>
        gerarBoletim({
            turma,
            aluno,
            notas,
            disciplinas,
            anoLetivo,
            trimestre,
            dataHoraAgora,
            formatarData,
        })
    ).join('<div style="page-break-after: always;"></div>');

    return boletinsHTML;
}