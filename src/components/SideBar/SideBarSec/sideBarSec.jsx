import React, { useState } from 'react';
import {
  Users, GraduationCap, BookOpen, Calendar, FileText, BarChart3,
  Settings, Home, School, LogOut, ChevronDown, User, ClipboardList
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './sideBarSec.css';

const SideBarSec = () => {
  const [expandedMenus, setExpandedMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

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
      ]
    },
    {
      id: 'subjects',
      label: 'Disciplinas',
      icon: BookOpen,
      submenu: [
        { id: 'subjects-list', label: 'Lista de Disciplinas' },
        { id: 'subjects-add', label: 'Cadastrar Disciplina' },
      ]
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: FileText,
      submenu: [
        { id: 'documents-declarations', label: 'Declarações' },
        { id: 'documents-transcripts', label: 'Histórico Escolar' },
        { id: 'reports-grades', label: 'Boletins' }
      ]
    },
    {
      id: 'assessments',
      label: 'Avaliações',
      icon: ClipboardList,
      submenu: [
        { id: 'assessments-exams', label: 'Provas' },
        { id: 'assessments-grades', label: 'Notas' },
      ]
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      submenu: [
        { id: 'settings-users', label: 'Usuários' },
        { id: 'settings-system', label: 'Sistema' }
      ]
    }
  ];

  const isActive = (path) => location.pathname.includes(path);

  const handleMenuClick = (item) => {
    if (item.submenu) {
      toggleMenu(item.id);
    } else if (item.path) {
      navigate(`/secretaria/${item.path}`);
    }
  };

  const handleSubmenuClick = (parentId, submenuItem) => {
    navigate(`/secretaria/${parentId}/${submenuItem.id}`);
  };

  return (
    <aside className="sidebar">
      {/* Perfil do Usuário */}
      <div className="user-profile">
        <div className="user-avatar">
          <User />
        </div>
        <div className="user-info">
          <h3>Maria Silva</h3>
          <p>Secretário(a)</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="navigation">
        <ul className="nav-menu">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item">
              <button
                className={`nav-button ${isActive(item.path || item.id) ? 'active' : ''}`}
                onClick={() => handleMenuClick(item)}
              >
                <div className="nav-button-content">
                  <item.icon />
                  <span>{item.label}</span>
                </div>
                {item.submenu && (
                  <ChevronDown 
                    className={`nav-chevron ${expandedMenus[item.id] ? 'expanded' : ''}`}
                  />
                )}
              </button>

              {item.submenu && (
                <ul className={`submenu ${expandedMenus[item.id] ? 'expanded' : ''}`}>
                  {item.submenu.map((subItem) => (
                    <li key={subItem.id} className="submenu-item">
                      <button
                        className={`submenu-button ${isActive(subItem.id) ? 'active' : ''}`}
                        onClick={() => handleSubmenuClick(item.id, subItem)}
                      >
                        {subItem.label}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer da Sidebar */}
      <div className="sidebar-footer">
        <button className="logout-button" onClick={() => navigate('/')}>
          <LogOut />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default SideBarSec;
