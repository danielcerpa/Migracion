import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import General from './General';
import Alta from './Alta';
import Modificar from './Modificar';
import Baja from './Baja';
import type { Prestamo, ViewType } from './types';
import { useAuth, type UserPermission } from '../../context/AuthContext';
import '../../styles/Usuarios.css'; // Reusing global styles for layout

const Prestamos: React.FC = () => {
    const { permissions } = useAuth();
    const [currentView, setCurrentView] = useState<ViewType>('general');
    const [prestamos, setPrestamos] = useState<Prestamo[]>([]);
    const [selectedPrestamo, setSelectedPrestamo] = useState<Prestamo | null>(null);

    // Get permissions for THIS module
    const modulePerms = permissions.find((p: UserPermission) => p.name.toLowerCase().includes('prestamo')) || {
        key_add: 0,
        key_edit: 0,
        key_delete: 0,
        key_export: 0
    };

    useEffect(() => {
        fetchPrestamos();
    }, []);

    const fetchPrestamos = async () => {
        try {
            const response = await fetch('/api/prestamos');
            if (response.ok) {
                const data = await response.json();
                setPrestamos(data);
            } else {
                console.error('Failed to fetch prestamos');
            }
        } catch (error) {
            console.error('Error fetching prestamos:', error);
        }
    };

    const handleNavigate = (view: ViewType, prestamo?: Prestamo) => {
        if (prestamo) setSelectedPrestamo(prestamo);
        else if (view === 'alta') setSelectedPrestamo(null);
        setCurrentView(view);
    };

    const handleBaja = async (id: number) => {
        try {
            const response = await fetch(`/api/prestamos/${id}`, { method: 'DELETE' });
            if (response.ok) {
                fetchPrestamos();
                goBackToGeneral();
            } else {
                console.error('Error al eliminar el préstamo');
                alert('Error al eliminar el préstamo');
            }
        } catch (error) {
            console.error('Error de red:', error);
            alert('Error de red al eliminar el préstamo');
        }
    };

    const goBackToGeneral = () => {
        setCurrentView('general');
        setSelectedPrestamo(null);
        fetchPrestamos(); // Refresh data
    };

    const renderContent = () => {
        switch (currentView) {
            case 'general':
                return <General prestamos={prestamos} onNavigate={handleNavigate} modulePerms={modulePerms} />;
            case 'alta':
                return <Alta onBack={goBackToGeneral} onSave={goBackToGeneral} />;
            case 'modificar':
                return (
                    <Modificar
                        prestamos={prestamos}
                        prestamo={selectedPrestamo}
                        onBack={goBackToGeneral}
                        onUpdate={goBackToGeneral}
                        onSelectPrestamo={(p: Prestamo) => setSelectedPrestamo(p)}
                    />
                );
            case 'baja':
                return (
                    <Baja
                        prestamos={prestamos}
                        selectedPrestamo={selectedPrestamo}
                        onBack={goBackToGeneral}
                        onBaja={handleBaja}
                        onSelectPrestamo={(p: Prestamo) => setSelectedPrestamo(p)}
                    />
                );
            default:
                return <General prestamos={prestamos} onNavigate={handleNavigate} modulePerms={modulePerms} />;
        }
    };

    return (
        <div className="usuarios-module">
            {currentView !== 'general' && (
                <div className="module-breadcrumb">
                    <span onClick={goBackToGeneral}>Préstamos</span>
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

export default Prestamos;
