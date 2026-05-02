/**
 * DashboardTutorial.js
 * Maneja el tour del panel principal de forma independiente.
 */
const DashboardTutorial = {
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
          element: '#sidebar',
          popover: {
            title: 'Panel Lateral',
            description: 'Este panel lateral es tu centro de navegación principal. Aquí encontrarás acceso a todos los módulos del sistema y sus funcionalidades.',
            side: 'right',
            align: 'center',
          },
        },
        {
          element: '#sidebar-collapse-btn',
          popover: {
            title: 'Colapsar/Expandir Panel',
            description: 'Colapsa o expande el panel lateral para tener más espacio en la pantalla.',
            side: 'right',
            align: 'start',
            popoverClass: 'popover-step-2'
          },
        },
        {
          element: '#config-btn',
          popover: {
            title: 'Configuración',
            description: 'Aquí encontrarás acceso a la configuración del sistema.',
            side: 'right',
            align: 'center',
            onNextClick: () => {
              const configBtn = document.querySelector('#config-btn');
              const panel = document.querySelector('.config-panel');
              if (configBtn && (!panel || panel.style.display === 'none')) {
                configBtn.click();
              }
              setTimeout(() => {
                window.driverObj.moveNext();
              }, 150);
            }
          },
        },
        {
          element: '#theme-toggle',
          popover: {
            title: 'Cambio de Tema',
            description: 'Alterna entre <strong>modo claro</strong> y <strong>modo oscuro</strong> según tu preferencia.',
            side: 'right',
            align: 'center',
          },
        },
        {
          element: '#scale-trigger',
          popover: {
            title: 'Tamaño de Interfaz',
            description: 'Ajusta el <strong>zoom de la interfaz</strong> según tu comodidad.',
            side: 'right',
            align: 'center',
          },
          onDeselected: () => {
            const configBtn = document.querySelector('#config-btn');
            const panel = document.querySelector('.config-panel');
            if (configBtn && panel && panel.style.display !== 'none') {
              configBtn.click();
            }
          }
        },
        {
          element: '#nav-dashboard',
          popover: {
            title: 'Panel de Control',
            description: 'Regresa al inicio en cualquier momento desde aquí.',
            side: 'right',
            align: 'start',
          },
        },
        {
          element: '#nav-modules-container',
          popover: {
            title: 'Módulos del Sistema',
            description: 'Accede a las funcionalidades específicas de cada área.',
            side: 'right',    
            align: 'center',
          },
        },
        {
          element: '#logout-btn',
          popover: {
            title: 'Cerrar Sesión',
            description: 'Sal de forma segura del sistema.',
            side: 'right',
            align: 'end',
          },
        }
      ]
    });
  },

  start: function() {
    window.driverObj = this.getDriver();
    window.driverObj.drive();
  },

  init: function() {
    const startBtn = document.querySelector('.control-panel-help-button');
    if (startBtn) {
      startBtn.onclick = (e) => {
        e.preventDefault();
        this.start();
      };
    }
  }
};

window.DashboardTutorial = DashboardTutorial;
