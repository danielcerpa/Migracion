# Sistema Privado - Documentación General

Este documento describe la arquitectura, módulos, funciones y desglose de archivos que conforman el Sistema Privado. Además, está profundamente detallado a nivel mantenedor para comprender las dependencias técnicas explícitas, flujos de datos y responsabilidades estructurales de cara al escalamiento o refactorización.

El sistema se compone de una arquitectura **Cliente-Servidor**.
- El **Frontend (Cliente)** está construido utilizando Vite, React.js y TypeScript.
- El **Backend (Servidor)** está desarrollado con Node.js y se encarga de proporcionar un API Rest para la gestión de la base de datos.

---

## 1. Frontend (`src/`)

Esta carpeta contiene todo el código fuente del cliente web. Los archivos están divididos por responsabilidades y componentes del sistema.

### Vistas y Módulos Principales (`src/vistas/`)
Los módulos o pantallas principales de la aplicación.
* **`Usuarios/`**: Módulo dedicado a la administración integral de los usuarios. Incluye vistas para creación (Alta), edición, listado y desactivación (Baja) de las cuentas de usuario.
  * Archivos: `Alta.tsx`, `Baja.tsx`, `General.tsx`, `Modificar.tsx`, `Usuarios.tsx`, `types.ts`.
* **`Perfiles/`**: Módulo para la configuración de roles o perfiles, administrando permisos sobre otros módulos del sistema.
  * Archivos: `Alta.tsx`, `Baja.tsx`, `General.tsx`, `Modificar.tsx`, `Perfiles.tsx`, `types.ts`.
* **`Catalogos/`**: Sistema de gestión de catálogos generales (País, Estado, Ciudad, Localidad, etc.). Esencial para mantener las tablas de soporte del sistema.
  * Archivos: `Alta.tsx`, `Baja.tsx`, `General.tsx`, `Modificar.tsx`, `Catalogos.tsx`, `types.ts`.
* **`Fototeca/`**: Galería y repositorio digital. Administra los recursos visuales del sistema (Altas, bajas de fotos, y consultas visuales).
  * Archivos: `Alta.tsx`, `Baja.tsx`, `General.tsx`, `Modificar.tsx`, `Fototeca.tsx`, `types.ts`.
* **`Login.tsx`**: Pantalla inicial para la autenticación en el sistema.
* **`Controlpanel.tsx`**: Panel principal (Dashboard) al que acceden los usuarios una vez autenticados con éxito. Muestra el resumen y acceso rápido a los módulos del sistema.
* **`provisional.tsx`**: Vista en desarrollo/temporal.

#### Estructura Estándar de los archivos por Módulo (Guía de Mantenimiento Explícita)
Dentro de cada módulo en `src/vistas/`, la lógica está fragmentada por las operaciones y vistas principales (sistema CRUD). Si vas a agregar un nuevo campo a la base de datos o arreglar fallos, este es el orden de intervención:

* **`[NombreDelModulo].tsx` (ej. `Usuarios.tsx`)**: 
  * *¿Qué es?*: Actúa como el contenedor o "enrutador interno" del módulo. Gestiona sub-rutas o pestañas mediante estados para decidir cuál componente hijo mostrar.
  * *Mantenimiento*: Si vas a agregar una nueva pestaña (Ej. "Exportar CSV"), la lógica de la barra navegadora de la vista, los botones y el gestor de estados (el cual decide desmontar `General.tsx` para montar `Alta.tsx`) ocurren aquí de manera exclusiva.
* **`General.tsx`**: 
  * *¿Qué es?*: Vista principal o de consulta (Read). Normalmente incluye un datatable o grid que muestra todos los registros de la base de datos.
  * *Mantenimiento*: Aquí es donde vive la petición GET (por ejemplo `GET /api/users`) empaquetada en un hook `useEffect`. La tabla (sus sentencias `<th>` y los valores `{row.campo_nuevo}`) se alimentan de esta estructura. Agrega columnas o filtros de búsqueda únicamente en este archivo.
