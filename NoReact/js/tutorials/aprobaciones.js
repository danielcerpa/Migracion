/**
 * AprobacionesTutorial.js
 */
const AprobacionesTutorial = {
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
          element: '.aprobaciones-title',
          popover: {
            title: 'Módulo de Aprobaciones',
            description: 'Revisa y valida las solicitudes de registro de especímenes.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#aprobaciones-grid-container',
          popover: {
            title: 'Solicitudes Pendientes',
            description: 'Cada tarjeta es una propuesta que requiere tu revisión.',
            side: "top",
            align: 'center'
          }
        },
        {
          element: '.btn-accept',
          popover: {
            title: 'Aprobar',
            description: 'Confirma que los datos son correctos para integrar el espécimen.',
            side: "bottom",
            align: 'start'
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

window.AprobacionesTutorial = AprobacionesTutorial;
