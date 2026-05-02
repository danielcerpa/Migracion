/**
 * PrestamosTutorial.js
 */
const PrestamosTutorial = {
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
          element: '#view-pres-general .screen-title',
          popover: {
            title: 'Control de Préstamos',
            description: 'Gestiona la salida de especímenes para investigación externa.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#prestamo-table-body',
          popover: {
            title: 'Estado de Préstamos',
            description: 'Monitorea qué ejemplares están fuera y sus fechas de retorno.',
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

window.PrestamosTutorial = PrestamosTutorial;
