import React from 'react';
import { 
  Globe, MapPin, Building2, Trees, 
  UserRound, Leaf, Layers, LayoutGrid,
  Users, Microscope, Hash, Library, BookOpen, Layers2,Blend,LandPlot,Podcast
} from 'lucide-react';
import type { CatalogSection } from './types';

interface CatalogDashboardProps {
  onSelect: (section: CatalogSection) => void;
}

const CATEGORIES = [
  {
    title: 'Geografía',
    items: [
      { key: 'pais',      label: 'País',               icon: Globe,      color: '#3b82f6' },
      { key: 'estado',    label: 'Estado',             icon: MapPin,     color: '#10b981' },
      { key: 'municipio', label: 'Municipio',          icon: Building2,  color: '#f59e0b' },
      { key: 'localidad', label: 'Localidad',          icon: Trees,       color: '#17c500' },
    ]
  },
  {
    title: 'Taxonomía',
    items: [
      { key: 'orden',      label: 'Orden',              icon: LayoutGrid,      color: '#8b5cf6' },
      { key: 'familia',    label: 'Familia',            icon: Layers,   color: '#ec4899' },
      { key: 'subfamilia', label: 'Subfamilia',         icon: Layers2,   color: '#f43f5e' },
      { key: 'tribu',      label: 'Tribu',              icon: Blend,         color: '#06b6d4' },
      { key: 'genero',     label: 'Género',             icon: Podcast,         color: '#3b82f6' },
      { key: 'especie',    label: 'Especie',            icon: LandPlot,         color: '#10b981' },
      { key: 'tipo',       label: 'Tipo',               icon: Hash,        color: '#64748b' },
    ]
  },
  {
    title: 'Personal y Bio/Biblio',
    items: [
      { key: 'colector',     label: 'Colector',           icon: UserRound,   color: '#f97316' },
      { key: 'determinador', label: 'Determinador',       icon: Users,       color: '#a855f7' },
      { key: 'planta',       label: 'Planta',             icon: Leaf,        color: '#17c500' },
      { key: 'organismo',    label: 'Organismo',          icon: Microscope,  color: '#6366f1' },
      { key: 'coleccion',    label: 'Colección',          icon: Library,     color: '#facc15' },
      { key: 'cita',         label: 'Cita Bib.',          icon: BookOpen,    color: '#94a3b8' },
    ]
  }
];

const CatalogDashboard: React.FC<CatalogDashboardProps> = ({ onSelect }) => {
  return (
    <div className="catalog-dashboard animate-fade-in">
      <div className="dashboard-header" id="catalog-dashboard-header">
        <h1 className="dashboard-title">Panel de Control de Catálogos</h1>
      </div>

      <div className="dashboard-grid-container">
        {CATEGORIES.map((cat, idx) => (
          <div key={idx} className="dashboard-category-section">
            <h2 className="category-title">{cat.title}</h2>
            <div className="catalog-cards-grid">
              {cat.items.map((item) => {
                const Icon = item.icon;
                return (
                  <div 
                    key={item.key} 
                    className="catalog-card"
                    onClick={() => onSelect(item.key as CatalogSection)}
                  >
                    <div className="card-icon-wrapper" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                      <Icon size={24} />
                    </div>
                    <div className="card-info">
                      <span className="card-label">{item.label}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CatalogDashboard;
