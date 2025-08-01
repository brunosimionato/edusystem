// src/pages/CadastroAluno/CadastroAluno.jsx
import React, { useState, useEffect } from 'react';
// Mantendo os ícones lucide-react
import { User, Calendar, Mail, Phone, Home, GraduationCap, Users, Plus, XCircle, Trash2 } from 'lucide-react'; // Adicionei Trash2 para o botão de remover
import './cadastroAluno.css'; // O CSS que você precisará ajustar para os novos elementos

const CadastroAluno = () => {
    // Estado para controlar a visibilidade da seção de histórico escolar.
    const [showAcademicHistorySection, setShowAcademicHistorySection] = useState(false);
    // Estado para armazenar os anos escolares e suas notas de forma unificada
    const [academicYears, setAcademicYears] = useState([]);

    // Disciplinas padrão para séries a partir do 6º ano
    const disciplines = [
        'Português', 'Matemática', 'Ciências', 'História', 'Geografia', 'Inglês', 'Educação Física', 'Arte'
        // Adicione mais disciplinas conforme necessário
    ];

    // Função para lidar com a mudança do checkbox "Aluno proveniente de matrícula"
    const handleProvenanceChange = (event) => {
        const isChecked = event.target.checked;
        setShowAcademicHistorySection(isChecked); // Controla a visibilidade da seção de histórico

        if (isChecked && academicYears.length === 0) {
            // Se marcado e não houver anos no histórico, adiciona o primeiro ano automaticamente
            // com o ano calendário vazio para preenchimento manual
            handleAddAcademicYear();
        } else if (!isChecked) {
            // Se desmarcado, limpa todos os anos escolares do estado
            setAcademicYears([]);
        }
    };

    // Função para adicionar um novo ano escolar de forma sequencial
    const handleAddAcademicYear = () => {
        setAcademicYears(prevYears => {
            const lastYear = prevYears.length > 0 ? prevYears[prevYears.length - 1] : null;

            let nextGradeNumber;
            // O ano calendário será sempre vazio para preenchimento manual
            const nextCalendarYear = ''; 

            if (lastYear) {
                // Extrai o número da série do último ano (ex: "1º ANO" -> 1)
                nextGradeNumber = parseInt(lastYear.grade.split('º')[0]) + 1;
            } else {
                // Se for o primeiro ano a ser adicionado, começa em 1º Ano
                nextGradeNumber = 1;
            }

            const nextGrade = `${nextGradeNumber}º ANO`;

            let newNotes = {};
            if (nextGradeNumber <= 5) {
                // Séries iniciais (1º ao 5º ano): uma única nota geral
                newNotes = { general: '' };
            } else {
                // Séries finais (6º ano em diante): notas por disciplina
                disciplines.forEach(disc => {
                    newNotes[disc.toLowerCase().replace(' ', '')] = ''; // Usa o nome da disciplina em minúsculas e sem espaços como chave
                });
            }

            const newEntry = {
                grade: nextGrade,
                calendarYear: nextCalendarYear, // Agora inicializado como vazio
                notes: newNotes
            };

            return [...prevYears, newEntry];
        });
    };

    // Função para atualizar a nota de um ano/disciplina específico
    const handleNoteChange = (yearIndex, noteKey, value) => {
        setAcademicYears(prevYears => {
            const updatedYears = [...prevYears];
            if (updatedYears[yearIndex].notes.hasOwnProperty(noteKey)) {
                updatedYears[yearIndex].notes[noteKey] = value;
            }
            return updatedYears;
        });
    };

    // Função para atualizar o ano calendário de um ano escolar específico
    const handleCalendarYearChange = (yearIndex, value) => {
        setAcademicYears(prevYears => {
            const updatedYears = [...prevYears];
            updatedYears[yearIndex].calendarYear = value;
            return updatedYears;
        });
    };

    // Função para lidar com o envio do formulário (exemplo)
    const handleSubmit = (event) => {
        event.preventDefault();
        console.log("Dados do aluno e histórico escolar:", {
            // Aqui você coletaria todos os outros dados do formulário
            academicYears: academicYears
        });
        alert('Formulário enviado! Verifique o console para os dados do histórico escolar.');
    };

    // NOVA FUNÇÃO: Limpar o formulário
    const handleClearForm = () => {
        // Limpa o histórico escolar
        setAcademicYears([]);
        setShowAcademicHistorySection(false);

        // Para limpar outros campos do formulário (Dados Pessoais, Contato, Responsável, Matrícula),
        // eles precisariam ser componentes controlados, ou seja, ter seus valores vinculados
        // a um estado no React e ter uma função onChange.
        // Exemplo:
        // setAlunoNome('');
        // setAlunoDataNascimento('');
        // ... e assim por diante para cada campo que você deseja limpar.
        // Como o código atual não controla esses campos via estado, eles não serão limpos automaticamente.
        // Para uma limpeza completa, você precisaria adicionar estados para cada input/select.
    };

    return (
        <div className="cadastro-aluno-form-container">
            <h2 className="cadastro-aluno-form-title">Cadastro de Novo Aluno</h2>

            {/* Seção de Dados Pessoais */}
            <div className="cadastro-aluno-form-section">
                <h3 className="cadastro-aluno-section-header">Dados Pessoais</h3>
                <div className="cadastro-aluno-form-grid">
                    {/* Nome e Data de Nascimento */}
                    <div className="cadastro-aluno-form-group two-thirds-width">
                        <label htmlFor="alunoNome">Nome Completo:</label>
                        <div className="cadastro-aluno-input-wrapper">
                            <User size={18} className="cadastro-aluno-input-icon" />
                            <input type="text" id="alunoNome" name="alunoNome" placeholder="Nome completo do aluno" className="cadastro-aluno-input" />
                        </div>
                    </div>
                    <div className="cadastro-aluno-form-group third-width">
                        <label htmlFor="alunoDataNascimento">Data de Nascimento:</label>
                        <div className="cadastro-aluno-input-wrapper">
                            <Calendar size={18} className="cadastro-aluno-input-icon" />
                            <input type="date" id="alunoDataNascimento" name="alunoDataNascimento" className="cadastro-aluno-input" />
                        </div>
                    </div>
                    
                    {/* CPF, RG e Gênero */}
                    <div className="cadastro-aluno-form-group third-width">
                        <label htmlFor="alunoCPF">CPF:</label>
                        <input type="text" id="alunoCPF" name="alunoCPF" placeholder="000.000.000-00" className="cadastro-aluno-input" />
                    </div>
                    <div className="cadastro-aluno-form-group third-width">
                        <label htmlFor="alunoRG">RG:</label>
                        <input type="text" id="alunoRG" name="alunoRG" placeholder="00.000.000-0" className="cadastro-aluno-input" />
                    </div>
                    <div className="cadastro-aluno-form-group third-width">
                        <label htmlFor="alunoGenero">Gênero:</label>
                        <select id="alunoGenero" name="alunoGenero" className="cadastro-aluno-select">
                            <option value="">Selecione</option>
                            <option value="masculino">Masculino</option>
                            <option value="feminino">Feminino</option>
                            <option value="outro">Outro</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Seção de Contato */}
            <div className="cadastro-aluno-form-section">
                <h3 className="cadastro-aluno-section-header">Contato</h3>
                <div className="cadastro-aluno-form-grid">
                    {/* Email e Telefone */}
                    <div className="cadastro-aluno-form-group half-width">
                        <label htmlFor="alunoEmail">E-mail:</label>
                        <div className="cadastro-aluno-input-wrapper">
                            <Mail size={18} className="cadastro-aluno-input-icon" />
                            <input type="email" id="alunoEmail" name="alunoEmail" placeholder="email@exemplo.com" className="cadastro-aluno-input" />
                        </div>
                    </div>
                    <div className="cadastro-aluno-form-group half-width">
                        <label htmlFor="alunoTelefone">Telefone:</label>
                        <div className="cadastro-aluno-input-wrapper">
                            <Phone size={18} className="cadastro-aluno-input-icon" />
                            <input type="tel" id="alunoTelefone" name="alunoTelefone" placeholder="(XX) XXXXX-XXXX" className="cadastro-aluno-input" />
                        </div>
                    </div>

                    {/* Endereço - Linha 1: Rua */}
                    <div className="cadastro-aluno-form-group full-width">
                        <label htmlFor="alunoEnderecoRua">Endereço (Rua/Avenida):</label>
                        <div className="cadastro-aluno-input-wrapper">
                            <Home size={18} className="cadastro-aluno-input-icon" />
                            <input type="text" id="alunoEnderecoRua" name="alunoEnderecoRua" placeholder="Rua, Avenida, etc." className="cadastro-aluno-input" />
                        </div>
                    </div>

                    {/* Endereço - Linha 2: Número, Bairro e CEP */}
                    <div className="cadastro-aluno-form-group quarter-width">
                        <label htmlFor="alunoEnderecoNumero">Número:</label>
                        <input type="text" id="alunoEnderecoNumero" name="alunoEnderecoNumero" placeholder="123" className="cadastro-aluno-input" />
                    </div>
                    <div className="cadastro-aluno-form-group half-width">
                        <label htmlFor="alunoEnderecoBairro">Bairro:</label>
                        <input type="text" id="alunoEnderecoBairro" name="alunoEnderecoBairro" placeholder="Nome do bairro" className="cadastro-aluno-input" />
                    </div>
                    <div className="cadastro-aluno-form-group quarter-width">
                        <label htmlFor="alunoEnderecoCEP">CEP:</label>
                        <input type="text" id="alunoEnderecoCEP" name="alunoEnderecoCEP" placeholder="00000-000" className="cadastro-aluno-input" />
                    </div>

                    {/* Endereço - Linha 3: Cidade e Estado */}
                    <div className="cadastro-aluno-form-group three-quarters-width">
                        <label htmlFor="alunoEnderecoCidade">Cidade:</label>
                        <input type="text" id="alunoEnderecoCidade" name="alunoEnderecoCidade" placeholder="Nome da cidade" className="cadastro-aluno-input" />
                    </div>
                    <div className="cadastro-aluno-form-group quarter-width">
                        <label htmlFor="alunoEnderecoEstado">UF:</label>
                        <input type="text" id="alunoEnderecoEstado" name="alunoEnderecoEstado" placeholder="RS" maxLength="2" className="cadastro-aluno-input" />
                    </div>
                </div>
            </div>

            {/* Seção de Responsável */}
            <div className="cadastro-aluno-form-section">
                <h3 className="cadastro-aluno-section-header">Dados do Responsável</h3>
                <div className="cadastro-aluno-form-grid">
                    {/* Nome do Responsável e CPF */}
                    <div className="cadastro-aluno-form-group two-thirds-width">
                        <label htmlFor="responsavelNome">Nome Completo do Responsável:</label>
                        <div className="cadastro-aluno-input-wrapper">
                            <User size={18} className="cadastro-aluno-input-icon" />
                            <input type="text" id="responsavelNome" name="responsavelNome" placeholder="Nome completo do responsável" className="cadastro-aluno-input" />
                        </div>
                    </div>
                    <div className="cadastro-aluno-form-group third-width">
                        <label htmlFor="responsavelCPF">CPF do Responsável:</label>
                        <input type="text" id="responsavelCPF" name="responsavelCPF" placeholder="000.000.000-00" className="cadastro-aluno-input" />
                    </div>

                    {/* Telefone e Email do Responsável */}
                    <div className="cadastro-aluno-form-group half-width">
                        <label htmlFor="responsavelTelefone">Telefone do Responsável:</label>
                        <div className="cadastro-aluno-input-wrapper">
                            <Phone size={18} className="cadastro-aluno-input-icon" />
                            <input type="tel" id="responsavelTelefone" name="responsavelTelefone" placeholder="(XX) XXXXX-XXXX" className="cadastro-aluno-input" />
                        </div>
                    </div>
                    <div className="cadastro-aluno-form-group half-width">
                        <label htmlFor="responsavelEmail">E-mail do Responsável:</label>
                        <div className="cadastro-aluno-input-wrapper">
                            <Mail size={18} className="cadastro-aluno-input-icon" />
                            <input type="email" id="responsavelEmail" name="responsavelEmail" placeholder="email@exemplo.com" className="cadastro-aluno-input" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Seção de Matrícula */}
            <div className="cadastro-aluno-form-section">
                <h3 className="cadastro-aluno-section-header">Dados da Matrícula</h3>
                <div className="cadastro-aluno-form-grid">
                    {/* Turma, Ano Letivo e Data de Matrícula */}
                    <div className="cadastro-aluno-form-group third-width">
                        <label htmlFor="alunoTurma">Turma:</label>
                        <div className="cadastro-aluno-input-wrapper">
                            <Users size={18} className="cadastro-aluno-input-icon" />
                            <select id="alunoTurma" name="alunoTurma" className="cadastro-aluno-select">
                                <option value="">Selecione a Turma</option>
                                <option value="1anoA">1º Ano A</option>
                                <option value="2anoB">2º Ano B</option>
                                <option value="3anoC">3º Ano C</option>
                                {/* Adicione mais opções de turmas conforme necessário */}
                            </select>
                        </div>
                    </div>
                    <div className="cadastro-aluno-form-group third-width">
                        <label htmlFor="alunoAnoLetivo">Ano Letivo:</label>
                        <div className="cadastro-aluno-input-wrapper">
                            <Calendar size={18} className="cadastro-aluno-input-icon" />
                            <input type="number" id="alunoAnoLetivo" name="alunoAnoLetivo" placeholder="2025" className="cadastro-aluno-input" />
                        </div>
                    </div>
                    <div className="cadastro-aluno-form-group third-width">
                        <label htmlFor="alunoDataMatricula">Data da Matrícula:</label>
                        <div className="cadastro-aluno-input-wrapper">
                            <Calendar size={18} className="cadastro-aluno-input-icon" />
                            <input type="date" id="alunoDataMatricula" name="alunoDataMatricula" className="cadastro-aluno-input" />
                        </div>
                    </div>

                    {/* Checkbox "Proveniente de Matrícula" que controla a exibição do histórico */}
                    <div className="cadastro-aluno-form-group full-width" style={{ marginTop: '20px' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <input
                                type="checkbox"
                                id="provenienteMatricula"
                                className="cadastro-aluno-checkbox"
                                checked={showAcademicHistorySection}
                                onChange={handleProvenanceChange}
                                style={{ transform: 'scale(1.2)' }}
                            />
                            Aluno proveniente de matrícula (Exibir Histórico Escolar)?
                        </label>
                    </div>
                </div>
            </div>

            {/* Seção para o Histórico Escolar - Exibida condicionalmente */}
            {showAcademicHistorySection && (
                <div id="gradeEntrySection" className="cadastro-aluno-form-section">
                    <h3 className="cadastro-aluno-section-header">Histórico Escolar</h3>
                    <div className="grade-table-header">
                        <div className="grade-header-item">SÉRIE</div>
                        <div className="grade-header-item">ANO</div> {/* Cabeçalho para o Ano Calendário */}
                        <div className="grade-header-item grades-header">NOTA(S)</div>
                        <div className="grade-header-item"></div> {/* Coluna para o botão remover */}
                    </div>
                    <div id="gradeRowsContainer">
                        {academicYears.map((yearData, index) => (
                            <div key={index} className="grade-entry-row-dynamic">
                                <div className="grade-entry-cell">{yearData.grade}</div>
                                <div className="grade-entry-cell">
                                    <input
                                        type="number"
                                        className="cadastro-aluno-input"
                                        placeholder="Ano Calendário"
                                        value={yearData.calendarYear}
                                        onChange={(e) => handleCalendarYearChange(index, e.target.value)}
                                        min="1900" // Adicione um limite mínimo razoável
                                        max={new Date().getFullYear()} // Limite máximo para o ano atual
                                    />
                                </div>
                                <div className="grade-entry-cell">
                                    {/* Renderização condicional das notas baseada na série */}
                                    {parseInt(yearData.grade.split('º')[0]) <= 5 ? (
                                        // Séries iniciais (1º ao 5º ano): um único input de nota geral
                                        <input
                                            type="number"
                                            className="cadastro-aluno-input"
                                            placeholder="Nota Geral"
                                            value={yearData.notes.general}
                                            onChange={(e) => handleNoteChange(index, 'general', e.target.value)}
                                            min="0"
                                            max="100"
                                        />
                                    ) : (
                                        // Séries finais (6º ano em diante): grid de inputs por disciplina
                                        <div className="discipline-grades-grid">
                                            {Object.keys(yearData.notes).map(disciplineKey => (
                                                <div className="cadastro-aluno-form-group" key={disciplineKey}>
                                                    <label htmlFor={`grade-${index}-${disciplineKey}`}>
                                                        {disciplineKey.charAt(0).toUpperCase() + disciplineKey.slice(1).replace(/([A-Z])/g, ' $1').trim()}
                                                    </label>
                                                    <input
                                                        type="number"
                                                        id={`grade-${index}-${disciplineKey}`}
                                                        className="cadastro-aluno-input"
                                                        placeholder="Nota"
                                                        value={yearData.notes[disciplineKey]}
                                                        onChange={(e) => handleNoteChange(index, disciplineKey, e.target.value)}
                                                        min="0"
                                                        max="100"
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {/* Botão de remover ano escolar, visível se houver mais de um ano */}
                                {academicYears.length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => setAcademicYears(academicYears.filter((_, i) => i !== index))}
                                        className="cadastro-aluno-remove-button" // Classe para o botão de remover
                                    >
                                        <Trash2 size={18} /> Remover
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        id="addGradeYearButton"
                        className="cadastro-aluno-add-button green-button" // Adicionei a classe green-button
                        onClick={handleAddAcademicYear}
                    >
                        <Plus size={18} /> Adicionar Próximo Ano Escolar
                    </button>
                </div>
            )}

            {/* Botões de Ação */}
            <div className="cadastro-aluno-form-actions">
                <button type="button" className="cadastro-aluno-clear-button red-button" onClick={handleClearForm}>
                    <XCircle size={20} /> Limpar Formulário
                </button>
                <button type="submit" className="cadastro-aluno-submit-button blue-button" onClick={handleSubmit}>
                    <GraduationCap size={20} /> Cadastrar Aluno
                </button>
            </div>
        </div>
    );
};

export default CadastroAluno;