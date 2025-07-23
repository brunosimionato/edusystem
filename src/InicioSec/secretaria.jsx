import React, { useState } from 'react';
import { 
  Users, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  FileText, 
  BarChart3, 
  Settings, 
  Home,
  UserPlus,
  School,
  ClipboardList,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Plus,
  Eye
} from 'lucide-react';
import './secretaria.css';

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState('secretaria');
  const [expandedMenus, setExpandedMenus] = useState({});

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: 'dashboard'
    },
    {
      id: 'students',
      label: 'Alunos',
      icon: Users,
      submenu: [
        { id: 'students-list', label: 'Lista de Alunos' },
        { id: 'students-add', label: 'Cadastrar Aluno' },
        { id: 'students-enrollment', label: 'Matrículas' },
        { id: 'students-documents', label: 'Documentação' }
      ]
    },
    {
      id: 'teachers',
      label: 'Professores',
      icon: GraduationCap,
      submenu: [
        { id: 'teachers-list', label: 'Lista de Professores' },
        { id: 'teachers-add', label: 'Cadastrar Professor' },
        { id: 'teachers-schedule', label: 'Horários' },
        { id: 'teachers-evaluation', label: 'Avaliações' }
      ]
    },
    {
      id: 'classes',
      label: 'Turmas',
      icon: School,
      submenu: [
        { id: 'classes-list', label: 'Lista de Turmas' },
        { id: 'classes-add', label: 'Criar Turma' },
        { id: 'classes-schedule', label: 'Grade Horária' },
        { id: 'classes-attendance', label: 'Frequência' }
      ]
    },
    {
      id: 'subjects',
      label: 'Disciplinas',
      icon: BookOpen,
      submenu: [
        { id: 'subjects-list', label: 'Lista de Disciplinas' },
        { id: 'subjects-add', label: 'Cadastrar Disciplina' },
        { id: 'subjects-curriculum', label: 'Currículo' }
      ]
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: Calendar,
      submenu: [
        { id: 'calendar-academic', label: 'Calendário Acadêmico' },
        { id: 'calendar-events', label: 'Eventos' },
        { id: 'calendar-holidays', label: 'Feriados' }
      ]
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      submenu: [
        { id: 'reports-students', label: 'Relatório de Alunos' },
        { id: 'reports-teachers', label: 'Relatório de Professores' },
        { id: 'reports-attendance', label: 'Frequência' },
        { id: 'reports-grades', label: 'Notas' },
        { id: 'reports-financial', label: 'Financeiro' }
      ]
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: FileText,
      submenu: [
        { id: 'documents-certificates', label: 'Certificados' },
        { id: 'documents-declarations', label: 'Declarações' },
        { id: 'documents-transcripts', label: 'Histórico Escolar' }
      ]
    },
    {
      id: 'assessments',
      label: 'Avaliações',
      icon: ClipboardList,
      submenu: [
        { id: 'assessments-exams', label: 'Provas' },
        { id: 'assessments-grades', label: 'Notas' },
        { id: 'assessments-recovery', label: 'Recuperação' }
      ]
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      submenu: [
        { id: 'settings-school', label: 'Dados da Escola' },
        { id: 'settings-users', label: 'Usuários' },
        { id: 'settings-system', label: 'Sistema' }
      ]
    }
  ];

  const dashboardStats = [
    { label: 'Total de Alunos', value: '1,247', icon: Users, color: 'blue' },
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
    { 
      action: 'Relatório gerado', 
      description: 'Frequência Mensal - Novembro', 
      time: '1 dia atrás' 
    }
  ];

  const upcomingEvents = [
    {
      day: '25',
      month: 'NOV',
      title: 'Conselho de Classe',
      description: 'Avaliação do 3º Bimestre',
      color: 'blue'
    },
    {
      day: '30',
      month: 'NOV',
      title: 'Reunião de Pais',
      description: 'Ensino Fundamental II',
      color: 'green'
    }
  ];

  const quickActions = [
    {
      icon: UserPlus,
      text: 'Cadastrar Aluno',
      color: 'blue',
      onClick: () => setActiveSection('students-add')
    },
    {
      icon: Plus,
      text: 'Criar Turma',
      color: 'green',
      onClick: () => setActiveSection('classes-add')
    },
    {
      icon: BarChart3,
      text: 'Gerar Relatório',
      color: 'purple',
      onClick: () => setActiveSection('reports')
    },
    {
      icon: Calendar,
      text: 'Agendar Evento',
      color: 'orange',
      onClick: () => setActiveSection('calendar-events')
    }
  ];

  const renderMenuItem = (item) => {
    const isExpanded = expandedMenus[item.id];
    const isActive = activeSection === item.id;

    return (
      <li key={item.id} className="nav-item">
        <button
          className={`nav-button ${isActive ? 'active' : ''}`}
          onClick={() => {
            if (item.submenu) {
              toggleMenu(item.id);
            } else {
              setActiveSection(item.id);
            }
          }}
        >
          <div className="nav-button-content">
            <item.icon />
            <span>{item.label}</span>
          </div>
          {item.submenu && (
            <ChevronDown className={`nav-chevron ${isExpanded ? 'expanded' : ''}`} />
          )}
        </button>
        
        {item.submenu && (
          <ul className={`submenu ${isExpanded ? 'expanded' : ''}`}>
            {item.submenu.map((subitem) => (
              <li key={subitem.id} className="submenu-item">
                <button
                  className={`submenu-button ${activeSection === subitem.id ? 'active' : ''}`}
                  onClick={() => setActiveSection(subitem.id)}
                >
                  {subitem.label}
                </button>
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  };

  const renderDashboard = () => (
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
          <a href="#" className="section-link">Ver todas</a>
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

      {/* Upcoming Events */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Próximos Eventos</h3>
        </div>
        <div className="events-list">
          {upcomingEvents.map((event, index) => (
            <div key={index} className={`event-item ${event.color}`}>
              <div className="event-date">
                <div className="event-day">{event.day}</div>
                <div className="event-month">{event.month}</div>
              </div>
              <div className="event-info">
                <div className="event-title">{event.title}</div>
                <div className="event-description">{event.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderDevelopmentSection = () => (
    <div className="section-card">
      <div className="development-section">
        <div className="development-icon">
          <Settings />
        </div>
        <h3 className="development-title">Seção em Desenvolvimento</h3>
        <p className="development-description">
          Esta funcionalidade está sendo desenvolvida. Em breve estará disponível para uso.
        </p>
      </div>
    </div>
  );

  return (
    <div className="dashboard-container">
      {/* Sidebar */}
      <div className="sidebar">
        {/* Header da Sidebar */}
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon">
              <School />
            </div>
            <div className="logo-text">
              <h1>EscolaSystem</h1>
              <p>Gestão Escolar</p>
            </div>
          </div>
        </div>

        {/* Perfil do Usuário */}
        <div className="user-profile">
          <div className="user-avatar">AS</div>
          <div className="user-info">
            <h3>Ana Silva</h3>
            <p>Secretária</p>
          </div>
        </div>

        {/* Menu de Navegação */}
        <nav className="navigation">
          <ul className="nav-menu">
            {menuItems.map(renderMenuItem)}
          </ul>
        </nav>

        {/* Footer da Sidebar */}
        <div className="sidebar-footer">
          <button className="logout-button">
            <LogOut />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Conteúdo Principal */}
      <div className="main-content">
        {/* Header Superior */}
        <header className="main-header">
          <div className="header-content">
            <div className="header-title">
              <h2>Dashboard</h2>
              <p>Visão geral do sistema de gestão escolar</p>
            </div>
            
            <div className="header-actions">
              {/* Barra de Pesquisa */}
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="search-input"
                />
              </div>
              
              {/* Notificações */}
              <button className="notification-button">
                <Bell />
                <span className="notification-badge">3</span>
              </button>
            </div>
          </div>
        </header>

        {/* Área de Conteúdo */}
        <main className="content-area">
          {activeSection === 'dashboard' ? renderDashboard() : renderDevelopmentSection()}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;