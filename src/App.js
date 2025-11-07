import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Contexto de autenticação
import { AuthProvider } from './context/AuthContext';

// Login e primeiro acesso
import Login from './Login/login';
import UserRegistration from './components/UserRegistration/UserRegistration';

// Layouts
import LayoutSec from './components/Layout/LayoutSec/layoutSec';
import LayoutProf from './components/Layout/LayoutProf/layoutProf';

// Secretaria
import Secretaria from './Secretaria/InicioSec/secretaria';
import CadastroAluno from './Secretaria/CriarAluno/cadastroAluno';
import ListaAluno from './Secretaria/ListaAluno/listaAluno';
import CriarProfe from './Secretaria/CriarProfe/criarProfe';
import ListaProfe from './Secretaria/ListaProfe/listaProfe';
import CriarTurma from './Secretaria/CriarTurma/criarTurma';
import Horarios from './Secretaria/Horario/horario';
import Faltas from './Secretaria/Faltas/faltas';
import Notas from './Secretaria/Notas/notas';
import Usuarios from './Secretaria/Usuarios/usuarios';

// Professor
import Professor from './Professor/InicioProf/prof';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Login / Primeiro Acesso */}
          <Route path="/" element={<Login />} />
          <Route path="/primeiro-acesso" element={<UserRegistration />} />

          {/* Rotas da Secretaria */}
          <Route path="/secretaria" element={<LayoutSec />}>
            <Route path="dashboard" element={<Secretaria />} />
            <Route path="cadastrar-aluno" element={<CadastroAluno />} />
            <Route path="lista-aluno" element={<ListaAluno />} />
            <Route path="cadastrar-professor" element={<CriarProfe />} />
            <Route path="lista-profe" element={<ListaProfe />} />
            <Route path="criar-turma" element={<CriarTurma />} />
            <Route path="horarios" element={<Horarios />} />
            <Route path="faltas" element={<Faltas />} />
            <Route path="notas" element={<Notas />} />
            <Route path="usuarios" element={<Usuarios />} />
          </Route>

          {/* Rotas do Professor */}
          <Route path="/professor" element={<LayoutProf />}>
            <Route path="dashboard" element={<Professor />} />
          </Route>
        </Routes>
      </BrowserRouter>

    </AuthProvider>
  );
}

export default App;
