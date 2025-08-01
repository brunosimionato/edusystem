// Seu arquivo: src/pages/Secretaria/Secretaria.jsx (ou onde quer que esteja)
import React from 'react';
import { Users, GraduationCap, BookOpen, School, UserPlus, Plus, BarChart3, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './secretaria.css';

// REMOVA ESTA LINHA: import LayoutSec from '../../components/Layout/LayoutSec';

const Secretaria = () => {
  const navigate = useNavigate();
  const dashboardStats = [
    { label: 'Total de Alunos', value: '1.247', icon: Users, color: 'blue' },
    { label: 'Professores Ativos', value: '87', icon: GraduationCap, color: 'green' },
    { label: 'Turmas Ativas', value: '42', icon: School, color: 'purple' },
    { label: 'Disciplinas', value: '23', icon: BookOpen, color: 'orange' }
  ];
  const recentActivities = [
    {
      action: 'Novo aluno matriculado',
      description: 'João Silva - 8º Ano A',
      time: '2 horas atrás'
    },
    {
      action: 'Professor cadastrado',
      description: 'Profa. Maria Santos - Matemática',
      time: '3 horas atrás'
    },
    {
      action: 'Turma criada',
      description: '9º Ano C - Ensino Fundamental',
      time: '5 horas atrás'
    },
  ];
  const quickActions = [
    {
      icon: UserPlus,
      text: 'Cadastrar Aluno',
      color: 'blue',
      onClick: () => navigate('/secretaria/cadastrar-aluno')
    },
    {
      icon: Plus,
      text: 'Criar Turma',
      color: 'green',
      onClick: () => navigate('/secretaria/criar-turma')
    },
    {
      icon: BarChart3,
      text: 'Declarações',
      color: 'purple',
      onClick: () => navigate('/secretaria/declaracoes')
    },
    {
      icon: Calendar,
      text: 'Horários',
      color: 'orange',
      onClick: () => navigate('/secretaria/grade-horaria')
    }
  ];
  return (
    // REMOVA AS TAGS <LayoutSec> E </LayoutSec> AQUI!
    <div className="dashboard-content">
      {/* Stats Cards */}
      <div className="stats-grid">
        {dashboardStats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-card-content">
              <div className="stat-info">
                <h3>{stat.label}</h3>
                <div className="stat-value">{stat.value}</div>
              </div>
              <div className={`stat-icon ${stat.color}`}>
                <stat.icon />
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Quick Actions */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Ações Rápidas</h3>
        </div>
        <div className="quick-actions-grid">
          {quickActions.map((action, index) => (
            <button
              key={index}
              className="action-button"
              onClick={action.onClick}
            >
              <div className={`action-icon ${action.color}`}>
                <action.icon />
              </div>
              <span className="action-text">{action.text}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Recent Activities */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Atividades Recentes</h3>
        </div>
        <div className="activity-feed">
          {recentActivities.map((activity, index) => (
            <div key={index} className="activity-item">
              <div className="activity-indicator"></div>
              <div className="activity-content">
                <div className="activity-title">{activity.action}</div>
                <div className="activity-description">{activity.description}</div>
              </div>
              <div className="activity-time">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
    // REMOVA AS TAGS <LayoutSec> E </LayoutSec> AQUI!
  );
};
export default Secretaria;
