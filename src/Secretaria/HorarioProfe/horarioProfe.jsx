import React, { useState, useEffect } from 'react';
import './horarioProfe.css';

const HorarioProfe = () => {
  const [turmas, setTurmas] = useState([]);
  const [turmaSelecionada, setTurmaSelecionada] = useState('');
  const [editando, setEditando] = useState(false);
  const [horarioSelecionado, setHorarioSelecionado] = useState({ periodo: '', dia: '', turno: '' });

  // Estrutura dos horários
  const diasSemana = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta'];
  
  const periodosMatutino = [
    { periodo: 1, horario: '07:30 - 08:20' },
    { periodo: 2, horario: '08:20 - 09:10' },
    { periodo: 'Intervalo', horario: '09:00 - 09:15', isIntervalo: true },
    { periodo: 3, horario: '09:15 - 10:05' },
    { periodo: 4, horario: '10:05 - 10:55' },
    { periodo: 5, horario: '10:55 - 11:45' }
  ];

  const periodosVespertino = [
    { periodo: 1, horario: '13:00 - 13:50' },
    { periodo: 2, horario: '13:50 - 14:40' },
    { periodo: 3, horario: '14:40 - 15:30' },
    { periodo: 'Intervalo', horario: '15:00 - 15:15', isIntervalo: true },
    { periodo: 4, horario: '15:15 - 16:05' },
    { periodo: 5, horario: '16:05 - 17:00' }
  ];

  // Estado para armazenar os horários das turmas
  const [horariosMatutino, setHorariosMatutino] = useState({});
  const [horariosVespertino, setHorariosVespertino] = useState({});
  const [materias, setMaterias] = useState([]);
  const [professores, setProfessores] = useState([]);

  // Inicializar dados mockados
  useEffect(() => {
    // Turmas mockadas
    setTurmas([
      { id: 1, nome: '1º Ano A' },
      { id: 2, nome: '1º Ano B' },
      { id: 3, nome: '2º Ano A' },
      { id: 4, nome: '2º Ano B' },
      { id: 5, nome: '3º Ano A' }
    ]);

    // Matérias mockadas
    setMaterias([
      'Matemática', 'Português', 'História', 'Geografia', 'Ciências',
      'Inglês', 'Educação Física', 'Artes', 'Filosofia', 'Sociologia'
    ]);

    // Professores mockados
    setProfessores([
      { id: 1, nome: 'Prof. João Silva' },
      { id: 2, nome: 'Prof. Maria Santos' },
      { id: 3, nome: 'Prof. Carlos Oliveira' },
      { id: 4, nome: 'Prof. Ana Costa' },
      { id: 5, nome: 'Prof. Pedro Lima' }
    ]);
  }, []);

  const inicializarHorarios = (turmaId) => {
    const horarioVazio = {};
    diasSemana.forEach(dia => {
      horarioVazio[dia] = {};
      periodosMatutino.forEach(periodo => {
        if (!periodo.isIntervalo) {
          horarioVazio[dia][`matutino_${periodo.periodo}`] = { materia: '', professor: '' };
        }
      });
      periodosVespertino.forEach(periodo => {
        if (!periodo.isIntervalo) {
          horarioVazio[dia][`vespertino_${periodo.periodo}`] = { materia: '', professor: '' };
        }
      });
    });
    return horarioVazio;
  };

  const handleTurmaChange = (turmaId) => {
    setTurmaSelecionada(turmaId);
    if (!horariosMatutino[turmaId]) {
      const novoHorario = inicializarHorarios(turmaId);
      setHorariosMatutino(prev => ({ ...prev, [turmaId]: novoHorario }));
      setHorariosVespertino(prev => ({ ...prev, [turmaId]: novoHorario }));
    }
  };

  const handleEditarHorario = (periodo, dia, turno) => {
    setHorarioSelecionado({ periodo, dia, turno });
    setEditando(true);
  };

  const handleSalvarHorario = (materia, professor) => {
    const { periodo, dia, turno } = horarioSelecionado;
    const chave = `${turno}_${periodo}`;
    
    if (turno === 'matutino') {
      setHorariosMatutino(prev => ({
        ...prev,
        [turmaSelecionada]: {
          ...prev[turmaSelecionada],
          [dia]: {
            ...prev[turmaSelecionada][dia],
            [chave]: { materia, professor }
          }
        }
      }));
    } else {
      setHorariosVespertino(prev => ({
        ...prev,
        [turmaSelecionada]: {
          ...prev[turmaSelecionada],
          [dia]: {
            ...prev[turmaSelecionada][dia],
            [chave]: { materia, professor }
          }
        }
      }));
    }
    
    setEditando(false);
    setHorarioSelecionado({ periodo: '', dia: '', turno: '' });
  };

  const renderCelula = (periodo, dia, turno) => {
    if (periodo.isIntervalo) {
      return (
        <td key={`${dia}-${turno}-intervalo`} className="intervalo-cell">
          <div className="intervalo-content">
            <span>INTERVALO</span>
            <small>{periodo.horario}</small>
          </div>
        </td>
      );
    }

    const horarios = turno === 'matutino' ? horariosMatutino : horariosVespertino;
    const chave = `${turno}_${periodo.periodo}`;
    const dadosHorario = horarios[turmaSelecionada]?.[dia]?.[chave] || { materia: '', professor: '' };

    return (
      <td 
        key={`${dia}-${turno}-${periodo.periodo}`} 
        className="horario-cell"
        onClick={() => handleEditarHorario(periodo.periodo, dia, turno)}
      >
        <div className="horario-content">
          <div className="materia">{dadosHorario.materia || 'Clique para editar'}</div>
          <div className="professor">{dadosHorario.professor}</div>
        </div>
      </td>
    );
  };

  const renderTabela = (periodos, turno, titulo) => (
    <div className="turno-section">
      <h3 className="turno-title">{titulo}</h3>
      <div className="table-container">
        <table className="horarios-table">
          <thead>
            <tr>
              <th className="periodo-header">Período</th>
              <th className="horario-header">Horário</th>
              {diasSemana.map(dia => (
                <th key={dia} className="dia-header">{dia}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periodos.map((periodo) => (
              <tr key={`${turno}-${periodo.periodo}`} className={periodo.isIntervalo ? 'intervalo-row' : ''}>
                <td className="periodo-cell">
                  {periodo.isIntervalo ? 'Intervalo' : `${periodo.periodo}º`}
                </td>
                <td className="horario-cell-time">{periodo.horario}</td>
                {diasSemana.map(dia => renderCelula(periodo, dia, turno))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="horarios-cadastro-container">
      {turmaSelecionada && (
        <div className="horarios-content">
          <div className="turma-info">
            <h2>Grade Horária - {turmas.find(t => t.id.toString() === turmaSelecionada)?.nome}</h2>
          </div>

          {renderTabela(periodosMatutino, 'matutino', 'Período Matutino (07:30 - 11:45)')}
          {renderTabela(periodosVespertino, 'vespertino', 'Período Vespertino (13:00 - 17:00)')}
        </div>
      )}

      {editando && (
        <div className="modal-overlay">
          <div className="modal-content">
            <ModalEdicao
              periodo={horarioSelecionado.periodo}
              dia={horarioSelecionado.dia}
              turno={horarioSelecionado.turno}
              materias={materias}
              professores={professores}
              onSalvar={handleSalvarHorario}
              onCancelar={() => setEditando(false)}
              horarioAtual={
                (horarioSelecionado.turno === 'matutino' ? horariosMatutino : horariosVespertino)
                [turmaSelecionada]?.[horarioSelecionado.dia]?.[`${horarioSelecionado.turno}_${horarioSelecionado.periodo}`]
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

const ModalEdicao = ({ periodo, dia, turno, materias, professores, onSalvar, onCancelar, horarioAtual }) => {
  const [materia, setMateria] = useState(horarioAtual?.materia || '');
  const [professor, setProfessor] = useState(horarioAtual?.professor || '');

  const handleSalvar = () => {
    onSalvar(materia, professor);
  };

  return (
    <div className="modal-edicao">
      <div className="modal-header">
        <h3>Editar Horário</h3>
        <p>{dia} - {periodo}º Período ({turno === 'matutino' ? 'Manhã' : 'Tarde'})</p>
      </div>
      
      <div className="modal-body">
        <div className="form-group">
          <label>Matéria:</label>
          <select 
            value={materia} 
            onChange={(e) => setMateria(e.target.value)}
            className="select-input"
          >
            <option value="">Selecione uma matéria</option>
            {materias.map(mat => (
              <option key={mat} value={mat}>{mat}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Professor:</label>
          <select 
            value={professor} 
            onChange={(e) => setProfessor(e.target.value)}
            className="select-input"
          >
            <option value="">Selecione um professor</option>
            {professores.map(prof => (
              <option key={prof.id} value={prof.nome}>{prof.nome}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="modal-footer">
        <button onClick={onCancelar} className="btn-cancelar">
          Cancelar
        </button>
        <button onClick={handleSalvar} className="btn-salvar">
          Salvar
        </button>
      </div>
    </div>
  );
};

export default HorarioProfe;