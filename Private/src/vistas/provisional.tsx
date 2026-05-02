import React from 'react';
import { Construction } from 'lucide-react';
import '../styles/provisional.css';

const Provisional: React.FC = () => {
  return (
    <div className="provisional-wrapper">
      <h2 className="provisional-title">Módulo en construcción</h2>
      <Construction className="provisional-icon" size={64} />
      <p className="provisional-desc">
        Esperamos que pronto esté listo.
      </p>
    </div>
  );
};

export default Provisional;
