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
        { id: 'lessons-materials', label: 'Materiais' },
        { id: 'lessons-content', label: 'Conteúdo Programático' },
        { id: 'lessons-resources', label: 'Recursos Didáticos' }
      ]
    },
    {
      id: 'assessments',
      label: 'Avaliações',
      icon: ClipboardList,
      submenu: [
        { id: 'assessments-create', label: 'Criar Avaliação' },
        { id: 'assessments-grades', label: 'Lançar Notas' },
        { id: 'assessments-results', label: 'Resultados' },
        { id: 'assessments-recovery', label: 'Recuperação' }
      ]
    },
    {
      id: 'attendance',
      label: 'Frequência',
      icon: CheckCircle,
      submenu: [
        { id: 'attendance-daily', label: 'Chamada Diária' },
        { id: 'attendance-reports', label: 'Relatórios' },
        { id: 'attendance-absences', label: 'Faltas' }
      ]
    },
    {
      id: 'reports',
      label: 'Relatórios',
      icon: BarChart3,
      submenu: [
        { id: 'reports-performance', label: 'Desempenho da Turma' },
        { id: 'reports-individual', label: 'Individual do Aluno' },
        { id: 'reports-attendance', label: 'Frequência' },
        { id: 'reports-grades', label: 'Notas' }
      ]
    },
    {
      id: 'communication',
      label: 'Comunicação',
      icon: MessageCircle,
      submenu: [
        { id: 'communication-parents', label: 'Pais/Responsáveis' },
        { id: 'communication-coordination', label: 'Coordenação' },
        { id: 'communication-announcements', label: 'Comunicados' }
      ]
    },
    {
      id: 'calendar',
      label: 'Calendário',
      icon: Calendar,
      submenu: [
        { id: 'calendar-schedule', label: 'Minha Agenda' },
        { id: 'calendar-academic', label: 'Calendário Acadêmico' },
        { id: 'calendar-events', label: 'Eventos' }
      ]
    },
    {
      id: 'profile',
      label: 'Meu Perfil',
      icon: Settings,
      submenu: [
        { id: 'profile-info', label: 'Informações Pessoais' },
        { id: 'profile-subjects', label: 'Minhas Disciplinas' },
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
      time: '07:30',
      subject: 'Matemática',
      class: '8º A',
      room: 'Sala 15',
      status: 'completed'
    },
    {
      time: '08:20',
      subject: 'Matemática',
      class: '9º B',
      room: 'Sala 12',
      status: 'completed'
    },
    {
      time: '09:30',
      subject: 'Álgebra',
      class: '1º EM A',
      room: 'Sala 8',
      status: 'current'
    },
    {
      time: '14:00',
      subject: 'Geometria',
      class: '2º EM C',
      room: 'Sala 10',
      status: 'upcoming'
    }
  ];

  const recentActivities = [
    { 
      action: 'Notas lançadas', 
      description: 'Prova de Matemática - 8º A', 
      time: '30 min atrás' 
    },
    { 
      action: 'Chamada realizada', 
      description: '9º B - 4ª aula', 
      time: '1 hora atrás' 
    },
    { 
      action: 'Material enviado', 
      description: 'Lista de exercícios - 1º EM A', 
      time: '2 horas atrás' 
    },
    { 
      action: 'Plano de aula criado', 
      description: 'Função Quadrática - 2º EM', 
      time: '1 dia atrás' 
    }
  ];

  const upcomingTasks = [
    {
      priority: 'high',
      task: 'Correção de Provas',
      description: '8º A e 9º B - Matemática',
      deadline: 'Hoje, 18:00'
    },
    {
      priority: 'medium',
      task: 'Conselho de Classe',
      description: 'Reunião do 3º Bimestre',
      deadline: 'Amanhã, 14:00'
    },
    {
      priority: 'low',
      task: 'Relatório Mensal',
      description: 'Desempenho das turmas',
      deadline: '30/11/2024'
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

      {/* Upcoming Tasks */}
      <div className="section-card">
        <div className="section-header">
          <h3 className="section-title">Próximas Tarefas</h3>
        </div>
        <div className="tasks-list">
          {upcomingTasks.map((task, index) => (
            <div key={index} className={`task-item priority-${task.priority}`}>
              <div className="task-priority">
                <div className={`priority-indicator ${task.priority}`}></div>
              </div>
              <div className="task-content">
                <div className="task-title">{task.task}</div>
                <div className="task-description">{task.description}</div>
              </div>
              <div className="task-deadline">{task.deadline}</div>
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