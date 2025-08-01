import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from './Login/login';
// Layouts
import LayoutSec from './components/Layout/LayoutSec/layoutSec';
import LayoutProf from './components/Layout/LayoutProf/layoutProf';
// Secretaria
import Secretaria from './Secretaria/InicioSec/secretaria';
import CadastroAluno from './Secretaria/CadAluno/cadastroAluno';
// Professor
import Professor from './Professor/InicioProf/prof';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />

        {/* Rotas da Secretaria */}
        <Route path="/secretaria" element={<LayoutSec />}>
          <Route index element={<Secretaria />} /> {/* Adicionado: Rota padrão para /secretaria */}
          <Route path="dashboard" element={<Secretaria />} />
          <Route path="cadastrar-aluno" element={<CadastroAluno />} />
        </Route>

        {/* Rotas do Professor */}
        <Route path="/professor" element={<LayoutProf />}>
          <Route index element={<Professor />} /> {/* Adicionado: Rota padrão para /professor */}
          <Route path="dashboard" element={<Professor />} />
          {/* Adicione mais rotas do professor aqui */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
