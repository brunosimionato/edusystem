import React, { useState } from "react";
import "./criarProfe.css";
import { XCircle, UserPlus } from "lucide-react";

const CriarProfe = () => {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    dataNascimento: "",
    genero: "",
    telefone: "",
    email: "",
    rua: "",
    numero: "",
    bairro: "",
    cep: "",
    cidade: "",
    estado: "",
    formacao: "",
    disciplinas: [],
    turmas: [], // Novo campo para turmas
  });

  const [camposInvalidos, setCamposInvalidos] = useState([]);

  const disciplinasDisponiveis = [
    "Português",
    "Matemática",
    "Ciências",
    "História",
    "Geografia",
    "Inglês",
    "Artes",
    "Educação Física",
    "Religião",
    "Ensino Globalizado",
    "Espanhol",
  ];

  // Lista de turmas disponíveis (exemplo)
  const turmasDisponiveis = [
    "1º Ano A - Fundamental",
    "1º Ano B - Fundamental",
    "2º Ano A - Fundamental",
    "2º Ano B - Fundamental",
    "3º Ano A - Fundamental",
    "3º Ano B - Fundamental",
    "4º Ano A - Fundamental",
    "4º Ano B - Fundamental",
    "4º Ano C - Fundamental",
    "5º Ano A - Fundamental",
    "5º Ano B - Fundamental",
    "6º Ano A - Fundamental",
    "7º Ano A - Fundamental",
    "8º Ano A - Fundamental",
    "9º Ano A - Fundamental",
  ];

  // Máscaras
  const mascaraCPF = (value) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");

  const mascaraTelefone = (value) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d{4})$/, "$1-$2");

  const mascaraCEP = (value) =>
    value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");

  // Função para buscar o endereço pelo CEP
  const buscarEndereco = async (cep) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          rua: data.logradouro || "",
          bairro: data.bairro || "",
          cidade: data.localidade || "",
          estado: data.uf || "",
        }));
      } else {
        alert("CEP não encontrado.");
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;

    if (name === "cpf") {
      formattedValue = mascaraCPF(value);
    } else if (name === "telefone") {
      formattedValue = mascaraTelefone(value);
    } else if (name === "cep") {
      formattedValue = mascaraCEP(value);
      const somenteNumeros = value.replace(/\D/g, "");
      if (somenteNumeros.length === 8) {
        buscarEndereco(somenteNumeros);
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : formattedValue,
    }));
  };

  const handleDisciplinaChange = (disciplina) => {
    setFormData((prev) => {
      const disciplinas = prev.disciplinas.includes(disciplina)
        ? prev.disciplinas.filter((d) => d !== disciplina)
        : [...prev.disciplinas, disciplina];
      return { ...prev, disciplinas };
    });
  };

  // Novo handler para a seleção de turmas
  const handleTurmaChange = (turma) => {
    setFormData((prev) => {
      const turmas = prev.turmas.includes(turma)
        ? prev.turmas.filter((t) => t !== turma)
        : [...prev.turmas, turma];
      return { ...prev, turmas };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    let invalidos = [];
    const camposObrigatorios = [
      "nome",
      "cpf",
      "dataNascimento",
      "genero",
      "telefone",
      "email",
      "rua",
      "numero",
      "bairro",
      "cep",
      "cidade",
      "estado",
      "formacao",
    ];

    camposObrigatorios.forEach((campo) => {
      if (!formData[campo] || formData[campo].toString().trim() === "") {
        invalidos.push(campo);
      }
    });

    if (formData.disciplinas.length === 0) {
      invalidos.push("disciplinas");
    }

    // Validação para turmas
    if (formData.turmas.length === 0) {
      invalidos.push("turmas");
    }

    if (invalidos.length > 0) {
      setCamposInvalidos(invalidos);
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setCamposInvalidos([]);
    console.log("Professor cadastrado:", formData);
    handleLimpar(false);
  };

  const handleLimpar = (confirmar = true) => {
    if (confirmar && !window.confirm("Deseja limpar todos os campos?")) {
      return;
    }
    setFormData({
      nome: "",
      cpf: "",
      dataNascimento: "",
      genero: "",
      telefone: "",
      email: "",
      rua: "",
      numero: "",
      bairro: "",
      cep: "",
      cidade: "",
      estado: "",
      formacao: "",
      disciplinas: [],
      turmas: [], // Resetar turmas ao limpar
    });
    setCamposInvalidos([]);
  };

  return (
    <div className="cadastro-container-professor">
      <div className="cadastro-card-professor">
        <form onSubmit={handleSubmit} className="cadastro-form">
          {/* Dados Pessoais */}
          <div className="form-section-professor">
            <div className="section-title-cad-professor">Dados Pessoais</div>
            <div className="form-row-professor">
              <div className="form-group-professor flex-3">
                <label>Nome*</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("nome") ? "input-error" : ""
                  }
                />
              </div>
              <div className="form-group-professor medium">
                <label>CPF*</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  maxLength="14"
                  className={
                    camposInvalidos.includes("cpf") ? "input-error" : ""
                  }
                />
              </div>
              <div className="form-group-professor medium">
                <label>Data de Nascimento*</label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("dataNascimento")
                      ? "input-error"
                      : ""
                  }
                />
              </div>
            </div>
            <div className="form-row-professor">
              <div className="form-group-professor flex-1">
                <label>Gênero*</label>
                <select
                  name="genero"
                  value={formData.genero}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("genero") ? "input-error" : ""
                  }
                >
                  <option value=""> </option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>
              <div className="form-group-professor medium">
                <label>Telefone*</label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  maxLength="15"
                  className={
                    camposInvalidos.includes("telefone") ? "input-error" : ""
                  }
                />
              </div>
              <div className="form-group-professor flex-2">
                <label>Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("email") ? "input-error" : ""
                  }
                />
              </div>
            </div>
          </div>
          {/* Endereço */}
          <div className="form-section-professor">
            <div className="section-title-cad-professor">Endereço</div>
            <div className="form-row-professor">
              <div className="form-group-professor flex-3">
                <label>Logradouro*</label>
                <input
                  type="text"
                  name="rua"
                  value={formData.rua}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("rua") ? "input-error" : ""
                  }
                />
              </div>
              <div className="form-group-professor small">
                <label>Número*</label>
                <input
                  type="number"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("numero") ? "input-error" : ""
                  }
                />
              </div>
              <div className="form-group-professor flex-1">
                <label>Bairro*</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("bairro") ? "input-error" : ""
                  }
                />
              </div>
            </div>
            <div className="form-row-professor">
              <div className="form-group-professor medium">
                <label>CEP*</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  maxLength="9"
                  className={
                    camposInvalidos.includes("cep") ? "input-error" : ""
                  }
                />
              </div>
              <div className="form-group-professor flex-2">
                <label>Cidade*</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("cidade") ? "input-error" : ""
                  }
                />
              </div>
              <div className="form-group-professor small">
                <label>Estado*</label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("estado") ? "input-error" : ""
                  }
                />
              </div>
            </div>
          </div>
          {/* Formação e Disciplinas */}
          <div className="form-section-professor">
            <div className="section-title-cad-professor">
              Formação e Disciplinas
            </div>
            <div className="form-row-professor">
              <div className="form-group-professor flex-1">
                <label>Formação Acadêmica*</label>
                <input
                  type="text"
                  name="formacao"
                  value={formData.formacao}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("formacao") ? "input-error" : ""
                  }
                />
              </div>
            </div>
            <div className="form-row-professor">
              <div className="form-group-professor disciplinas-group">
                <label className="disciplinas-main-label">
                  Disciplinas que leciona*
                </label>
                <div
                  className={`disciplinas-container ${
                    camposInvalidos.includes("disciplinas") ? "input-error" : ""
                  }`}
                >
                  <div className="disciplinas-grid">
                    {disciplinasDisponiveis.map((disciplina) => (
                      <label key={disciplina} className="disciplina-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.disciplinas.includes(disciplina)}
                          onChange={() => handleDisciplinaChange(disciplina)}
                          className="checkbox-input"
                        />
                        <span className="checkbox-text">{disciplina}</span>
                      </label>
                    ))}
                  </div>
                  {camposInvalidos.includes("disciplinas") && (
                    <p className="input-error-text">
                      Selecione pelo menos uma disciplina.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Nova Seção: Turmas que Leciona */}
          <div className="form-section-professor">
            <div className="section-title-cad-professor">
              Turmas que Leciona
            </div>
            <div className="form-row-professor">
              <div className="form-group-professor disciplinas-group">
                <label className="disciplinas-main-label">
                  Selecionar Turmas*
                </label>
                <div
                  className={`disciplinas-container ${
                    camposInvalidos.includes("turmas") ? "input-error" : ""
                  }`}
                >
                  <div className="disciplinas-grid">
                    {turmasDisponiveis.map((turma) => (
                      <label key={turma} className="disciplina-checkbox">
                        <input
                          type="checkbox"
                          checked={formData.turmas.includes(turma)}
                          onChange={() => handleTurmaChange(turma)}
                          className="checkbox-input"
                        />
                        <span className="checkbox-text">{turma}</span>
                      </label>
                    ))}
                  </div>
                  {camposInvalidos.includes("turmas") && (
                    <p className="input-error-text">
                      Selecione pelo menos uma turma.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Botões */}
          <div className="form-buttons-professor">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleLimpar()}
            >
              <XCircle size={17} /> Limpar
            </button>
            <button type="submit" className="btn btn-primary-prof">
              <UserPlus size={17} /> Cadastrar Professor
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CriarProfe;
