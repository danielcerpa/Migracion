import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const MainLayout: React.FC = () => {
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-container">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
