import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import MainLayout from './layouts/MainLayout';
import Login from './vistas/Login';
import ControlPanelPlaceholder from './vistas/Controlpanel';
import Provisional from './vistas/provisional';
import Usuarios from './vistas/Usuarios/Usuarios';
import Perfiles from './vistas/Perfiles/Perfiles';
import Fototeca from './vistas/Fototeca/Fototeca';
import Catalogos from './vistas/Catalogos/Catalogos';
import Prestamos from './vistas/Prestamos/Prestamos';
import Especimenes from './vistas/Especimenes/Especimenes';
import Aprobaciones from './vistas/Aprobaciones/Aprobaciones';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  
  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Navigate to="/login" replace />} />

      <Route path="/controlpanel" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<ControlPanelPlaceholder />} />
        <Route path="usuarios" element={<Usuarios />} />
        <Route path="perfiles" element={<Perfiles />} />
        <Route path="fototeca" element={<Fototeca />} />
        <Route path="catalogos" element={<Catalogos />} />
        <Route path="especimenes" element={<Especimenes />} />
        <Route path="aprobaciones" element={<Aprobaciones />} />
        <Route path="prestamos" element={<Prestamos />} />

        <Route path="provisional" element={<Provisional />} />
        <Route path="provisional/:id" element={<Provisional />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
