export function gerarRelatorioProfessor({
  professor,
  dataHoraAgora,
  formatarData,
}) {
  
  // Funções de formatação
  const formatarCPF = (cpf) => {
    if (!cpf) return '-';
    cpf = cpf.replace(/\D/g, '');
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  const formatarTelefone = (telefone) => {
    if (!telefone) return '-';
    telefone = telefone.replace(/\D/g, '');
    if (telefone.length === 11) {
      return telefone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (telefone.length === 10) {
      return telefone.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
    }
    return telefone;
  };

  const formatarCEP = (cep) => {
    if (!cep) return '-';
    cep = cep.replace(/\D/g, '');
    return cep.replace(/(\d{5})(\d{3})/, '$1-$2');
  };

  return `
<html>
<head>
    <title>RELATÓRIO DO PROFESSOR - ${professor.usuario?.nome.toUpperCase()}</title>

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
                INFORMAÇÕES DO PROFESSOR
        ============================ */
        .professor-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
            padding: 20px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .info-section {
            display: flex;
            flex-direction: column;
            gap: 12px;
        }

        .info-item {
            display: flex;
            flex-direction: column;
            gap: 4px;
        }

        .info-label {
            font-size: 12px;
            font-weight: 600;
            color: #6b7280;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        .info-value {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
        }

        .info-value strong {
            color: #111827;
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
            align-items: center;
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
            text-align: center;
        }

        tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        tbody tr:hover {
            background: #f3f4f6;
        }

        /* ===========================
                COLUNAS ESPECÍFICAS
        ============================ */
        .turma-column {
            width: 20%;
            padding-left: 10px;
        }

        .disciplinas-column {
            width: 80%;
            padding-left: 200px;
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
            
            .professor-info {
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
    <div class="main-title">RELATÓRIO DO PROFESSOR - ${professor.usuario?.nome.toUpperCase()}</div>

    <!-- INFORMAÇÕES DO PROFESSOR -->
    <div class="professor-info">
        <div class="info-section">
            <div class="info-item">
                <span class="info-label">Email</span>
                <span class="info-value">${professor.usuario?.email || "-"}</span>
            </div>
            <div class="info-item">
                <span class="info-label">CPF</span>
                <span class="info-value">${professor.cpf ? formatarCPF(professor.cpf) : "-"}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Data de Nascimento</span>
                <span class="info-value">${formatarData(professor.nascimento)}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Telefone</span>
                <span class="info-value">${professor.telefone ? formatarTelefone(professor.telefone) : "-"}</span>
            </div>
        </div>
        
        <div class="info-section">
            <div class="info-item">
                <span class="info-label">Endereço</span>
                <span class="info-value">
                    ${professor.logradouro || ""}${professor.numero ? `, nº ${professor.numero}` : ""}${professor.bairro ? `, ${professor.bairro}` : ""}${professor.cidade ? `, ${professor.cidade}` : ""}${professor.estado ? ` - ${professor.estado}` : ""}${professor.cep ? `, CEP ${formatarCEP(professor.cep)}` : ""}
                </span>
            </div>
            <div class="info-item">
                <span class="info-label">Formação Acadêmica</span>
                <span class="info-value">${professor.formacaoAcademica || "-"}</span>
            </div>
        </div>
    </div>


    <!-- TURMAS -->
    <div class="table-section">
        <div class="section-title"style="text-transform: uppercase;">Turmas e disciplinas</div>
        <div class="table-container">
            <table>
                <thead>
                    <tr>
                        <th class="turma-column">Turma</th>
                        <th class="disciplinas-column">Disciplinas Ministradas</th>
                    </tr>
                </thead>
                <tbody>
                    ${
                      professor.turmas?.length
                        ? professor.turmas
                            .map(
                              (turma) => `
                                <tr>
                                    <td class="turma-column">${turma.nome}</td>
                                    <td class="disciplinas-column">${professor.disciplinas?.map(d => d.nome).join(", ") || "-"}</td>
                                </tr>
                            `
                            )
                            .join("")
                        : `<tr><td colspan="2">Nenhuma turma vinculada</td></tr>`
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