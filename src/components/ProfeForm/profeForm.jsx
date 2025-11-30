import React, { useState, useEffect } from "react";
import "./profeForm.css";
import { XCircle, UserPlus, Save, AlertCircle } from "lucide-react";
import {
  mascaraCPF,
  mascaraTelefone,
  mascaraCEP,
} from "../../utils/formatacao";
import DisciplinaService from "../../Services/DisciplinaService";
import ProfessorService from "../../Services/ProfessorService";
import TurmaService from "../../Services/TurmaService";

const ProfeForm = ({
  professor = null,
  isEditing = false,
  onClose = () => {},
  onSaved = () => {},
}) => {
  const editing = isEditing || Boolean(professor);

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
    turmas: [],
  });

  const [disciplinasSelecionadas, setDisciplinasSelecionadas] = useState([]);
  const [camposInvalidos, setCamposInvalidos] = useState([]);
  const [disciplinasDisponiveis, setDisciplinasDisponiveis] = useState([]);
  const [isLoadingDisciplinas, setIsLoadingDisciplinas] = useState(false);
  const [errorDisciplinas, setErrorDisciplinas] = useState(null);
  const [turmasDisponiveis, setTurmasDisponiveis] = useState([]);
  const [isLoadingTurmas, setIsLoadingTurmas] = useState(false);
  const [errorTurmas, setErrorTurmas] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [buscandoCep, setBuscandoCep] = useState(false);
  const [professoresExistentes, setProfessoresExistentes] = useState([]);

  // Carregar disciplinas
  useEffect(() => {
    const fetchDisciplinas = async () => {
      setIsLoadingDisciplinas(true);
      try {
        const data = await DisciplinaService.getAll();
        setDisciplinasDisponiveis(data);
        setErrorDisciplinas(null);
      } catch (error) {
        setErrorDisciplinas(error);
        console.error("Erro ao carregar disciplinas:", error);
      } finally {
        setIsLoadingDisciplinas(false);
      }
    };
    fetchDisciplinas();
  }, []);

  // Carregar turmas - apenas turmas ativas
  useEffect(() => {
    const fetchTurmas = async () => {
      setIsLoadingTurmas(true);
      try {
        const data = await TurmaService.list({ withAlunos: false });
        const turmasAtivas = data.filter(
          (turma) =>
            turma.status === undefined ||
            turma.status === null ||
            turma.status === "ativo" ||
            turma.status === true
        );
        setTurmasDisponiveis(turmasAtivas);
        setErrorTurmas(null);
      } catch (error) {
        setErrorTurmas(error);
        console.error("Erro ao carregar turmas:", error);
      } finally {
        setIsLoadingTurmas(false);
      }
    };
    fetchTurmas();
  }, []);

  // Carregar lista de professores para validação de duplicatas
  useEffect(() => {
    const fetchProfessores = async () => {
      try {
        const data = await ProfessorService.getAll();
        setProfessoresExistentes(data);
      } catch (error) {
        console.error("Erro ao carregar professores para validação:", error);
      }
    };
    fetchProfessores();
  }, []);

  // Popula o formulário quando for edição
  useEffect(() => {
    if (!professor) {
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
        turmas: [],
      });
      setDisciplinasSelecionadas([]);
      setCamposInvalidos([]);
      return;
    }

    // VERIFICAR SE PROFESSOR ESTÁ ATIVO
    if (professor.status === "inativo") {
      console.warn("Tentativa de editar professor inativo:", professor);
      return;
    }

    // Mapeamento dos dados do professor
    const nome = professor.usuario?.nome || "";
    const email = professor.usuario?.email || "";
    const cpf = professor.cpf || "";

    const nascimento =
      professor.nascimento instanceof Date
        ? professor.nascimento.toISOString().split("T")[0]
        : professor.nascimento?.split("T")?.[0] || "";

    const genero = professor.genero || "";
    const telefone = professor.telefone || "";
    const rua = professor.logradouro || "";
    const numero = professor.numero || "";
    const bairro = professor.bairro || "";
    const cep = professor.cep || "";
    const cidade = professor.cidade || "";
    const estado = professor.estado || "";
    const formacao = professor.formacaoAcademica || "";

    // Turmas → Sempre IDs numéricos (apenas turmas ativas)
    const turmas = (professor.turmas || [])
      .map((t) => (typeof t === "object" ? t.id : t))
      .filter((turmaId) => {
        const turmaDisponivel = turmasDisponiveis.find((t) => t.id === turmaId);
        return turmaDisponivel;
      });

    // Disciplinas → Sempre IDs numéricos
    let disciplinasIds = [];
    if (Array.isArray(professor.idDisciplinas)) {
      disciplinasIds = professor.idDisciplinas;
    } else if (Array.isArray(professor.disciplinas)) {
      disciplinasIds = professor.disciplinas.map((d) =>
        typeof d === "object" ? d.id : d
      );
    }

    setFormData({
      nome,
      cpf,
      dataNascimento: nascimento,
      genero,
      telefone,
      email,
      rua,
      numero,
      bairro,
      cep,
      cidade,
      estado,
      formacao,
      turmas,
    });

    setDisciplinasSelecionadas(disciplinasIds);
    setCamposInvalidos([]);
  }, [professor, turmasDisponiveis]);

  const validarDuplicatas = () => {
    const cpfLimpo = formData.cpf.replace(/\D/g, "");
    const emailLimpo = formData.email.trim().toLowerCase();

    const professorComMesmoEmail = professoresExistentes.find((prof) => {
      const profEmail = prof.usuario?.email?.trim().toLowerCase();
      return profEmail === emailLimpo;
    });

    const professorComMesmoCPF = professoresExistentes.find((prof) => {
      const profCPF = prof.cpf?.replace(/\D/g, "");
      return profCPF === cpfLimpo;
    });

    if (editing && professor?.id) {
      if (
        professorComMesmoEmail &&
        professorComMesmoEmail.id !== professor.id
      ) {
        return {
          duplicado: true,
          campo: "email",
          mensagem: "Já existe um professor cadastrado com este e-mail.",
        };
      }
      if (professorComMesmoCPF && professorComMesmoCPF.id !== professor.id) {
        return {
          duplicado: true,
          campo: "cpf",
          mensagem: "Já existe um professor cadastrado com este CPF.",
        };
      }
    } else {
      if (professorComMesmoEmail) {
        return {
          duplicado: true,
          campo: "email",
          mensagem: "Já existe um professor cadastrado com este e-mail.",
        };
      }
      if (professorComMesmoCPF) {
        return {
          duplicado: true,
          campo: "cpf",
          mensagem: "Já existe um professor cadastrado com este CPF.",
        };
      }
    }

    return { duplicado: false };
  };

  const buscarEndereco = async (cep) => {
    try {
      const cepLimpo = cep.replace(/\D/g, "");
      if (cepLimpo.length !== 8) return;

      setBuscandoCep(true);
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      const data = await response.json();

      if (!data.erro) {
        setFormData((prev) => ({
          ...prev,
          rua: data.logradouro || prev.rua,
          bairro: data.bairro || prev.bairro,
          cidade: data.localidade || prev.cidade,
          estado: data.uf || prev.estado,
        }));

        if (data.logradouro) {
          setCamposInvalidos((prev) => prev.filter((c) => c !== "rua"));
        }
        if (data.bairro) {
          setCamposInvalidos((prev) => prev.filter((c) => c !== "bairro"));
        }
        if (data.localidade) {
          setCamposInvalidos((prev) => prev.filter((c) => c !== "cidade"));
        }
        if (data.uf) {
          setCamposInvalidos((prev) => prev.filter((c) => c !== "estado"));
        }
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    } finally {
      setBuscandoCep(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    let formattedValue = value;

    if (name === "cpf") {
      formattedValue = mascaraCPF(value);
    } else if (name === "telefone") {
      formattedValue = mascaraTelefone(value);
    } else if (name === "cep") {
      formattedValue = mascaraCEP(value);

      if (value.replace(/\D/g, "").length === 8) {
        buscarEndereco(value);
      }
    } else if (name === "estado") {
      formattedValue = value.toUpperCase().slice(0, 2);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: formattedValue,
    }));

    if (value.trim() && camposInvalidos.includes(name)) {
      setCamposInvalidos((prev) => prev.filter((campo) => campo !== name));
    }
  };

  const handleDisciplinaChange = (disciplinaId) => {
    setDisciplinasSelecionadas((prev) => {
      const novasDisciplinas = prev.includes(disciplinaId)
        ? prev.filter((d) => d !== disciplinaId)
        : [...prev, disciplinaId];

      if (
        novasDisciplinas.length > 0 &&
        camposInvalidos.includes("disciplinas")
      ) {
        setCamposInvalidos((prev) =>
          prev.filter((campo) => campo !== "disciplinas")
        );
      }

      return novasDisciplinas;
    });
  };

  const handleTurmaChange = (turmaId) => {
    const turmaSelecionada = turmasDisponiveis.find((t) => t.id === turmaId);
    if (!turmaSelecionada) {
      alert("Esta turma não está disponível ou está inativa.");
      return;
    }

    setFormData((prev) => {
      const novasTurmas = prev.turmas.includes(turmaId)
        ? prev.turmas.filter((t) => t !== turmaId)
        : [...prev.turmas, turmaId];

      if (novasTurmas.length > 0 && camposInvalidos.includes("turmas")) {
        setCamposInvalidos((prev) =>
          prev.filter((campo) => campo !== "turmas")
        );
      }

      return { ...prev, turmas: novasTurmas };
    });
  };

  const validateForm = () => {
    const invalidos = [];
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

    if (formData.cpf && formData.cpf.replace(/\D/g, "").length !== 11) {
      if (!invalidos.includes("cpf")) invalidos.push("cpf");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      if (!invalidos.includes("email")) invalidos.push("email");
    }

    if (formData.cep && formData.cep.replace(/\D/g, "").length !== 8) {
      if (!invalidos.includes("cep")) invalidos.push("cep");
    }

    if (disciplinasSelecionadas.length === 0) {
      invalidos.push("disciplinas");
    }

    if (formData.turmas.length === 0) {
      invalidos.push("turmas");
    }

    return invalidos;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validacaoDuplicatas = validarDuplicatas();
    if (validacaoDuplicatas.duplicado) {
      alert(validacaoDuplicatas.mensagem);
      setIsSubmitting(false);

      const campoDuplicado = document.querySelector(
        `[name="${validacaoDuplicatas.campo}"]`
      );
      if (campoDuplicado) {
        campoDuplicado.scrollIntoView({ behavior: "smooth", block: "center" });
        campoDuplicado.focus();
      }
      return;
    }

    const invalidos = validateForm();
    if (invalidos.length > 0) {
      setCamposInvalidos(invalidos);
      alert("Por favor, preencha todos os campos obrigatórios corretamente.");
      setIsSubmitting(false);

      // Scroll para o primeiro campo inválido
      const firstInvalid = document.querySelector(".input-error");
      if (firstInvalid) {
        firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setCamposInvalidos([]);

    try {
      const payload = {
        usuario: {
          nome: formData.nome.trim(),
          email: formData.email.trim(),
        },
        professor: {
          cpf: formData.cpf.replace(/\D/g, ""),
          nascimento: formData.dataNascimento,
          genero: formData.genero,
          telefone: formData.telefone.replace(/\D/g, ""),
          logradouro: formData.rua.trim(),
          numero: formData.numero.toString(),
          bairro: formData.bairro.trim(),
          cep: formData.cep.replace(/\D/g, ""),
          cidade: formData.cidade.trim(),
          estado: formData.estado,
          formacaoAcademica: formData.formacao.trim(),
          idDisciplinaEspecialidade: disciplinasSelecionadas[0] || null,
          idDisciplinas: disciplinasSelecionadas,
          turmas: formData.turmas,
          status: "ativo",
        },
      };

      console.log("📤 Payload enviado:", JSON.stringify(payload, null, 2));

      if (editing && professor?.id) {
        await ProfessorService.update(professor.id, payload);
        alert("Professor atualizado com sucesso!");
      } else {
        // Para criação, adiciona senha e tipo_usuario
        payload.usuario.senha = formData.cpf.replace(/\D/g, "");
        payload.usuario.tipo_usuario = "professor";

        await ProfessorService.create(payload);
        alert("Professor criado com sucesso!");

        // Reset apenas em criação
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
          turmas: [],
        });
        setDisciplinasSelecionadas([]);
      }

      onSaved();
      onClose();
    } catch (error) {
      console.error("❌ Erro ao salvar professor:", error);
      const msg = error?.message?.toLowerCase() || "";

      if (msg.includes("email") || msg.includes("já está em uso")) {
        alert("Já existe um professor cadastrado com esse e-mail.");
      } else if (msg.includes("cpf")) {
        alert("Já existe um professor cadastrado com esse CPF.");
      } else {
        alert("Erro ao salvar professor: " + error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLimpar = () => {
    if (editing) {
      onClose();
      return;
    }

    if (!window.confirm("Deseja limpar todos os campos?")) {
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
      turmas: [],
    });
    setDisciplinasSelecionadas([]);
    setCamposInvalidos([]);
  };

  if (professor && professor.status === "inativo") {
    return (
      <div className="cadastro-container-professor">
        <div className="cadastro-card-professor">
          <div className="error-container">
            <AlertCircle size={48} color="#dc3545" />
            <h3>Professor Inativo</h3>
            <p>Não é possível editar um professor inativo.</p>
            <button className="btn btn-secondary" onClick={onClose}>
              <XCircle size={17} /> Fechar
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="cadastro-container-professor">
      <div className="cadastro-card-professor">
        <form onSubmit={handleSubmit} className="cadastro-form" noValidate>
          {/* Dados Pessoais */}
          <div className="form-section-professor">
            <div className="section-title-cad-professor">
              <span>Dados Pessoais</span>
            </div>
            <div className="form-row-professor">
              <div className="form-group-professor flex-3">
                <label>Nome Completo*</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("nome") ? "input-error" : ""
                  }
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                  max={new Date().toISOString().split("T")[0]}
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
                  disabled={isSubmitting}
                >
                  <option value="">Selecione</option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                  <option value="outro">Outro</option>
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
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group-professor flex-2">
                <label>E-mail*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("email") ? "input-error" : ""
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="form-section-professor">
            <div className="section-title-cad-professor">
              <span>Endereço</span>
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
                  disabled={isSubmitting || buscandoCep}
                />
                {buscandoCep && (
                  <span className="info-message">Buscando endereço...</span>
                )}
              </div>
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
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group-professor small">
                <label>Número*</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("numero") ? "input-error" : ""
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="form-row-professor">
              <div className="form-group-professor flex-2">
                <label>Bairro*</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("bairro") ? "input-error" : ""
                  }
                  disabled={isSubmitting}
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
                  disabled={isSubmitting}
                />
              </div>
              <div className="form-group-professor small">
                <label>Estado*</label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  maxLength={2}
                  className={
                    camposInvalidos.includes("estado") ? "input-error" : ""
                  }
                  disabled={isSubmitting}
                />
              </div>
            </div>
          </div>

          {/* Formação e Disciplinas */}
          <div className="form-section-professor">
            <div className="section-title-cad-professor">
              <span>Formação e Disciplinas</span>
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
                  disabled={isSubmitting}
                />
              </div>
            </div>
            <div className="form-row-professor">
              <div className="form-group-professor disciplinas-group">
                <label className="disciplinas-main-label">
                  Disciplinas que Leciona*
                </label>
                <div
                  className={`disciplinas-container ${
                    camposInvalidos.includes("disciplinas") ? "input-error" : ""
                  }`}
                >
                  {isLoadingDisciplinas ? (
                    <div className="loading-message">
                      Carregando disciplinas...
                    </div>
                  ) : errorDisciplinas ? (
                    <div className="error-load-message">
                      <AlertCircle size={16} /> Erro ao carregar disciplinas.
                      Tente recarregar a página.
                    </div>
                  ) : disciplinasDisponiveis.length === 0 ? (
                    <div className="empty-message">
                      Nenhuma disciplina disponível.
                    </div>
                  ) : (
                    <div className="disciplinas-grid">
                      {disciplinasDisponiveis.map((disciplina) => (
                        <label
                          key={disciplina.id}
                          className="disciplina-checkbox"
                        >
                          <input
                            type="checkbox"
                            checked={disciplinasSelecionadas.includes(
                              disciplina.id
                            )}
                            onChange={() =>
                              handleDisciplinaChange(disciplina.id)
                            }
                            disabled={isSubmitting}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text">
                            {disciplina.nome}
                          </span>
                        </label>
                      ))}
                    </div>
                  )}
                  {camposInvalidos.includes("disciplinas") && (
                    <p className="input-error-text">
                      <AlertCircle size={14} /> Selecione pelo menos uma
                      disciplina
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Turmas */}
          <div className="form-section-professor">
            <div className="section-title-cad-professor">
              <span>Turmas</span>
            </div>
            <div className="form-row-professor">
              <div className="form-group-professor disciplinas-group">
                <label className="disciplinas-main-label">
                  Turmas que Leciona*
                </label>
                <div
                  className={`disciplinas-container ${
                    camposInvalidos.includes("turmas") ? "input-error" : ""
                  }`}
                >
                  {isLoadingTurmas ? (
                    <div className="loading-message">Carregando turmas...</div>
                  ) : errorTurmas ? (
                    <div className="error-load-message">
                      <AlertCircle size={16} /> Erro ao carregar turmas. Tente
                      recarregar a página.
                    </div>
                  ) : turmasDisponiveis.length === 0 ? (
                    <div className="empty-message">
                      Nenhuma turma disponível.
                    </div>
                  ) : (
                    <div className="disciplinas-grid">
                      {turmasDisponiveis.map((turma) => (
                        <label key={turma.id} className="disciplina-checkbox">
                          <input
                            type="checkbox"
                            checked={formData.turmas.includes(turma.id)}
                            onChange={() => handleTurmaChange(turma.id)}
                            disabled={isSubmitting}
                            className="checkbox-input"
                          />
                          <span className="checkbox-text">{turma.nome}</span>
                        </label>
                      ))}
                    </div>
                  )}
                  {camposInvalidos.includes("turmas") && (
                    <p className="input-error-text">
                      <AlertCircle size={14} /> Selecione pelo menos uma turma
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
              onClick={handleLimpar}
              disabled={isSubmitting}
            >
              <XCircle size={17} /> {editing ? "Cancelar" : "Limpar"}
            </button>
            <button
              type="submit"
              className={`btn btn-primary-prof ${editing ? "btn-save" : ""}`}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner"></span> Salvando...
                </>
              ) : editing ? (
                <>
                  <Save size={17} /> Salvar Alterações
                </>
              ) : (
                <>
                  <UserPlus size={17} /> Cadastrar Professor
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfeForm;
