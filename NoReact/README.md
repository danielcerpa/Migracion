# Sistema de Gestión Entomológica

Esta es una versión del sistema migrada a tecnologías estándar de la web, sin el uso de React.

## Tecnologías Utilizadas

- **HTML5**: Estructura semántica.
- **CSS3**: Estilos personalizados con variables para soporte de temas (Claro/Oscuro).
- **Bootstrap 5**: Framework para componentes responsivos y layouts.
- **Vanilla JavaScript**: Lógica de aplicación, navegación dinámica (tipo SPA) y gestión de estado local.
- **Lucide Icons**: Iconografía moderna.

## Estructura del Proyecto

- `index.html`: Página de inicio y acceso (Login).
- `dashboard.html`: Estructura principal del panel de control con barra de navegación lateral.
- `css/`: Contiene los estilos modulares del sistema.
- `js/`: Contiene la lógica de login y el controlador del dashboard.
- `api/`: Contiene los archivos PHP para la API.
- `db.php`: Conexión a la base de datos.
- `v2.sql`: Script de la base de datos.

## Cómo ejecutar

En Xampp, copiar el folder "NoReact" a htdocs.

- Crear la db en phpmyadmin.
- Importar el archivo ¨v2.sql¨
- Si no quiren mover el puerto del servidor en xampp, en db.php cambiar el puerto del 3307 al 3306.
- Entra a http://localhost/NoReact

## Características Migradas

- [x] Login con validación y guardado de sesión (localStorage).
- [x] Barra de navegación lateral colapsable.
- [x] Soporte para Modo Oscuro y Modo Claro.
- [x] Navegación dinámica entre módulos.
- [x] Panel de Control con resumen de áreas.
- [x] Módulo de Catálogos (Vista de tabla).
- [x] Módulo de Especímenes (Vista de tarjetas/cards).

## Pendientes de Migración

- [ ] **Módulo de Usuarios**: Finalizar validación de permisos por módulo y perfil.
- [ ] **Módulo de Perfiles**: Implementar la gestión completa de permisos CRUD.
- [ ] **Módulo de Aprobaciones**: Refinar la vista de solicitudes y conexión con el flujo de creación de especímenes.
- [ ] **Módulo de Fototeca**: Implementar la carga real de archivos y gestión de galería.
- [ ] **Módulo de Préstamos**: Completar el flujo de seguimiento y devolución.
- [ ] **Refactorización de Formularios**:
  - Migrar los formularios extensos de _Alta_ y _Modificación_ (Especímenes) que contienen más de 50 campos en la versión original.
  - Implementar selectores dinámicos (Custom Selects) para catálogos vinculados (Países, Estados, Colectores, etc.).
- [ ] **Ficha Técnica**: Expandir el detalle del espécimen para incluir toda la información taxonómica y ecológica de la versión original.
- [ ] **Backend PHP**: Completar todos los endpoints de la API para cubrir las operaciones avanzadas de cada módulo.
- [ ] **Estilos Específicos**: Migrar los archivos CSS dedicados para Fototeca, Perfiles y Préstamos para recuperar la fidelidad visual original.
