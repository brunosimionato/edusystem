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

  // Helper para obter o caminho completo de um item de menu
  const getPathForMenuItem = (item, parentId = null) => {
    if (item.path) {
      return item.path; // Se o item já tem um path explícito, use-o
    }
    if (parentId) {
      // Para submenus sem path explícito, construa o path com base no pai e no ID
      return `/secretaria/${parentId}/${item.id}`;
    }
    // Para itens de menu principais sem submenu e sem path explícito, use o ID
    return `/secretaria/${item.id}`;
  };

  // Função para verificar se um item de menu está ativo
  const isItemActive = (item, parentId = null) => {
    const targetPath = getPathForMenuItem(item, parentId);
    // Verifica se o caminho atual começa com o caminho do item (para sub-rotas)
    return location.pathname.startsWith(targetPath);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/secretaria/dashboard' // Adicione o prefixo /secretaria/ aqui
    },
    {
      id: 'students',
      label: 'Alunos',
      icon: Users,
      submenu: [
        { id: 'students-list', label: 'Lista de Alunos', path: '/secretaria/alunos/lista' }, // Exemplo de path para lista
        { id: 'students-add', label: 'Cadastrar Aluno', path: '/secretaria/cadastrar-aluno'}, // Este path será usado
      ]
    },
    {
      id: 'teachers',
      label: 'Professores',
      icon: GraduationCap,
      submenu: [
        { id: 'teachers-list', label: 'Lista de Professores', path: '/secretaria/professores/lista' },
        { id: 'teachers-add', label: 'Cadastrar Professor', path: '/secretaria/professores/cadastro' },
        { id: 'teachers-schedule', label: 'Horários', path: '/secretaria/professores/horarios' },
      ]
    },
    {
      id: 'classes',
      label: 'Turmas',
      icon: School,
      submenu: [
        { id: 'classes-list', label: 'Lista de Turmas', path: '/secretaria/turmas/lista' },
        { id: 'classes-add', label: 'Criar Turma', path: '/secretaria/turmas/criar' },
        { id: 'classes-schedule', label: 'Grade Horária', path: '/secretaria/turmas/grade' },
      ]
    },
    {
      id: 'subjects',
      label: 'Disciplinas',
      icon: BookOpen,
      submenu: [
        { id: 'subjects-list', label: 'Lista de Disciplinas', path: '/secretaria/disciplinas/lista' },
        { id: 'subjects-add', label: 'Cadastrar Disciplina', path: '/secretaria/disciplinas/cadastro' },
      ]
    },
    {
      id: 'documents',
      label: 'Documentos',
      icon: FileText,
      submenu: [
        { id: 'documents-declarations', label: 'Declarações', path: '/secretaria/documentos/declaracoes' },
        { id: 'documents-transcripts', label: 'Histórico Escolar', path: '/secretaria/documentos/historico' },
        { id: 'reports-grades', label: 'Boletins', path: '/secretaria/documentos/boletins' }
      ]
    },
    {
      id: 'assessments',
      label: 'Avaliações',
      icon: ClipboardList,
      submenu: [
        { id: 'assessments-exams', label: 'Provas', path: '/secretaria/avaliacoes/provas' },
        { id: 'assessments-grades', label: 'Notas', path: '/secretaria/avaliacoes/notas' },
      ]
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: Settings,
      submenu: [
        { id: 'settings-users', label: 'Usuários', path: '/secretaria/configuracoes/usuarios' },
        { id: 'settings-system', label: 'Sistema', path: '/secretaria/configuracoes/sistema' }
      ]
    }
  ];

  // Função para lidar com o clique nos itens de menu principais
  const handleMenuClick = (item) => {
    if (item.submenu) {
      toggleMenu(item.id);
    } else if (item.path) {
      navigate(item.path); // Navega diretamente para o path definido
    }
  };

  // Função para lidar com o clique nos itens de submenu
  const handleSubmenuClick = (parentId, submenuItem) => {
    // Usa o path definido no submenuItem, ou constrói um path padrão
    const targetPath = getPathForMenuItem(submenuItem, parentId);
    navigate(targetPath);
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
                className={`nav-button ${isItemActive(item) ? 'active' : ''}`}
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
                        className={`submenu-button ${isItemActive(subItem, item.id) ? 'active' : ''}`}
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
