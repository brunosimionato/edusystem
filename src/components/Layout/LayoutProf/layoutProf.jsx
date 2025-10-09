import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderProf from '../../Header/HeaderProf/headerProf';
import SideBarProf from '../../SideBar/SideBarProf/sideBarProf';
import './layoutProf.css';

// Mapeamento das rotas e títulos exibidos no cabeçalho
const titulosPorRota = {
  '/professor/dashboard': 'Dashboard',
  '/professor/lista-turma': 'Lista de Turmas',
  '/professor/horario-profe': 'Horários',
    '/professor/notas': 'Notas',
  '/professor/conteudos': 'Conteúdos',
  '/professor/avaliacoes': 'Avaliações',
  '/professor/perfil': 'Meu Perfil',
};

const LayoutProf = () => {
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const location = useLocation();

  useEffect(() => {
    // Encontra a rota correspondente ao pathname atual
    const rotaEncontrada = Object.keys(titulosPorRota).find((rota) =>
      location.pathname.startsWith(rota)
    );
    const novoTitulo = rotaEncontrada ? titulosPorRota[rotaEncontrada] : 'EduSystem';
    setPageTitle(novoTitulo);
  }, [location]);

  return (
    <div className="dashboard-container-prof">
      <HeaderProf pageTitle={pageTitle} />
      <SideBarProf setPageTitle={setPageTitle} />
      <main className="main-content-prof">
          <Outlet />
      </main>
    </div>
  );
};

export default LayoutProf;