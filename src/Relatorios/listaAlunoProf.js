export function gerarRelatorioAlunosProfessor({
    turma,
    alunos,
    qtdAtivos,
    dataHoraAgora,
    formatarData,
}) {

    function calcularIdadeRelatorio(dataNascimento) {
        if (!dataNascimento) return "-";
        try {
            const data = new Date(dataNascimento);
            if (isNaN(data.getTime())) return "-";

            const hoje = new Date();
            let idade = hoje.getFullYear() - data.getFullYear();
            const mes = hoje.getMonth() - data.getMonth();

            if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
                idade--;
            }
            return idade;
        } catch (error) {
            return "-";
        }
    }

    return `
<html>
<head>
    <title>LISTA DE ALUNOS - ${turma.nome}</title>

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

        .turno {
            font-size: 16px;
            color: #4b5563;
            font-weight: 600;
        }

        /* ===========================
                INFORMAÇÕES DA TURMA
        ============================ */
        .turma-info {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
            padding: 13px;
            background: #f8fafc;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }

        .info-item {
            text-align: center;
        }

        .info-value {
            font-size: 20px;
            font-weight: 700;
            color: #64748B;
            display: block;
        }

        .info-label {
            font-size: 14px;
            color: #6b7280;
            margin-top: 4px;
            font-weight: 600;
        }

        /* ===========================
                TABELA
        ============================ */
        .table-container {
            margin-top: 10px;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        table {
            width: 100%;
            border-collapse: collapse;
            font-size: 14px;
        }

        thead {
            background: #64748B;
        }

        th {
            padding: 12px 16px;
            font-weight: 600;
            color: white;
            text-align: left;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
        }

        /* DATA DE NASCIMENTO E IDADE CENTRALIZADAS */
        th:nth-child(2),
        td:nth-child(2),
        th:nth-child(3),
        td:nth-child(3) {
            text-align: center;
        }

        td {
            padding: 8px 16px;
            border-bottom: 1px solid #f3f4f6;
            color: #374151;
        }

        tbody tr:nth-child(even) {
            background: #f9fafb;
        }

        tbody tr:hover {
            background: #f3f4f6;
        }

        .aluno-nome {
            font-weight: 600;
            color: #111827;
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
                margin-bottom: 5mm; /* Margem mínima na parte inferior */
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
            
            .turma-info {
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
                bottom: 0mm; /* COLADO no fim da margem A4 */
                left: 0mm; /* ESTICADO da esquerda */
                right: 0mm; /* ESTICADO da direita */
                padding: 8px 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
                border-top: 2px solid #e5e7eb;
                font-size: 12px;
            }

            /* Garantir que o conteúdo não fique por baixo do footer */
            .table-container {
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
    <div class="main-title">LISTA DE ALUNOS - ${turma.nome} - ${turma.turno.toUpperCase()}</div>

    <!-- INFORMAÇÕES DA TURMA -->
    <div class="turma-info">
        <div class="info-item">
            <span class="info-value">${alunos.length}</span>
            <span class="info-label">Total de Alunos</span>
        </div>
        <div class="info-item">
            <span class="info-value">${qtdAtivos}/${turma.capacidade || turma.quantidadeMaxima || alunos.length}</span>
            <span class="info-label">Capacidade</span>
        </div>
    </div>

    <!-- TABELA -->
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th>Nome</th>
                    <th>Data de Nascimento</th>
                    <th>Idade</th>
                </tr>
            </thead>

            <tbody>
                ${alunos
                .map((aluno) => {
                    const dataNascimento = aluno.dataNascimento || aluno.data_nascimento || aluno.nascimento || aluno.dt_nascimento || aluno.birthdate;
                    const idade = calcularIdadeRelatorio(dataNascimento);

                    return `
                        <tr>
                            <td class="aluno-nome">${aluno.nome}</td>
                            <td>${formatarData(dataNascimento)}</td>
                            <td><strong>${typeof idade === 'number' ? `${idade} anos` : idade}</strong></td>
                        </tr>
                    `;
                })
                .join("")}
            </tbody>
        </table>
    </div>

    <!-- FOOTER - ESTICADO NA LARGURA -->
    <div class="footer">
        <p>Gerado automaticamente pelo EduSystem — Impresso em ${dataHoraAgora}</p>
    </div>

    <script>
        // Função para calcular idade no relatório
        function calcularIdadeRelatorio(dataNascimento) {
            if (!dataNascimento) return "-";
            try {
                const data = new Date(dataNascimento);
                if (isNaN(data.getTime())) return "-";
                
                const hoje = new Date();
                let idade = hoje.getFullYear() - data.getFullYear();
                const mes = hoje.getMonth() - data.getMonth();
                
                if (mes < 0 || (mes === 0 && hoje.getDate() < data.getDate())) {
                    idade--;
                }
                return idade;
            } catch (error) {
                return "-";
            }
        }
    </script>

</body>
</html>
`;
}