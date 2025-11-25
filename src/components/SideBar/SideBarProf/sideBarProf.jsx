import React, { useState } from 'react';
import {
  Users,
  GraduationCap,
  Home,
  LogOut,
  ChevronDown,
  ClipboardList,
  CheckCircle,
} from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import './sideBarProf.css';
import { useAuth } from '../../../context/AuthContext';

const SideBarProf = () => {
  const { logout } = useAuth();

  const [expandedMenus, setExpandedMenus] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const toggleMenu = (menuKey) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuKey]: !prev[menuKey],
    }));
  };

  // Helper: retorna o caminho completo de um item de menu
  const getPathForMenuItem = (item, parentId = null) => {
    if (item.path) return item.path;
    if (parentId) return `/professor/${parentId}/${item.id}`;
    return `/professor/${item.id}`;
  };

  // Verifica se o item de menu está ativo
  const isItemActive = (item, parentId = null) => {
    const targetPath = getPathForMenuItem(item, parentId);
    return location.pathname.startsWith(targetPath);
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      path: '/professor/dashboard',
    },
    {
      id: 'classes',
      label: 'Minhas Turmas',
      icon: Users,
      submenu: [
        { id: 'classes-list', label: 'Lista de Turmas', path: '/professor/lista-turma' },
        { id: 'classes-schedule', label: 'Horários', path: '/professor/horario-profe' },
      ],
    },
    {
      id: 'assessments',
      label: 'Notas',
      icon: ClipboardList,
      submenu: [
        { id: 'assessments-create', label: 'Notas', path: '/professor/notas-profe' },
      ],
    },
    {
      id: 'attendance',
      label: 'Frequência',
      icon: CheckCircle,
      submenu: [
        { id: 'attendance-daily', label: 'Faltas', path: '/professor/faltas-prof' },
      ],
    },
  ];

  const handleMenuClick = (item) => {
    if (item.submenu) {
      toggleMenu(item.id);
    } else if (item.path) {
      navigate(item.path);
    }
  };

  const handleSubmenuClick = (parentId, submenuItem) => {
    const targetPath = getPathForMenuItem(submenuItem, parentId);
    navigate(targetPath);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="sidebar-prof" id="professor-sidebar">
      {/* Perfil do Usuário */}
      <div className="user-profile-prof" id="prof-user-profile">
        <div className="user-avatar-prof" id="prof-avatar">
          <GraduationCap />
        </div>
        <div className="user-info-prof" id="prof-user-info">
          <h3 className="prof-name">João Santos</h3>
          <p className="prof-role">Professor(a)</p>
        </div>
      </div>

      {/* Navegação */}
      <nav className="navigation-prof" id="prof-navigation">
        <ul className="nav-menu-prof" id="prof-nav-menu">
          {menuItems.map((item) => (
            <li key={item.id} className="nav-item-prof">
              <button
                className={`nav-button-prof ${
                  isItemActive(item) ? 'active-prof' : ''
                }`}
                onClick={() => handleMenuClick(item)}
                id={`prof-nav-${item.id}`}
              >
                <div className="nav-button-content-prof">
                  <item.icon />
                  <span className="nav-label-prof">{item.label}</span>
                </div>
                {item.submenu && (
                  <ChevronDown
                    className={`nav-chevron-prof ${
                      expandedMenus[item.id] ? 'expanded-prof' : ''
                    }`}
                  />
                )}
              </button>

              {item.submenu && (
                <ul
                  className={`submenu-prof ${
                    expandedMenus[item.id] ? 'expanded-prof' : ''
                  }`}
                  id={`prof-submenu-${item.id}`}
                >
                  {item.submenu.map((subItem) => (
                    <li key={subItem.id} className="submenu-item-prof">
                      <button
                        className={`submenu-button-prof ${
                          isItemActive(subItem, item.id) ? 'active-prof' : ''
                        }`}
                        onClick={() => handleSubmenuClick(item.id, subItem)}
                        id={`prof-submenu-${subItem.id}`}
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
      <div className="sidebar-footer-prof" id="prof-sidebar-footer">
        <button
          className="logout-button-prof"
          onClick={handleLogout}
          id="prof-logout-btn"
        >
          <LogOut />
          Sair
        </button>
      </div>
    </aside>
  );
};

export default SideBarProf;
