import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderSec from '../../Header/HeaderSec/headerSec';
import SideBarSec from '../../SideBar/SideBarSec/sideBarSec';
import './layoutSec.css';

const titulosPorRota = {
  '/secretaria/dashboard': 'Dashboard',
  '/secretaria/cadastrar-aluno': 'Cadastro de Aluno',
  '/secretaria/lista-aluno': 'Lista de Alunos',
  '/secretaria/cadastrar-professor': 'Cadastro de Professores',
  '/secretaria/lista-profe': 'Lista de Professores',
  '/secretaria/criar-turma': 'Cadastrar Turma',
  '/secretaria/horario': 'Horários',
  '/secretaria/notas': 'Notas',
  '/secretaria/faltas': 'Faltas',
  '/secretaria/usuarios': 'Gestão de Usuários',
};

const LayoutSec = () => {
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const location = useLocation();

  useEffect(() => {
    const rotaEncontrada = Object.keys(titulosPorRota).find((rota) =>
      location.pathname.startsWith(rota)
    );
    const novoTitulo = rotaEncontrada ? titulosPorRota[rotaEncontrada] : 'EduSystem';
    setPageTitle(novoTitulo);
  }, [location]);

  return (
    <div className="dashboard-container">
      <HeaderSec pageTitle={pageTitle} />
      <SideBarSec setPageTitle={setPageTitle} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutSec;
