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
  ClipboardList,
  Bell,
  Search,
  LogOut,
  ChevronDown,
  Plus,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  BookOpenCheck,
  PresentationChart,
  MessageCircle,
  Award,
  Folder,
  Upload
} from 'lucide-react';

const ProfessorDashboard = () => {
  const [activeSection, setActiveSection] = useState('dashboard');
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
      id: 'classes',
      label: 'Minhas Turmas',
      icon: Users,
      submenu: [
        { id: 'classes-list', label: 'Lista de Turmas' },
        { id: 'classes-students', label: 'Alunos' },
        { id: 'classes-schedule', label: 'Horários' },
        { id: 'classes-attendance', label: 'Chamada' }
      ]
    },
    {
      id: 'lessons',
      label: 'Aulas',
      icon: BookOpen,
      submenu: [
        { id: 'lessons-plan', label: 'Plano de Aula' },
        { id: 'lessons-content', label: 'Conteúdo Programático' },
      ]
    },
    {
      id: 'assessments',
      label: 'Avaliações',
      icon: ClipboardList,
      submenu: [
        { id: 'assessments-create', label: 'Criar Avaliação' },
        { id: 'assessments-grades', label: 'Lançar Notas' },
      ]
    },
    {
      id: 'attendance',
      label: 'Frequência',
      icon: CheckCircle,
      submenu: [
        { id: 'attendance-daily', label: 'Chamada' },
      ]
    },
    {
      id: 'profile',
      label: 'Meu Perfil',
      icon: Settings,
      submenu: [
        { id: 'profile-info', label: 'Informações Pessoais' },
        { id: 'profile-schedule', label: 'Horário de Trabalho' }
      ]
    }
  ];

  const dashboardStats = [
    { label: 'Turmas Ativas', value: '6', icon: Users, color: 'blue' },
    { label: 'Total de Alunos', value: '184', icon: GraduationCap, color: 'green' },
    { label: 'Aulas Hoje', value: '4', icon: Clock, color: 'purple' },
    { label: 'Avaliações Pendentes', value: '12', icon: ClipboardList, color: 'orange' }
  ];

  const todaySchedule = [
    {
      time: '07:30 - 08:20',
      subject: 'Matemática',
      class: '8º A',
    },
    {
      time: '08:20 - 09:10',
      subject: 'Matemática',
      class: '8º A',
    },
    {
      time: '09:30-10:20',
      subject: 'Matemática',
      class: '9º B',
    },
    {
      time: '14:00',
      subject: 'Matemática',
      class: '7º C',
    }
  ];

  const quickActions = [
    {
      icon: CheckCircle,
      text: 'Fazer Chamada',
      color: 'blue',
      onClick: () => setActiveSection('attendance-daily')
    },
    {
      icon: Plus,
      text: 'Lançar Notas',
      color: 'green',
      onClick: () => setActiveSection('assessments-grades')
    },
    {
      icon: BookOpenCheck,
      text: 'Plano de Aula',
      color: 'purple',
      onClick: () => setActiveSection('lessons-plan')
    },
    {
      icon: Upload,
      text: 'Enviar Material',
      color: 'orange',
      onClick: () => setActiveSection('lessons-materials')
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

      {/* Today's Schedule */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Horário de Hoje</h3>
          <a href="#" className="section-link">Ver agenda completa</a>
        </div>
        <div className="schedule-list">
          {todaySchedule.map((item, index) => (
            <div key={index} className={`schedule-item ${item.status}`}>
              <div className="schedule-time">{item.time}</div>
              <div className="schedule-content">
                <div className="schedule-subject">{item.subject}</div>
                <div className="schedule-class">{item.class} - {item.room}</div>
              </div>
              <div className="schedule-status">
                {item.status === 'completed' && <CheckCircle className="status-completed" />}
                {item.status === 'current' && <Clock className="status-current" />}
                {item.status === 'upcoming' && <AlertCircle className="status-upcoming" />}
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
              <GraduationCap />
            </div>
            <div className="logo-text">
              <h1>EscolaSystem</h1>
              <p>Portal do Professor</p>
            </div>
          </div>
        </div>

        {/* Perfil do Usuário */}
        <div className="user-profile">
          <div className="user-avatar">MS</div>
          <div className="user-info">
            <h3>Maria Santos</h3>
            <p>Professora</p>
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
              <h2>Dashboard do Professor</h2>
              <p>Bem-vinda de volta, Maria! Aqui está o resumo das suas atividades.</p>
            </div>
            
            <div className="header-actions">
              {/* Barra de Pesquisa */}
              <div className="search-container">
                <Search className="search-icon" />
                <input
                  type="text"
                  placeholder="Buscar aluno, turma..."
                  className="search-input"
                />
              </div>
              
              {/* Notificações */}
              <button className="notification-button">
                <Bell />
                <span className="notification-badge">5</span>
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
      
      export default ProfessorDashboard;