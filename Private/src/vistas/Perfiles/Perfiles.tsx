import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import General from './General';
import Alta from './Alta';
import Modificar from './Modificar';
import Baja from './Baja';
import type { Perfil, ViewType, PartialPerfil } from './types';
import { useAuth, type UserPermission } from '../../context/AuthContext';
import '../../styles/Perfiles.css';

const Perfiles: React.FC = () => {
  const { permissions } = useAuth();
  const [currentView, setCurrentView] = useState<ViewType>('general');
  const [profiles, setProfiles] = useState<Perfil[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<Perfil | null>(null);

  // Get permissions for THIS module
  const modulePerms = permissions.find((p: UserPermission) => p.name.toLowerCase().includes('perfil')) || {
    key_add: 0,
    key_edit: 0,
    key_delete: 0,
    key_export: 0
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  const fetchProfiles = async () => {
    try {
      const response = await fetch('/api/profiles');
      if (response.ok) {
        const data = await response.json();
        setProfiles(data);
      } else {
        console.error('Failed to fetch profiles');
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleNavigate = (view: ViewType, profile?: Perfil) => {
    if (profile) setSelectedProfile(profile);
    else if (view === 'alta') setSelectedProfile(null);
    setCurrentView(view);
  };

  const handleSave = async (profileData: PartialPerfil) => {
    try {
      const response = await fetch('/api/profiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        await fetchProfiles();
        goBackToGeneral();
      } else {
        alert('Error al guardar el perfil');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  const handleUpdate = async (profileId: number, profileData: Partial<Perfil>) => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profileData),
      });

      if (response.ok) {
        await fetchProfiles();
        goBackToGeneral();
      } else {
        alert('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleDelete = async (profileId: number) => {
    try {
      const response = await fetch(`/api/profiles/${profileId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchProfiles();
        goBackToGeneral();
      } else {
        alert('Error al eliminar el perfil');
      }
    } catch (error) {
      console.error('Error deleting profile:', error);
    }
  };

  const goBackToGeneral = () => {
    setCurrentView('general');
    setSelectedProfile(null);
  };

  const renderContent = () => {
    switch (currentView) {
      case 'general':
        return <General profiles={profiles} onNavigate={handleNavigate} modulePerms={modulePerms} />;
      case 'alta':
        return <Alta onBack={goBackToGeneral} onSave={handleSave} />;
      case 'modificar':
        return (
          <Modificar 
            profiles={profiles} 
            profile={selectedProfile} 
            onBack={goBackToGeneral} 
            onUpdate={handleUpdate}
            onSelectProfile={(p) => setSelectedProfile(p)}
          />
        );
      case 'baja':
        return <Baja profiles={profiles} profile={selectedProfile} onSelectProfile={(p) => setSelectedProfile(p)} onBack={goBackToGeneral} onDelete={handleDelete} />;
      default:
        return <General profiles={profiles} onNavigate={handleNavigate} modulePerms={modulePerms} />;
    }
  };

  return (
    <div className="usuarios-module perfiles-module">
      {currentView !== 'general' && (
        <div className="module-breadcrumb">
          <span onClick={goBackToGeneral}>Perfiles</span>
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

export default Perfiles;
