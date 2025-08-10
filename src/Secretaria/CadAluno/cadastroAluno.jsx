import React, { useState } from "react";
import "./cadastroAluno.css";

import { XCircle, UserPlus, Trash2 } from "lucide-react";

const CadastroAluno = () => {
  const [formData, setFormData] = useState({
    nome: "",
    cpf: "",
    cns: "",
    dataNascimento: "",
    genero: "",
    religiao: "",
    telefone: "",
    rua: "",
    numero: "",
    bairro: "",
    cep: "",
    cidade: "",
    estado: "",
    nomeR1: "",
    cpfR1: "",
    telefoneR1: "",
    parentescoR1: "",
    nomeR2: "",
    cpfR2: "",
    telefoneR2: "",
    parentescoR2: "",
    anoLetivo: "",
    serie: "",
    turma: "",
    alunoOutraEscola: false,
  });

  const [camposInvalidos, setCamposInvalidos] = useState([]);

  const [historicoEscolar, setHistoricoEscolar] = useState([
    {
      escolaAnterior: "",
      serieAnterior: "",
      notaConclusao: "",
      anoConclusao: "",
    },
  ]);

  const camposObrigatorios = [
    "nome",
    "cpf",
    "cns",
    "dataNascimento",
    "genero",
    "telefone",
    "rua",
    "numero",
    "bairro",
    "cep",
    "cidade",
    "estado",
    "nomeR1",
    "cpfR1",
    "telefoneR1",
    "parentescoR1",
    "anoLetivo",
    "serie",
    "turma",
    "escolaAnterior",
    "serieAnterior",
    "notaConclusao",
    "anoConclusao",
  ];

  // Máscaras
  const mascaraCPF = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  };

  const mascaraTelefone = (value) => {
    return value
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{4,5})(\d{4})$/, "$1-$2");
  };

  const mascaraCEP = (value) => {
    return value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");
  };

  // Handlers
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;

    if (name === "cns") {
      formattedValue = value.replace(/\D/g, "").slice(0, 15);
    } else if (name.includes("cpf") || name === "cpf") {
      formattedValue = mascaraCPF(value);
    } else if (name.includes("telefone") || name === "telefone") {
      formattedValue = mascaraTelefone(value);
    } else if (name === "cep") {
      formattedValue = mascaraCEP(value);

      const cepLimpo = formattedValue.replace(/\D/g, "");
      if (cepLimpo.length === 8) {
        buscarCEP(formattedValue); // chama a função para preencher cidade e estado
      }
    }

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : formattedValue,
    }));
  };

  const buscarCEP = async (cep) => {
    const cepLimpo = cep.replace(/\D/g, "");

    if (cepLimpo.length === 8) {
      try {
        const response = await fetch(
          `https://viacep.com.br/ws/${cepLimpo}/json/`
        );
        const data = await response.json();

        if (!data.erro) {
          setFormData((prev) => ({
            ...prev,
            rua: data.logradouro,
            bairro: data.bairro,
            cidade: data.localidade,
            estado: data.uf,
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP:", error);
      }
    }
  };

  const handleCEPBlur = () => {
    buscarCEP(formData.cep);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const invalidos = camposObrigatorios.filter((campo) => {
      if (campo.includes("escolaAnterior")) {
        return !formData[campo] || formData[campo].toString().trim() === "";
      }
      return !formData[campo] || formData[campo].toString().trim() === "";
    });

    if (invalidos.length > 0) {
      setCamposInvalidos(invalidos);
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setCamposInvalidos([]);
    handleLimpar(false); // limpa direto sem confirmação
  };

  const handleLimpar = (confirmar = true) => {
    if (confirmar) {
      // Só pede confirmação se confirmar for true
      if (!window.confirm("Tem certeza que deseja limpar todos os campos?")) {
        return; // sai sem limpar se cancelar
      }
    } // Limpa todos os campos, incluindo histórico escolar
    setFormData({
      nome: "",
      cpf: "",
      cns: "",
      dataNascimento: "",
      genero: "",
      religiao: "",
      telefone: "",
      rua: "",
      numero: "",
      bairro: "",
      cep: "",
      cidade: "",
      estado: "",
      nomeR1: "",
      cpfR1: "",
      telefoneR1: "",
      parentescoR1: "",
      nomeR2: "",
      cpfR2: "",
      telefoneR2: "",
      parentescoR2: "",
      anoLetivo: "",
      serie: "",
      turma: "",
      alunoOutraEscola: false,
    }); // Limpa o histórico escolar
    setHistoricoEscolar([
      {
        escolaAnterior: "",
        serieAnterior: "",
        notaConclusao: "",
        anoConclusao: "",
      },
    ]);
    setCamposInvalidos([]);
  };

  const handleHistoricoChange = (index, e) => {
    const { name, value } = e.target;
    const novosHistoricos = [...historicoEscolar];
    novosHistoricos[index][name] = value;
    setHistoricoEscolar(novosHistoricos);
  };

  const adicionarAnoEscolar = () => {
    setHistoricoEscolar([
      ...historicoEscolar,
      {
        escolaAnterior: "",
        serieAnterior: "",
        notaConclusao: "",
        anoConclusao: "",
      },
    ]);
  };

  const removerAnoEscolar = (index) => {
    if (historicoEscolar.length === 1) {
      alert(
        "Para remover o único ano escolar, desmarque a opção 'Aluno proveniente de outra escola'."
      );
      return;
    }

    setHistoricoEscolar((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="cadastro-container-aluno">
      <div className="cadastro-card-aluno">
        <form onSubmit={handleSubmit} className="cadastro-form">
          {/* Dados Pessoais */}
          <div className="form-section-aluno">
            <div className="section-title-cad-aluno">Dados Pessoais</div>
            <div className="form-row-aluno">
              <div className="form-group-aluno flex-3">
                <label htmlFor="nome">Nome*</label>
                <input
                  className={
                    camposInvalidos.includes("nome") ? "input-error" : ""
                  }
                  type="text"
                  id="nome"
                  name="nome"
                  value={formData.nome}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="cpf">CPF*</label>
                <input
                  className={
                    camposInvalidos.includes("cpf") ? "input-error" : ""
                  }
                  type="text"
                  id="cpf"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  maxLength="14"
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="cns">CNS*</label>
                <input
                  className={
                    camposInvalidos.includes("cns") ? "input-error" : ""
                  }
                  type="number"
                  id="cns"
                  name="cns"
                  value={formData.cns}
                  onChange={handleInputChange}
                  maxLength="15"
                />
              </div>
            </div>

            <div className="form-row-aluno">
              <div className="form-group-aluno medium">
                <label htmlFor="dataNascimento">Nascimento*</label>
                <input
                  className={
                    camposInvalidos.includes("dataNascimento")
                      ? "input-error"
                      : ""
                  }
                  type="date"
                  id="dataNascimento"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno flex-1">
                <label htmlFor="genero">Gênero*</label>
                <select
                  className={
                    camposInvalidos.includes("genero") ? "input-error" : ""
                  }
                  id="genero"
                  name="genero"
                  value={formData.genero}
                  onChange={handleInputChange}
                >
                  <option value=""> </option>
                  <option value="masculino">Masculino</option>
                  <option value="feminino">Feminino</option>
                </select>
              </div>
              <div className="form-group-aluno flex-1">
                <label htmlFor="religiao">Religião</label>
                <input
                  type="text"
                  id="religiao"
                  name="religiao"
                  value={formData.religiao}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="telefone">Telefone*</label>
                <input
                  className={
                    camposInvalidos.includes("telefone") ? "input-error" : ""
                  }
                  type="tel"
                  id="telefone"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleInputChange}
                  maxLength="15"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="form-section-aluno">
            <div className="section-title-cad-aluno">Endereço</div>
            <div className="form-row-aluno">
              <div className="form-group-aluno flex-3">
                <label htmlFor="rua">Logradouro*</label>
                <input
                  className={
                    camposInvalidos.includes("rua") ? "input-error" : ""
                  }
                  type="text"
                  id="rua"
                  name="rua"
                  value={formData.rua}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno small">
                <label htmlFor="numero">Número*</label>
                <input
                  className={
                    camposInvalidos.includes("numero") ? "input-error" : ""
                  }
                  type="number"
                  id="numero"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno flex-1">
                <label htmlFor="bairro">Bairro*</label>
                <input
                  className={
                    camposInvalidos.includes("bairro") ? "input-error" : ""
                  }
                  type="text"
                  id="bairro"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="form-row-aluno">
              <div className="form-group-aluno medium">
                <label htmlFor="cep">CEP*</label>
                <input
                  className={
                    camposInvalidos.includes("cep") ? "input-error" : ""
                  }
                  type="text"
                  id="cep"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  onBlur={handleCEPBlur}
                  maxLength="9"
                />
              </div>
              <div className="form-group-aluno flex-1">
                <label htmlFor="cidade">Cidade*</label>
                <input
                  className={
                    camposInvalidos.includes("cidade") ? "input-error" : ""
                  }
                  type="text"
                  id="cidade"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="estado">Estado*</label>
                <input
                  className={
                    camposInvalidos.includes("estado") ? "input-error" : ""
                  }
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  maxLength={2}
                />
              </div>
            </div>
          </div>

          {/* Responsáveis */}
          <div className="form-section-aluno">
            <div className="section-title-cad-aluno">Responsáveis</div>

            <div className="form-row-aluno">
              <div className="form-group-aluno flex-2">
                <label htmlFor="nomeR1">Responsável 1*</label>
                <input
                  className={
                    camposInvalidos.includes("nomeR1") ? "input-error" : ""
                  }
                  type="text"
                  id="nomeR1"
                  name="nomeR1"
                  value={formData.nomeR1}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="cpfR1">CPF*</label>
                <input
                  className={
                    camposInvalidos.includes("cpfR1") ? "input-error" : ""
                  }
                  type="text"
                  id="cpfR1"
                  name="cpfR1"
                  value={formData.cpfR1}
                  onChange={handleInputChange}
                  maxLength="14"
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="telefoneR1">Telefone*</label>
                <input
                  className={
                    camposInvalidos.includes("telefoneR1") ? "input-error" : ""
                  }
                  type="tel"
                  id="telefoneR1"
                  name="telefoneR1"
                  value={formData.telefoneR1}
                  onChange={handleInputChange}
                  maxLength="15"
                />
              </div>
              <div className="form-group-aluno flex-1">
                <label htmlFor="parentescoR1">Parentesco*</label>
                <input
                  className={
                    camposInvalidos.includes("parentescoR1")
                      ? "input-error"
                      : ""
                  }
                  type="text"
                  id="parentescoR1"
                  name="parentescoR1"
                  value={formData.parentescoR1}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="form-row-aluno">
              <div className="form-group-aluno flex-2">
                <label htmlFor="nomeR2">Responsável 2</label>
                <input
                  className={
                    camposInvalidos.includes("nomeR2") ? "input-error" : ""
                  }
                  type="text"
                  id="nomeR2"
                  name="nomeR2"
                  value={formData.nomeR2}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="cpfR2">CPF</label>
                <input
                  className={
                    camposInvalidos.includes("cpfR2") ? "input-error" : ""
                  }
                  type="text"
                  id="cpfR2"
                  name="cpfR2"
                  value={formData.cpfR2}
                  onChange={handleInputChange}
                  maxLength="14"
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="telefoneR2">Telefone</label>
                <input
                  className={
                    camposInvalidos.includes("telefoneR2") ? "input-error" : ""
                  }
                  type="tel"
                  id="telefoneR2"
                  name="telefoneR2"
                  value={formData.telefoneR2}
                  onChange={handleInputChange}
                  maxLength="15"
                />
              </div>
              <div className="form-group-aluno flex-1">
                <label htmlFor="parentescoR2">Parentesco</label>
                <input
                  className={
                    camposInvalidos.includes("parentescoR2")
                      ? "input-error"
                      : ""
                  }
                  type="text"
                  id="parentescoR2"
                  name="parentescoR2"
                  value={formData.parentescoR2}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Dados de Matrícula */}
          <div className="form-section-aluno">
            <div className="section-title-cad-aluno">Matrícula</div>

            <div className="form-row-aluno">
              <div className="form-group-aluno flex-2">
                <label htmlFor="anoLetivo">Ano Letivo*</label>
                <input
                  className={
                    camposInvalidos.includes("anoLetivo") ? "input-error" : ""
                  }
                  id="anoLetivo"
                  name="anoLetivo"
                  value={formData.anoLetivo}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno flex-1">
                <label htmlFor="serie">Ano Escolar*</label>
                <select
                  className={
                    camposInvalidos.includes("serie") ? "input-error" : ""
                  }
                  id="serie"
                  name="serie"
                  value={formData.serie}
                  onChange={handleInputChange}
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
              </div>
              <div className="form-group-aluno flex-1">
                <label htmlFor="turma">Turma*</label>
                <select
                  className={
                    camposInvalidos.includes("turma") ? "input-error" : ""
                  }
                  id="turma"
                  name="turma"
                  value={formData.turma}
                  onChange={handleInputChange}
                >
                  <option value="">Selecione</option>
                  <option value="A">1º A</option>
                  <option value="B">1º B</option>
                  <option value="C">2º A</option>
                  <option value="D">3º A</option>
                </select>
              </div>
            </div>

            <div className="form-row-aluno">
              <div className="checkbox-group-aluno">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="alunoOutraEscola"
                    checked={formData.alunoOutraEscola}
                    onChange={handleInputChange}
                  />
                  <span className="checkbox-text">
                    Aluno proveniente de outra escola (necessita histórico
                    escolar)
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Histórico Escolar - aparece só se alunoOutraEscola for true */}
          {formData.alunoOutraEscola && (
            <div className="form-section-aluno">
              <div className="section-title-cad-aluno">Histórico Escolar</div>

              {historicoEscolar.map((ano, index) => (
                <div key={index} className="form-row-aluno">
                  <div className="form-group-aluno flex-3">
                    <label htmlFor={`escolaAnterior-${index}`}>
                      Escola Anterior*
                    </label>
                    <input
                      type="text"
                      id={`escolaAnterior-${index}`}
                      name={`escolaAnterior`}
                      value={ano.escolaAnterior}
                      onChange={(e) => handleHistoricoChange(index, e)}
                      className={
                        camposInvalidos.includes("escolaAnterior")
                          ? "input-error"
                          : ""
                      }
                    />
                  </div>
                  <div className="form-group-aluno flex-1">
                    <label htmlFor={`serieAnterior-${index}`}>Série*</label>
                    <select
                      id={`serieAnterior-${index}`}
                      name="serieAnterior"
                      value={ano.serieAnterior}
                      onChange={(e) => handleHistoricoChange(index, e)}
                      className={
                        camposInvalidos.includes("serieAnterior")
                          ? "input-error"
                          : ""
                      }
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
                    </select>
                  </div>
                  <div className="form-group-aluno flex-1">
                    <label htmlFor={`notaConclusao-${index}`}>Nota*</label>
                    <input
                      type="number"
                      id={`notaConclusao-${index}`}
                      name="notaConclusao"
                      value={ano.notaConclusao}
                      onChange={(e) => handleHistoricoChange(index, e)}
                      className={
                        camposInvalidos.includes("notaConclusao")
                          ? "input-error"
                          : ""
                      }
                    />
                  </div>
                  <div className="form-group-aluno flex-1">
                    <label htmlFor={`anoConclusao-${index}`}>
                      Ano de Conclusão*
                    </label>
                    <input
                      type="text"
                      id={`anoConclusao-${index}`}
                      name="anoConclusao"
                      value={ano.anoConclusao}
                      onChange={(e) => handleHistoricoChange(index, e)}
                      maxLength={4}
                      className={
                        camposInvalidos.includes("anoConclusao")
                          ? "input-error"
                          : ""
                      }
                    />
                  </div>

                  <div className="form-group-aluno flex-0">
                    <button
                      type="button"
                      onClick={() => removerAnoEscolar(index)}
                      className="btn-remove"
                      title="Remover este ano escolar"
                    >
                      <Trash2 size={20}/>{" "}
                    </button>
                  </div>
                </div>
              ))}
              <div className="form-row-aluno-add-ano-aescolar">
                <button
                  type="button"
                  className="btn-add-aluno"
                  onClick={adicionarAnoEscolar}
                  style={{ marginTop: "10px" }}
                >
                  + Adicionar Ano Escolar
                </button>
              </div>
            </div>
          )}

          <div className="form-buttons-aluno">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => handleLimpar()}
            >
              <XCircle size={17} /> Limpar
            </button>
            <button type="submit" className="btn btn-primary">
              <UserPlus size={17} /> Cadastrar Aluno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroAluno;
