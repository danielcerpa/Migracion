/**
 * PerfilesTutorial.js
 */
const PerfilesTutorial = {
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
            title: 'Perfiles de Acceso',
            description: 'Define las plantillas de permisos (Administrador, Investigador, etc.) del sistema.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#module-table',
          popover: {
            title: 'Matriz de Permisos',
            description: 'Observa qué acciones globales tiene permitido cada perfil.',
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

window.PerfilesTutorial = PerfilesTutorial;
