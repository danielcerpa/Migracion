/**
 * FototecaTutorial.js
 */
const FototecaTutorial = {
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
          element: '#view-foto-general .screen-title',
          popover: {
            title: 'Fototeca Entomológica',
            description: 'Repositorio visual de la colección. Gestiona las fotografías de los ejemplares.',
            side: "bottom",
            align: 'start'
          }
        },
        {
          element: '#btn-alta-fototeca',
          popover: {
            title: 'Subir Material',
            description: 'Vincula nuevas fotografías a especímenes existentes.',
            side: "bottom",
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

window.FototecaTutorial = FototecaTutorial;
