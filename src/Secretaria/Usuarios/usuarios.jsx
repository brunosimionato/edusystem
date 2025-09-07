import React, { useState, useEffect } from "react";
import {
  User,
  Plus,
  XCircle,
  Edit,
  ChevronDown,
  ChevronRight,
  Trash2,
  Mail,
  UserCheck,
} from "lucide-react";
import "./usuarios.css";

const Usuarios = () => {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario, setTipoUsuario] = useState("professor");
  const [usuarios, setUsuarios] = useState([]);
  const [usuarioExpandido, setUsuarioExpandido] = useState({});
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [dadosEdicao, setDadosEdicao] = useState({});
  const [erros, setErros] = useState({
    nome: false,
    email: false,
    senha: false,
    tipoUsuario: false,
  });

  useEffect(() => {
    // Usuários simulados para exemplo
    const usuariosSimulados = [
      {
        id: 1,
        nome: "Maria Silva",
        email: "maria.silva@escola.com",
        tipo: "professor",
        dataCadastro: "15/08/2024"
      },
      {
        id: 2,
        nome: "João Santos",
        email: "joao.santos@escola.com",
        tipo: "secretaria",
        dataCadastro: "10/08/2024"
      },
    ];
    setUsuarios(usuariosSimulados);
  }, []);

  const validarEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const handleSubmit = () => {
    let temErro = false;
    const novosErros = {
      nome: false,
      email: false,
      senha: false,
      tipoUsuario: false,
    };

    if (!nome.trim()) {
      novosErros.nome = true;
      temErro = true;
    }

    if (!email.trim()) {
      novosErros.email = true;
      temErro = true;
    } else if (!validarEmail(email)) {
      novosErros.email = true;
      temErro = true;
    }

    if (!senha.trim()) {
      novosErros.senha = true;
      temErro = true;
    } else if (senha.length < 6) {
      novosErros.senha = true;
      temErro = true;
    }

    if (!tipoUsuario) {
      novosErros.tipoUsuario = true;
      temErro = true;
    }

    setErros(novosErros);

    if (temErro) {
      alert("Por favor, preencha todos os campos corretamente.");
      return;
    }

    // Verificar se email já existe
    const emailExiste = usuarios.some(user => user.email.toLowerCase() === email.toLowerCase());
    if (emailExiste) {
      alert("Este email já está cadastrado!");
      return;
    }

    const novoUsuario = {
      id: Date.now(),
      nome: nome.trim(),
      email: email.toLowerCase().trim(),
      tipo: tipoUsuario,
      dataCadastro: new Date().toLocaleDateString('pt-BR'),
    };

    setUsuarios((prev) => [...prev, novoUsuario]);
    handleLimparForm(false);
    alert("Usuário cadastrado com sucesso!");
  };

  const handleLimparForm = (confirmar = true) => {
    if (confirmar) {
      const querLimpar = window.confirm(
        "Tem certeza que deseja limpar o formulário?"
      );
      if (!querLimpar) return;
    }

    setNome("");
    setEmail("");
    setSenha("");
    setTipoUsuario("professor");
    setErros({
      nome: false,
      email: false,
      senha: false,
      tipoUsuario: false,
    });
  };

  const handleRemoverUsuario = (id) => {
    const confirmar = window.confirm(
      "Deseja realmente remover este usuário?"
    );
    if (!confirmar) return;
    setUsuarios((prev) => prev.filter((usuario) => usuario.id !== id));
  };

  const toggleUsuarioExpansao = (id) => {
    setUsuarioExpandido((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const iniciarEdicao = (usuario) => {
    setUsuarioEditando(usuario.id);
    setDadosEdicao({
      nome: usuario.nome,
      email: usuario.email,
      tipo: usuario.tipo,
    });
  };

  const cancelarEdicao = () => {
    setUsuarioEditando(null);
    setDadosEdicao({});
  };

  const salvarEdicao = (usuarioId) => {
    if (!dadosEdicao.nome.trim() || !dadosEdicao.email.trim()) {
      alert("Nome e email são obrigatórios!");
      return;
    }

    if (!validarEmail(dadosEdicao.email)) {
      alert("Email inválido!");
      return;
    }

    // Verificar se email já existe (exceto o próprio usuário)
    const emailExiste = usuarios.some(user => 
      user.email.toLowerCase() === dadosEdicao.email.toLowerCase() && user.id !== usuarioId
    );
    if (emailExiste) {
      alert("Este email já está cadastrado!");
      return;
    }

    setUsuarios((prev) =>
      prev.map((usuario) =>
        usuario.id === usuarioId
          ? { 
              ...usuario, 
              nome: dadosEdicao.nome.trim(),
              email: dadosEdicao.email.toLowerCase().trim(),
              tipo: dadosEdicao.tipo
            }
          : usuario
      )
    );
    setUsuarioEditando(null);
    setDadosEdicao({});
    alert("Usuário atualizado com sucesso!");
  };

  return (
    <div className="cadastro-horario-form-container">
      <div className="cadastro-horario-form-section">
        <h3 className="cadastro-horario-section-header">Novo Usuário</h3>
        <div className="form-fields-container">
          <div className="cadastro-horario-form-grid">
            <div className="cadastro-horario-form-group full-width">
              <label htmlFor="nome">Nome Completo*</label>
              <div className="cadastro-horario-input-wrapper">
                <input
                  id="nome"
                  type="text"
                  className={`cadastro-horario-select ${
                    erros.nome ? "input-error" : ""
                  }`}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  placeholder="Digite o nome completo"
                />
              </div>
            </div>

            <div className="cadastro-horario-form-group half-width">
              <label htmlFor="email">Email*</label>
              <div className="cadastro-horario-input-wrapper">
                <input
                  id="email"
                  type="email"
                  className={`cadastro-horario-select ${
                    erros.email ? "input-error" : ""
                  }`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="exemplo@escola.com"
                />
              </div>
            </div>

            <div className="cadastro-horario-form-group half-width">
              <label htmlFor="senha">Senha*</label>
              <div className="cadastro-horario-input-wrapper">
                <input
                  id="senha"
                  type="password"
                  className={`cadastro-horario-select ${
                    erros.senha ? "input-error" : ""
                  }`}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            <div className="cadastro-horario-form-group full-width">
              <label htmlFor="tipoUsuario">Tipo de Usuário*</label>
              <div className="cadastro-horario-input-wrapper">
                <select
                  id="tipoUsuario"
                  className={`cadastro-horario-select ${
                    erros.tipoUsuario ? "input-error" : ""
                  }`}
                  value={tipoUsuario}
                  onChange={(e) => setTipoUsuario(e.target.value)}
                >
                  <option value="professor">Professor</option>
                  <option value="secretaria">Secretaria</option>
                </select>
              </div>
            </div>
          </div>

          <div className="cadastro-horario-form-actions">
            <button
              type="button"
              className="cadastro-horario-clear-button red-button"
              onClick={() => handleLimparForm(true)}
            >
              <XCircle size={17} /> Limpar
            </button>
            <button
              type="button"
              className="cadastro-horario-submit-button blue-button"
              onClick={handleSubmit}
            >
              <Plus size={17} /> Cadastrar Usuário
            </button>
          </div>
        </div>
      </div>

      <div className="cadastro-horario-form-section">
        <div className="cadastro-horario-section-header-with-button">
          <h3 className="cadastro-horario-section-header-turmas">
            Usuários Cadastrados
          </h3>
        </div>

        {usuarios.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <User size={48} />
            </div>
            <h4>Nenhum usuário cadastrado</h4>
            <p>Cadastre o primeiro usuário usando o formulário acima.</p>
          </div>
        ) : (
          <div className="turmas-list">
            {usuarios.map((usuario) => (
              <div key={usuario.id} className="grade-card">
                <div
                  className={`grade-header clickable ${
                    usuarioExpandido[usuario.id] ? "expanded" : ""
                  }`}
                  onClick={() => toggleUsuarioExpansao(usuario.id)}
                >
                  <div className="grade-info">
                    <div className="expand-icon">
                      {usuarioExpandido[usuario.id] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                    </div>
                    <div className="grade-title">
                      <h4 className="grade-nome">{usuario.nome}</h4>
                      <span className={`grade-turno turno-${usuario.tipo}`}>
                        {usuario.tipo === "professor" ? "Professor" : "Secretaria"}
                      </span>
                    </div>
                  </div>

                  <div className="grade-actions">
                    <button
                      className="action-button-horarios edit-button-horarios"
                      onClick={(e) => {
                        e.stopPropagation();
                        iniciarEdicao(usuario);
                        setUsuarioExpandido((prev) => ({ ...prev, [usuario.id]: true }));
                      }}
                    >
                      <Edit size={16} /> Editar
                    </button>
                    <button
                      className="action-button-horarios remove-button-horarios"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoverUsuario(usuario.id);
                      }}
                    >
                      <Trash2 size={17} /> Remover
                    </button>
                  </div>
                </div>

                {usuarioExpandido[usuario.id] && (
                  <div className="grade-content">
                    {usuarioEditando === usuario.id ? (
                      <div className="edicao-form">
                        <div className="cadastro-horario-form-grid">
                          <div className="cadastro-horario-form-group full-width">
                            <label htmlFor={`edit-nome-${usuario.id}`}>Nome Completo*</label>
                            <div className="cadastro-horario-input-wrapper">
                              <input
                                id={`edit-nome-${usuario.id}`}
                                type="text"
                                className="cadastro-horario-select"
                                value={dadosEdicao.nome || ""}
                                onChange={(e) => setDadosEdicao(prev => ({ ...prev, nome: e.target.value }))}
                                placeholder="Digite o nome completo"
                              />
                            </div>
                          </div>

                          <div className="cadastro-horario-form-group half-width">
                            <label htmlFor={`edit-email-${usuario.id}`}>Email*</label>
                            <div className="cadastro-horario-input-wrapper">
                              <input
                                id={`edit-email-${usuario.id}`}
                                type="email"
                                className="cadastro-horario-select"
                                value={dadosEdicao.email || ""}
                                onChange={(e) => setDadosEdicao(prev => ({ ...prev, email: e.target.value }))}
                                placeholder="exemplo@escola.com"
                              />
                            </div>
                          </div>

                          <div className="cadastro-horario-form-group half-width">
                            <label htmlFor={`edit-tipo-${usuario.id}`}>Tipo de Usuário*</label>
                            <div className="cadastro-horario-input-wrapper">
                              <select
                                id={`edit-tipo-${usuario.id}`}
                                className="cadastro-horario-select"
                                value={dadosEdicao.tipo || ""}
                                onChange={(e) => setDadosEdicao(prev => ({ ...prev, tipo: e.target.value }))}
                              >
                                <option value="professor">Professor</option>
                                <option value="secretaria">Secretaria</option>
                              </select>
                            </div>
                          </div>
                        </div>

                        <div className="edicao-actions">
                          <button className="cancelar-edicao-button" onClick={cancelarEdicao}>
                            <XCircle size={16} /> Cancelar
                          </button>
                          <button
                            className="salvar-edicao-button"
                            onClick={() => salvarEdicao(usuario.id)}
                          >
                            <Plus size={16} /> Salvar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="usuario-detalhes">
                        <div className="info-grid">
                          <div className="info-item">
                            <Mail size={16} className="info-icon" />
                            <div>
                              <span className="info-label">Email:</span>
                              <span className="info-value">{usuario.email}</span>
                            </div>
                          </div>
                          <div className="info-item">
                            <UserCheck size={16} className="info-icon" />
                            <div>
                              <span className="info-label">Tipo:</span>
                              <span className="info-value">
                                {usuario.tipo === "professor" ? "Professor" : "Secretaria"}
                              </span>
                            </div>
                          </div>
                          <div className="info-item">
                            <User size={16} className="info-icon" />
                            <div>
                              <span className="info-label">Cadastrado em:</span>
                              <span className="info-value">{usuario.dataCadastro}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Usuarios;