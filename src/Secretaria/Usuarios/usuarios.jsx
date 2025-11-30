import React, { useState, useEffect } from "react";
import {
  User,
  Plus,
  XCircle,
  Edit,
  ChevronDown,
  ChevronRight,
  UserX,
  Mail,
  UserCheck,
  Save,
} from "lucide-react";

import "./usuarios.css";
import { useAuth } from "../../context/AuthContext";

const Usuarios = () => {
  const { authToken } = useAuth();

  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [tipoUsuario] = useState("secretaria");

  const [usuarios, setUsuarios] = useState([]);
  const [usuarioExpandido, setUsuarioExpandido] = useState({});
  const [usuarioEditando, setUsuarioEditando] = useState(null);
  const [animacaoSaindo, setAnimacaoSaindo] = useState({});

  const [dadosEdicao, setDadosEdicao] = useState({
    nome: "",
    email: "",
    senha: "",
    tipo: "",
  });

  const [erros, setErros] = useState({
    nome: false,
    email: false,
    senha: false,
  });

  const [abaSelecionada, setAbaSelecionada] = useState("secretaria");

  useEffect(() => {
    async function fetchUsuarios() {
      try {
        const response = await fetch("http://localhost:3000/usuarios", {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = await response.json();

        const formatados = data.map((u) => ({
          id: u.id ?? u.id_usuarios ?? u.id_usuario,
          nome: u.nome,
          email: u.email,
          tipo: u.tipo_usuario,
          ativo:
            u.ativo === true ||
            u.ativo === "true" ||
            u.ativo === 1 ||
            u.ativo === "1",
          dataCadastro: u.created_at
            ? new Date(u.created_at).toLocaleDateString("pt-BR")
            : "—",
        }));

        setUsuarios(formatados);
      } catch (error) {
        console.error("Erro ao carregar usuários:", error);
      }
    }

    if (authToken) fetchUsuarios();
  }, [authToken]);

  const validarEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async () => {
    const novosErros = {
      nome: !nome.trim(),
      email: !email.trim() || !validarEmail(email),
      senha: !senha.trim() || senha.length < 6,
    };

    setErros(novosErros);

    if (Object.values(novosErros).includes(true))
      return alert("Preencha os campos corretamente.");

    try {
      const response = await fetch("http://localhost:3000/usuarios", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          nome,
          email,
          senha,
          tipo_usuario: "secretaria",
        }),
      });

      const novo = await response.json();

      if (!response.ok) {
        alert(novo.error || "Erro ao cadastrar usuário.");
        return;
      }

      setUsuarios((prev) => [
        ...prev,
        {
          id: novo.id,
          nome: novo.nome,
          email: novo.email,
          tipo: novo.tipo_usuario,
          ativo: true,
          dataCadastro: new Date().toLocaleDateString("pt-BR"),
        },
      ]);

      handleLimparForm();
      alert("Usuário criado com sucesso!");
    } catch (error) {
      console.error("Erro ao cadastrar usuário:", error);
      alert("Erro ao cadastrar usuário.");
    }
  };

  const handleLimparForm = () => {
    setNome("");
    setEmail("");
    setSenha("");
    setErros({});
  };

  const toggleAtivo = async (usuario) => {
    const endpoint = usuario.ativo ? "" : "/ativar";
    const metodo = usuario.ativo ? "DELETE" : "PUT";

    if (
      !window.confirm(
        usuario.ativo
          ? "Deseja realmente INATIVAR este usuário?"
          : "Deseja realmente ATIVAR este usuário?"
      )
    )
      return;

    try {
      await fetch(`http://localhost:3000/usuarios/${usuario.id}${endpoint}`, {
        method: metodo,
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setUsuarios((prev) =>
        prev.map((u) =>
          u.id === usuario.id ? { ...u, ativo: !usuario.ativo } : u
        )
      );
    } catch (error) {
      alert("Erro ao alterar status do usuário.");
    }
  };

  const iniciarEdicao = (usuario) => {
    setUsuarioEditando(usuario.id);
    setDadosEdicao({
      nome: usuario.nome,
      email: usuario.email,
      senha: "",
      tipo: usuario.tipo,
    });
  };

  const cancelarEdicao = () => {
    setUsuarioEditando(null);
    setDadosEdicao({});
  };

  const salvarEdicao = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/usuarios/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          nome: dadosEdicao.nome,
          email: dadosEdicao.email,
          senha: dadosEdicao.senha || undefined,
        }),
      });

      const resultado = await response.json();

      if (!response.ok) {
        alert(resultado.error || "Erro ao salvar alterações.");
        return;
      }

      setUsuarios((prev) =>
        prev.map((usuario) =>
          usuario.id === id
            ? { ...usuario, nome: dadosEdicao.nome, email: dadosEdicao.email }
            : usuario
        )
      );

      cancelarEdicao();
      alert("Usuário atualizado com sucesso!");
    } catch (error) {
      console.error("Erro ao editar usuário", error);
      alert("Erro ao editar o usuário.");
    }
  };

  const toggleUsuarioExpansao = (id) => {
    if (usuarioExpandido[id]) {
      setAnimacaoSaindo((prev) => ({ ...prev, [id]: true }));
      setTimeout(() => {
        setUsuarioExpandido((prev) => ({ ...prev, [id]: false }));
        setAnimacaoSaindo((prev) => ({ ...prev, [id]: false }));
      }, 300);
    } else {
      setUsuarioExpandido((prev) => ({ ...prev, [id]: true }));
    }
  };

  return (
    <div className="cadastro-usuario-form-container">
      {/* FORMULÁRIO */}
      <div className="cadastro-usuario-form-section">
        <h3 className="cadastro-usuario-section-header">
          Cadastro de Secretários
        </h3>

        <div className="usuario-form-fields-container">
          <div className="cadastro-usuario-form-grid">
            <div className="cadastro-usuario-form-group half-width">
              <label htmlFor="nomeCompleto">Nome Completo*</label>
              <input
                id="nomeCompleto"
                type="text"
                className={`cadastro-usuario-input ${
                  erros.nome ? "usuario-input-error" : ""
                }`}
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>

            <div className="cadastro-usuario-form-group half-width">
              <label htmlFor="emailCadastro">Email*</label>
              <input
                id="emailCadastro"
                type="email"
                className={`cadastro-usuario-input ${
                  erros.email ? "usuario-input-error" : ""
                }`}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="cadastro-usuario-form-group half-width">
              <label htmlFor="senhaCadastro">Senha*</label>
              <input
                id="senhaCadastro"
                type="password"
                className={`cadastro-usuario-input ${
                  erros.senha ? "usuario-input-error" : ""
                }`}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>

            <div className="cadastro-usuario-form-group half-width">
              <label htmlFor="tipoUsuario">Tipo de Usuário*</label>

              <select
                id="tipoUsuario"
                className="cadastro-usuario-select blocked"
                value="secretaria"
                disabled
              >
                <option value="secretaria">Secretaria</option>
              </select>

              <input type="hidden" value="secretaria" />
            </div>
          </div>

          <div className="cadastro-usuario-form-actions">
            <button
              className="usuario-clear-button red-button"
              onClick={handleLimparForm}
            >
              <XCircle size={17} /> Limpar
            </button>

            <button
              className="usuario-submit-button blue-button"
              onClick={handleSubmit}
            >
              <Plus size={17} /> Cadastrar Usuário
            </button>
          </div>
        </div>
      </div>

      <div className="usuario-tabs">
        <button
          className={`usuario-tab ${
            abaSelecionada === "secretaria" ? "active" : ""
          }`}
          onClick={() => setAbaSelecionada("secretaria")}
        >
          Secretários
        </button>

        <button
          className={`usuario-tab ${
            abaSelecionada === "professor" ? "active" : ""
          }`}
          onClick={() => setAbaSelecionada("professor")}
        >
          Professores
        </button>
      </div>

      {/* LISTAGEM */}
      <div className="cadastro-usuario-form-section">
        <div className="cadastro-usuario-section-header-with-button">
          <h3 className="cadastro-usuario-section-header-list">
            Usuários Cadastrados
          </h3>
        </div>

        {usuarios
          .filter((u) => u.tipo === abaSelecionada)
          .sort((a, b) => (b.ativo === a.ativo ? 0 : b.ativo ? 1 : -1))
          .length === 0 ? (
          <div className="usuarios-empty-state">
            <User size={48} />
            <h4>Nenhum usuário cadastrado nessa categoria</h4>
          </div>
        ) : (
          <div className="usuarios-list">
            {usuarios
              .filter((u) => u.tipo === abaSelecionada)
              .sort((a, b) => (b.ativo === a.ativo ? 0 : b.ativo ? 1 : -1))
              .map((usuario) => (
                <div
                  key={usuario.id}
                  className={`usuario-card ${usuario.ativo ? "" : "inativo"}`}
                >
                  <div className="usuario-info">
                    <div className="usuario-header">
                      <div
                        className="usuario-basic-info-container clickable"
                        onClick={() => toggleUsuarioExpansao(usuario.id)}
                      >
                        {usuarioExpandido[usuario.id] ? (
                          <ChevronDown size={20} />
                        ) : (
                          <ChevronRight size={20} />
                        )}

                        <div className="usuario-avatar">
                          <User size={24} />
                        </div>

                        <div className="usuario-basic-info">
                          <h3 className="usuario-nome">{usuario.nome}</h3>
                          <p className="usuario-tipo">
                            {usuario.tipo === "professor"
                              ? "Professor"
                              : "Secretaria"}
                          </p>
                        </div>
                      </div>

                      <div className="usuario-header-actions">
                        {usuarioEditando === usuario.id ? (
                          <>
                            <button
                              className="action-button-usuario save-button-usuario"
                              onClick={(e) => {
                                e.stopPropagation();
                                salvarEdicao(usuario.id);
                              }}
                            >
                              <Save size={16} /> Salvar
                            </button>

                            <button
                              className="action-button-usuario remove-button-usuario"
                              onClick={(e) => {
                                e.stopPropagation();
                                cancelarEdicao();
                              }}
                            >
                              <XCircle size={16} /> Cancelar
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="action-button-usuario edit-button-usuario"
                              onClick={(e) => {
                                e.stopPropagation();
                                iniciarEdicao(usuario);
                                setUsuarioExpandido((prev) => ({
                                  ...prev,
                                  [usuario.id]: true,
                                }));
                              }}
                            >
                              <Edit size={16} /> Editar
                            </button>

                            {usuario.ativo ? (
                              <button
                                className="action-button-usuario deactivate-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAtivo(usuario);
                                }}
                              >
                                <UserX size={16} /> Inativar
                              </button>
                            ) : (
                              <button
                                className="action-button-usuario activate-button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleAtivo(usuario);
                                }}
                              >
                                <UserCheck size={16} /> Ativar
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {(usuarioExpandido[usuario.id] ||
                      animacaoSaindo[usuario.id]) && (
                      <div
                        className={`usuario-details-container ${
                          animacaoSaindo[usuario.id] ? "closing" : ""
                        }`}
                      >
                        {usuarioEditando === usuario.id ? (
                          <div className="usuario-edicao-form">
                            <div className="cadastro-usuario-form-grid">
                              <div className="cadastro-usuario-form-group full-width">
                                <label>Nome Completo*</label>
                                <input
                                  type="text"
                                  className="cadastro-usuario-input"
                                  value={dadosEdicao.nome}
                                  onChange={(e) =>
                                    setDadosEdicao((prev) => ({
                                      ...prev,
                                      nome: e.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <div className="cadastro-usuario-form-group half-width">
                                <label>Email*</label>
                                <input
                                  type="email"
                                  className="cadastro-usuario-input"
                                  value={dadosEdicao.email}
                                  onChange={(e) =>
                                    setDadosEdicao((prev) => ({
                                      ...prev,
                                      email: e.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <div className="cadastro-usuario-form-group half-width">
                                <label>Senha (opcional)</label>
                                <input
                                  type="password"
                                  className="cadastro-usuario-input"
                                  placeholder="Nova senha"
                                  onChange={(e) =>
                                    setDadosEdicao((prev) => ({
                                      ...prev,
                                      senha: e.target.value,
                                    }))
                                  }
                                />
                              </div>

                              <div className="cadastro-usuario-form-group half-width">
                                <label>Tipo de Usuário</label>
                                <select
                                  disabled
                                  className="cadastro-usuario-select disabled"
                                  value={dadosEdicao.tipo}
                                >
                                  <option value="professor">Professor</option>
                                  <option value="secretaria">Secretaria</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="usuario-detalhes">
                            <div className="usuario-info-grid">
                              <div className="usuario-info-item">
                                <Mail size={16} className="usuario-info-icon" />
                                <div>
                                  <span className="usuario-info-label">
                                    Email:
                                  </span>
                                  <span className="usuario-info-value">
                                    {usuario.email}
                                  </span>
                                </div>
                              </div>

                              <div className="usuario-info-item">
                                <User size={16} className="usuario-info-icon" />
                                <div>
                                  <span className="usuario-info-label">
                                    Cadastrado em:
                                  </span>
                                  <span className="usuario-info-value">
                                    {usuario.dataCadastro}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Usuarios;
