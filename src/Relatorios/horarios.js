export function gerarRelatorioHorarioTurma({ turma, horarios, professores, disciplinas, dataHoraAgora }) {
    return `
<html>
<head>
    <title>HORÁRIO DA TURMA - ${turma.nome}</title>
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
            text-transform: uppercase;
        }

        /* ===========================
                SEÇÃO DA TURMA
        ============================ */
        .turma-section {
            margin-bottom: 30px;
        }

        .turma-header {
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
            padding: 15px;
            margin-bottom: 15px;
        }

        .turma-title {
            font-size: 16px;
            font-weight: 670;
            color: #111827;
            margin-bottom: 5px;
        }

        .turma-details {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }

        /* ===========================
                TABELA DE HORÁRIOS
        ============================ */
        .table-container {
            margin-top: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 13px;
        }

        thead {
            background: #64748B;
        }

        th {
            padding: 12px 14px;
            font-weight: 600;
            color: white;
            text-align: center;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            height: 45px;
        }

        /* HORÁRIO CENTRALIZADO */
        th:nth-child(1),
        td:nth-child(1) {
            text-align: center;
        }

        td {
            padding: 10px 14px;
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
            text-align: center;
            vertical-align: middle;
            height: 50px;
        }

        tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        tbody tr:hover {
            background: #f3f4f6;
        }

        /* LINHAS DE INTERVALO DESTACADAS */
        .break-row {
            background: #e5e7eb !important;
            color: #374151;
        }

        .break-row td {
            color: #374151;
            text-align: center;
            font-weight: 600;
            height: 35px;
            background: #e5e7eb !important;
            border-bottom: 1px solid #d1d5db;
        }

        .break-row td:first-child {
            background: #374151 !important;
            color: white;
            font-weight: 600;
        }

        .materia-cell {
            font-weight: 600;
            color: #111827;
            text-align: center;
            vertical-align: middle;
        }

        .materia-nome {
            font-weight: 600;
            display: block;
            font-size: 12px;
            line-height: 1.3;
            text-align: center;
            margin-bottom: 2px;
        }

        .professor-nome {
            font-size: 9px;
            color: #6b7280;
            display: block;
            line-height: 1.2;
            text-align: center;
            font-weight: 500;
        }

        .turma-nome {
            font-size: 10px;
            color: #6b7280;
            display: block;
            line-height: 1.2;
            margin-top: 2px;
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
            font-size: 12px;
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
                font-size: 13px;
            }
            
            .header {
                margin-bottom: 20px;
                padding-bottom: 15px;
            }
            
            .turma-header {
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

            .break-row {
                background: #e5e7eb !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .break-row td {
                background: #e5e7eb !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
            }

            .break-row td:first-child {
                background: #374151 !important;
                color: white !important;
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
                font-size: 11px;
                background: #ffffff !important;
            }

            /* Garantir que o conteúdo não fique por baixo do footer */
            .turma-section:last-child {
                margin-bottom: 25px;
            }

            .graduation-logo {
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                border: 3px solid #64748B !important;
                background: #f8fafc !important;
            }

            /* Evitar quebra de página dentro das seções */
            .turma-section {
                page-break-inside: avoid;
            }
            
            table {
                page-break-inside: auto;
            }
            
            tr {
                page-break-inside: avoid;
                page-break-after: auto;
            }

            /* Ajustes de fonte para impressão */
            table {
                font-size: 12px;
            }

            th {
                font-size: 11px;
                padding: 10px 12px;
            }

            td {
                padding: 8px 12px;
                font-size: 11px;
            }

            .materia-nome {
                font-size: 11px;
            }

            .professor-nome {
                font-size: 8px;
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
    <div class="main-title">HORÁRIO DA TURMA - ${turma.nome}</div>

    <!-- SEÇÃO DA TURMA -->
    <div class="turma-section">
        <div class="turma-header">
            <div class="turma-title">${turma.nome}</div>
            <div class="turma-details">Turno: ${turma.turno} • Horário: ${turma.turno === "Manhã" ? "07:30 - 11:15" : "13:00 - 17:00"}</div>
        </div>

        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th style="width: 18%">Horário</th>
                        <th style="width: 16.4%">Segunda</th>
                        <th style="width: 16.4%">Terça</th>
                        <th style="width: 16.4%">Quarta</th>
                        <th style="width: 16.4%">Quinta</th>
                        <th style="width: 16.4%">Sexta</th>
                    </tr>
                </thead>
                <tbody>
                    ${horarios.map(linha => `
                        <tr class="${linha.isBreak ? "break-row" : ""}">
                            <td><strong>${linha.label}</strong></td>
                            ${linha.dias.map(dia => {
                                if (dia === null || linha.isBreak) {
                                    return `<td>${linha.isBreak ? (linha.periodo || linha.label) : '-'}</td>`;
                                }

                                const disciplina = disciplinas.find(x => x.id === dia.idDisciplina);
                                const professor = professores.find(x => x.id === dia.idProfessor);
                                
                                const disciplinaNome = disciplina?.nome || `Disciplina ${dia.idDisciplina}`;
                                
                                // Função para extrair primeiro e último nome
                                const extrairPrimeiroUltimoNome = (nomeCompleto) => {
                                    if (!nomeCompleto) return `Professor ${dia.idProfessor}`;
                                    
                                    const nomes = nomeCompleto.trim().split(' ');
                                    if (nomes.length === 1) return nomes[0];
                                    
                                    const primeiroNome = nomes[0];
                                    const ultimoNome = nomes[nomes.length - 1];
                                    
                                    return `${primeiroNome} ${ultimoNome}`;
                                };

                                const professorNome = professor?.usuario?.nome || professor?.nome;
                                const professorAbreviado = extrairPrimeiroUltimoNome(professorNome) || `Professor ${dia.idProfessor}`;
                                
                                return `
                                    <td class="materia-cell">
                                        <span class="materia-nome">${disciplinaNome}</span>
                                        <span class="professor-nome">${professorAbreviado}</span>
                                    </td>
                                `;
                            }).join('')}
                        </tr>
                    `).join('')}
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