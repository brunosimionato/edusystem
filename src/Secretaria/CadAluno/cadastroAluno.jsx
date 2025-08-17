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

  const series = [
    "1ano",
    "2ano",
    "3ano",
    "4ano",
    "5ano",
    "6ano",
    "7ano",
    "8ano",
    "9ano", // Adicionei 9º ano aqui para a lista de séries
  ];

    // Defina o mapeamento de disciplinas aqui
  const disciplinasMap = {
    portugues: "Português",
    matematica: "Matemática",
    ciencias: "Ciências",
    historia: "História",
    geografia: "Geografia",
    ingles: "Inglês",
    artes: "Artes",
    edFisica: "Educação Física",
    religiao: "Religião",
  };

  const [historicoEscolar, setHistoricoEscolar] = useState([
    {
      escolaAnterior: "",
      serieAnterior: "", // Mudei para vazio para que o usuário selecione
      anoConclusao: "",
      notaConclusao: "",
      notas: {
        portugues: "",
        matemática: "",
        ciencias: "",
        historia: "",
        geografia: "",
        ingles: "",
        artes: "",
        edFisica: "",
      },
    },
  ]);

  // Campos obrigatórios que são sempre parte do formData principal
  const camposObrigatoriosPrincipais = [
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
    let invalidos = [];

    // 1. Validar campos principais do formData
    camposObrigatoriosPrincipais.forEach((campo) => {
      if (!formData[campo] || formData[campo].toString().trim() === "") {
        invalidos.push(campo);
      }
    });

    // 2. Validar campos do histórico escolar se 'alunoOutraEscola' for true
    if (formData.alunoOutraEscola) {
      historicoEscolar.forEach((ano, index) => {
        // Campos obrigatórios para cada ano no histórico
        if (!ano.escolaAnterior || ano.escolaAnterior.trim() === "") {
          invalidos.push(`escolaAnterior-${index}`);
        }
        if (!ano.serieAnterior || ano.serieAnterior.trim() === "") {
          invalidos.push(`serieAnterior-${index}`);
        }
        if (!ano.anoConclusao || ano.anoConclusao.trim() === "") {
          invalidos.push(`anoConclusao-${index}`);
        }

        // Validação condicional das notas
        if (
          ["1ano", "2ano", "3ano", "4ano", "5ano"].includes(ano.serieAnterior)
        ) {
          if (
            !ano.notaConclusao ||
            ano.notaConclusao.toString().trim() === ""
          ) {
            invalidos.push(`notaConclusao-${index}`);
          }
        } else if (
          ["6ano", "7ano", "8ano", "9ano"].includes(ano.serieAnterior)
        ) {
          // Para 6º, 7º, 8º e 9º ano, todas as notas de disciplina são obrigatórias
          Object.keys(ano.notas).forEach((materia) => {
            if (
              !ano.notas[materia] ||
              ano.notas[materia].toString().trim() === ""
            ) {
              invalidos.push(`notas.${materia}-${index}`);
            }
          });
        }
      });
    }

    if (invalidos.length > 0) {
      setCamposInvalidos(invalidos);
      alert("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    setCamposInvalidos([]);
    console.log("Dados do Formulário:", formData);
    console.log("Histórico Escolar:", historicoEscolar);
    // Aqui você enviaria os dados para o backend ou faria outra ação
    handleLimpar(false); // limpa direto sem confirmação após o envio
  };

  const handleLimpar = (confirmar = true) => {
    if (confirmar) {
      if (!window.confirm("Tem certeza que deseja limpar todos os campos?")) {
        return;
      }
    }
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
    });
    setHistoricoEscolar([
      {
        escolaAnterior: "",
        serieAnterior: "",
        notaConclusao: "",
        anoConclusao: "",
        notas: {
          portugues: "",
          matemática: "",
          ciencias: "",
          historia: "",
          geografia: "",
          ingles: "",
          artes: "",
          edFisica: "",
        },
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
    // Verifica se já temos 9 anos escolares
    if (historicoEscolar.length >= 9) {
      alert("O máximo de anos escolares permitidos é 9.");
      return;
    }

    let proximaSerie = "";

    if (historicoEscolar.length === 1) {
      // Se histórico vazio, começa com "1ano"
      proximaSerie = "2ano";
    } else {
      // Se existe histórico, pega a última série e calcula a próxima
      const ultimoAno = historicoEscolar[historicoEscolar.length - 1];
      const ultimaSerieIndex = series.indexOf(ultimoAno.serieAnterior);
      <div className="linha-divisoria" />
      // Se a última série for "1ano", não vai permitir adicionar outro
      if (ultimoAno.serieAnterior === "2ano") {
        proximaSerie = "3ano"; // Faz o próximo ser "2ano"
      } else {
        // Verifica se ainda pode avançar na série
        if (ultimaSerieIndex < series.length - 1) {
          proximaSerie = series[ultimaSerieIndex + 1];
        } else {
          alert("Você já alcançou o último ano escolar.");
          return;
        }
      }
    }

    // Adiciona um novo ano ao histórico escolar
    setHistoricoEscolar([
      ...historicoEscolar,
      {
        escolaAnterior: "",
        serieAnterior: proximaSerie,
        anoConclusao: "",
        notaConclusao: "",
        notas: {
          Português: "",
          Matemática: "",
          Ciências: "",
          História: "",
          Geografia: "",
          Inglês: "",
          Arte: "",
          Religião: "",
        },
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
              <div className="form-group-aluno flex-2">
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
              <div className="form-group-aluno small">
                <label htmlFor="estado">Estado*</label>
                <input
                  className={
                    camposInvalidos.includes("estado") ? "input-error" : ""
                  }
                  type="text"
                  id="estado"
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>
          {/* Responsável 1 */}
          <div className="form-section-aluno">
            <div className="section-title-cad-aluno">Responsável 1</div>
            <div className="form-row-aluno">
              <div className="form-group-aluno flex-3">
                <label htmlFor="nomeR1">Nome*</label>
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
          </div>
          {/* Responsável 2 */}
          <div className="form-section-aluno">
            <div className="section-title-cad-aluno">
              Responsável 2 (Opcional)
            </div>
            <div className="form-row-aluno">
              <div className="form-group-aluno flex-3">
                <label htmlFor="nomeR2">Nome</label>
                <input
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
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
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
                <div key={index} className="historico-ano-container">
                  {" "}
                  {/* Contêiner para cada ano escolar */}
                  {/* Primeira linha: Escola, Série, Nota (condicional), Ano Conclusão, Remover */}
                  <div className="form-row-aluno">
                    <div className="form-group-aluno flex-3">
                      <label htmlFor={`escolaAnterior-${index}`}>
                        Escola Anterior*
                      </label>
                      <input
                        type="text"
                        id={`escolaAnterior-${index}`}
                        name="escolaAnterior"
                        value={ano.escolaAnterior}
                        onChange={(e) => handleHistoricoChange(index, e)}
                        className={
                          camposInvalidos.includes(`escolaAnterior-${index}`)
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
                          camposInvalidos.includes(`serieAnterior-${index}`)
                            ? "input-error"
                            : ""
                        }
                      >
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

                    {/* Renderiza nota de conclusão para 1º ao 5º ano */}
                    {!["6ano", "7ano", "8ano", "9ano"].includes(
                      ano.serieAnterior
                    ) && (
                      <div className="form-group-aluno flex-1">
                        <label htmlFor={`notaConclusao-${index}`}>Nota*</label>
                        <input
                          type="number"
                          id={`notaConclusao-${index}`}
                          name="notaConclusao"
                          value={ano.notaConclusao}
                          onChange={(e) => handleHistoricoChange(index, e)}
                          className={
                            camposInvalidos.includes(`notaConclusao-${index}`)
                              ? "input-error"
                              : ""
                          }
                        />
                      </div>
                    )}

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
                          camposInvalidos.includes(`anoConclusao-${index}`)
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
                        <Trash2 size={20} />{" "}
                      </button>
                    </div>
                  </div>{" "}
                  {/* Fim da primeira linha do ano escolar */}

                  
                  {/* Segunda linha: Notas por disciplina (aparece apenas para 6º, 7º, 8º e 9º ano) */}
                  {["6ano", "7ano", "8ano", "9ano"].includes(
                    ano.serieAnterior
                  ) && (
                    <div className="form-row-aluno-materias">
                      {Object.keys(ano.notas).map((materia) => (
                        <div key={materia} className="form-group-aluno flex-1">
                          <label>
                            {disciplinasMap[materia] || materia.charAt(0).toUpperCase() + materia.slice(1)}*
                          </label>
                          <input
                            type="number"
                            name={`notas.${materia}`}
                            value={ano.notas[materia]}
                            onChange={(e) => {
                              const novosHistoricos = [...historicoEscolar];
                              novosHistoricos[index].notas[materia] =
                                e.target.value;
                              setHistoricoEscolar(novosHistoricos);
                            }}
                            className={
                              camposInvalidos.includes(
                                `notas.${materia}-${index}`
                              )
                                ? "input-error"
                                : ""
                            }
                          />
                        </div>
                      ))}
                      
                    </div>
                  )}
                </div> /* Fim do historico-ano-container */
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