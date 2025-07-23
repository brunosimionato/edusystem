import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import LoginForm from './Login/login'; // ajuste para o caminho correto
import Secretaria from './InicioSec/secretaria'; // ajuste para o caminho correto
import Professor from './InicioProf/prof'; // ajuste para o caminho correto

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LoginForm />} />
        <Route path="/inicioSec/secretaria" element={<Secretaria />} />
        <Route path="/inicioProf/professor" element={<Professor />} /> {/* corrigido aqui */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
