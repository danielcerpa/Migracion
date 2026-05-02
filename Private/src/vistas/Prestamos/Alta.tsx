import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Search } from 'lucide-react';

interface AltaProps {
    onBack: () => void;
    onSave: () => void;
}

const mockEjemplares = [
    { id: 1, nombreComun: 'Mariposa Monarca', cientifico: 'Danaus plexippus' },
    { id: 2, nombreComun: 'Escarabajo Rinoceronte', cientifico: 'Oryctes nasicornis' },
    { id: 3, nombreComun: 'Mantis Religiosa', cientifico: 'Mantis religiosa' },
    { id: 1045, nombreComun: 'Abeja Europea', cientifico: 'Apis mellifera' },
    { id: 1046, nombreComun: 'Hormiga Cortadora', cientifico: 'Atta cephalotes' },
    { id: 2001, nombreComun: 'Polilla Luna', cientifico: 'Actias luna' },
];

const Alta: React.FC<AltaProps> = ({ onBack, onSave }) => {
    const [formData, setFormData] = useState({
        idEjemplar: '',
        nombre_cientifico: '',
        nombre_comun: '',
        prestatario: '',
        institucion: '',
        fecha_prestamo: new Date().toISOString().split('T')[0],
        fecha_devolucion_estimada: '',
        estado_prestamo: 'Activo',
        proposito: '',
        condicion_al_prestar: '',
        observaciones: ''
    });

    const [queryEjemplar, setQueryEjemplar] = useState('');
    const [openDropdown, setOpenDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const filteredEjemplares = queryEjemplar.trim() === ''
        ? mockEjemplares
        : mockEjemplares.filter(e => 
            e.nombreComun.toLowerCase().includes(queryEjemplar.toLowerCase()) || 
            e.cientifico.toLowerCase().includes(queryEjemplar.toLowerCase()) ||
            e.id.toString().includes(queryEjemplar)
        );

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSelectEjemplar = (ej: any) => {
        setFormData(prev => ({ 
            ...prev, 
            idEjemplar: ej.id.toString(),
            nombre_comun: ej.nombreComun,
            nombre_cientifico: ej.cientifico
        }));
        setQueryEjemplar('');
        setOpenDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/prestamos', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            if (response.ok) {
                onSave();
            } else {
                console.error('Error al guardar el préstamo');
            }
        } catch (error) {
            console.error('Error de red:', error);
        }
    };

    return (
        <div className="screen-container animate-slide-in">
            <div className="screen-header">
                <div className="header-with-back">
                    <button className="btn-back" onClick={onBack}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h2 className="screen-title">Registrar Préstamo</h2>
                    </div>
                </div>
                <div className="header-actions">
                    <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
                    <button type="submit" form="alta-prestamo-form" className="btn-primary with-icon"
                        disabled={!formData.idEjemplar || !formData.prestatario.trim() || !formData.fecha_prestamo}
                    >
                        <Save size={18} />
                        Guardar Préstamo
                    </button>
                </div>
            </div>

            <div className="form-container">
                <form id="alta-prestamo-form" onSubmit={handleSubmit}>
                    <div className="form-card">
                        <div className="form-section">
                            <h3 className="section-title">Datos del Préstamo</h3>
                            <div className="form-grid">

                                <div className="form-group full-width" ref={dropdownRef}>
                                    <label>Buscar Ejemplar (Autocompleta los campos de abajo)</label>
                                    <div className="search-wrapper" style={{ position: 'relative' }}>
                                        <Search size={18} />
                                        <input
                                            type="text"
                                            style={{ paddingLeft: '28px' }}
                                            placeholder="Busca y selecciona para rellenar ID y Nombres..."
                                            value={queryEjemplar}
                                            onChange={(e) => {
                                                setQueryEjemplar(e.target.value);
                                                setOpenDropdown(true);
                                            }}
                                            onFocus={() => setOpenDropdown(true)}
                                        />
                                        
                                        {openDropdown && (
                                            <div style={{
                                                position: 'absolute',
                                                top: '100%',
                                                left: 0,
                                                right: 0,
                                                background: 'var(--bg-card)',
                                                border: '1px solid var(--border-color)',
                                                borderRadius: '8px',
                                                maxHeight: '250px',
                                                overflowY: 'auto',
                                                zIndex: 100,
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
                                            }}>
                                                <table className="custom-table compact-table" style={{ width: '100%', margin: 0 }}>
                                                    <thead>
                                                        <tr>
                                                            <th style={{ padding: '8px' }}>ID</th>
                                                            <th style={{ padding: '8px' }}>Nombre Común</th>
                                                            <th style={{ padding: '8px' }}>Especie</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {filteredEjemplares.length === 0 ? (
                                                            <tr><td colSpan={3} style={{ textAlign: 'center', padding: '1rem' }}>No se encontraron coincidencias</td></tr>
                                                        ) : (
                                                            filteredEjemplares.map(ej => (
                                                                <tr 
                                                                    key={ej.id} 
                                                                    onClick={() => handleSelectEjemplar(ej)}
                                                                >
                                                                    <td style={{ padding: '8px', fontWeight: 'bold' }}>#{ej.id}</td>
                                                                    <td style={{ padding: '8px' }}>{ej.nombreComun}</td>
                                                                    <td style={{ padding: '8px', fontStyle: 'italic', color: 'var(--text-muted)' }}>{ej.cientifico}</td>
                                                                </tr>
                                                            ))
                                                        )}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: '1.25rem' }} className="full-width">
                                    <div className="form-group">
                                        <label>ID Ejemplar</label>
                                        <input type="number" name="idEjemplar" value={formData.idEjemplar} onChange={handleChange} required readOnly placeholder="..." />
                                    </div>
                                    <div className="form-group">
                                        <label>Nombre Común</label>
                                        <input type="text" name="nombre_comun" value={formData.nombre_comun} onChange={handleChange} required readOnly placeholder="..." />
                                    </div>
                                    <div className="form-group">
                                        <label>Nombre Científico</label>
                                        <input type="text" name="nombre_cientifico" value={formData.nombre_cientifico} onChange={handleChange} required readOnly placeholder="..." />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label>Prestatario</label>
                                    <input type="text" name="prestatario" value={formData.prestatario} onChange={handleChange} required placeholder="Nombre del investigador o persona que solicita el préstamo" />
                                </div>
                                <div className="form-group">
                                    <label>Institución</label>
                                    <input type="text" name="institucion" value={formData.institucion} onChange={handleChange} placeholder="Universidad de Guanajuato" />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem' }} className="full-width">
                                    <div className="form-group">
                                        <label>Fecha de Préstamo</label>
                                        <input type="date" name="fecha_prestamo" value={formData.fecha_prestamo} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label>Fecha Devolución Estimada</label>
                                        <input type="date" name="fecha_devolucion_estimada" value={formData.fecha_devolucion_estimada} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label>Estado</label>
                                        <select name="estado_prestamo" value={formData.estado_prestamo} onChange={handleChange}>
                                            <option value="Activo">Activo</option>
                                            <option value="Devuelto">Devuelto</option>
                                            <option value="Vencido">Vencido</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="form-group full-width">
                                    <label>Propósito</label>
                                    <input type="text" name="proposito" value={formData.proposito} onChange={handleChange} placeholder="Razón del préstamo" />
                                </div>
                                <div className="form-group full-width">
                                    <label>Condición al prestar</label>
                                    <input type="text" name="condicion_al_prestar" value={formData.condicion_al_prestar} onChange={handleChange} placeholder="Estado físico del ejemplar" />
                                </div>
                                <div className="form-group full-width">
                                    <label>Observaciones</label>
                                    <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} rows={3} placeholder="Notas adicionales"></textarea>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Alta;
