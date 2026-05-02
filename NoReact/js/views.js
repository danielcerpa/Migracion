// ── View Interactivity Functions ──────────────────────────────

function filterTable(input) {
    const q = input.value.toLowerCase();
    document.querySelectorAll('#module-table tbody tr').forEach(tr => {
        tr.style.display = tr.textContent.toLowerCase().includes(q) ? '' : 'none';
    });
}

// ── Especímenes Logic ─────────────────────────────────────────
function openFicha(id) {
    const e = (window._especimenesData || []).find(x => x.id === id);
    if (!e) return;
    const year = e.fecha ? new Date(e.fecha).getFullYear() : '—';
    const dateF = e.fecha ? new Date(e.fecha).toLocaleDateString() : '—';
    document.body.insertAdjacentHTML('beforeend', `
    <div id="ficha-modal">
      <div class="ft-overlay" onclick="closeFicha()">
        <div class="ft-modal" onclick="event.stopPropagation()">
          <button class="ft-close" onclick="closeFicha()"><i data-lucide="x"></i></button>
          <div class="ft-scroll">
            <header class="ft-header">
              <h1 class="ft-title">FICHA TÉCNICA</h1>
              <p class="ft-subtitle">Colección Entomológica</p>
              <div class="ft-header-row">
                <div class="ft-field"><span class="ft-label">Colector</span><span class="ft-value">${e.colector}</span></div>
                <div class="ft-field"><span class="ft-label">Año de Catalogación</span><span class="ft-value">${e.anio_cat}</span></div>
              </div>
            </header>
            <section class="ft-section ft-hero-section">
              <div class="ft-hero-info">
                <h2 class="ft-common-name">${e.comun}</h2>
                <p class="ft-scientific-name"><i>${e.cientifico}</i></p>
                <div class="ft-taxonomy-pills">
                  <span class="ft-pill ft-pill-order">${e.orden}</span>
                  <span class="ft-pill ft-pill-family">${e.familia}</span>
                  <span class="ft-pill ft-pill-tribu">${e.tribu}</span>
                </div>
              </div>
              <div class="ft-hero-image"><i data-lucide="bug" style="width:56px;height:56px;opacity:0.3"></i></div>
            </section>
            <section class="ft-section">
              <h3 class="ft-section-title">Datos de Identificación</h3>
              <div class="ft-grid ft-grid-2">
                <div class="ft-field"><span class="ft-label">Nombre Común</span><span class="ft-value">${e.comun}</span></div>
                <div class="ft-field"><span class="ft-label">Colección</span><span class="ft-value">${e.coleccion}</span></div>
              </div>
            </section>
            <section class="ft-section">
              <h3 class="ft-section-title">Datos de Colecta</h3>
              <div class="ft-grid ft-grid-3">
                <div class="ft-field"><span class="ft-label">Año</span><span class="ft-value">${year}</span></div>
                <div class="ft-field"><span class="ft-label">País</span><span class="ft-value">${e.pais}</span></div>
                <div class="ft-field"><span class="ft-label">Estado</span><span class="ft-value">${e.estado}</span></div>
              </div>
              <div class="ft-grid ft-grid-2">
                <div class="ft-field"><span class="ft-label">Localidad</span><span class="ft-value">${e.localidad}</span></div>
                <div class="ft-field"><span class="ft-label">Fecha de Colecta</span><span class="ft-value">${dateF}</span></div>
              </div>
              <div class="ft-grid ft-grid-2">
                <div class="ft-field"><span class="ft-label">Altitud</span><span class="ft-value">${e.alt} m</span></div>
              </div>
            </section>
            <section class="ft-section">
              <h3 class="ft-section-title">Ubicación Geográfica</h3>
              <div class="ft-grid ft-grid-2">
                <div class="ft-field"><span class="ft-label">Latitud</span><span class="ft-value">${e.lat}°</span></div>
                <div class="ft-field"><span class="ft-label">Longitud</span><span class="ft-value">${e.lon}°</span></div>
              </div>
            </section>
            <section class="ft-section">
              <h3 class="ft-section-title">Datos Biológicos</h3>
              <div class="ft-grid ft-grid-2">
                <div class="ft-field"><span class="ft-label">Tribu</span><span class="ft-value">${e.tribu}</span></div>
                <div class="ft-field"><span class="ft-label">Planta Hospedera</span><span class="ft-value ft-italic">${e.planta}</span></div>
                <div class="ft-field"><span class="ft-label">Organismo Huésped</span><span class="ft-value ft-italic">${e.organismo}</span></div>
              </div>
            </section>
            <section class="ft-section">
              <h3 class="ft-section-title">Catalogación</h3>
              <div class="ft-grid ft-grid-2">
                <div class="ft-field"><span class="ft-label">Determinador</span><span class="ft-value">${e.determinador}</span></div>
                <div class="ft-field"><span class="ft-label">Año de Catalogación</span><span class="ft-value">${e.anio_cat}</span></div>
              </div>
              <div class="ft-grid" style="grid-template-columns:1fr">
                <div class="ft-field"><span class="ft-label">Cita Bibliográfica</span><span class="ft-value">${e.cita}</span></div>
              </div>
            </section>
            <section class="ft-section">
              <h3 class="ft-section-title">Datos Ecológicos / Taxonómicos</h3>
              <div class="ft-notes">${e.ecologia}</div>
            </section>
          </div>
        </div>
      </div>
    </div>`);
    lucide.createIcons();
    document.body.style.overflow = 'hidden';
}

