import React, { useState } from 'react';
import { ArrowLeft, Save } from 'lucide-react';

interface AltaProps {
  onBack: () => void;
  onSaved: () => void;
}

const Alta: React.FC<AltaProps> = ({ onBack, onSaved }) => {
  const [id_especimen, setIdEspecimen] = useState('');
  const [ruta_archivo, setRutaArchivo] = useState('');
  const [descripcion_foto, setDescripcionFoto] = useState('');
  const [id_colector, setIdColector] = useState('');
  const [id_determinador, setIdDeterminador] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const idEsp = Number(id_especimen);
    if (!Number.isFinite(idEsp) || idEsp < 1) {
      console.error('Id espécimen inválido');
      return;
    }
    const body: Record<string, unknown> = {
      id_especimen: idEsp,
      ruta_archivo: ruta_archivo.trim(),
      descripcion_foto: descripcion_foto.trim() === '' ? null : descripcion_foto.trim(),
    };
    const c = id_colector.trim();
    const d = id_determinador.trim();
    body.id_colector = c === '' ? null : Number(c);
    body.id_determinador = d === '' ? null : Number(d);
    if (c !== '' && !Number.isFinite(body.id_colector as number)) {
      console.error('Id colector inválido');
      return;
    }
    if (d !== '' && !Number.isFinite(body.id_determinador as number)) {
      console.error('Id determinador inválido');
      return;
    }

    try {
      const response = await fetch('/api/fototeca', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (response.ok) {
        onSaved();
      } else {
        console.error('Error al guardar la imagen');
      }
    } catch (error) {
      console.error('Error de red:', error);
    }
  };

  return (
    <div className="fototeca-module screen-container animate-slide-in">
      <div className="screen-header">
        <div className="header-with-back">
          <button className="btn-back" type="button" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="screen-title">Nuevo Registro</h2>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button type="submit" form="alta-fototeca-form" className="btn-primary with-icon"
            disabled={!id_especimen.trim() || !ruta_archivo.trim()}
          >
            <Save size={18} />
            Guardar imagen
          </button>
        </div>
      </div>
      <div className="form-container-split">
        <form
          id="alta-fototeca-form"
          className="split-layout-form"
          onSubmit={handleSubmit}
        >
          <div className="form-left-column">
            <div className="form-card">
              <div className="form-section">
                <h3 className="section-title">Datos de la imagen</h3>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Id espécimen</label>
                    <input
                      type="number"
                      placeholder="Ej. 1"
                      min={1}
                      required
                      value={id_especimen}
                      onChange={(e) => setIdEspecimen(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Id colector (opcional)</label>
                    <input
                      type="number"
                      placeholder="Vacío si no aplica"
                      min={1}
                      value={id_colector}
                      onChange={(e) => setIdColector(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label>Id determinador (opcional)</label>
                    <input
                      type="number"
                      placeholder="Vacío si no aplica"
                      min={1}
                      value={id_determinador}
                      onChange={(e) => setIdDeterminador(e.target.value)}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Ruta archivo</label>
                    <input
                      type="text"
                      placeholder="Ruta o URL del archivo"
                      required
                      maxLength={255}
                      value={ruta_archivo}
                      onChange={(e) => setRutaArchivo(e.target.value)}
                    />
                  </div>
                  <div className="form-group full-width">
                    <label>Descripción (opcional)</label>
                    <input
                      type="text"
                      placeholder="Descripción breve de la foto"
                      maxLength={255}
                      value={descripcion_foto}
                      onChange={(e) => setDescripcionFoto(e.target.value)}
                    />
                  </div>
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
