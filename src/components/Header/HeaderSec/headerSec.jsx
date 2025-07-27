import React from 'react';
import { School, Bell, Search } from 'lucide-react';
import './headerSec.css';

const HeaderSec = ({ 
  pageTitle = 'Dashboard', 
  pageDescription = 'Visão geral do sistema de gestão escolar.',
  showNotifications = true,
  onSearch,
  searchPlaceholder = 'Buscar aluno, turma...'
}) => {
  const handleSearchChange = (e) => {
    if (onSearch) {
      onSearch(e.target.value);
    }
  };

  return (
    <header className="unified-header">
      <div className="header-left">
        <div className="logo">
          <div className="sec-logo-icon">
            <School />
          </div>
          <div className="logo-text">
            <h1>EduSystem</h1>
            <p>Gestão Escolar</p>
          </div>
        </div>
      </div>

      <div className="header-right">
        <div className="header-title">
          <h2>{pageTitle}</h2>
          <p className="multiline-text">
            {pageDescription}
          </p>
        </div>

        <div className="header-actions">
          <div className="search-container">
            <Search className="search-icon" />
            <input
              type="text"
              placeholder={searchPlaceholder}
              className="search-input"
              onChange={handleSearchChange}
            />
          </div>
          
          {showNotifications && (
            <button className="notification-btn" aria-label="Notificações">
              <Bell />
              <span className="notification-badge"></span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default HeaderSec;