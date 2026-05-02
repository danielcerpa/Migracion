import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import General from './General';
import Alta from './Alta';
import Modificar from './Modificar';
import Baja from './Baja';
import { createUser, updateUser, deleteUser } from '../../services/api';
import type { Usuario, ViewType } from './types';
import { useAuth, type UserPermission } from '../../context/AuthContext';
import '../../styles/Usuarios.css';

const Usuarios: React.FC = () => {
  const { permissions } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('general');
  const [users, setUsers] = useState<Usuario[]>([]);
  const [selectedUser, setSelectedUser] = useState<Usuario | null>(null);

  // Get permissions for THIS module
  const modulePerms = permissions.find((p: UserPermission) => p.name.toLowerCase().includes('usuario')) || {
    key_add: 0,
    key_edit: 0,
    key_delete: 0,
    key_export: 0
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        console.error('Failed to fetch users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleNavigate = (view: ViewType, user?: Usuario) => {
    if (user) setSelectedUser(user);
    else if (view === 'alta') setSelectedUser(null);
    setCurrentView(view);
  };

  const handleAltaAction = async (data: any) => {
    try {
      await createUser(data);
      fetchUsers();
      goBackToGeneral();
    } catch (err) {
      console.error('Error creating user', err);
      alert('Error creando el usuario');
    }
  };

  const handleUpdateAction = async (id: number, data: any) => {
    try {
      await updateUser(id, data);
      fetchUsers();
      goBackToGeneral();
    } catch (err) {
      console.error('Error updating user', err);
      alert('Error actualizando el usuario');
    }
  };

  const handleBajaAction = async (userId: number) => {
    try {
      await deleteUser(userId);
      fetchUsers();
      goBackToGeneral();
    } catch (err) {
      console.error('Error deleting user', err);
      alert('Error dando de baja el usuario');
    }
  };

  const goBackToGeneral = () => {
    setCurrentView('general');
    setSelectedUser(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'general':
        return <General users={users} onNavigate={handleNavigate} modulePerms={modulePerms} />;
      case 'alta':
        return <Alta onBack={goBackToGeneral} onSave={handleAltaAction} />;
      case 'modificar':
        return (
          <Modificar 
            users={users} 
            user={selectedUser} 
            onBack={goBackToGeneral} 
            onUpdate={handleUpdateAction}
            onSelectUser={(u) => setSelectedUser(u)}
          />
        );
      case 'baja':
        return <Baja users={users} selectedUser={selectedUser} onBack={goBackToGeneral} onBaja={handleBajaAction} onSelectUser={(u) => setSelectedUser(u)} />;
      default:
        return <General users={users} onNavigate={handleNavigate} modulePerms={modulePerms} />;
    }
  };

  return (
    <div className="usuarios-module">
      {currentView !== 'general' && (
        <div className="module-breadcrumb">
          <span onClick={goBackToGeneral}>Usuarios</span>
          <ChevronRight size={14} />
          <span className="current-crumb">
            {currentView === 'modificar' ? 'Actualizar' : currentView.charAt(0).toUpperCase() + currentView.slice(1)}
          </span>
        </div>
      )}
      
      <div className="module-screen">
        {renderContent()}
      </div>
    </div>
  );
};

export default Usuarios;
