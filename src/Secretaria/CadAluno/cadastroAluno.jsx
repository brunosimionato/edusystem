import React, { useState } from 'react';
import { 
  User, 
  FileText, 
  Calendar, 
  MapPin, 
  Users, 
  Phone, 
  GraduationCap, 
  BookOpen,
  Save,
  ArrowLeft,
  Plus,
  Trash2
} from 'lucide-react';
import './cadastroAluno.css';


const CadastroAluno = () => {
  const [formData, setFormData] = useState({
    // Dados pessoais
    nomeCompleto: '',
    cpf: '',
    dataNascimento: '',
    turma: '',
    cns: '',
    religiao: '',
    
    // Endereço
    endereco: '',
    numero: '',
    cidade: '',
    estado: '',
    cep: '',
    bairro: '',
    
    // Dados do pai
    nomePai: '',
    profissaoPai: '',
    telefonePai: '',
    
    // Dados da mãe
    nomeMae: '',
    profissaoMae: '',
    telefoneMae: '',
    
    // Histórico escolar
    possuiHistorico: false,
    tipoSerie: 'iniciais' // 'iniciais' ou 'finais'
  });

  const [historicoSeries, setHistoricoSeries] = useState([
    { ano: '', nota: '' }
  ]);

  const [historicoMaterias, setHistoricoMaterias] = useState([
    {
      ano: '',
      materias: {
        portugues: '',
        matematica: '',
        ciencias: '',
        historia: '',
        geografia: '',
        ensReligioso: '',
        arte: '',
        educacaoFisica: '',
        ingles: ''
      }
    }
  ]);

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ];

  const turmas = [
    '1º Ano A', '1º Ano B', '2º Ano A', '2º Ano B', '3º Ano A', '3º Ano B',
    '4º Ano A', '4º Ano B', '5º Ano A', '5º Ano B', '6º Ano A', '6º Ano B',
    '7º Ano A', '7º Ano B', '8º Ano A', '8º Ano B', '9º Ano A', '9º Ano B'
  ];

  const materiasFinais = [
    { key: 'portugues', label: 'Português' },
    { key: 'matematica', label: 'Matemática' },
    { key: 'ciencias', label: 'Ciências' },
    { key: 'historia', label: 'História' },
    { key: 'geografia', label: 'Geografia' },
    { key: 'ensReligioso', label: 'Ens. Religioso' },
    { key: 'arte', label: 'Arte' },
    { key: 'educacaoFisica', label: 'Educação Física' },
    { key: 'ingles', label: 'Inglês' }
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleHistoricoSeriesChange = (index, field, value) => {
    const newHistorico = [...historicoSeries];
    newHistorico[index][field] = value;
    setHistoricoSeries(newHistorico);
  };

  const handleHistoricoMateriasChange = (index, field, value) => {
    const newHistorico = [...historicoMaterias];
    if (field === 'ano') {
      newHistorico[index].ano = value;
    } else {
      newHistorico[index].materias[field] = value;
    }
    setHistoricoMaterias(newHistorico);
  };

  const addHistoricoSeries = () => {
    setHistoricoSeries([...historicoSeries, { ano: '', nota: '' }]);
  };

  const addHistoricoMaterias = () => {
    setHistoricoMaterias([...historicoMaterias, {
      ano: '',
      materias: {
        portugues: '', matematica: '', ciencias: '', historia: '',
        geografia: '', ensReligioso: '', arte: '', educacaoFisica: '', ingles: ''
      }
    }]);
  };

  const removeHistoricoSeries = (index) => {
    setHistoricoSeries(historicoSeries.filter((_, i) => i !== index));
  };

  const removeHistoricoMaterias = (index) => {
    setHistoricoMaterias(historicoMaterias.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dadosCompletos = {
      ...formData,
      historico: formData.possuiHistorico ? {
        tipo: formData.tipoSerie,
        dados: formData.tipoSerie === 'iniciais' ? historicoSeries : historicoMaterias
      } : null
    };
    console.log('Dados do aluno:', dadosCompletos);
    alert('Aluno cadastrado com sucesso!');
  };

  return (
    <div className="cadastro-aluno-page">
      <div className="cadastro-container">
        <div className="cadastro-header">
          <button className="btn-voltar" type="button">
            <ArrowLeft size={20} />
            Voltar
          </button>
          <div className="header-title">
            <User size={24} />
            <h1>Cadastro de Aluno</h1>
          </div>
        </div>

        <form className="cadastro-form" onSubmit={handleSubmit}>
          {/* Dados Pessoais */}
          <div className="form-section">
            <div className="section-header">
              <User size={20} />
              <h2>Dados Pessoais</h2>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Nome Completo *</label>
                <input
                  type="text"
                  name="nomeCompleto"
                  value={formData.nomeCompleto}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o nome completo"
                />
              </div>

              <div className="form-group">
                <label>CPF *</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleInputChange}
                  required
                  placeholder="000.000.000-00"
                />
              </div>

              <div className="form-group">
                <label>Data de Nascimento *</label>
                <input
                  type="date"
                  name="dataNascimento"
                  value={formData.dataNascimento}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Turma *</label>
                <select
                  name="turma"
                  value={formData.turma}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione uma turma</option>
                  {turmas.map(turma => (
                    <option key={turma} value={turma}>{turma}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>CNS</label>
                <input
                  type="text"
                  name="cns"
                  value={formData.cns}
                  onChange={handleInputChange}
                  placeholder="Cartão Nacional de Saúde"
                />
              </div>

              <div className="form-group">
                <label>Religião</label>
                <input
                  type="text"
                  name="religiao"
                  value={formData.religiao}
                  onChange={handleInputChange}
                  placeholder="Digite a religião"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="form-section">
            <div className="section-header">
              <MapPin size={20} />
              <h2>Endereço</h2>
            </div>
            
            <div className="form-grid">
              <div className="form-group span-2">
                <label>Endereço *</label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleInputChange}
                  required
                  placeholder="Rua, Avenida, etc."
                />
              </div>

              <div className="form-group">
                <label>Número *</label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleInputChange}
                  required
                  placeholder="Número"
                />
              </div>

              <div className="form-group">
                <label>Bairro *</label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleInputChange}
                  required
                  placeholder="Bairro"
                />
              </div>

              <div className="form-group">
                <label>Cidade *</label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleInputChange}
                  required
                  placeholder="Cidade"
                />
              </div>

              <div className="form-group">
                <label>Estado *</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Selecione</option>
                  {estados.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>CEP *</label>
                <input
                  type="text"
                  name="cep"
                  value={formData.cep}
                  onChange={handleInputChange}
                  required
                  placeholder="00000-000"
                />
              </div>
            </div>
          </div>

          {/* Dados do Pai */}
          <div className="form-section">
            <div className="section-header">
              <Users size={20} />
              <h2>Dados do Pai</h2>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Nome do Pai</label>
                <input
                  type="text"
                  name="nomePai"
                  value={formData.nomePai}
                  onChange={handleInputChange}
                  placeholder="Nome completo do pai"
                />
              </div>

              <div className="form-group">
                <label>Profissão do Pai</label>
                <input
                  type="text"
                  name="profissaoPai"
                  value={formData.profissaoPai}
                  onChange={handleInputChange}
                  placeholder="Profissão"
                />
              </div>

              <div className="form-group">
                <label>Telefone do Pai</label>
                <input
                  type="tel"
                  name="telefonePai"
                  value={formData.telefonePai}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Dados da Mãe */}
          <div className="form-section">
            <div className="section-header">
              <Users size={20} />
              <h2>Dados da Mãe</h2>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Nome da Mãe</label>
                <input
                  type="text"
                  name="nomeMae"
                  value={formData.nomeMae}
                  onChange={handleInputChange}
                  placeholder="Nome completo da mãe"
                />
              </div>

              <div className="form-group">
                <label>Profissão da Mãe</label>
                <input
                  type="text"
                  name="profissaoMae"
                  value={formData.profissaoMae}
                  onChange={handleInputChange}
                  placeholder="Profissão"
                />
              </div>

              <div className="form-group">
                <label>Telefone da Mãe</label>
                <input
                  type="tel"
                  name="telefoneMae"
                  value={formData.telefoneMae}
                  onChange={handleInputChange}
                  placeholder="(00) 00000-0000"
                />
              </div>
            </div>
          </div>

          {/* Histórico Escolar */}
          <div className="form-section">
            <div className="section-header">
              <GraduationCap size={20} />
              <h2>Histórico Escolar</h2>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="possuiHistorico"
                  checked={formData.possuiHistorico}
                  onChange={handleInputChange}
                />
                Aluno possui histórico escolar (transferência)
              </label>
            </div>

            {formData.possuiHistorico && (
              <div className="historico-section">
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="tipoSerie"
                      value="iniciais"
                      checked={formData.tipoSerie === 'iniciais'}
                      onChange={handleInputChange}
                    />
                    Séries Iniciais (1º ao 5º ano)
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="tipoSerie"
                      value="finais"
                      checked={formData.tipoSerie === 'finais'}
                      onChange={handleInputChange}
                    />
                    Séries Finais (6º ao 9º ano)
                  </label>
                </div>

                {/* Tabela para Séries Iniciais */}
                {formData.tipoSerie === 'iniciais' && (
                  <div className="historico-table">
                    <div className="table-header">
                      <h3>Histórico - Séries Iniciais (Ensino Globalizado)</h3>
                      <button type="button" onClick={addHistoricoSeries} className="btn-add">
                        <Plus size={16} />
                        Adicionar Ano
                      </button>
                    </div>
                    
                    <table className="historico-table-content">
                      <thead>
                        <tr>
                          <th>Ano Letivo</th>
                          <th>Nota Global</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {historicoSeries.map((item, index) => (
                          <tr key={index}>
                            <td>
                              <input
                                type="text"
                                value={item.ano}
                                onChange={(e) => handleHistoricoSeriesChange(index, 'ano', e.target.value)}
                                placeholder="Ex: 2023"
                              />
                            </td>
                            <td>
                              <input
                                type="number"
                                min="0"
                                max="10"
                                step="0.1"
                                value={item.nota}
                                onChange={(e) => handleHistoricoSeriesChange(index, 'nota', e.target.value)}
                                placeholder="0.0"
                              />
                            </td>
                            <td>
                              <button
                                type="button"
                                onClick={() => removeHistoricoSeries(index)}
                                className="btn-remove"
                                disabled={historicoSeries.length === 1}
                              >
                                <Trash2 size={16} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Tabela para Séries Finais */}
                {formData.tipoSerie === 'finais' && (
                  <div className="historico-table">
                    <div className="table-header">
                      <h3>Histórico - Séries Finais (Por Matéria)</h3>
                      <button type="button" onClick={addHistoricoMaterias} className="btn-add">
                        <Plus size={16} />
                        Adicionar Ano
                      </button>
                    </div>
                    
                    {historicoMaterias.map((anoData, anoIndex) => (
                      <div key={anoIndex} className="ano-historico">
                        <div className="ano-header">
                          <input
                            type="text"
                            value={anoData.ano}
                            onChange={(e) => handleHistoricoMateriasChange(anoIndex, 'ano', e.target.value)}
                            placeholder="Ano Letivo (Ex: 2023)"
                            className="ano-input"
                          />
                          <button
                            type="button"
                            onClick={() => removeHistoricoMaterias(anoIndex)}
                            className="btn-remove"
                            disabled={historicoMaterias.length === 1}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                        
                        <table className="materias-table">
                          <thead>
                            <tr>
                              <th>Matéria</th>
                              <th>Nota</th>
                            </tr>
                          </thead>
                          <tbody>
                            {materiasFinais.map((materia) => (
                              <tr key={materia.key}>
                                <td>{materia.label}</td>
                                <td>
                                  <input
                                    type="number"
                                    min="0"
                                    max="10"
                                    step="0.1"
                                    value={anoData.materias[materia.key]}
                                    onChange={(e) => handleHistoricoMateriasChange(anoIndex, materia.key, e.target.value)}
                                    placeholder="0.0"
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Botões de Ação */}
          <div className="form-actions">
            <button type="button" className="btn-secondary">
              Cancelar
            </button>
            <button type="submit" className="btn-primary">
              <Save size={20} />
              Salvar Aluno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CadastroAluno;
