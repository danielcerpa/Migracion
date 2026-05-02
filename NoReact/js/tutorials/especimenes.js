/**
 * EspecimenesTutorial.js
 */
const EspecimenesTutorial = {
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
          element: '#view-esp-general .screen-title',
          popover: {
            title: 'Inventario Biológico',
            description: 'Explora y gestiona la colección entomológica completa.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#especimen-cards-grid',
          popover: {
            title: 'Vista de Galería',
            description: 'Haz clic en "Ver Detalles" para la ficha técnica completa.',
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

window.EspecimenesTutorial = EspecimenesTutorial;
