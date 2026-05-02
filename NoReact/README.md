# Sistema de Gestión Entomológica (NoReact)

Versión migrada sin React: HTML, CSS, Bootstrap 5, JavaScript y API PHP según `v2.sql`.

## Ejecutar (XAMPP)

Copiar la carpeta `NoReact` a `htdocs`, crear la base, importar `v2.sql`, ajustar `api/db.php` (puerto 3307/3306). Entrada: `http://localhost/NoReact/`.

La **fototeca** guarda archivos en `uploads/fototeca/`; Apache/PHP necesitan permiso de escritura en esa ruta.

## Migrado

- Login, permisos en localStorage, sidebar, temas, módulos dinámicos.
- Usuarios (matriz módulo/perfil; no permite dejar todo en «Sin Acceso»).
- Perfiles CRUD, catálogos, especímenes, panel.
- Aprobaciones con API (aprobar filtra columnas de `especimenes`; rechazar/registrar revisión).
- Fototeca: subida real (multipart) o URL.
- Préstamos alineados con `prestamo` en SQL, autollenado de espécimen, «Registrar devolución».
- `especimenes.php?id=` para detalle de un espécimen.
- CSS: `css/fototeca.css`, `css/perfiles.css`, `css/prestamos.css`.
- **Solicitud de alta** (sin permiso de alta): vista «Solicitar registro», `solicitudes_especimen.php`, panel «Mis solicitudes».
- Formularios de espécimenes con **selects** rellenados desde `catalogos.php` (`js/especimenCatalogos.js`).
- **Ficha técnica** ampliada (taxonomía, colecta, ubicación, ecología, control) según columnas `_nombre` del listado API.
- Módulo **Reportes**: `views/reportes/reportes.html`, `reportes.php` (conteos), exportación CSV rápida de activos.

## Pendiente / mejoras futuras

- Dependencias en cascada (estado filtrado por país, etc.) en los selects.
- Más tipos de reporte o exportaciones (PDF, filtros por fecha).
