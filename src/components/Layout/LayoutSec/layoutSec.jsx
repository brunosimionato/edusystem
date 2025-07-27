import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderSec from '../../Header/HeaderSec/headerSec';
import SideBarSec from '../../SideBar/SideBarSec/sideBarSec';
import './layoutSec.css';

const LayoutSec = () => {
  return (
    <div className="dashboard-container">
      <HeaderSec />
      <SideBarSec />
      <main className="main-content">
        <div className="content-area">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LayoutSec;