* **`Alta.tsx`**: 
  * *¿Qué es?*: Vista de registro (Create). Aquí reside el formulario principal junto con las validaciones de front-end para crear e insertar nuevos elementos comunicándose con el Backend. Recibe `onBack` y `onSave` como Props desde su enrutador padre.
  * *Mantenimiento*: Carece de autogestión de envío actual en varias partes. Para inyectarle vida, hay que conectarle Hooks `useState` atados al atributo `value` en los diferentes campos o selects (por ejemplo el combo de permisos: admin, editor, capt, etc.), recabarlos en un JSON, y enviarlos a la API dentro del callback `onSave()`.
* **`Modificar.tsx`**: 
  * *¿Qué es?*: Vista de edición (Update). Carga la información de uno o más elemento existente para poder alterar en su estado/información y guardarlos con éxito.
  * *Mantenimiento*: Es una copia al carbón de `Alta.tsx` pero *requiere* en su renderizado inicial una precarga hacia la API (Ej `GET /api/user/:id`) rellenando todos sus Hooks con la información vieja, para emitir un PUT a la API en vez de un POST en su guardado final.
* **`Baja.tsx`**: 
  * *¿Qué es?*: Vista de eliminación (Delete). Pantalla donde se eligen ítems para su baja ya sea para borrarlos por completo (borrado físico) o desactivarlos (borrado lógico).
* **`types.ts`**: 
  * *¿Qué es?*: Archivo nativo de TypeScript. Contiene las definiciones de tipos e Interfaces (`interface`) correspondientes al módulo en curso para garantizar el tipado estricto.
  * *Mantenimiento*: Si alteras una tabla SQL desde PhpMyAdmin o similar agregando nuevas variables a los usuarios o perfiles, DEBES incluirlas aquí (ej `export interface Usuario { ... campo_nuevo: string }`) o React/TS impedirá la compilación con errores de tipeo.

### Componentes Compartidos (`src/components/`)
Componentes reutilizables que forman parte de la UI y no pertenecen a una vista en específico.
* **`Sidebar.tsx`**: Menú lateral de navegación, se encarga de mostrar los módulos a los que el usuario tiene acceso. *Mantenimiento*: Modifica las rutas (`<nav>`) para añadir links a nuevos módulos (validándolos contra los privilegios descritos por la API).
* **`AccessDeniedModal.tsx`**: Ventana modal que informa al usuario cuando intenta acceder a un recurso para el que no posee permisos suficientes.
* **`ErrorBoundary.tsx`**: Componente fundamental de React encargado de capturar y mostrar un fallback ante errores inesperados en el árbol de componentes impidiendo la Pantalla Blanca de la Muerte.
* **`useTour.ts`**: Hook abstracto de utilidad para el DOM enfocado en dirigir "tours guiados" resaltando partes del sistema para nuevos usuarios.

### Servicios (`src/services/`)
* **`api.ts`**: Contiene la configuración global de cliente para las solicitudes HTTP. Instancia el interceptor HTTP global para inyectar headers (Ej, JWT Token) que enviarán hacia el backend en TODAS las consultas simultáneas del proyecto.

### Capas adicionales (`src/`)
* **`layouts/ MainLayout.tsx`**: Pinta el esqueleto CSS Grid/Flex de la aplicación (abarca qué tamaño toma el sidebar vs cabecera vs la ruta central donde habitan las vistas).
* **`context/`**: Manejo de variables globales o sesiones (autenticación) que proveen a toda la aplicación con Context API sin caer en Prop Drilling.
* **`styles/` & `assets/` & `svgs/`**: El esqueleto visual. Hojas de estilos abstractas e iconos estáticos.

---

## 2. Backend Servidor (`server/`)

Aquí reside toda la lógica de negocio y exposición de la API para que el frontend interactúe con la base de datos. Está fundamentado en un riguroso esquema modular/MVC.

### Base y Entrada
* **`index.js`**: Es el archivo principal y punto de entrada del backend. Instancia el servidor Express, pre-configura middlewares como CORS o JSON body parser, e inyecta todos y cada uno de los archivos de rutas. *Mantenimiento*: Si creas un submódulo totalmente nuevo, debes registrar sus rutas en la sección final de los imports de este archivo.
* **Scripts SQL (`tablas.sql`, `catalogos.sql`)**: Archivos de apoyo fuera de la arquitectura que contienen las declaraciones `CREATE TABLE` originales para migrar del desarrollo al entorno de producción/hosting inicial.

