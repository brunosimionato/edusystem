import React, { useState, useEffect } from "react";
import { XCircle, UserPlus, Trash2, Save } from "lucide-react";
import { useTurmas } from "../../hooks/useTurmas";

import {
  mascaraCEP,
  mascaraCPF,
  mascaraTelefone,
} from "../../utils/formatacao";

import "./alunoForm.css";

const AlunoForm = ({
  initialData = null,
  onSave = null,
  onCancel = null,
  mode = "create",
}) => {
  const [formData, setFormData] = useState({
    id: null,
    nome: "",
    cpf: "",
    cns: "",
    nascimento: "",
    genero: "",
    religiao: "",
    telefone: "",
    logradouro: "",
    numero: "",
    bairro: "",
    cep: "",
    cidade: "",
    estado: "",
    responsavel1Nome: "",
    responsavel1Cpf: "",
    responsavel1Telefone: "",
    responsavel1Parentesco: "",
    responsavel2Nome: "",
    responsavel2Cpf: "",
    responsavel2Telefone: "",
    responsavel2Parentesco: "",
    serie: "",
    anoLetivo: "",
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
    "9ano",
  ];

  const disciplinasMap = {
    ensinoGlobalizado: "Ensino Globalizado",
    matematica: "Matemática",
    ciencias: "Ciências",
    historia: "História",
    geografia: "Geografia",
    ingles: "Inglês",
    arte: "Arte",
    edFisica: "Educação Física",
  };

  const {
    turmas,
    isLoading: turmasLoading,
    hasError: turmasError,
  } = useTurmas();

  const [historicoEscolar, setHistoricoEscolar] = useState([]);

  // ✅ CORRIGIDO: Popula initialData corretamente
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id ?? null,
        nome: initialData.nome ?? "",
        cpf: initialData.cpf ?? "",
        cns: initialData.cns ?? "",
        nascimento: initialData.nascimento?.substring(0, 10) ?? "",
        genero: initialData.genero ?? "",
        religiao: initialData.religiao ?? "",
        telefone: initialData.telefone ?? "",

        logradouro: initialData.logradouro ?? "",
        numero: initialData.numero ?? "",
        bairro: initialData.bairro ?? "",
        cep: initialData.cep ?? "",
        cidade: initialData.cidade ?? "",
        estado: initialData.estado ?? "",

        responsavel1Nome: initialData.responsavel1Nome ?? "",
        responsavel1Cpf: initialData.responsavel1Cpf ?? "",
        responsavel1Telefone: initialData.responsavel1Telefone ?? "",
        responsavel1Parentesco: initialData.responsavel1Parentesco ?? "",

        responsavel2Nome: initialData.responsavel2Nome ?? "",
        responsavel2Cpf: initialData.responsavel2Cpf ?? "",
        responsavel2Telefone: initialData.responsavel2Telefone ?? "",
        responsavel2Parentesco: initialData.responsavel2Parentesco ?? "",

        serie: initialData.serie ?? "",
        anoLetivo: initialData.anoLetivo ?? "",
        turma: initialData.turma ?? "",

        alunoOutraEscola: (initialData.historicoEscolar?.length ?? 0) > 0,
      });

      // ✅ Normalização para evitar erro do trim()
      setHistoricoEscolar(
        (initialData.historicoEscolar ?? []).map((ano) => ({
          ...ano,
          anoConclusao: ano.anoConclusao != null ? String(ano.anoConclusao) : "",
          escolaAnterior: ano.escolaAnterior ?? "",
          serieAnterior: ano.serieAnterior ?? "",
          notas: {
            ...ano.notas,
          },
        }))
      );
    }
  }, [initialData]);

  // ✅ CORRIGIDO: Campos obrigatórios com nomes corretos
  const camposObrigatoriosPrincipais = [
    "nome",
    "cpf",
    "nascimento",
    "genero",
    "telefone",
    "logradouro", // ✅ era "rua"
    "numero",
    "bairro",
    "cep",
    "cidade",
    "estado",
    "responsavel1Nome", // ✅ era "nomeR1"
    "responsavel1Cpf",
    "responsavel1Telefone", // ✅ era "telefoneR1"
    "responsavel1Parentesco", // ✅ era "parentescoR1"
    "anoLetivo",
    "turma",
  ];

  // ✅ CORRIGIDO: handleInputChange completo
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    let formattedValue = value;

    if (name === "cns") {
      formattedValue = value.replace(/\D/g, "").slice(0, 15);
    } else if (name.includes("Cpf") || name === "cpf") {
      formattedValue = mascaraCPF(value);
    } else if (name.includes("Telefone") || name === "telefone") {
      formattedValue = mascaraTelefone(value);
    } else if (name === "cep") {
      formattedValue = mascaraCEP(value);
      const cepLimpo = formattedValue.replace(/\D/g, "");
      if (cepLimpo.length === 8) {
        buscarCEP(formattedValue);
      }
    }

    // ✅ Checkbox de aluno de outra escola
    if (name === "alunoOutraEscola") {
      if (checked) {
        if (historicoEscolar.length === 0) {
          setHistoricoEscolar([
            {
              escolaAnterior: "",
              serieAnterior: "1ano",
              anoConclusao: "",
              notas: {
                ensinoGlobalizado: "",
                matematica: "",
                ciencias: "",
                historia: "",
                geografia: "",
                ingles: "",
                arte: "",
                edFisica: "",
              },
            },
          ]);
        }
        setFormData((prev) => ({ ...prev, alunoOutraEscola: true }));
      } else {
        setHistoricoEscolar([]);
        setFormData((prev) => ({ ...prev, alunoOutraEscola: false }));
      }
      return;
    }

    // ✅ Para todos os outros inputs
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
            logradouro: data.logradouro,
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Dados do Formulário:", formData);
    console.log("Histórico Escolar:", historicoEscolar);

    let invalidos = [];

    // 1. Validar campos principais
    camposObrigatoriosPrincipais.forEach((campo) => {
      if (!formData[campo] || formData[campo].toString().trim() === "") {
        invalidos.push(campo);
      }
    });

    // 2. Validar histórico escolar se necessário
    if (formData.alunoOutraEscola) {
      historicoEscolar.forEach((ano, index) => {
        if (!ano.escolaAnterior || ano.escolaAnterior.trim() === "") {
          invalidos.push(`escolaAnterior-${index}`);
        }
        if (!ano.serieAnterior || ano.serieAnterior.trim() === "") {
          invalidos.push(`serieAnterior-${index}`);
        }
        if (!ano.anoConclusao || ano.anoConclusao.trim() === "") {
          invalidos.push(`anoConclusao-${index}`);
        }

        // Para 1º ao 5º ano, apenas Ensino Globalizado é obrigatório
        if (
          ["1ano", "2ano", "3ano", "4ano", "5ano"].includes(ano.serieAnterior)
        ) {
          if (
            !ano.notas.ensinoGlobalizado ||
            ano.notas.ensinoGlobalizado.toString().trim() === ""
          ) {
            invalidos.push(`notas.ensinoGlobalizado-${index}`);
          }
        }
        // Para 6º ao 9º ano, todas exceto Ensino Globalizado
        else if (["6ano", "7ano", "8ano", "9ano"].includes(ano.serieAnterior)) {
          Object.keys(ano.notas).forEach((materia) => {
            if (materia !== "ensinoGlobalizado") {
              if (
                !ano.notas[materia] ||
                ano.notas[materia].toString().trim() === ""
              ) {
                invalidos.push(`notas.${materia}-${index}`);
              }
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

    // ✅ Monta o payload final
    const historicoToSend =
      !formData.alunoOutraEscola || historicoEscolar.length === 0
        ? null
        : historicoEscolar;

    const payload = {
      ...formData,
      id: formData.id,
      historicoEscolar: historicoToSend,
    };

    console.log("➡️ PAYLOAD FINAL:", payload);

    if (onSave) {
      try {
        const sucesso = await onSave(payload);

        if (sucesso === true) {
          handleLimpar(false);
        }
      } catch (error) {
        if (error.message?.toLowerCase().includes("cpf")) {
        } else {
          alert("Erro ao salvar o aluno. Verifique os dados e tente novamente.");
        }

        console.error("Erro ao salvar:", error);
        return;
      }
    }
  };

  // ✅ CORRIGIDO: handleLimpar com os nomes corretos
  const handleLimpar = (confirmar = true) => {
    if (confirmar) {
      if (!window.confirm("Tem certeza que deseja limpar todos os campos?")) {
        return;
      }
    }
    setFormData({
      id: null,
      nome: "",
      cpf: "",
      cns: "",
      nascimento: "",
      genero: "",
      religiao: "",
      telefone: "",
      logradouro: "",
      numero: "",
      bairro: "",
      cep: "",
      cidade: "",
      estado: "",
      responsavel1Nome: "",
      responsavel1Cpf: "",
      responsavel1Telefone: "",
      responsavel1Parentesco: "",
      responsavel2Nome: "",
      responsavel2Cpf: "",
      responsavel2Telefone: "",
      responsavel2Parentesco: "",
      serie: "",
      anoLetivo: "",
      turma: "",
      alunoOutraEscola: false,
    });
    setHistoricoEscolar([]);
    setCamposInvalidos([]);
  };

  // ✅ CORRIGIDO: Suporta `notas.xxx` no histórico
  const handleHistoricoChange = (index, e) => {
    const { name, value } = e.target;
    const novosHistoricos = [...historicoEscolar];

    // ✅ Trata notas.xxx
    if (name.startsWith("notas.")) {
      const materia = name.split(".")[1];
      novosHistoricos[index].notas[materia] = value;
    } else {
      novosHistoricos[index][name] = value;
    }

    setHistoricoEscolar(novosHistoricos);
  };

  const adicionarAnoEscolar = () => {
    const seriesOrdenadas = [
      "1ano",
      "2ano",
      "3ano",
      "4ano",
      "5ano",
      "6ano",
      "7ano",
      "8ano",
    ];

    let nextSerie = "1ano";

    if (historicoEscolar.length > 0) {
      const ultimaSerie =
        historicoEscolar[historicoEscolar.length - 1].serieAnterior;
      const idx = seriesOrdenadas.indexOf(ultimaSerie);

      if (idx === -1 || idx === seriesOrdenadas.length - 1) {
        alert("O último ano escolar já foi adicionado (8º ano).");
        return;
      }

      nextSerie = seriesOrdenadas[idx + 1];
    }

    setHistoricoEscolar([
      ...historicoEscolar,
      {
        escolaAnterior: "",
        serieAnterior: nextSerie,
        anoConclusao: "",
        notas: {
          ensinoGlobalizado: "",
          matematica: "",
          ciencias: "",
          historia: "",
          geografia: "",
          ingles: "",
          arte: "",
          edFisica: "",
        },
      },
    ]);
  };

  const removerAnoEscolar = (index) => {
    if (index !== historicoEscolar.length - 1) {
      alert("Os anos escolares devem ser excluídos em ordem decrescente.");
      return;
    }

    if (historicoEscolar.length === 1) {
      alert(
        "Para remover o último ano escolar, desmarque a opção 'Aluno proveniente de outra escola'."
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
                <label htmlFor="cns">CNS</label>
                <input
                  className={
                    camposInvalidos.includes("cns") ? "input-error" : ""
                  }
                  type="text"
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
                <label htmlFor="nascimento">Nascimento*</label>
                <input
                  className={
                    camposInvalidos.includes("nascimento")
                      ? "input-error"
                      : ""
                  }
                  type="date"
                  id="nascimento"
                  name="nascimento"
                  value={formData.nascimento}
                  onChange={handleInputChange}
                  min="1900-01-01"
                  max="2100-12-31"
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
                  <option value="">Selecione</option>
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
                <label htmlFor="logradouro">Logradouro*</label>
                <input
                  className={
                    camposInvalidos.includes("logradouro") ? "input-error" : ""
                  }
                  type="text"
                  id="logradouro"
                  name="logradouro"
                  value={formData.logradouro}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno small">
                <label htmlFor="numero">Número*</label>
                <input
                  className={
                    camposInvalidos.includes("numero") ? "input-error" : ""
                  }
                  type="text"
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
                  onChange={(e) =>
                    handleInputChange({
                      target: {
                        name: "estado",
                        value: e.target.value.toUpperCase(),
                      },
                    })
                  }
                  maxLength={2}
                  pattern="[A-Z]{2}"
                  title="Digite a sigla do estado (ex: SP, RJ)"
                  style={{ textTransform: "uppercase" }}
                />
              </div>
            </div>
          </div>

          {/* Responsável 1 */}
          <div className="form-section-aluno">
            <div className="section-title-cad-aluno">Responsável 1*</div>
            <div className="form-row-aluno">
              <div className="form-group-aluno flex-3">
                <label htmlFor="responsavel1Nome">Nome*</label>
                <input
                  className={
                    camposInvalidos.includes("responsavel1Nome") ? "input-error" : ""
                  }
                  type="text"
                  id="responsavel1Nome"
                  name="responsavel1Nome"
                  value={formData.responsavel1Nome}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="responsavel1Cpf">CPF*</label>
                <input
                  className={
                    camposInvalidos.includes("responsavel1Cpf") ? "input-error" : ""
                  }
                  type="text"
                  id="responsavel1Cpf"
                  name="responsavel1Cpf"
                  value={formData.responsavel1Cpf}
                  onChange={handleInputChange}
                  maxLength="14"
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="responsavel1Telefone">Telefone*</label>
                <input
                  className={
                    camposInvalidos.includes("responsavel1Telefone") ? "input-error" : ""
                  }
                  type="tel"
                  id="responsavel1Telefone"
                  name="responsavel1Telefone"
                  value={formData.responsavel1Telefone}
                  onChange={handleInputChange}
                  maxLength="15"
                />
              </div>
              <div className="form-group-aluno flex-1">
                <label htmlFor="responsavel1Parentesco">Parentesco*</label>
                <input
                  className={
                    camposInvalidos.includes("responsavel1Parentesco")
                      ? "input-error"
                      : ""
                  }
                  type="text"
                  id="responsavel1Parentesco"
                  name="responsavel1Parentesco"
                  value={formData.responsavel1Parentesco}
                  onChange={handleInputChange}
                />
              </div>
            </div>
          </div>

          {/* Responsável 2 */}
          <div className="form-section-aluno">
            <div className="section-title-cad-aluno">Responsável 2</div>
            <div className="form-row-aluno">
              <div className="form-group-aluno flex-3">
                <label htmlFor="responsavel2Nome">Nome</label>
                <input
                  type="text"
                  id="responsavel2Nome"
                  name="responsavel2Nome"
                  value={formData.responsavel2Nome}
                  onChange={handleInputChange}
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="responsavel2Cpf">CPF</label>
                <input
                  type="text"
                  id="responsavel2Cpf"
                  name="responsavel2Cpf"
                  value={formData.responsavel2Cpf}
                  onChange={handleInputChange}
                  maxLength="14"
                />
              </div>
              <div className="form-group-aluno medium">
                <label htmlFor="responsavel2Telefone">Telefone</label>
                <input
                  type="tel"
                  id="responsavel2Telefone"
                  name="responsavel2Telefone"
                  value={formData.responsavel2Telefone}
                  onChange={handleInputChange}
                  maxLength="15"
                />
              </div>
              <div className="form-group-aluno flex-1">
                <label htmlFor="responsavel2Parentesco">Parentesco</label>
                <input
                  type="text"
                  id="responsavel2Parentesco"
                  name="responsavel2Parentesco"
                  value={formData.responsavel2Parentesco}
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
                <label htmlFor="turma">Turma*</label>
                <select
                  id="turma"
                  name="turma"
                  value={formData.turma}
                  onChange={handleInputChange}
                  className={
                    camposInvalidos.includes("turma") ? "input-error" : ""
                  }
                >
                  {turmasLoading && (
                    <option value="" disabled>
                      Carregando turmas...
                    </option>
                  )}
                  {turmasError && (
                    <option value="" disabled>
                      Erro ao carregar turmas
                    </option>
                  )}
                  {!turmasLoading && !turmasError && (
                    <>
                      <option value="">Selecione</option>
                      {turmas.map((turma) => (
                        <option key={turma.id} value={turma.id}>
                          {turma.nome}
                        </option>
                      ))}
                    </>
                  )}
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

          {/* Histórico Escolar */}
          {formData.alunoOutraEscola && historicoEscolar.length > 0 && (
            <div className="form-section-aluno">
              <div className="section-title-cad-aluno">Histórico Escolar</div>

              <div className="historico-container">
                {historicoEscolar.map((ano, index) => (
                  <div key={index} className="historico-ano-container">
                    <div className="historico-header">
                      <h4 className="historico-titulo">{index + 1}º Ano</h4>
                      <button
                        type="button"
                        onClick={() => removerAnoEscolar(index)}
                        className="btn-remove"
                        title="Remover este ano escolar"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>

                    <div className="historico-info-basica">
                      {/* Escola Anterior */}
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

                      {/* Série (bloqueada para edição) */}
                      <div className="form-group-aluno">
                        <label htmlFor={`serieAnterior-${index}`}>Série*</label>
                        <select
                          id={`serieAnterior-${index}`}
                          name="serieAnterior"
                          value={ano.serieAnterior}
                          disabled
                          className={
                            camposInvalidos.includes(`serieAnterior-${index}`)
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

                      {/* Ano de Conclusão */}
                      <div className="form-group-aluno">
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
                    </div>

                    {/* Notas por disciplina */}
                    <div className="historico-notas">
                      <h5 className="notas-titulo">Notas</h5>
                      <div className="notas-grid">
                        {Object.keys(ano.notas).map((materia) => {
                          const isObrigatoria =
                            (["1ano", "2ano", "3ano", "4ano", "5ano"].includes(
                              ano.serieAnterior
                            ) &&
                              materia === "ensinoGlobalizado") ||
                            (["6ano", "7ano", "8ano", "9ano"].includes(
                              ano.serieAnterior
                            ) &&
                              materia !== "ensinoGlobalizado");

                          // Para 1º ao 5º ano, mostra apenas Ensino Globalizado
                          if (
                            ["1ano", "2ano", "3ano", "4ano", "5ano"].includes(
                              ano.serieAnterior
                            )
                          ) {
                            if (materia !== "ensinoGlobalizado") {
                              return null;
                            }
                          }

                          // Para 6º ao 9º ano, não mostra Ensino Globalizado
                          if (
                            ["6ano", "7ano", "8ano", "9ano"].includes(
                              ano.serieAnterior
                            )
                          ) {
                            if (materia === "ensinoGlobalizado") {
                              return null;
                            }
                          }

                          return (
                            <div key={materia} className="form-group-aluno">
                              <label>
                                {disciplinasMap[materia] || materia}
                                {isObrigatoria && "*"}
                              </label>
                              <input
                                type="number"
                                step="1"
                                min="0"
                                max="100"
                                name={`notas.${materia}`}
                                value={ano.notas[materia]}
                                onChange={(e) => handleHistoricoChange(index, e)}
                                className={
                                  camposInvalidos.includes(
                                    `notas.${materia}-${index}`
                                  )
                                    ? "input-error"
                                    : ""
                                }
                                placeholder={
                                  isObrigatoria ? "Obrigatório" : "Opcional"
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

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

          {/* Botões */}
          <div className="form-buttons-aluno">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                if (onCancel) onCancel();
                else handleLimpar();
              }}
            >
              <XCircle size={17} /> {mode === "edit" ? "Cancelar" : "Limpar"}
            </button>

            <button
              type="submit"
              className={`btn ${mode === "edit" ? "btn-save" : "btn-primary"}`}
            >
              {mode === "edit" ? (
                <>
                  <Save size={17} /> Salvar
                </>
              ) : (
                <>
                  <UserPlus size={17} /> Cadastrar Aluno
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AlunoForm;