import React from 'react';
import { 
  Users, GraduationCap, Clock, ClipboardList,
  CheckCircle, Plus, BookOpenCheck, Upload
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './prof.css';

const Professor = () => {
  const navigate = useNavigate();

  const dashboardStats = [
    { label: 'Turmas Ativas', value: '6', icon: Users, color: 'blue' },
    { label: 'Total de Alunos', value: '184', icon: GraduationCap, color: 'green' },
    { label: 'Periodos Hoje', value: '4', icon: Clock, color: 'purple' },
    { label: 'Avaliações Pendentes', value: '12', icon: ClipboardList, color: 'orange' }
  ];

  const quickActions = [
    {
      icon: CheckCircle,
      text: 'Fazer Chamada',
      color: 'blue',
      onClick: () => navigate('/professor/chamada')
    },
    {
      icon: Plus,
      text: 'Lançar Notas',
      color: 'green',
      onClick: () => navigate('/professor/notas')
    },
    {
      icon: BookOpenCheck,
      text: 'Plano de Aula',
      color: 'purple',
      onClick: () => navigate('/professor/planos')
    },
    {
      icon: Upload,
      text: 'Lançar Notas',
      color: 'orange',
      onClick: () => navigate('/professor/materiais')
    }
  ];

  return (
    <div className="dashboard-content-prof">
      {/* Stats Cards */}
      <div className="stats-grid-prof">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="stat-card-prof">
            <div className="stat-card-content-prof">
              <div className="stat-info-prof">
                <h3>{stat.label}</h3>
                <div className="stat-value-prof">{stat.value}</div>
              </div>
              <div className={`stat-icon-prof ${stat.color}`}>
                <stat.icon />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="section-card-prof">
        <div className="section-header-prof">
          <h3 className="section-title-prof">Ações Rápidas</h3>
        </div>
        <div className="quick-actions-grid-prof">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="action-button-prof"
              onClick={action.onClick}
            >
              <div className={`action-icon-prof ${action.color}`}>
                <action.icon />
              </div>
              <span className="action-text-prof">{action.text}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Professor;
