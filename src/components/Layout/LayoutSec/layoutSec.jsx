import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import HeaderSec from '../../Header/HeaderSec/headerSec';
import SideBarSec from '../../SideBar/SideBarSec/sideBarSec';
import './layoutSec.css';

const LayoutSec = () => {
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [pageDescription, setPageDescription] = useState(' ');
  const location = useLocation();

  // Mapeie os títulos conforme as rotas reais que você usa
  const titulosPorRota = {
    '/secretaria/dashboard': 'Dashboard',
    '/secretaria/cadastrar-aluno': 'Cadastro de Aluno',
    '/secretaria/alunos/lista': 'Lista de Alunos',
    '/secretaria/professores/lista': 'Lista de Professores',
    '/secretaria/professores/cadastro': 'Cadastro de Professores',
    '/secretaria/criar-turma': 'Criar Turma',
    '/secretaria/turmas/lista': 'Lista de Turmas',
    '/secretaria/disciplinas/lista': 'Lista de Disciplinas',
    '/secretaria/disciplinas/cadastro': 'Cadastro de Disciplinas',
    '/secretaria/documentos/declaracoes': 'Declarações',
    '/secretaria/documentos/historico': 'Histórico Escolar',
    '/secretaria/documentos/boletins': 'Boletins',
    '/secretaria/avaliacoes/provas': 'Provas',
    '/secretaria/avaliacoes/notas': 'Notas',
    '/secretaria/configuracoes/usuarios': 'Usuários',
    '/secretaria/configuracoes/sistema': 'Configurações do Sistema',
    // Adicione outras rotas conforme necessidade
  };

  useEffect(() => {
    // Busca a primeira rota que casa com o início do pathname atual
    const rotaEncontrada = Object.keys(titulosPorRota).find((rota) =>
      location.pathname.startsWith(rota)
    );
    const novoTitulo = rotaEncontrada ? titulosPorRota[rotaEncontrada] : 'EduSystem';
    setPageTitle(novoTitulo);
  }, [location]);

  return (
    <div className="dashboard-container">
      <HeaderSec pageTitle={pageTitle} pageDescription={pageDescription} />
      <SideBarSec setPageTitle={setPageTitle} />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default LayoutSec;