function closeFicha() {
    const m = document.getElementById('ficha-modal');
    if (m) m.remove();
    document.body.style.overflow = 'auto';
}

// ── Aprobaciones Logic ────────────────────────────────────────
function aprobar(id) {
    if (!confirm('¿Está seguro de que desea aprobar esta solicitud? Se creará un nuevo espécimen.')) return;
    document.querySelector(`[onclick="aprobar(${id})"]`)?.closest('.aprobacion-card')?.remove();
}

function rechazar(id) { openCommentModal(id, 'RECHAZADA'); }
function regresar(id) { openCommentModal(id, 'REGRESADA'); }

function openCommentModal(id, action) {
    const title = action === 'RECHAZADA' ? 'Rechazar Solicitud' : 'Regresar Solicitud';
    const desc = action === 'RECHAZADA' ? 'Explique brevemente por qué se rechaza este registro.' : 'Indique los cambios o correcciones que el usuario debe realizar.';
    document.body.insertAdjacentHTML('beforeend', `
    <div id="comment-modal">
      <div class="modal-overlay" onclick="closeCommentModal()">
        <div class="modal-content" onclick="event.stopPropagation()">
          <h2 class="modal-title">${title}</h2>
          <p class="aprobaciones-subtitle" style="margin-bottom:1rem">${desc}</p>
          <textarea class="comment-textarea" id="comment-text" placeholder="Escriba sus comentarios aquí..."></textarea>
          <div class="modal-footer">
            <button class="btn-secondary" onclick="closeCommentModal()">Cancelar</button>
            <button class="btn-aprobacion ${action === 'RECHAZADA' ? 'btn-reject' : 'btn-return'}" onclick="submitComment(${id}, '${action}')">Confirmar</button>
          </div>
        </div>
      </div>
    </div>`);
}

function submitComment(id, action) {
    const text = document.getElementById('comment-text')?.value;
    if (action === 'REGRESADA' && !text?.trim()) { alert('Debe agregar un comentario para regresar la solicitud.'); return; }
    closeCommentModal();
    document.querySelector(`[onclick="rechazar(${id})"], [onclick="regresar(${id})"]`)?.closest('.aprobacion-card')?.remove();
}

function closeCommentModal() {
    document.getElementById('comment-modal')?.remove();
}
