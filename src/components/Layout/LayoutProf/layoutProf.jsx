import React from 'react';
import { Outlet } from 'react-router-dom';
import HeaderProf from '../../Header/HeaderProf/headerProf';
import SideBarProf from '../../SideBar/SideBarProf/sideBarProf';
import './layoutProf.css';

const LayoutProf = () => {
  return (
    <div className="dashboard-container-prof">
      <HeaderProf />
      <SideBarProf />
      <main className="main-content-prof">
        <div className="content-area-prof">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default LayoutProf;
