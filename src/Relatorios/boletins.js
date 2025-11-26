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

    const calcularMedia = () => {
        if (turma.tipo === 'fundamental1') {
            const notaGlobal = parseFloat(notas.globalizada);
            return isNaN(notaGlobal) ? ' - ' : notaGlobal.toFixed(1);
        } else {
            const notasValidas = Object.values(notas).filter(nota => {
                const notaNum = parseFloat(nota);
                return !isNaN(notaNum) && notaNum > 0;
            });

            if (notasValidas.length === 0) return ' - ';

            const soma = notasValidas.reduce((acc, nota) => acc + parseFloat(nota), 0);
            return (soma / notasValidas.length).toFixed(1);
        }
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
        body {
            font-family: Arial, sans-serif;
            padding: 20px 25px;
            padding-bottom: 70px; /* espaço para o footer */
            color: #333;
            line-height: 1.45;
            min-height: 100vh;
            position: relative;
        }

        h1, h2, h3 {
            margin: 0;
            font-weight: bold;
        }

        .header-text-only {
            text-align: center;
            margin-bottom: 10px;
        }

        .header-text-only h2 {
            font-size: 16px;
        }

        .header-text-only p {
            font-size: 13px;
            color: #555;
            margin: 2px 0;
        }

        /* ===========================
                INFO BOX
        ============================ */
        .info-box {
            background: #f4f6fa;
            border-left: 5px solid #4a90e2;
            border-radius: 4px;
            padding: 12px 14px 10px;
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

        .aluno-info {
            display: grid;
            grid-template-columns: 1fr 1fr;
            row-gap: 1px;   /* quase sem espaço vertical */
            column-gap: 6px;
            margin-top: 0;
        }



        .table-container {
            margin: 20px 0;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
            border: 1px solid #444;
            page-break-inside: auto;
        }

        th {
            background: #d9d9d9;
            padding: 8px 4px;
            border: 1px solid #444;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 12px;
            letter-spacing: 0.4px;
        }

        td {
            padding: 7px 4px;
            border: 1px solid #444;
            text-align: center;
            font-size: 12px;
        }

        tr {
            page-break-inside: avoid;
        }

        tr:nth-child(even) { background: #f2f2f2; }
        tr:nth-child(odd)  { background: #ffffff; }

        .situacao-aprovado {
            color: #27ae60;
            font-weight: bold;
        }

        .situacao-reprovado {
            color: #e74c3c;
            font-weight: bold;
        }

        .media-final {
            background: #e8f4fd !important;
            font-weight: bold;
        }

        /* ===========================
                OBSERVAÇÕES
        ============================ */
        .observacoes {
            margin: 20px 0;
            padding: 12px;
            background: #fff9e6;
            border-left: 4px solid #f39c12;
            border-radius: 4px;
        }

        .observacoes h3 {
            font-size: 13px;
            margin-bottom: 8px;
            color: #e67e22;
        }

        .observacoes ul {
            margin: 0;
            padding-left: 20px;
            font-size: 12px;
        }

        .observacoes li {
            margin-bottom: 4px;
        }

        /* ===========================
                ASSINATURAS
        ============================ */
        .assinaturas {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 40px;
            margin: 40px 0 20px;
            padding-top: 20px;

        }

        .assinatura {
            text-align: center;
        }

        .linha-assinatura {
            border-bottom: 1px solid #444;
            margin-bottom: 5px;
            padding-top: 30px;
        }

        .assinatura p {
            font-size: 11px;
            color: #666;
            margin: 0;
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
            .footer { position: fixed; }
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

    <!-- INFORMAÇÕES DO BOLETIM -->
    <div class="info-box">
        <h1>BOLETIM ESCOLAR</h1>
        <div class="report-subtitle">${anoLetivo} - ${trimestre}º TRIMESTRE</div>

        <div class="aluno-info">
            <p><strong>Aluno:</strong> ${aluno.nome}</p>
            <p><strong>Turma:</strong> ${turma.nome}</p>
            <p><strong>Turno:</strong> ${turma.turno}</p>
            <p><strong>Data de Emissão:</strong> ${dataEmissao}</p>
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
                        <td>ENSINO GLOBALIZADO</td>
                        <td>${notas.globalizada || ' - '}</td>
                        <td class="situacao-${calcularSituacao(notas.globalizada).toLowerCase()}">
                            ${calcularSituacao(notas.globalizada)}
                        </td>
                    </tr>
                </tbody>
                <tfoot>
                    <tr class="media-final">
                        <td><strong>MÉDIA FINAL</strong></td>
                        <td><strong>${calcularMedia()}</strong></td>
                        <td class="situacao-${calcularSituacao(calcularMedia()).toLowerCase()}">
                            <strong>${calcularSituacao(calcularMedia())}</strong>
                        </td>
                    </tr>
                </tfoot>
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
            .map(discId => `
                        <tr>
                            <td>${disciplinas[discId]}</td>
                            <td>${getNotaDisciplina(discId)}</td>
                            <td class="situacao-${calcularSituacao(getNotaDisciplina(discId)).toLowerCase()}">
                                ${calcularSituacao(getNotaDisciplina(discId))}
                            </td>
                        </tr>
                      `).join('')}
                </tbody>
                <tfoot>
                    <tr class="media-final">
                        <td><strong>MÉDIA GERAL</strong></td>
                        <td><strong>${calcularMedia()}</strong></td>
                        <td class="situacao-${calcularSituacao(calcularMedia()).toLowerCase()}">
                            <strong>${calcularSituacao(calcularMedia())}</strong>
                        </td>
                    </tr>
                </tfoot>
            </table>
        `}
    </div>

    <!-- OBSERVAÇÕES -->
    <div class="observacoes">
        <h3>Observações:</h3>
        <ul>
            <li>Escala de avaliação: 0 a 100 pontos</li>
            <li>Média para aprovação: 60 pontos</li>
            <li>Este documento é gerado automaticamente pelo sistema</li>
            <li>Boletim referente ao ${trimestre}º trimestre do ano letivo de ${anoLetivo}</li>
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

    <!-- FOOTER FIXO -->
    <div class="footer">
        Gerado automaticamente pelo EDU System — Impressão em ${dataHoraAgora}
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