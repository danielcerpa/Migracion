const CatalogosTutorial = {
  showProgress: true,
  animate: true,
  smoothScroll: true,
  allowClose: true,
  overlayColor: 'rgba(0, 0, 0, 0.9)',
  stagePadding: 6,
  stageRadius: 10,
  progressText: 'Paso {{current}} de {{total}}',
  nextBtnText: 'Siguiente',
  prevBtnText: 'Anterior',
  doneBtnText: 'Entendido',
  steps: [
    {
      element: '.dashboard-title',
      popover: {
        title: 'Panel de Catálogos',
        description: 'Administra las bases de datos maestras que alimentan las opciones de todo el sistema.',
        side: "bottom",
        align: 'start'
      }
    },
    {
      element: '.dashboard-category-section:nth-child(1)',
      popover: {
        title: 'Geografía',
        description: 'Gestiona la ubicación de los hallazgos: Países, Estados, Municipios y Localidades.',
        side: "top",
        align: 'start'
      }
    },
    {
      element: '.dashboard-category-section:nth-child(2)',
      popover: {
        title: 'Taxonomía',
        description: 'La jerarquía biológica central. Desde Órdenes y Familias hasta Especies y Tipos.',
        side: "top",
        align: 'start'
      }
    },
    {
      element: '.catalog-card',
      popover: {
        title: 'Acceso a Registros',
        description: 'Haz clic en cualquier tarjeta para gestionar sus registros específicos (Ver, Crear, Editar, Eliminar).',
        side: "bottom",
        align: 'center'
      }
    }
  ]
};

window.CatalogosTutorial = CatalogosTutorial;