### Configuración Crítica (`server/configuracion/`)
* **`db.js`**: El archivo encargado de establecer e instanciar la conexión MySQL estática (Crea el pool general o conector). 
  * *Mantenimiento*: Ante la mayoría de incidencias del tipo `ECONNREFUSED` (Pantallas vacías, desconexión fatal de APIs), aquí recaen las credenciales del HOST, DB, y USER correctas o mapeos `.env`. Todo debe enrutar vía las instancias exportadas acá hacia cada Modelo del sistema.

### Rutas HTTP (`server/rutas/`)
Define los "endpoints" expuestos. Separa el tráfico HTTP crudo, actuando como un conmutador dirigiendo al Controlador correcto. Aceptan los verbos GET, POST, PUT, DELETE asociándolos a métodos importados.
* **`rutasAuth.js`**: Define endpoints como `/login` para procesar inicios de sesión o verificar sesiones.
* **`rutasUsuario.js`**: Rutas exclusivas para tabla usuarios (Añadir un endpoint para cancelar o habilitar un usuario se codearía aquí usando `router.put('/:id/estado', ...)`).
* **`rutasPerfil.js`**: Enrutador para manejar operaciones de los roles.
* **`rutasModulo.js`**: Expone de manera plana todos los listados de módulos accesibles para llenar combos de la UI.
* **`rutasCatalogo.js`**: En vez de poseer N modelos redundantes, expone generalidades parametrizables por "nombreDeTabla".

### Controladores (`server/controladores/`)
Contienen en exclusivo el 100% núcleo de la lógica de negocio de la entidad asociada. Resguardan y dirigen las comprobaciones del request originado en el frontal antes de ir al SQL propiamente.
* **Responsabilidades y Mantenimiento:** Su interior debe ser programado SIEMPRE con envolturas `try-catch`. Deben recibir `(req, res)` validar que la información mandada en `req.body` está íntegra y luego pedirle la orden al Modelo, devolviendo un `res.json(resultado)` o en su defecto un `res.status(500).json(...)`.
* **`authControlador.js`**: Recibe credenciales, comprueba hashes (`usuarioModelo.authenticate(...)`) y emite objetos de Web Tokens hacia la frontal como prueba criptográfica del logueo.
* **`usuarioControlador.js`**: Contiene métodos como `getUsers`. Si un usuario nuevo no debe tener correos repetidos, la validación final se impone en este script consultándolo primeramente ante modelo.
* **`perfilControlador.js`**: Lógica abstracta de permisos (qué CRUD se ejecuta sobre las uniones o tablas foráneas).
* **`moduloControlador.js`**: Gestión simple en listas.
* **`catalogoControlador.js`**: Capa transaccional para agregar/eliminar items base como un País o Ciudad.

### Modelos (`server/modelos/`)
Se asocian directamente y sin intermediarios con el Motor SQL de bases de datos de `db.js`.
* **Responsabilidades y Mantenimiento**: Este bloque NO manipula ni conoce el concepto de Req o Res, ni tokens. Cada método (`static async getX() {}`) encapsula consultas desinfectadas contra inyección SQL puras empleando por lo general arrays de parámetros preparados. Es el único estrato capaz de realizar afectos permanentes a disco. Modificar nombres foráneos, joins que fallan, o adaptaciones por cambio de bases a Postgres se realiza solamente desde aquí.
* **`usuarioModelo.js`**: Archivo con querys de comprobación de autenticidad `SELECT * FROM user...` o `JOIN` complejos hacia `permissions` o listados totales (`getAllUsers`).
* **`perfilModelo.js`**: Archivo con consultas CRUD exclusivas de perfiles/roles.
* **`moduloModelo.js`**: Mapeo SQL con tablas de sistemas preinstalados.
* **`catalogoModelo.js`**: Archivo con métodos parametrizados. Permite que con un sólo archivo se ejecuten consultas escalables sobre cualquier tipo de tabla satélite recibiendo el nombre de la tabla por propiedad para inyectarlo en SQL.
