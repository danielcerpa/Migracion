/**
 * UsuariosTutorial.js
 * Maneja el tour del módulo de usuarios de forma independiente.
 */
const UsuariosTutorial = {
  getDriver: function() {
    return window.driver.js.driver({
      animate: true,
      smoothScroll: true,
      allowClose: true,
      overlayColor: 'rgba(0, 0, 0, 0.9)',
      stagePadding: 10,
      stageRadius: 10,
      progressText: 'Paso {{current}} de {{total}}',
      nextBtnText: 'Siguiente',
      prevBtnText: 'Anterior',
      doneBtnText: 'Entendido',
      steps: [
        {
          element: '#view-general .screen-title',
          popover: {
            title: 'Gestión de Usuarios',
            description: 'Administra los usuarios, sus accesos y estados de seguridad.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '.header-actions',
          popover: {
            title: 'Acciones del Módulo',
            description: 'Crea, modifica o da de baja usuarios desde este panel.',
            side: "bottom",
            align: 'center'
          }
        },
        {
          element: '.search-wrapper',
          popover: {
            title: 'Búsqueda Dinámica',
            description: 'Filtra la lista de usuarios en tiempo real.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#module-table',
          popover: {
            title: 'Tabla de Datos',
            description: 'Haz clic en una fila para seleccionar un usuario.',
            side: "top",
            align: 'center'
          }
        }
      ]
    });
  },

  start: function() {
    window.driverObj = this.getDriver();
    window.driverObj.drive();
  },

  init: function() {
    const infoBtn = document.querySelector('.module-info-btn');
    if (infoBtn) {
      infoBtn.onclick = (e) => {
        e.preventDefault();
        this.start();
      };
    }
  }
};

window.UsuariosTutorial = UsuariosTutorial;
