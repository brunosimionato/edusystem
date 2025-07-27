import React from 'react';
import { GraduationCap, Bell, Search } from 'lucide-react';
import './headerProf.css';

const HeaderProf = ({
  pageTitle = 'Dashboard',
  pageDescription = 'Área do professor - Gestão de turmas e atividades.',
  showNotifications = true,
  onSearch,
  searchPlaceholder = 'Buscar aluno, turma, atividade...'
}) => {
  const handleSearchChange = (e) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="unified-header-prof">
      <div className="header-left-prof">
        <div className="logo-prof">
          <div className="prof-logo-icon">
            <GraduationCap />
          </div>
          <div className="logo-text-prof">
            <h1>EduSystem</h1>
            <p>Portal do Professor</p>
          </div>
        </div>
      </div>

      <div className="header-right-prof">
        <div className="header-title-prof">
          <h2>{pageTitle}</h2>
          <p className="multiline-text-prof">
            {pageDescription}
          </p>
        </div>

        <div className="header-actions-prof">
          <div className="search-container-prof">
            <Search className="search-icon-prof" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="search-input-prof"
              onChange={handleSearchChange}
            />
          </div>

          {showNotifications && (
            <button className="notification-btn-prof" aria-label="Notificações">
              <Bell />
              <span className="notification-badge-prof"></span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderProf;