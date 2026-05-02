import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Save, Search, X } from 'lucide-react';


interface AltaProps {
  onBack: () => void;
  onSave: (data: any) => void;
  modoSolicitud?: boolean; // si true, envía como solicitud en lugar de guardar directamente
}

// Shapes from v2.sql
interface Orden       { idOrden: number;       nombre: string; }
interface Familia     { idFamilia: number;     idOrden: number;      nombre: string; }
interface Subfamilia  { idSubfamilia: number;  idFamilia: number;    nombre: string; }
interface Tribu       { idTribu: number;       idSubfamilia: number; nombre: string; }
interface Genero      { idGenero: number;      idTribu: number;      nombre: string; }
interface Especie     { idEspecie: number;     idGenero: number;     nombre: string; subespecie: string | null; }
interface Tipo        { idTipo: number;        nombre: string; }
interface Pais        { idPais: number;        nombre: string; }
interface Estado      { idEstado: number;      idPais: number;      nombre: string; }
interface Municipio   { idMunicipio: number;   idEstado: number;    nombre: string; }
interface Localidad   { idLocalidad: number;   idMunicipio: number; nombre: string; }
interface Colector    { idColector: number;    nombre: string; apellido_paterno: string; }
interface Determinador{ idDeterminador: number;nombre: string; apellido_paterno: string; }
interface Planta      { idPlanta: number;      nombre_cientifico: string; nombre_comun: string; }
interface Organismo   { idOrganismo: number;   nombre_organismo: string; }
interface Coleccion   { idColeccion: number;   acronimo: string; nombre_institucion: string; }
interface Cita        { idCita: number;        titulo: string; autores: string; anio: number; }

interface AllCatalogs {
  ordenes:      Orden[];
  familias:     Familia[];
  subfamilias:  Subfamilia[];
  tribus:       Tribu[];
  generos:      Genero[];
  especies:     Especie[];
  tipos:        Tipo[];
  paises:       Pais[];
  estados:      Estado[];
  municipios:   Municipio[];
  localidades:  Localidad[];
  colectores:   Colector[];
  determinadores: Determinador[];
  plantas:      Planta[];
  organismos:   Organismo[];
  colecciones:  Coleccion[];
  citas:        Cita[];
}

const Alta: React.FC<AltaProps> = ({ onBack, onSave, modoSolicitud = false }) => {
  const [formData, setFormData] = useState({
    id_orden: '',
    id_familia: '',
    id_subfamilia: '',
    id_tribu: '',
    id_genero: '',
    id_especie: '',
    id_tipo: '',
    id_pais: '',
    id_estado: '',
    id_municipio: '',
    id_localidad: '',
    id_colector: '',
    id_determinador: '',
    id_planta: '',
    id_organismo_huesped: '',
    id_coleccion: '',
    id_cita: '',
    nombre_comun: '',
    nombre_cientifico: '',
    anio_identificacion: '',
    fecha_colecta: '',
    altitud: '',
    datos_ecologicos: '',
    num_individuos: '1',
    envio_identificacion: '',
    anio_catalogacion: '',
    latitud_n: '',
    longitud_o: '',
    numero_frasco: '',
    status: true
  });

  // ── All catalog data (fetched once) ──────────────────────
  const all = useRef<AllCatalogs>({
    ordenes: [], familias: [], subfamilias: [], tribus: [], generos: [], especies: [],
    tipos: [], paises: [], estados: [], municipios: [], localidades: [],
    colectores: [], determinadores: [], plantas: [], organismos: [], colecciones: [], citas: []
  });
  const [, forceUpdate] = useState(0); // trigger re-render after fetch

  useEffect(() => {
    const endpoints: [keyof AllCatalogs, string][] = [
      ['ordenes',       '/api/catalogos/ordenes'],
      ['familias',      '/api/catalogos/familias'],
      ['subfamilias',   '/api/catalogos/subfamilias'],
      ['tribus',        '/api/catalogos/tribus'],
      ['generos',       '/api/catalogos/generos'],
      ['especies',      '/api/catalogos/especies'],
      ['tipos',         '/api/catalogos/tipos'],
      ['paises',        '/api/catalogos/paises'],
      ['estados',       '/api/catalogos/estados'],
      ['municipios',    '/api/catalogos/municipios'],
      ['localidades',   '/api/catalogos/localidades'],
      ['colectores',    '/api/catalogos/colectores'],
      ['determinadores','/api/catalogos/determinadores'],
      ['plantas',       '/api/catalogos/plantas'],
      ['organismos',    '/api/catalogos/organismos'],
      ['colecciones',   '/api/catalogos/colecciones'],
      ['citas',         '/api/catalogos/citas'],
    ];

    Promise.all(endpoints.map(([, url]) => fetch(url).then(r => r.ok ? r.json() : [])))
      .then(results => {
        endpoints.forEach(([key], i) => {
          (all.current as any)[key] = results[i].filter((item: any) => item.status !== 0 && item.status !== false && item.status !== '0');
        });
        
        const p = all.current;
        p.estados = p.estados.filter(e => p.paises.some(x => x.idPais === e.idPais));
        p.municipios = p.municipios.filter(m => p.estados.some(x => x.idEstado === m.idEstado));
        p.localidades = p.localidades.filter(l => p.municipios.some(x => x.idMunicipio === l.idMunicipio));

        p.familias = p.familias.filter(f => p.ordenes.some(x => x.idOrden === f.idOrden));
        p.subfamilias = p.subfamilias.filter(s => p.familias.some(x => x.idFamilia === s.idFamilia));
        p.tribus = p.tribus.filter(t => p.subfamilias.some(x => x.idSubfamilia === t.idSubfamilia));
        p.generos = p.generos.filter(g => p.tribus.some(x => x.idTribu === g.idTribu));
        p.especies = p.especies.filter(e => p.generos.some(x => x.idGenero === e.idGenero));

        forceUpdate(n => n + 1);
      })
      .catch(err => console.error('Error cargando catálogos:', err));
  }, []);

  // ── Cascading filtered lists ──────────────────────────────
  const familias     = formData.id_orden      ? all.current.familias.filter(f => f.idOrden === +formData.id_orden)           : all.current.familias;
  const subfamilias  = formData.id_familia    ? all.current.subfamilias.filter(s => s.idFamilia === +formData.id_familia)     : [];
  const tribus       = formData.id_subfamilia ? all.current.tribus.filter(t => t.idSubfamilia === +formData.id_subfamilia)    : [];
  const generos      = formData.id_tribu      ? all.current.generos.filter(g => g.idTribu === +formData.id_tribu)             : [];
  const especies     = formData.id_genero     ? all.current.especies.filter(e => e.idGenero === +formData.id_genero)          : [];
  const localidades  = formData.id_municipio  ? all.current.localidades.filter(l => l.idMunicipio === +formData.id_municipio) : [];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Clear children when parent changes
    const resets: Record<string, string[]> = {
      id_orden:      ['id_familia', 'id_subfamilia', 'id_tribu', 'id_genero', 'id_especie'],
      id_familia:    ['id_subfamilia', 'id_tribu', 'id_genero', 'id_especie'],
      id_subfamilia: ['id_tribu', 'id_genero', 'id_especie'],
      id_tribu:      ['id_genero', 'id_especie'],
      id_genero:     ['id_especie'],
      id_pais:       ['id_estado', 'id_municipio', 'id_localidad'],
      id_estado:     ['id_municipio', 'id_localidad'],
      id_municipio:  ['id_localidad'],
    };
    const extra: Record<string, string> = {};
    (resets[name] ?? []).forEach(k => { extra[k] = ''; });
    setFormData(prev => ({ ...prev, [name]: value, ...extra }));
  };

  // ── Searchable País logic ─────────────────────────────
  const [paisSearch, setPaisSearch] = useState('');
  const [showPaisDropdown, setShowPaisDropdown] = useState(false);

  // ── Searchable Estado logic ───────────────────────────
  const [estadoSearch, setEstadoSearch] = useState('');
  const [showEstadoDropdown, setShowEstadoDropdown] = useState(false);

  // ── Searchable Municipality logic ────────────────────────
  const [muniSearch, setMuniSearch] = useState('');
  const [showMuniDropdown, setShowMuniDropdown] = useState(false);

  const filteredMuniResults = all.current.municipios.filter(m => {
    if (!muniSearch.trim()) return false;
    const q = muniSearch.toLowerCase();
    const est = all.current.estados.find(e => e.idEstado === m.idEstado);
    const pais = all.current.paises.find(p => p.idPais === est?.idPais);
    return m.nombre.toLowerCase().includes(q) || 
           (est?.nombre || '').toLowerCase().includes(q) ||
           (pais?.nombre || '').toLowerCase().includes(q);
  });

  const handleSelectMuni = (m: Municipio) => {
    const est = all.current.estados.find(e => e.idEstado === m.idEstado);
    const pais = all.current.paises.find(p => p.idPais === est?.idPais);
    setFormData(prev => ({
      ...prev,
      id_municipio: String(m.idMunicipio),
      id_estado: String(est?.idEstado || ''),
      id_pais: String(pais?.idPais || '')
    }));
    setMuniSearch(`${m.nombre}, ${est?.nombre || ''}, ${pais?.nombre || ''}`);
    setEstadoSearch(est?.nombre || '');
    setPaisSearch(pais?.nombre || '');
    setShowMuniDropdown(false);
  };

  const handleClearMuni = () => {
    setMuniSearch('');
    setEstadoSearch('');
    setPaisSearch('');
    setFormData(prev => ({ ...prev, id_municipio: '', id_estado: '', id_pais: '' }));
  };

  // ── Searchable Colector logic ───────────────────────────
  const [colectorSearch, setColectorSearch] = useState('');
  const [showColectorDropdown, setShowColectorDropdown] = useState(false);

  const filteredColectores = all.current.colectores.filter(c => {
    if (!colectorSearch.trim()) return false;
    const q = colectorSearch.toLowerCase();
    return c.nombre.toLowerCase().includes(q) || 
           c.apellido_paterno.toLowerCase().includes(q);
  });

  // ── Searchable Planta logic ─────────────────────────────
  const [plantaSearch, setPlantaSearch] = useState('');
  const [showPlantaDropdown, setShowPlantaDropdown] = useState(false);

  const filteredPlantas = all.current.plantas.filter(p => {
    if (!plantaSearch.trim()) return false;
    const q = plantaSearch.toLowerCase();
    return p.nombre_cientifico.toLowerCase().includes(q) || 
           p.nombre_comun.toLowerCase().includes(q);
  });

  // ── Searchable Orden logic ──────────────────────────────
  const [ordenSearch, setOrdenSearch] = useState('');
  const [showOrdenDropdown, setShowOrdenDropdown] = useState(false);
  const filteredOrdenes = all.current.ordenes.filter(o =>
    !ordenSearch.trim() || o.nombre.toLowerCase().includes(ordenSearch.toLowerCase())
  );

  // ── Searchable Familia logic ────────────────────────────
  const [familiaSearch, setFamiliaSearch] = useState('');
  const [showFamiliaDropdown, setShowFamiliaDropdown] = useState(false);
  const filteredFamilias = familias.filter(f =>
    !familiaSearch.trim() || f.nombre.toLowerCase().includes(familiaSearch.toLowerCase())
  );

  // ── Searchable Subfamilia logic ─────────────────────────
  const [subfamiliaSearch, setSubfamiliaSearch] = useState('');
  const [showSubfamiliaDropdown, setShowSubfamiliaDropdown] = useState(false);
  const filteredSubfamilias = subfamilias.filter(s =>
    !subfamiliaSearch.trim() || s.nombre.toLowerCase().includes(subfamiliaSearch.toLowerCase())
  );

  // ── Searchable Tribu logic ──────────────────────────────
  const [tribuSearch, setTribuSearch] = useState('');
  const [showTribuDropdown, setShowTribuDropdown] = useState(false);
  const filteredTribus = tribus.filter(t =>
    !tribuSearch.trim() || t.nombre.toLowerCase().includes(tribuSearch.toLowerCase())
  );

  // ── Searchable Género logic ─────────────────────────────
  const [generoSearch, setGeneroSearch] = useState('');
  const [showGeneroDropdown, setShowGeneroDropdown] = useState(false);
  const filteredGeneros = generos.filter(g =>
    !generoSearch.trim() || g.nombre.toLowerCase().includes(generoSearch.toLowerCase())
  );

  // ── Searchable Especie logic ────────────────────────────
  const [especieSearch, setEspecieSearch] = useState('');
  const [showEspecieDropdown, setShowEspecieDropdown] = useState(false);
  const filteredEspecies = especies.filter(e =>
    !especieSearch.trim() || (e.nombre + (e.subespecie ? ` ${e.subespecie}` : '')).toLowerCase().includes(especieSearch.toLowerCase())
  );

  // ── Searchable Tipo logic ───────────────────────────────
  const [tipoSearch, setTipoSearch] = useState('');
  const [showTipoDropdown, setShowTipoDropdown] = useState(false);
  const filteredTipos = all.current.tipos.filter(t =>
    !tipoSearch.trim() || t.nombre.toLowerCase().includes(tipoSearch.toLowerCase())
  );

  // ── Searchable Localidad logic ──────────────────────────
  const [localidadSearch, setLocalidadSearch] = useState('');
  const [showLocalidadDropdown, setShowLocalidadDropdown] = useState(false);
  const filteredLocalidades = localidades.filter(l =>
    !localidadSearch.trim() || l.nombre.toLowerCase().includes(localidadSearch.toLowerCase())
  );

  // ── Searchable Organismo logic ──────────────────────────
  const [organismoSearch, setOrganismoSearch] = useState('');
  const [showOrganismoDropdown, setShowOrganismoDropdown] = useState(false);
  const filteredOrganismos = all.current.organismos.filter(o =>
    !organismoSearch.trim() || o.nombre_organismo.toLowerCase().includes(organismoSearch.toLowerCase())
  );

  // ── Searchable Determinador logic ───────────────────────
  const [determinadorSearch, setDeterminadorSearch] = useState('');
  const [showDeterminadorDropdown, setShowDeterminadorDropdown] = useState(false);
  const filteredDeterminadores = all.current.determinadores.filter(d =>
    !determinadorSearch.trim() || (d.nombre + ' ' + d.apellido_paterno).toLowerCase().includes(determinadorSearch.toLowerCase())
  );

  // ── Searchable Coleccion logic ──────────────────────────
  const [coleccionSearch, setColeccionSearch] = useState('');
  const [showColeccionDropdown, setShowColeccionDropdown] = useState(false);
  const filteredColecciones = all.current.colecciones.filter(c =>
    !coleccionSearch.trim() || (c.acronimo + ' ' + c.nombre_institucion).toLowerCase().includes(coleccionSearch.toLowerCase())
  );

  // ── Searchable Cita logic ───────────────────────────────
  const [citaSearch, setCitaSearch] = useState('');
  const [showCitaDropdown, setShowCitaDropdown] = useState(false);
  const filteredCitas = all.current.citas.filter(c =>
    !citaSearch.trim() || c.titulo.toLowerCase().includes(citaSearch.toLowerCase()) || c.autores.toLowerCase().includes(citaSearch.toLowerCase())
  );

  // ── Cascade select handlers ─────────────────────────────
  const handleSelectOrden = (o: Orden) => {
    setFormData(prev => ({ ...prev, id_orden: String(o.idOrden), id_familia: '', id_subfamilia: '', id_tribu: '', id_genero: '', id_especie: '' }));
    setOrdenSearch(o.nombre);
    setFamiliaSearch(''); setSubfamiliaSearch(''); setTribuSearch(''); setGeneroSearch(''); setEspecieSearch('');
    setShowOrdenDropdown(false);
  };
  const handleSelectFamilia = (f: Familia) => {
    setFormData(prev => ({ ...prev, id_familia: String(f.idFamilia), id_subfamilia: '', id_tribu: '', id_genero: '', id_especie: '' }));
    setFamiliaSearch(f.nombre);
    setSubfamiliaSearch(''); setTribuSearch(''); setGeneroSearch(''); setEspecieSearch('');
    setShowFamiliaDropdown(false);
  };
  const handleSelectSubfamilia = (s: Subfamilia) => {
    setFormData(prev => ({ ...prev, id_subfamilia: String(s.idSubfamilia), id_tribu: '', id_genero: '', id_especie: '' }));
    setSubfamiliaSearch(s.nombre);
    setTribuSearch(''); setGeneroSearch(''); setEspecieSearch('');
    setShowSubfamiliaDropdown(false);
  };
  const handleSelectTribu = (t: Tribu) => {
    setFormData(prev => ({ ...prev, id_tribu: String(t.idTribu), id_genero: '', id_especie: '' }));
    setTribuSearch(t.nombre);
    setGeneroSearch(''); setEspecieSearch('');
    setShowTribuDropdown(false);
  };
  const handleSelectGenero = (g: Genero) => {
    setFormData(prev => ({ ...prev, id_genero: String(g.idGenero), id_especie: '' }));
    setGeneroSearch(g.nombre);
    setEspecieSearch('');
    setShowGeneroDropdown(false);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (modoSolicitud) {
      // Modo solicitud: delega al padre que llama a crearSolicitud()
      onSave(formData);
      return;
    }
    try {
      const response = await fetch('/api/especimenes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const result = await response.json();
        onSave(result);
      } else {
        console.error('Error al guardar el espécimen');
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
            <h2 className="screen-title">
              {modoSolicitud ? 'Solicitud de Nuevo Registro' : 'Nuevo Registro'}
            </h2>
          </div>
        </div>
        <div className="header-actions">
          <button type="button" className="btn-outline" onClick={onBack}>Cancelar</button>
          <button type="submit" form="alta-especimen-form" className="btn-primary with-icon"
            disabled={!formData.id_colector || !formData.fecha_colecta}
          >
            <Save size={18} />
            {modoSolicitud ? 'Enviar Solicitud' : 'Guardar Espécimen'}
          </button>
        </div>
      </div>

      <div className="form-container alta-form">
        <form id="alta-especimen-form" onSubmit={handleSubmit}>
          <div className="form-card">
            {/* SECCIÓN 1: TAXONOMÍA */}
            <div className="form-section">
              <h3 className="section-title">Información Taxonómica</h3>
              <div className="form-grid">
                <div className="form-group">
                  <label>Nombre Común</label>
                  <input type="text" name="nombre_comun" placeholder="Ej. Pino" value={formData.nombre_comun} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Nombre Científico</label>
                  <input type="text" name="nombre_cientifico" placeholder="Ej. Pinus pinea" value={formData.nombre_cientifico} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Orden</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar orden..."
                      value={ordenSearch}
                      onChange={(e) => { setOrdenSearch(e.target.value); setShowOrdenDropdown(true); }}
                      onFocus={() => setShowOrdenDropdown(true)}
                      onBlur={() => setTimeout(() => setShowOrdenDropdown(false), 200)}
                      className={!!formData.id_orden ? 'input-selected' : ''}
                    />
                    {ordenSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setOrdenSearch(''); setFamiliaSearch(''); setSubfamiliaSearch(''); setTribuSearch(''); setGeneroSearch(''); setEspecieSearch('');
                        setFormData(prev => ({ ...prev, id_orden: '', id_familia: '', id_subfamilia: '', id_tribu: '', id_genero: '', id_especie: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showOrdenDropdown && filteredOrdenes.length > 0 && (
                    <div className="search-dropdown">
                      {filteredOrdenes.map(o => (
                        <div key={o.idOrden} className="search-dropdown-item" onMouseDown={() => handleSelectOrden(o)}>
                          {o.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Familia</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar familia..."
                      value={familiaSearch}
                      onChange={(e) => { setFamiliaSearch(e.target.value); setShowFamiliaDropdown(true); }}
                      onFocus={() => setShowFamiliaDropdown(true)}
                      onBlur={() => setTimeout(() => setShowFamiliaDropdown(false), 200)}
                      className={!!formData.id_familia ? 'input-selected' : ''}
                    />
                    {familiaSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setFamiliaSearch(''); setSubfamiliaSearch(''); setTribuSearch(''); setGeneroSearch(''); setEspecieSearch('');
                        setFormData(prev => ({ ...prev, id_familia: '', id_subfamilia: '', id_tribu: '', id_genero: '', id_especie: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showFamiliaDropdown && filteredFamilias.length > 0 && (
                    <div className="search-dropdown">
                      {filteredFamilias.map(f => (
                        <div key={f.idFamilia} className="search-dropdown-item" onMouseDown={() => handleSelectFamilia(f)}>
                          {f.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Subfamilia</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar subfamilia..."
                      value={subfamiliaSearch}
                      onChange={(e) => { setSubfamiliaSearch(e.target.value); setShowSubfamiliaDropdown(true); }}
                      onFocus={() => setShowSubfamiliaDropdown(true)}
                      onBlur={() => setTimeout(() => setShowSubfamiliaDropdown(false), 200)}
                      className={!!formData.id_subfamilia ? 'input-selected' : ''}
                    />
                    {subfamiliaSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setSubfamiliaSearch(''); setTribuSearch(''); setGeneroSearch(''); setEspecieSearch('');
                        setFormData(prev => ({ ...prev, id_subfamilia: '', id_tribu: '', id_genero: '', id_especie: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showSubfamiliaDropdown && filteredSubfamilias.length > 0 && (
                    <div className="search-dropdown">
                      {filteredSubfamilias.map(s => (
                        <div key={s.idSubfamilia} className="search-dropdown-item" onMouseDown={() => handleSelectSubfamilia(s)}>
                          {s.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Tribu</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar tribu..."
                      value={tribuSearch}
                      onChange={(e) => { setTribuSearch(e.target.value); setShowTribuDropdown(true); }}
                      onFocus={() => setShowTribuDropdown(true)}
                      onBlur={() => setTimeout(() => setShowTribuDropdown(false), 200)}
                      className={!!formData.id_tribu ? 'input-selected' : ''}
                    />
                    {tribuSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setTribuSearch(''); setGeneroSearch(''); setEspecieSearch('');
                        setFormData(prev => ({ ...prev, id_tribu: '', id_genero: '', id_especie: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showTribuDropdown && filteredTribus.length > 0 && (
                    <div className="search-dropdown">
                      {filteredTribus.map(t => (
                        <div key={t.idTribu} className="search-dropdown-item" onMouseDown={() => handleSelectTribu(t)}>
                          {t.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Género</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar género..."
                      value={generoSearch}
                      onChange={(e) => { setGeneroSearch(e.target.value); setShowGeneroDropdown(true); }}
                      onFocus={() => setShowGeneroDropdown(true)}
                      onBlur={() => setTimeout(() => setShowGeneroDropdown(false), 200)}
                      className={!!formData.id_genero ? 'input-selected' : ''}
                    />
                    {generoSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setGeneroSearch(''); setEspecieSearch('');
                        setFormData(prev => ({ ...prev, id_genero: '', id_especie: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showGeneroDropdown && filteredGeneros.length > 0 && (
                    <div className="search-dropdown">
                      {filteredGeneros.map(g => (
                        <div key={g.idGenero} className="search-dropdown-item" onMouseDown={() => handleSelectGenero(g)}>
                          {g.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Especie</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar especie..."
                      value={especieSearch}
                      onChange={(e) => { setEspecieSearch(e.target.value); setShowEspecieDropdown(true); }}
                      onFocus={() => setShowEspecieDropdown(true)}
                      onBlur={() => setTimeout(() => setShowEspecieDropdown(false), 200)}
                      className={!!formData.id_especie ? 'input-selected' : ''}
                    />
                    {especieSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setEspecieSearch('');
                        setFormData(prev => ({ ...prev, id_especie: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showEspecieDropdown && filteredEspecies.length > 0 && (
                    <div className="search-dropdown">
                      {filteredEspecies.map(e => (
                        <div key={e.idEspecie} className="search-dropdown-item" onMouseDown={() => {
                          setFormData(prev => ({ ...prev, id_especie: String(e.idEspecie) }));
                          setEspecieSearch(e.nombre + (e.subespecie ? ` ${e.subespecie}` : ''));
                          setShowEspecieDropdown(false);
                        }}>
                          <span style={{ fontWeight: 600 }}>{e.nombre}</span>
                          {e.subespecie && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> {e.subespecie}</span>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Tipo</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar tipo..."
                      value={tipoSearch}
                      onChange={(e) => { setTipoSearch(e.target.value); setShowTipoDropdown(true); }}
                      onFocus={() => setShowTipoDropdown(true)}
                      onBlur={() => setTimeout(() => setShowTipoDropdown(false), 200)}
                      className={!!formData.id_tipo ? 'input-selected' : ''}
                    />
                    {tipoSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setTipoSearch('');
                        setFormData(prev => ({ ...prev, id_tipo: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showTipoDropdown && filteredTipos.length > 0 && (
                    <div className="search-dropdown">
                      {filteredTipos.map(t => (
                        <div key={t.idTipo} className="search-dropdown-item" onMouseDown={() => {
                          setFormData(prev => ({ ...prev, id_tipo: String(t.idTipo) }));
                          setTipoSearch(t.nombre);
                          setShowTipoDropdown(false);
                        }}>
                          {t.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="form-section-divider" style={{ margin: '2rem 0', borderBottom: '1px solid var(--border-color)', opacity: 0.3 }} />

            {/* SECCIÓN 2: LOCALIZACIÓN */}
            <div className="form-section">
              <h3 className="section-title">Geografía y Localización</h3>
              <div className="form-grid">
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>País</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar país..."
                      value={paisSearch}
                      onChange={(e) => { setPaisSearch(e.target.value); setShowPaisDropdown(true); }}
                      onFocus={() => setShowPaisDropdown(true)}
                      onBlur={() => setTimeout(() => setShowPaisDropdown(false), 200)}
                      className={!!formData.id_pais ? 'input-selected' : ''}
                    />
                    {paisSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setPaisSearch(''); setEstadoSearch(''); setMuniSearch('');
                        setFormData(prev => ({ ...prev, id_pais: '', id_estado: '', id_municipio: '', id_localidad: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showPaisDropdown && (
                    <div className="search-dropdown">
                      {all.current.paises
                        .filter(p => !paisSearch.trim() || p.nombre.toLowerCase().includes(paisSearch.toLowerCase()))
                        .map(p => (
                          <div key={p.idPais} className="search-dropdown-item" onMouseDown={() => {
                            setFormData(prev => ({ ...prev, id_pais: String(p.idPais), id_estado: '', id_municipio: '', id_localidad: '' }));
                            setPaisSearch(p.nombre); setEstadoSearch(''); setMuniSearch('');
                            setShowPaisDropdown(false);
                          }}>{p.nombre}</div>
                        ))}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Estado</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar estado..."
                      value={estadoSearch}
                      onChange={(e) => { setEstadoSearch(e.target.value); setShowEstadoDropdown(true); }}
                      onFocus={() => setShowEstadoDropdown(true)}
                      onBlur={() => setTimeout(() => setShowEstadoDropdown(false), 200)}
                      className={!!formData.id_estado ? 'input-selected' : ''}
                    />
                    {estadoSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setEstadoSearch(''); setMuniSearch('');
                        setFormData(prev => ({ ...prev, id_estado: '', id_municipio: '', id_localidad: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showEstadoDropdown && (
                    <div className="search-dropdown">
                      {all.current.estados
                        .filter(e => formData.id_pais ? e.idPais === +formData.id_pais : true)
                        .filter(e => !estadoSearch.trim() || e.nombre.toLowerCase().includes(estadoSearch.toLowerCase()))
                        .map(e => (
                          <div key={e.idEstado} className="search-dropdown-item" onMouseDown={() => {
                            const pais = all.current.paises.find(p => p.idPais === e.idPais);
                            setFormData(prev => ({ ...prev, id_estado: String(e.idEstado), id_pais: String(e.idPais), id_municipio: '', id_localidad: '' }));
                            setEstadoSearch(e.nombre);
                            if (pais) setPaisSearch(pais.nombre);
                            setMuniSearch('');
                            setShowEstadoDropdown(false);
                          }}>{e.nombre}</div>
                        ))}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Municipio</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input 
                      type="text" 
                      placeholder="Buscar municipio..." 
                      value={muniSearch}
                      onChange={(e) => { setMuniSearch(e.target.value); setShowMuniDropdown(true); }}
                      onFocus={() => setShowMuniDropdown(true)}
                      onBlur={() => setTimeout(() => setShowMuniDropdown(false), 200)}
                      className={!!formData.id_municipio ? 'input-selected' : ''}
                    />
                    {muniSearch && (
                      <button type="button" className="btn-clear" onClick={handleClearMuni}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {showMuniDropdown && filteredMuniResults.length > 0 && (
                    <div className="search-dropdown">
                      {filteredMuniResults.map(m => {
                        const est = all.current.estados.find(e => e.idEstado === m.idEstado);
                        const pais = all.current.paises.find(p => p.idPais === est?.idPais);
                        return (
                          <div 
                            key={m.idMunicipio} 
                            className="search-dropdown-item"
                            onMouseDown={() => handleSelectMuni(m)}
                          >
                            <span style={{ fontWeight: 600 }}>{m.nombre}</span>
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                              {est?.nombre || ''}, {pais?.nombre || ''}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Localidad</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar localidad..."
                      value={localidadSearch}
                      onChange={(e) => { setLocalidadSearch(e.target.value); setShowLocalidadDropdown(true); }}
                      onFocus={() => setShowLocalidadDropdown(true)}
                      onBlur={() => setTimeout(() => setShowLocalidadDropdown(false), 200)}
                      className={!!formData.id_localidad ? 'input-selected' : ''}
                    />
                    {localidadSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setLocalidadSearch('');
                        setFormData(prev => ({ ...prev, id_localidad: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showLocalidadDropdown && filteredLocalidades.length > 0 && (
                    <div className="search-dropdown">
                      {filteredLocalidades.map(l => (
                        <div key={l.idLocalidad} className="search-dropdown-item" onMouseDown={() => {
                          setFormData(prev => ({ ...prev, id_localidad: String(l.idLocalidad) }));
                          setLocalidadSearch(l.nombre);
                          setShowLocalidadDropdown(false);
                        }}>
                          {l.nombre}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Latitud (N)</label>
                  <input type="number" step="any" name="latitud_n" value={formData.latitud_n} onChange={handleChange} placeholder="Ej: 16.737" />
                </div>
                <div className="form-group">
                  <label>Longitud (O)</label>
                  <input type="number" step="any" name="longitud_o" value={formData.longitud_o} onChange={handleChange} placeholder="Ej: -92.637" />
                </div>
                <div className="form-group">
                  <label>Altitud (msnm)</label>
                  <input type="number" name="altitud" value={formData.altitud} onChange={handleChange} placeholder="Ej: 2100" />
                </div>
              </div>
            </div>

            <div className="form-section-divider" style={{ margin: '2rem 0', borderBottom: '1px solid var(--border-color)', opacity: 0.3 }} />

            {/* SECCIÓN 3: COLECTA */}
            <div className="form-section">
              <h3 className="section-title">Datos de Colecta</h3>
              <div className="form-grid">
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Colector</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input 
                      type="text" 
                      placeholder="Buscar colector..." 
                      value={colectorSearch}
                      onChange={(e) => { setColectorSearch(e.target.value); setShowColectorDropdown(true); }}
                      onFocus={() => setShowColectorDropdown(true)}
                      onBlur={() => setTimeout(() => setShowColectorDropdown(false), 200)}
                      className={!!formData.id_colector ? 'input-selected' : ''}
                    />
                    {colectorSearch && (
                      <button type="button" className="btn-clear" onClick={() => { setColectorSearch(''); setFormData(p => ({ ...p, id_colector: '' })); }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {showColectorDropdown && filteredColectores.length > 0 && (
                    <div className="search-dropdown">
                      {filteredColectores.map(c => (
                        <div 
                          key={c.idColector} 
                          className="search-dropdown-item"
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, id_colector: String(c.idColector) }));
                            setColectorSearch(`${c.nombre} ${c.apellido_paterno}`);
                            setShowColectorDropdown(false);
                          }}
                        >
                          {c.nombre} {c.apellido_paterno}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group">
                  <label>Fecha de Colecta</label>
                  <input type="date" name="fecha_colecta" value={formData.fecha_colecta} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Número de Frasco / Caja</label>
                  <input type="text" name="numero_frasco" value={formData.numero_frasco} onChange={handleChange} placeholder="Ej: F-102" />
                </div>
                
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Planta Hospedera</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input 
                      type="text" 
                      placeholder="Buscar planta..." 
                      value={plantaSearch}
                      onChange={(e) => { setPlantaSearch(e.target.value); setShowPlantaDropdown(true); }}
                      onFocus={() => setShowPlantaDropdown(true)}
                      onBlur={() => setTimeout(() => setShowPlantaDropdown(false), 200)}
                      className={!!formData.id_planta ? 'input-selected' : ''}
                    />
                    {plantaSearch && (
                      <button type="button" className="btn-clear" onClick={() => { setPlantaSearch(''); setFormData(p => ({ ...p, id_planta: '' })); }}>
                        <X size={14} />
                      </button>
                    )}
                  </div>
                  {showPlantaDropdown && filteredPlantas.length > 0 && (
                    <div className="search-dropdown">
                      {filteredPlantas.map(p => (
                        <div 
                          key={p.idPlanta} 
                          className="search-dropdown-item"
                          onMouseDown={() => {
                            setFormData(prev => ({ ...prev, id_planta: String(p.idPlanta) }));
                            setPlantaSearch(p.nombre_cientifico);
                            setShowPlantaDropdown(false);
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>{p.nombre_cientifico}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{p.nombre_comun}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Organismo Huésped</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar organismo..."
                      value={organismoSearch}
                      onChange={(e) => { setOrganismoSearch(e.target.value); setShowOrganismoDropdown(true); }}
                      onFocus={() => setShowOrganismoDropdown(true)}
                      onBlur={() => setTimeout(() => setShowOrganismoDropdown(false), 200)}
                      className={!!formData.id_organismo_huesped ? 'input-selected' : ''}
                    />
                    {organismoSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setOrganismoSearch('');
                        setFormData(prev => ({ ...prev, id_organismo_huesped: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showOrganismoDropdown && filteredOrganismos.length > 0 && (
                    <div className="search-dropdown">
                      {filteredOrganismos.map(o => (
                        <div key={o.idOrganismo} className="search-dropdown-item" onMouseDown={() => {
                          setFormData(prev => ({ ...prev, id_organismo_huesped: String(o.idOrganismo) }));
                          setOrganismoSearch(o.nombre_organismo);
                          setShowOrganismoDropdown(false);
                        }}>
                          {o.nombre_organismo}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Núm. Individuos</label>
                  <input type="number" name="num_individuos" value={formData.num_individuos} onChange={handleChange} min="1" />
                </div>
                <div className="form-group full-width">
                  <label>Datos Ecológicos</label>
                  <textarea
                    name="datos_ecologicos"
                    value={formData.datos_ecologicos}
                    onChange={handleChange}
                    rows={3}
                    placeholder="Describa el hábitat, método de colecta, etc."
                  />
                </div>
              </div>
            </div>

            <div className="form-section-divider" style={{ margin: '2rem 0', borderBottom: '1px solid var(--border-color)', opacity: 0.3 }} />

            {/* SECCIÓN 4: CURACIÓN */}
            <div className="form-section">
              <h3 className="section-title">Detalles de Curación</h3>
              <div className="form-grid">
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Determinador</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar determinador..."
                      value={determinadorSearch}
                      onChange={(e) => { setDeterminadorSearch(e.target.value); setShowDeterminadorDropdown(true); }}
                      onFocus={() => setShowDeterminadorDropdown(true)}
                      onBlur={() => setTimeout(() => setShowDeterminadorDropdown(false), 200)}
                      className={!!formData.id_determinador ? 'input-selected' : ''}
                    />
                    {determinadorSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setDeterminadorSearch('');
                        setFormData(prev => ({ ...prev, id_determinador: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showDeterminadorDropdown && filteredDeterminadores.length > 0 && (
                    <div className="search-dropdown">
                      {filteredDeterminadores.map(d => (
                        <div key={d.idDeterminador} className="search-dropdown-item" onMouseDown={() => {
                          setFormData(prev => ({ ...prev, id_determinador: String(d.idDeterminador) }));
                          setDeterminadorSearch(`${d.nombre} ${d.apellido_paterno}`);
                          setShowDeterminadorDropdown(false);
                        }}>
                          {d.nombre} {d.apellido_paterno}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group">
                  <label>Año de Identificación</label>
                  <input type="number" name="anio_identificacion" value={formData.anio_identificacion} onChange={handleChange} placeholder="Ej: 2024" />
                </div>
                <div className="form-group">
                  <label>Año de Catalogación</label>
                  <input type="number" name="anio_catalogacion" value={formData.anio_catalogacion} onChange={handleChange} placeholder="Ej: 2024" />
                </div>
                <div className="form-group">
                  <label>Envío a Identificación</label>
                  <input type="date" name="envio_identificacion" value={formData.envio_identificacion} onChange={handleChange} />
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Colección</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar colección..."
                      value={coleccionSearch}
                      onChange={(e) => { setColeccionSearch(e.target.value); setShowColeccionDropdown(true); }}
                      onFocus={() => setShowColeccionDropdown(true)}
                      onBlur={() => setTimeout(() => setShowColeccionDropdown(false), 200)}
                      className={!!formData.id_coleccion ? 'input-selected' : ''}
                    />
                    {coleccionSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setColeccionSearch('');
                        setFormData(prev => ({ ...prev, id_coleccion: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showColeccionDropdown && filteredColecciones.length > 0 && (
                    <div className="search-dropdown">
                      {filteredColecciones.map(c => (
                        <div key={c.idColeccion} className="search-dropdown-item" onMouseDown={() => {
                          setFormData(prev => ({ ...prev, id_coleccion: String(c.idColeccion) }));
                          setColeccionSearch(`${c.acronimo} — ${c.nombre_institucion}`);
                          setShowColeccionDropdown(false);
                        }}>
                          <span style={{ fontWeight: 600 }}>{c.acronimo}</span>
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> {c.nombre_institucion}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <div className="form-group" style={{ position: 'relative' }}>
                  <label>Cita Bibliográfica</label>
                  <div className="search-wrapper">
                    <Search size={16} />
                    <input
                      type="text"
                      placeholder="Buscar cita..."
                      value={citaSearch}
                      onChange={(e) => { setCitaSearch(e.target.value); setShowCitaDropdown(true); }}
                      onFocus={() => setShowCitaDropdown(true)}
                      onBlur={() => setTimeout(() => setShowCitaDropdown(false), 200)}
                      className={!!formData.id_cita ? 'input-selected' : ''}
                    />
                    {citaSearch && (
                      <button type="button" className="btn-clear" onClick={() => {
                        setCitaSearch('');
                        setFormData(prev => ({ ...prev, id_cita: '' }));
                      }}><X size={14} /></button>
                    )}
                  </div>
                  {showCitaDropdown && filteredCitas.length > 0 && (
                    <div className="search-dropdown">
                      {filteredCitas.map(c => (
                        <div key={c.idCita} className="search-dropdown-item" onMouseDown={() => {
                          setFormData(prev => ({ ...prev, id_cita: String(c.idCita) }));
                          setCitaSearch(c.titulo);
                          setShowCitaDropdown(false);
                        }}>
                          {c.anio && <span style={{ fontWeight: 600 }}>{c.anio} — </span>}
                          <span>{c.titulo}</span>
                          {c.autores && <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}> {c.autores}</span>}
                        </div>
                      ))}
                    </div>
                  )}
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
