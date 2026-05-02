import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface Option {
  value: string;
  label: string;
  className?: string; // Por ejemplo, para texto rojo o cosas así
}

interface CustomSelectProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  compact?: boolean;
  openUpwards?: boolean;
}

const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder = 'Seleccionar...', className = '', compact = false, openUpwards = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const selectedOption = options.find(opt => opt.value === value);

  return (
    <div 
      ref={dropdownRef}
      className={`custom-select-container ${className}`} 
      style={{ position: 'relative', width: '100%' }}
    >
      <div 
        className={`custom-select-trigger ${compact ? 'select-table-compact' : 'form-input'}`} 
        onClick={() => setIsOpen(!isOpen)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          cursor: 'pointer',
          background: 'transparent',
          padding: compact ? '0' : undefined, // hereda de su clase en CSS si existiera, pero para compact es minimalista
        }}
      >
        <span className={selectedOption?.className || ''} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        {openUpwards ? (
          <ChevronUp size={compact ? 14 : 18} style={{ 
            marginLeft: '4px',
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} />
        ) : (
          <ChevronDown size={compact ? 14 : 18} style={{ 
            marginLeft: '4px',
            color: 'var(--text-muted)',
            transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease'
          }} />
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          ...(openUpwards ? { bottom: '100%', marginBottom: '0.25rem' } : { top: '100%', marginTop: '0.25rem' }),
          left: '-0.75rem',
          minWidth: 'calc(100% + 1.5rem)',
          maxHeight: '200px',
          overflowY: 'auto',
          background: 'var(--bg-card)', // Cambiado a var(--bg-card) para ser opaco
          border: '1px solid var(--border-color)',
          borderRadius: '0.5rem',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
          padding: '0.25rem'
        }}>
          {options.map((opt) => (
            <div
              key={opt.value}
              className={`custom-select-option ${opt.value === value ? 'selected' : ''} ${opt.className || ''}`}
              onClick={() => {
                onChange(opt.value);
                setIsOpen(false);
              }}
              style={{
                padding: '0.5rem 0.75rem',
                cursor: 'pointer',
                borderRadius: '0.25rem',
                fontSize: compact ? '0.85rem' : '0.9rem',
                transition: 'background-color 0.2s ease',
                whiteSpace: 'nowrap',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
