import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Users, Edit, UserX, ArrowRightLeft, Search, Filter } from 'lucide-react';
import './listaAluno.css';

const ListaAluno = () => {
  const [expandedTurmas, setExpandedTurmas] = useState(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedModal, setSelectedModal] = useState(null);
  const [selectedAluno, setSelectedAluno] = useState(null);

  // Dados de exemplo
  const [turmas, setTurmas] = useState([
    {
      id: 1,
      nome: "3º Ano A",
      turno: "manhã",
      maxAlunos: 30,
      alunos: [
        { id: 1, nome: "Ana Silva", status: "ativo" },
        { id: 2, nome: "Bruno Santos", status: "ativo" },
        { id: 3, nome: "Carlos Oliveira", status: "inativo" },
        { id: 4, nome: "Diana Costa", status: "ativo" },
        { id: 5, nome: "Eduardo Lima", status: "ativo" }
      ]
    },
    {
      id: 2,
      nome: "2º Ano B",
      turno: "tarde",
      maxAlunos: 28,
      alunos: [
        { id: 6, nome: "Fernanda Souza", status: "ativo" },
        { id: 7, nome: "Gabriel Rocha", status: "ativo" },
        { id: 8, nome: "Helena Martins", status: "inativo" },
        { id: 9, nome: "Igor Pereira", status: "ativo" }
      ]
    },
    {
      id: 3,
      nome: "1º Ano C",
      turno: "integral",
      maxAlunos: 25,
      alunos: [
        { id: 10, nome: "Julia Ferreira", status: "ativo" },
        { id: 11, nome: "Kevin Alves", status: "ativo" },
        { id: 12, nome: "Laura Mendes", status: "ativo" }
      ]
    }
  ]);

  const toggleTurma = (turmaId) => {
    const newExpanded = new Set(expandedTurmas);
    if (newExpanded.has(turmaId)) {
      newExpanded.delete(turmaId);
    } else {
      newExpanded.add(turmaId);
    }
    setExpandedTurmas(newExpanded);
  };

  const getTurnoClass = (turno) => {
    const classes = {
      'manhã': 'turno-manhã',
      'tarde': 'turno-tarde',
      'noite': 'turno-noite',
      'integral': 'turno-integral'
    };
    return classes[turno] || 'turno-manhã';
  };

  const getProgressClass = (alunos, maxAlunos) => {
    const percentual = (alunos.length / maxAlunos) * 100;
    if (percentual >= 100) return 'lotada';
    if (percentual >= 85) return 'quase-lotada';
    return '';
  };

  const handleAlunoAction = (action, aluno, turmaId) => {
    setSelectedAluno({ ...aluno, turmaId });
    setSelectedModal(action);
  };

  const toggleAlunoStatus = (alunoId, turmaId) => {
    setTurmas(prev => prev.map(turma => 
      turma.id === turmaId 
        ? {
            ...turma,
            alunos: turma.alunos.map(aluno =>
              aluno.id === alunoId
                ? { ...aluno, status: aluno.status === 'ativo' ? 'inativo' : 'ativo' }
                : aluno
            )
          }
        : turma
    ));
    setSelectedModal(null);
  };

  const filteredTurmas = turmas.filter(turma =>
    turma.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    turma.alunos.some(aluno => 
      aluno.nome.toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const Modal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
      <div className="modal-overlay">
        <div className="modal-content">
          <div className="modal-header">
            <h3 className="modal-title">{title}</h3>
            <button 
              onClick={onClose}
              className="modal-close-button"
            >
              ×
            </button>
          </div>
          {children}
        </div>
      </div>
    );
  };

  return (
    <div className="cadastro-turma-form-container">
      <h1 className="cadastro-turma-form-title">Gestão de Turmas e Alunos</h1>

      {/* Seção de Filtros */}
      <div className="cadastro-turma-form-section">
        <div className="cadastro-turma-section-header">
          <span>Filtros e Busca</span>
        </div>
        <div className="cadastro-turma-form-grid">
          <div className="cadastro-turma-form-group half-width">
            <label>Buscar turma ou aluno</label>
            <div className="cadastro-turma-input-wrapper">
              <Search className="cadastro-turma-input-icon" size={16} />
              <input
                type="text"
                className="cadastro-turma-input search-input-lista-aluno"
                placeholder="Digite o nome da turma ou aluno..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Seção de Turmas */}
      <div className="cadastro-turma-form-section">
        <div className="cadastro-turma-section-header-with-button">
          <span>Turmas Cadastradas ({filteredTurmas.length})</span>
        </div>

        {filteredTurmas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Users size={40} />
            </div>
            <h4>Nenhuma turma encontrada</h4>
            <p>Não há turmas que correspondam aos seus critérios de busca.</p>
          </div>
        ) : (
          <div className="turmas-list">
            {filteredTurmas.map((turma) => {
              const alunosAtivos = turma.alunos.filter(a => a.status === 'ativo').length;
              const percentual = Math.round((turma.alunos.length / turma.maxAlunos) * 100);
              const isExpanded = expandedTurmas.has(turma.id);

              return (
                <div key={turma.id} className={`turma-card ${getProgressClass(turma.alunos, turma.maxAlunos)}`}>
                  <div className="turma-info">
                    {/* Cabeçalho da Turma */}
                    <div 
                      className="turma-header clickable" 
                      onClick={() => toggleTurma(turma.id)}
                    >
                      {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                      <h3 className="turma-nome">{turma.nome}</h3>
                      <span className={`turma-turno ${getTurnoClass(turma.turno)}`}>
                        {turma.turno}
                      </span>
                    </div>

                    {/* Detalhes da Turma */}
                    <div className="turma-details">
                      <div className="alunos-count">
                        {turma.alunos.length} de {turma.maxAlunos} alunos | {alunosAtivos} ativos
                      </div>
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ width: `${Math.min(percentual, 100)}%` }}
                        ></div>
                      </div>
                      <div className="percentual-text">{percentual}% da capacidade</div>
                    </div>

                    {/* Lista de Alunos Expandida */}
                    {isExpanded && (
                      <div className="alunos-table-container">
                        {/* Cabeçalho da Tabela */}
                        <div className="alunos-table-header">
                          <span>Nome do Aluno</span>
                          <span>Status</span>
                          <span>Ações</span>
                        </div>

                        {/* Lista de Alunos */}
                        {turma.alunos.map((aluno) => (
                          <div key={aluno.id} className="aluno-row">
                            <span className={`aluno-nome ${aluno.status === 'inativo' ? 'inativo' : ''}`}>
                              {aluno.nome}
                            </span>
                            
                            <span className={`status-badge ${aluno.status}`}>
                              {aluno.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </span>
                            
                            <div className="aluno-actions">
                              <button
                                onClick={() => handleAlunoAction('editar', aluno, turma.id)}
                                className="action-button edit-button"
                                title="Editar aluno"
                              >
                                <Edit size={14} />
                              </button>
                              
                              <button
                                onClick={() => handleAlunoAction('status', aluno, turma.id)}
                                className={`action-button ${aluno.status === 'ativo' ? 'deactivate-button' : 'activate-button'}`}
                                title={aluno.status === 'ativo' ? 'Inativar aluno' : 'Ativar aluno'}
                              >
                                <UserX size={14} />
                              </button>
                              
                              <button
                                onClick={() => handleAlunoAction('remanejar', aluno, turma.id)}
                                className="action-button transfer-button"
                                title="Remanejar aluno"
                              >
                                <ArrowRightLeft size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal de Editar */}
      <Modal
        isOpen={selectedModal === 'editar'}
        onClose={() => setSelectedModal(null)}
        title="Editar Aluno"
      >
        {selectedAluno && (
          <div className="modal-form">
            <div className="cadastro-turma-form-group">
              <label>Nome do Aluno</label>
              <input
                type="text"
                className="cadastro-turma-input"
                defaultValue={selectedAluno.nome}
                placeholder="Digite o nome do aluno"
              />
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setSelectedModal(null)}
                className="cadastro-turma-clear-button red-button"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setSelectedModal(null)}
                className="cadastro-turma-submit-button blue-button"
              >
                Salvar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Alterar Status */}
      <Modal
        isOpen={selectedModal === 'status'}
        onClose={() => setSelectedModal(null)}
        title={selectedAluno?.status === 'ativo' ? 'Inativar Aluno' : 'Ativar Aluno'}
      >
        {selectedAluno && (
          <div className="modal-form">
            <p className="modal-confirmation-text">
              Tem certeza que deseja {selectedAluno.status === 'ativo' ? 'inativar' : 'ativar'} o aluno <strong>{selectedAluno.nome}</strong>?
            </p>
            <div className="modal-actions">
              <button 
                onClick={() => setSelectedModal(null)}
                className="cadastro-turma-clear-button red-button"
              >
                Cancelar
              </button>
              <button 
                onClick={() => toggleAlunoStatus(selectedAluno.id, selectedAluno.turmaId)}
                className="cadastro-turma-submit-button blue-button"
              >
                Confirmar
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal de Remanejar */}
      <Modal
        isOpen={selectedModal === 'remanejar'}
        onClose={() => setSelectedModal(null)}
        title="Remanejar Aluno"
      >
        {selectedAluno && (
          <div className="modal-form">
            <p className="modal-confirmation-text">
              Remanejar <strong>{selectedAluno.nome}</strong> para:
            </p>
            <div className="cadastro-turma-form-group">
              <label>Nova Turma</label>
              <select className="cadastro-turma-select">
                <option value="">Selecione a nova turma</option>
                {turmas
                  .filter(t => t.id !== selectedAluno.turmaId)
                  .map(turma => (
                    <option key={turma.id} value={turma.id}>
                      {turma.nome} - {turma.turno}
                    </option>
                  ))}
              </select>
            </div>
            <div className="modal-actions">
              <button 
                onClick={() => setSelectedModal(null)}
                className="cadastro-turma-clear-button red-button"
              >
                Cancelar
              </button>
              <button 
                onClick={() => setSelectedModal(null)}
                className="cadastro-turma-submit-button blue-button"
              >
                Remanejar
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ListaAluno;