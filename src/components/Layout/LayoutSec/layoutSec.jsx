// Seu arquivo: src/components/Layout/LayoutSec.jsx
import React from 'react';
import { Outlet } from 'react-router-dom'; // <--- IMPORTANTE: Mantenha esta importação
import HeaderSec from '../../Header/HeaderSec/headerSec'; // Verifique o caminho
import SideBarSec from '../../SideBar/SideBarSec/sideBarSec'; // Verifique o caminho
import './layoutSec.css';

const LayoutSec = () => { // <--- Não precisa de '{ children }' aqui
  return (
    <div className="dashboard-container">
      <HeaderSec />
      <SideBarSec />
      <main className="main-content">
        <Outlet />  {/* <--- IMPORTANTE: Mantenha o <Outlet /> aqui */}
      </main>
    </div>
  );
};
export default LayoutSec;
