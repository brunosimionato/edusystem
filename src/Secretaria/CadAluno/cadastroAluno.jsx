import React, { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Mail,
  Phone,
  Home,
  GraduationCap,
  Users,
  Plus,
  XCircle,
  Trash2,
  Briefcase,
} from "lucide-react";
import "./cadastroAluno.css";
const CadastroAluno = () => {
  // Estado para controlar a visibilidade da seção de histórico escolar.
  const [showAcademicHistorySection, setShowAcademicHistorySection] =
    useState(false);
  // Estado para armazenar os anos escolares e suas notas de forma unificada
  const [academicYears, setAcademicYears] = useState([]);
  // Disciplinas padrão para séries a partir do 6º ano
  const disciplines = [
    "Português",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Inglês",
    "Educ. Física",
    "Arte",
  ];
  // Estados para controlar os campos do formulário (adicionados para permitir a limpeza)
  const [alunoNome, setAlunoNome] = useState("");
  const [alunoCPF, setAlunoCPF] = useState("");
  const [alunoRG, setAlunoRG] = useState("");
  const [alunoDataNascimento, setAlunoDataNascimento] = useState("");
  const [alunoGenero, setAlunoGenero] = useState("");
  const [alunoReligiao, setAlunoReligiao] = useState("");
  const [alunoEnderecoRua, setAlunoEnderecoRua] = useState("");
  const [alunoEnderecoNumero, setAlunoEnderecoNumero] = useState("");
  const [alunoEnderecoBairro, setAlunoEnderecoBairro] = useState("");
  const [alunoEnderecoCEP, setAlunoEnderecoCEP] = useState("");
  const [alunoEnderecoCidade, setAlunoEnderecoCidade] = useState("");
  const [alunoEnderecoEstado, setAlunoEnderecoEstado] = useState("");
  const [alunoTelefone, setAlunoTelefone] = useState("");
  const [alunoEmail, setAlunoEmail] = useState("");
  const [maeNome, setMaeNome] = useState("");
  const [maeCPF, setMaeCPF] = useState("");
  const [maeTelefone, setMaeTelefone] = useState("");
  const [maeProfissao, setMaeProfissao] = useState("");
  const [paiNome, setPaiNome] = useState("");
  const [paiCPF, setPaiCPF] = useState("");
  const [paiTelefone, setPaiTelefone] = useState("");
  const [paiProfissao, setPaiProfissao] = useState("");
  const [matriculaAnoLetivo, setMatriculaAnoLetivo] = useState("");
  const [matriculaSerie, setMatriculaSerie] = useState("");
  const [alunoProveniente, setAlunoProveniente] = useState(false);
  // Novo estado para armazenar os erros do formulário
  const [formErrors, setFormErrors] = useState({});
  // Função para lidar com a mudança do checkbox "Aluno proveniente de matrícula"
  const handleProvenanceChange = (event) => {
    const isChecked = event.target.checked;
    setAlunoProveniente(isChecked);
    setShowAcademicHistorySection(isChecked);
    if (isChecked && academicYears.length === 0) {
      handleAddAcademicYear();
    } else if (!isChecked) {
      setAcademicYears([]);
    }
  };
  // MASCARAS
  // Função atualizada para formatar o CPF enquanto o usuário digita
  const formatarCPF = (value) => {
    const cleanedValue = value.replace(/\D/g, ""); // Remove qualquer caractere que não seja dígito
    let maskedValue = cleanedValue;
    if (cleanedValue.length > 3) {
      maskedValue = `${cleanedValue.slice(0, 3)}.${cleanedValue.slice(3)}`;
    }
    if (cleanedValue.length > 6) {
      maskedValue = `${maskedValue.slice(0, 7)}.${cleanedValue.slice(6)}`;
    }
    if (cleanedValue.length > 9) {
      maskedValue = `${maskedValue.slice(0, 11)}-${cleanedValue.slice(9)}`;
    }
    return maskedValue.slice(0, 14); // Limita ao formato XXX.XXX.XXX-XX
  };
  // Nova função para formatar o RG
  const formatarRG = (value) => {
    return value.replace(/\D/g, "").slice(0, 10);
  };
  // Nova função para formatar o CEP
  const formatarCEP = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    let maskedValue = cleanedValue;
    if (cleanedValue.length > 5) {
      maskedValue = `${cleanedValue.slice(0, 5)}-${cleanedValue.slice(5)}`;
    }
    return maskedValue.slice(0, 9); // Limita ao formato XXXXX-XXX
  };
  // Nova função para formatar o Telefone (incluindo celular com 9º dígito)
  const formatarTelefone = (value) => {
    const cleanedValue = value.replace(/\D/g, "");
    let maskedValue = cleanedValue;
    if (cleanedValue.length > 0) {
      maskedValue = `(${cleanedValue.slice(0, 2)}`;
    }
    if (cleanedValue.length > 2) {
      maskedValue = `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(2)}`;
    }
    if (cleanedValue.length > 7) {
      // Para números com 9 dígitos (celular)
      maskedValue = `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(
        2,
        7
      )}-${cleanedValue.slice(7)}`;
    } else if (cleanedValue.length > 6) {
      // Para números com 8 dígitos (fixo)
      maskedValue = `(${cleanedValue.slice(0, 2)}) ${cleanedValue.slice(
        2,
        6
      )}-${cleanedValue.slice(6)}`;
    }
    return maskedValue.slice(0, 15); // Limita ao formato (XX) XXXXX-XXXX
  };
  // Função para adicionar um novo ano escolar de forma sequencial
  const handleAddAcademicYear = () => {
    setAcademicYears((prevYears) => {
      const lastYear =
        prevYears.length > 0 ? prevYears[prevYears.length - 1] : null;
      let nextGradeNumber;
      const nextCalendarYear = ""; // Inicializa o ano calendário vazio
      if (lastYear) {
        // Extrai o número do ano da string "Xº ANO"
        nextGradeNumber = parseInt(lastYear.grade.split("º")[0]) + 1;
      } else {
        nextGradeNumber = 1;
      }
      // Adicionado para limitar até o 9º ano
      if (nextGradeNumber > 9) {
        alert("Não é possível adicionar anos escolares após o 9º ano.");
        return prevYears; // Não adiciona se já passou do 9º ano
      }
      const nextGrade = `${nextGradeNumber}º ANO`;
      let newNotes = {};
      // Lógica para definir notas gerais ou por disciplina
      if (nextGradeNumber <= 5) {
        newNotes = { general: "" };
      } else {
        disciplines.forEach((disc) => {
          newNotes[disc.toLowerCase().replace(" ", "")] = "";
        });
      }
      const newEntry = {
        grade: nextGrade,
        calendarYear: nextCalendarYear,
        notes: newNotes,
      };
      return [...prevYears, newEntry];
    });
  };
  // Função para atualizar a nota de um ano/disciplina específico
  const handleNoteChange = (yearIndex, noteKey, value) => {
    setAcademicYears((prevYears) => {
      const updatedYears = [...prevYears];
      if (updatedYears[yearIndex].notes.hasOwnProperty(noteKey)) {
        updatedYears[yearIndex].notes[noteKey] = value;
      }
      return updatedYears;
    });
  };
  // Função para atualizar o ano calendário de um ano escolar específico
  const handleCalendarYearChange = (yearIndex, value) => {
    setAcademicYears((prevYears) => {
      const updatedYears = [...prevYears];
      updatedYears[yearIndex].calendarYear = value;
      return updatedYears;
    });
  };
  // Função para lidar com a remoção de um ano escolar
  const handleRemoveAcademicYear = (indexToRemove) => {
    if (academicYears.length === 1 && indexToRemove === 0) {
      // Se houver apenas um ano e o usuário tentar removê-lo,
      // exibe um alerta para desmarcar o checkbox.
      alert(
        'Para remover o último ano escolar, por favor, desmarque a opção "Aluno proveniente de outra matrícula/escola" acima.'
      );
    } else if (indexToRemove === academicYears.length - 1) {
      // Se for o último ano e houver mais de um, remove normalmente
      setAcademicYears(academicYears.filter((_, i) => i !== indexToRemove));
    } else {
      // Se não for o último ano na ordem, exibe o alerta de remoção em ordem
      alert(
        "Você só pode remover o último ano escolar adicionado. Por favor, remova os anos em ordem decrescente."
      );
    }
  };
  // Função de validação do formulário
  const validateForm = () => {
    const errors = {};
    // Validação de Dados Pessoais
    if (!alunoNome.trim()) errors.alunoNome = " ";
    if (alunoCPF.replace(/\D/g, "").length !== 11) errors.alunoCPF = " ";
    if (alunoRG.replace(/\D/g, "").length < 8) errors.alunoRG = " ";
    if (!alunoDataNascimento) errors.alunoDataNascimento = " ";
    if (!alunoGenero) errors.alunoGenero = " ";
    if (!alunoEnderecoRua.trim()) errors.alunoEnderecoRua = " ";
    if (!alunoEnderecoNumero.trim()) errors.alunoEnderecoNumero = " ";
    if (!alunoEnderecoBairro.trim()) errors.alunoEnderecoBairro = " ";
    if (alunoEnderecoCEP.replace(/\D/g, "").length !== 8)
      errors.alunoEnderecoCEP = " ";
    if (!alunoEnderecoCidade.trim()) errors.alunoEnderecoCidade = " ";
    if (!alunoEnderecoEstado) errors.alunoEnderecoEstado = " ";
    if (alunoTelefone.replace(/\D/g, "").length < 10)
      errors.alunoTelefone = " ";
    // Validação de Dados Mãe
    if (!maeNome.trim()) errors.maeNome = " ";
    if (maeCPF.replace(/\D/g, "").length !== 11) errors.maeCPF = " ";
    if (maeTelefone.replace(/\D/g, "").length < 10) errors.maeTelefone = " ";
    // Validação de Dados dos Pai
    if (!paiNome.trim()) errors.paiNome = " ";
    if (paiCPF.replace(/\D/g, "").length !== 11) errors.paiCPF = " ";
    if (paiTelefone.replace(/\D/g, "").length < 10) errors.paiTelefone = " ";
    // Validação de Dados de Matrícula
    if (!/^\d{4}$/.test(matriculaAnoLetivo)) {
      errors.matriculaAnoLetivo = " ";
    }
    // Validação de Histórico Escolar (se aplicável)
    if (alunoProveniente) {
      if (academicYears.length === 0) {
        errors.academicHistory = " ";
      } else {
        academicYears.forEach((year, index) => {
          if (
            !year.calendarYear ||
            year.calendarYear.length !== 4 ||
            isNaN(year.calendarYear)
          ) {
            errors[`academicYear-${index}-calendarYear`] = " ";
          }
          const gradeNumber = parseInt(year.grade.split("º")[0]);
          if (gradeNumber <= 5) {
            if (!year.notes.general.trim()) {
              errors[`academicYear-${index}-generalNote`] = " ";
            }
          } else {
            disciplines.forEach((disc) => {
              const noteKey = disc.toLowerCase().replace(" ", "");
              if (!year.notes[noteKey].trim()) {
                errors[`academicYear-${index}-${noteKey}`] = " ";
              }
            });
          }
        });
      }
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      alert("Por favor, revise os campos obrigatórios antes de continuar.");
      return false;
    }
    return true; // Retorna true se não houver erros
  };
  // Função para lidar com o envio do formulário
  const handleSubmit = (event) => {
    event.preventDefault();
    const isValid = validateForm(); // Valida o formulário
    if (isValid) {
      console.log("Dados do aluno e histórico escolar:", {
        alunoNome,
        alunoCPF: alunoCPF.replace(/\D/g, ""), // Envia CPF limpo
        alunoRG: alunoRG.replace(/\D/g, ""), // Envia RG limpo
        alunoDataNascimento,
        alunoGenero,
        alunoReligiao,
        alunoEnderecoRua,
        alunoEnderecoNumero,
        alunoEnderecoBairro,
        alunoEnderecoCEP: alunoEnderecoCEP.replace(/\D/g, ""), // Envia CEP limpo
        alunoEnderecoCidade,
        alunoEnderecoEstado,
        alunoTelefone: alunoTelefone.replace(/\D/g, ""), // Envia Telefone limpo
        alunoEmail,
        maeNome,
        maeCPF: maeCPF.replace(/\D/g, ""), // Envia CPF limpo
        maeTelefone: maeTelefone.replace(/\D/g, ""), // Envia Telefone limpo
        maeProfissao,
        paiNome,
        paiCPF: paiCPF.replace(/\D/g, ""), // Envia CPF limpo
        paiTelefone: paiTelefone.replace(/\D/g, ""), // Envia Telefone limpo
        paiProfissao,
        matriculaAnoLetivo,
        matriculaSerie,
        alunoProveniente,
        academicYears: academicYears,
      });
      alert("Formulário enviado com sucesso!");
      // Aqui você normalmente enviaria os dados para um backend
      // Por exemplo: fetch('/api/cadastrar-aluno', { method: 'POST', body: JSON.stringify(...) });
      handleClearForm(); // Limpa o formulário após o envio bem-sucedido
    } else {
      alert("Por favor, corrija os erros no formulário antes de enviar.");
      // Opcional: rolar para o primeiro erro ou focar no primeiro campo com erro
    }
  };
  // Limpar o formulário
  const handleClearForm = () => {
    setAlunoNome("");
    setAlunoCPF("");
    setAlunoRG("");
    setAlunoDataNascimento("");
    setAlunoGenero("");
    setAlunoReligiao("");
    setAlunoEnderecoRua("");
    setAlunoEnderecoNumero("");
    setAlunoEnderecoBairro("");
    setAlunoEnderecoCEP("");
    setAlunoEnderecoCidade("");
    setAlunoEnderecoEstado("");
    setAlunoTelefone("");
    setAlunoEmail("");
    setMaeNome("");
    setMaeCPF("");
    setMaeTelefone("");
    setMaeProfissao("");
    setPaiNome("");
    setPaiCPF("");
    setPaiTelefone("");
    setPaiProfissao("");
    setMatriculaAnoLetivo("");
    setMatriculaSerie("");
    setAlunoProveniente(false);
    setAcademicYears([]);
    setShowAcademicHistorySection(false);
    setFormErrors({}); // Limpa os erros também
  };
  return (
    <div className="cadastro-aluno-form-container">
      {/* Seção de Dados Pessoais */}
      <div className="cadastro-aluno-form-section">
        <h3 className="cadastro-aluno-section-header">Dados Pessoais</h3>
        <div className="cadastro-aluno-form-grid">
          {/* Nome Completo (metade da largura) */}
          <div className="cadastro-aluno-form-group half-width">
            <label htmlFor="alunoNome">Nome Completo*</label>
            <div className="cadastro-aluno-input-wrapper">
              <User size={18} className="cadastro-aluno-input-icon" />
              <input
                type="text"
                id="alunoNome"
                name="alunoNome"
                placeholder="Nome completo do aluno"
                className={`cadastro-aluno-input ${
                  formErrors.alunoNome ? "input-error" : ""
                }`}
                value={alunoNome}
                onChange={(e) => setAlunoNome(e.target.value)}
              />
            </div>
            {formErrors.alunoNome && (
              <span className="error-message">{formErrors.alunoNome}</span>
            )}
          </div>
          {/* CPF (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="alunoCPF">CPF*</label>
            <input
              type="text"
              id="alunoCPF"
              name="alunoCPF"
              placeholder="000.000.000-00"
              className={`cadastro-aluno-input ${
                formErrors.alunoCPF ? "input-error" : ""
              }`}
              value={alunoCPF}
              onChange={(e) => setAlunoCPF(formatarCPF(e.target.value))}
            />
            {formErrors.alunoCPF && (
              <span className="error-message">{formErrors.alunoCPF}</span>
            )}
          </div>
          {/* RG (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="alunoRG">RG*</label>
            <input
              type="text"
              id="alunoRG"
              name="alunoRG"
              placeholder="000000000"
              className={`cadastro-aluno-input ${
                formErrors.alunoRG ? "input-error" : ""
              }`}
              value={alunoRG}
              onChange={(e) => setAlunoRG(formatarRG(e.target.value))}
            />
            {formErrors.alunoRG && (
              <span className="error-message">{formErrors.alunoRG}</span>
            )}
          </div>
          {/* Data de Nascimento (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="alunoDataNascimento">Data de Nascimento*</label>
            <div className="cadastro-aluno-input-wrapper">
              <Calendar size={18} className="cadastro-aluno-input-icon" />
              <input
                type="date"
                id="alunoDataNascimento"
                name="alunoDataNascimento"
                className={`cadastro-aluno-input ${
                  formErrors.alunoDataNascimento ? "input-error" : ""
                }`}
                value={alunoDataNascimento}
                onChange={(e) => setAlunoDataNascimento(e.target.value)}
              />
            </div>
            {formErrors.alunoDataNascimento && (
              <span className="error-message">
                {formErrors.alunoDataNascimento}
              </span>
            )}
          </div>
          {/* Gênero (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="alunoGenero">Gênero*</label>
            <select
              id="alunoGenero"
              name="alunoGenero"
              className={`cadastro-aluno-select ${
                formErrors.alunoGenero ? "input-error" : ""
              }`}
              value={alunoGenero}
              onChange={(e) => setAlunoGenero(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="Masculino">Masculino</option>
              <option value="Feminino">Feminino</option>
            </select>
            {formErrors.alunoGenero && (
              <span className="error-message">{formErrors.alunoGenero}</span>
            )}
          </div>
          {/* Religião (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="alunoReligiao">Religião*</label>
            <input
              type="text"
              id="alunoReligiao"
              name="alunoReligiao"
              placeholder="Religião"
              className="cadastro-aluno-input"
              value={alunoReligiao}
              onChange={(e) => setAlunoReligiao(e.target.value)}
            />
          </div>
          {/* Telefone (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="alunoTelefone">Telefone*</label>
            <div className="cadastro-aluno-input-wrapper">
              <Phone size={18} className="cadastro-aluno-input-icon" />
              <input
                type="tel"
                id="alunoTelefone"
                name="alunoTelefone"
                placeholder="(XX) XXXXX-XXXX"
                className={`cadastro-aluno-input ${
                  formErrors.alunoTelefone ? "input-error" : ""
                }`}
                value={alunoTelefone}
                onChange={(e) =>
                  setAlunoTelefone(formatarTelefone(e.target.value))
                }
              />
            </div>
            {formErrors.alunoTelefone && (
              <span className="error-message">{formErrors.alunoTelefone}</span>
            )}
          </div>
          {/* Email (metade da largura) */}
          <div className="cadastro-aluno-form-group half-width">
            <label htmlFor="alunoEmail">Email</label>
            <div className="cadastro-aluno-input-wrapper">
              <Mail size={18} className="cadastro-aluno-input-icon" />
              <input
                type="email"
                id="alunoEmail"
                name="alunoEmail"
                placeholder="email@exemplo.com"
                className={`cadastro-aluno-input ${
                  formErrors.alunoEmail ? "input-error" : ""
                }`}
                value={alunoEmail}
                onChange={(e) => setAlunoEmail(e.target.value)}
              />
            </div>
            {formErrors.alunoEmail && (
              <span className="error-message">{formErrors.alunoEmail}</span>
            )}
          </div>
        </div>
      </div>
      {/* Seção de Endereço */}
      <div className="cadastro-aluno-form-section">
        <h3 className="cadastro-aluno-section-header">Endereço</h3>
        <div className="cadastro-aluno-form-grid">
          {/* Rua (metade da largura) */}
          <div className="cadastro-aluno-form-group half-width">
            <label htmlFor="alunoEnderecoRua">Rua*</label>
            <div className="cadastro-aluno-input-wrapper">
              <Home size={18} className="cadastro-aluno-input-icon" />
              <input
                type="text"
                id="alunoEnderecoRua"
                name="alunoEnderecoRua"
                placeholder="Nome da rua"
                className={`cadastro-aluno-input ${
                  formErrors.alunoEnderecoRua ? "input-error" : ""
                }`}
                value={alunoEnderecoRua}
                onChange={(e) => setAlunoEnderecoRua(e.target.value)}
              />
            </div>
            {formErrors.alunoEnderecoRua && (
              <span className="error-message">
                {formErrors.alunoEnderecoRua}
              </span>
            )}
          </div>
          {/* Número (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="alunoEnderecoNumero">Número*</label>
            <input
              type="text"
              id="alunoEnderecoNumero"
              name="alunoEnderecoNumero"
              placeholder="Ex: 123"
              className={`cadastro-aluno-input ${
                formErrors.alunoEnderecoNumero ? "input-error" : ""
              }`}
              value={alunoEnderecoNumero}
              onChange={(e) => setAlunoEnderecoNumero(e.target.value)}
            />
            {formErrors.alunoEnderecoNumero && (
              <span className="error-message">
                {formErrors.alunoEnderecoNumero}
              </span>
            )}
          </div>
          {/* Bairro (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="alunoEnderecoBairro">Bairro*</label>
            <input
              type="text"
              id="alunoEnderecoBairro"
              name="alunoEnderecoBairro"
              placeholder="Nome do bairro"
              className={`cadastro-aluno-input ${
                formErrors.alunoEnderecoBairro ? "input-error" : ""
              }`}
              value={alunoEnderecoBairro}
              onChange={(e) => setAlunoEnderecoBairro(e.target.value)}
            />
            {formErrors.alunoEnderecoBairro && (
              <span className="error-message">
                {formErrors.alunoEnderecoBairro}
              </span>
            )}
          </div>
          {/* CEP (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="alunoEnderecoCEP">CEP*</label>
            <input
              type="text"
              id="alunoEnderecoCEP"
              name="alunoEnderecoCEP"
              placeholder="00000-000"
              className={`cadastro-aluno-input ${
                formErrors.alunoEnderecoCEP ? "input-error" : ""
              }`}
              value={alunoEnderecoCEP}
              onChange={(e) => setAlunoEnderecoCEP(formatarCEP(e.target.value))}
            />
            {formErrors.alunoEnderecoCEP && (
              <span className="error-message">
                {formErrors.alunoEnderecoCEP}
              </span>
            )}
          </div>
          {/* Cidade (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="alunoEnderecoCidade">Cidade*</label>
            <input
              type="text"
              id="alunoEnderecoCidade"
              name="alunoEnderecoCidade"
              placeholder="Nome da cidade"
              className={`cadastro-aluno-input ${
                formErrors.alunoEnderecoCidade ? "input-error" : ""
              }`}
              value={alunoEnderecoCidade}
              onChange={(e) => setAlunoEnderecoCidade(e.target.value)}
            />
            {formErrors.alunoEnderecoCidade && (
              <span className="error-message">
                {formErrors.alunoEnderecoCidade}
              </span>
            )}
          </div>
          {/* Estado (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="alunoEnderecoEstado">Estado*</label>
            <input
              type="text"
              id="alunoEnderecoEstado"
              name="alunoEnderecoEstado"
              className={`cadastro-aluno-input ${
                formErrors.alunoEnderecoEstado ? "input-error" : ""
              }`}
              value={alunoEnderecoEstado}
              onChange={(e) => {
                // Aceita somente letras e converte para maiúsculas, limitado a 2 caracteres
                const onlyLetters = e.target.value
                  .replace(/[^a-zA-Z]/g, "")
                  .toUpperCase();
                setAlunoEnderecoEstado(onlyLetters.slice(0, 2));
              }}
              placeholder="UF"
            />
            {formErrors.alunoEnderecoEstado && (
              <span className="error-message">
                {formErrors.alunoEnderecoEstado}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Seção de Dados dos Pais/Responsáveis */}
      <div className="cadastro-aluno-form-section">
        <h3 className="cadastro-aluno-section-header">
          Dados dos Pais ou Responsáveis
        </h3>
        {/* Dados da Mãe */}
        <div className="cadastro-aluno-form-grid flex-row-wrap">
          {/* Nome da Mãe (metade da largura) */}
          <div className="cadastro-aluno-form-group half-width">
            <label htmlFor="maeNome">Nome da Mãe*</label>
            <div className="cadastro-aluno-input-wrapper">
              <Users size={18} className="cadastro-aluno-input-icon" />
              <input
                type="text"
                id="maeNome"
                name="maeNome"
                placeholder="Nome completo"
                className={`cadastro-aluno-input ${
                  formErrors.maeNome ? "input-error" : ""
                }`}
                value={maeNome}
                onChange={(e) => setMaeNome(e.target.value)}
              />
            </div>
            {formErrors.maeNome && (
              <span className="error-message">{formErrors.maeNome}</span>
            )}
          </div>
          {/* CPF da Mãe (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="maeCPF">CPF*</label>
            <input
              type="text"
              id="maeCPF"
              name="maeCPF"
              placeholder="000.000.000-00"
              className={`cadastro-aluno-input ${
                formErrors.maeCPF ? "input-error" : ""
              }`}
              value={maeCPF}
              onChange={(e) => setMaeCPF(formatarCPF(e.target.value))}
            />
            {formErrors.maeCPF && (
              <span className="error-message">{formErrors.maeCPF}</span>
            )}
          </div>
          {/* Telefone da Mãe (metade da largura) */}
          <div className="cadastro-aluno-form-group half-width">
            <label htmlFor="maeTelefone">Telefone*</label>
            <div className="cadastro-aluno-input-wrapper">
              <Phone size={18} className="cadastro-aluno-input-icon" />
              <input
                type="tel"
                id="maeTelefone"
                name="maeTelefone"
                placeholder="(XX) XXXXX-XXXX"
                className={`cadastro-aluno-input ${
                  formErrors.maeTelefone ? "input-error" : ""
                }`}
                value={maeTelefone}
                onChange={(e) =>
                  setMaeTelefone(formatarTelefone(e.target.value))
                }
              />
            </div>
            {formErrors.maeTelefone && (
              <span className="error-message">{formErrors.maeTelefone}</span>
            )}
          </div>
          {/* Profissão da Mãe (metade da largura) */}
          <div className="cadastro-aluno-form-group half-width">
            <label htmlFor="maeProfissao">Profissão</label>
            <div className="cadastro-aluno-input-wrapper">
              <Briefcase size={18} className="cadastro-aluno-input-icon" />
              <input
                type="text"
                id="maeProfissao"
                name="maeProfissao"
                placeholder="Profissão da mãe"
                className="cadastro-aluno-input"
                value={maeProfissao}
                onChange={(e) => setMaeProfissao(e.target.value)}
              />
            </div>
          </div>
        </div>
        {/* Espaço entre as seções */}
        <div style={{ marginTop: "24px" }} />
        {/* Dados do Pai */}
        <div className="cadastro-aluno-form-grid flex-row-wrap">
          {/* Nome do Pai (metade da largura) */}
          <div className="cadastro-aluno-form-group half-width">
            <label htmlFor="paiNome">Nome do Pai*</label>
            <div className="cadastro-aluno-input-wrapper">
              <Users size={18} className="cadastro-aluno-input-icon" />
              <input
                type="text"
                id="paiNome"
                name="paiNome"
                placeholder="Nome completo"
                className={`cadastro-aluno-input ${
                  formErrors.paiNome ? "input-error" : ""
                }`}
                value={paiNome}
                onChange={(e) => setPaiNome(e.target.value)}
              />
            </div>
            {formErrors.paiNome && (
              <span className="error-message">{formErrors.paiNome}</span>
            )}
          </div>
          {/* CPF do Pai (um quarto da largura) */}
          <div className="cadastro-aluno-form-group quarter-width">
            <label htmlFor="paiCPF">CPF*</label>
            <input
              type="text"
              id="paiCPF"
              name="paiCPF"
              placeholder="000.000.000-00"
              className={`cadastro-aluno-input ${
                formErrors.paiCPF ? "input-error" : ""
              }`}
              value={paiCPF}
              onChange={(e) => setPaiCPF(formatarCPF(e.target.value))}
            />
            {formErrors.paiCPF && (
              <span className="error-message">{formErrors.paiCPF}</span>
            )}
          </div>
          {/* Telefone do Pai (metade da largura) */}
          <div className="cadastro-aluno-form-group half-width">
            <label htmlFor="paiTelefone">Telefone*</label>
            <div className="cadastro-aluno-input-wrapper">
              <Phone size={18} className="cadastro-aluno-input-icon" />
              <input
                type="tel"
                id="paiTelefone"
                name="paiTelefone"
                placeholder="(XX) XXXXX-XXXX"
                className={`cadastro-aluno-input ${
                  formErrors.paiTelefone ? "input-error" : ""
                }`}
                value={paiTelefone}
                onChange={(e) =>
                  setPaiTelefone(formatarTelefone(e.target.value))
                }
              />
            </div>
            {formErrors.paiTelefone && (
              <span className="error-message">{formErrors.paiTelefone}</span>
            )}
          </div>
          {/* Profissão do Pai (metade da largura) */}
          <div className="cadastro-aluno-form-group half-width">
            <label htmlFor="paiProfissao">Profissão</label>
            <div className="cadastro-aluno-input-wrapper">
              <Briefcase size={18} className="cadastro-aluno-input-icon" />
              <input
                type="text"
                id="paiProfissao"
                name="paiProfissao"
                placeholder="Profissão do pai"
                className="cadastro-aluno-input"
                value={paiProfissao}
                onChange={(e) => setPaiProfissao(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>
      {/* Seção de Dados de Matrícula */}
      <div className="cadastro-aluno-form-section">
        <h3 className="cadastro-aluno-section-header">Dados de Matrícula</h3>
        <div className="cadastro-aluno-form-grid">
          {/* Ano Letivo (agora half-width) */}
          <div className="cadastro-aluno-form-group half-width">
            <label htmlFor="matriculaAnoLetivo">Ano Letivo*</label>
            <input
              type="text"
              id="matriculaAnoLetivo"
              name="matriculaAnoLetivo"
              placeholder="Ex: 2025"
              maxLength={4}
              className={`cadastro-aluno-input ${
                formErrors.matriculaAnoLetivo ? "input-error" : ""
              }`}
              value={matriculaAnoLetivo}
              onChange={(e) => {
                const digitsOnly = e.target.value.replace(/\D/g, "");
                setMatriculaAnoLetivo(digitsOnly.slice(0, 4));
              }}
            />
            {formErrors.matriculaAnoLetivo && (
              <span className="error-message">
                {formErrors.matriculaAnoLetivo}
              </span>
            )}
          </div>
          {/* Série (agora half-width) */}
          <div className="cadastro-aluno-form-group half-width">
            <label htmlFor="matriculaSerie">Série*</label>
            <select
              id="matriculaSerie"
              name="matriculaSerie"
              className={`cadastro-aluno-select ${
                formErrors.matriculaSerie ? "input-error" : ""
              }`}
              value={matriculaSerie}
              onChange={(e) => setMatriculaSerie(e.target.value)}
            >
              <option value="">Selecione</option>
              <option value="1ano">1º Ano</option>
              <option value="2ano">2º Ano</option>
              <option value="3ano">3º Ano</option>
              <option value="4ano">4º Ano</option>
              <option value="5ano">5º Ano</option>
              <option value="6ano">6º Ano</option>
              <option value="7ano">7º Ano</option>
              <option value="8ano">8º Ano</option>
              <option value="9ano">9º Ano</option>
            </select>
            {formErrors.matriculaSerie && (
              <span className="error-message">{formErrors.matriculaSerie}</span>
            )}
          </div>
          {/* Checkbox de Aluno Proveniente */}
          <div className="cadastro-aluno-form-group full-width">
            <label className="cadastro-aluno-checkbox-label">
              <input
                type="checkbox"
                className="cadastro-aluno-checkbox"
                checked={alunoProveniente}
                onChange={handleProvenanceChange}
              />
              Aluno proveniente de outra matrícula/escola (requer histórico
              escolar)
            </label>
            {formErrors.academicHistory && (
              <span className="error-message">
                {formErrors.academicHistory}
              </span>
            )}
          </div>
        </div>
      </div>
      {/* Seção de Histórico Escolar (condicional) */}
      {showAcademicHistorySection && (
        <div className="cadastro-aluno-form-section" id="gradeEntrySection">
          <h3 className="cadastro-aluno-section-header">Histórico Escolar*</h3>
          <div id="gradeRowsContainer">
            {academicYears.map((year, index) => (
              <div key={index} className="grade-entry-row-dynamic">
                <div className="grade-entry-cell">{year.grade}</div>
                <div className="grade-entry-cell">
                  <input
                    type="text" // Alterado para type="text" para melhor controle de maxLength e validação
                    placeholder="Ano"
                    value={year.calendarYear}
                    onChange={(e) => {
                      const rawValue = e.target.value;
                      // 1. Remove qualquer caractere que não seja dígito
                      const cleanValue = rawValue.replace(/\D/g, "");
                      // 2. Limita a 4 caracteres
                      const finalValue = cleanValue.slice(0, 4);
                      // 3. Atualiza o estado com o valor já limpo e limitado
                      handleCalendarYearChange(index, finalValue);
                    }}
                    className={`cadastro-aluno-input ${
                      formErrors[`academicYear-${index}-calendarYear`]
                        ? "input-error"
                        : ""
                    }`}
                    maxLength="4" // Adicionado para feedback visual e prevenção de digitação excessiva no navegador
                  />
                  {formErrors[`academicYear-${index}-calendarYear`] && (
                    <span className="error-message">
                      {formErrors[`academicYear-${index}-calendarYear`]}
                    </span>
                  )}
                </div>
                <div className="grade-entry-cell">
                  {Object.keys(year.notes).length === 1 &&
                  year.notes.hasOwnProperty("general") ? (
                    <>
                      <input
                        type="text"
                        placeholder="Nota Geral"
                        value={year.notes.general}
                        onChange={(e) => {
                          const digitsOnly = e.target.value
                            .replace(/\D/g, "")
                            .slice(0, 2);
                          handleNoteChange(index, "general", digitsOnly);
                        }}
                        className={`cadastro-aluno-input ${
                          formErrors[`academicYear-${index}-generalNote`]
                            ? "input-error"
                            : ""
                        }`}
                      />
                      {formErrors[`academicYear-${index}-generalNote`] && (
                        <span className="error-message">
                          {formErrors[`academicYear-${index}-generalNote`]}
                        </span>
                      )}
                    </>
                  ) : parseInt(year.grade.split("º")[0]) >= 6 ? ( // CORREÇÃO APLICADA AQUI
                    <>
                      <div className="discipline-label-row">
                        {disciplines.map((disc) => {
                          const noteKey = disc.toLowerCase().replace(" ", "");
                          return (
                            <div
                              className="discipline-column"
                              key={`label-${noteKey}`}
                            >
                              <label htmlFor={`note-${index}-${noteKey}`}>
                                {disc}
                              </label>
                            </div>
                          );
                        })}
                      </div>
                      <div className="discipline-input-row">
                        {disciplines.map((disc) => {
                          const noteKey = disc.toLowerCase().replace(" ", "");
                          return (
                            <div
                              className="discipline-column"
                              key={`input-${noteKey}`}
                            >
                              <input
                                type="text"
                                id={`note-${index}-${noteKey}`}
                                placeholder="Nota"
                                value={year.notes[noteKey] || ""}
                                onChange={(e) => {
                                  const digitsOnly = e.target.value
                                    .replace(/\D/g, "")
                                    .slice(0, 2);
                                  handleNoteChange(index, noteKey, digitsOnly);
                                }}
                                className={`cadastro-aluno-input ${
                                  formErrors[`academicYear-${index}-${noteKey}`]
                                    ? "input-error"
                                    : ""
                                }`}
                              />
                              {formErrors[
                                `academicYear-${index}-${noteKey}`
                              ] && (
                                <span className="error-message">
                                  {
                                    formErrors[
                                      `academicYear-${index}-${noteKey}`
                                    ]
                                  }
                                </span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  ) : (
                    <div className="discipline-grades-grid">
                      {disciplines.map((disc) => {
                        const noteKey = disc.toLowerCase().replace(" ", "");
                        return (
                          <div
                            className="cadastro-aluno-form-group"
                            key={noteKey}
                          >
                            <label htmlFor={`note-${index}-${noteKey}`}>
                              {disc}:
                            </label>
                            <input
                              type="text"
                              id={`note-${index}-${noteKey}`}
                              placeholder="Nota"
                              value={year.notes[noteKey] || ""}
                              onChange={(e) =>
                                handleNoteChange(index, noteKey, e.target.value)
                              }
                              className={`cadastro-aluno-input ${
                                formErrors[`academicYear-${index}-${noteKey}`]
                                  ? "input-error"
                                  : ""
                              }`}
                            />
                            {formErrors[`academicYear-${index}-${noteKey}`] && (
                              <span className="error-message">
                                {formErrors[`academicYear-${index}-${noteKey}`]}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                {/* Botão de remover ano escolar, sempre visível para cada item */}
                <div className="grade-entry-cell">
                  <button
                    type="button"
                    onClick={() => handleRemoveAcademicYear(index)}
                    className="cadastro-aluno-remove-button"
                  >
                    <Trash2 size={18} /> Remover
                  </button>
                </div>
              </div>
            ))}
          </div>
          <button
            type="button"
            id="addGradeYearButton"
            className="cadastro-aluno-add-button green-button"
            onClick={handleAddAcademicYear}
          >
            <Plus size={18} /> Adicionar Ano
          </button>
        </div>
      )}
      {/* Botões de Ação */}
      <div className="cadastro-aluno-form-actions">
        <button
          type="button"
          className="cadastro-aluno-clear-button red-button"
          onClick={handleClearForm}
        >
          <XCircle size={20} /> Limpar Formulário
        </button>
        <button
          type="submit"
          className="cadastro-aluno-submit-button blue-button"
          onClick={handleSubmit}
        >
          <GraduationCap size={20} /> Cadastrar Aluno
        </button>
      </div>
    </div>
  );
};
export default CadastroAluno;