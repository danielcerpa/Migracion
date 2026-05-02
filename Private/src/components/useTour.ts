import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const startSystemTour = () => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 1)',
    stagePadding: 6,
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
          description:
            'Este panel lateral es tu centro de navegación principal. Aquí encontrarás acceso a todos los módulos del sistema y sus funcionalidades.',
          side: 'right',
          align: 'center',
        },
      },
      {
        element: '#sidebar-collapse-btn',
        popover: {
          title: 'Colapsar/Expandir Panel',
          description:
            'Colapsa o expande el panel lateral para tener más espacio en la pantalla.',
          side: 'right',
          align: 'start',
          popoverClass: 'popover-step-2'
        },
      },
      {
        element: '#config-btn',
        popover: {
          title: 'Configuración',
          description:
            'Aquí encontrarás acceso a la configuración del sistema.',
          side: 'right',
          align: 'center',
          onNextClick: () => {
            const configBtn = document.querySelector<HTMLElement>('#config-btn');
            const panel = document.querySelector('.config-panel');
            if (configBtn && !panel) {
              configBtn.click();
            }
            setTimeout(() => {
              driverObj.moveNext();
            }, 100);
          }
        },
      },
      {
        element: '#theme-toggle',
        popover: {
          title: 'Cambio de Tema',
          description:
            'Alterna entre <strong>modo claro</strong> y <strong>modo oscuro</strong> según tu preferencia. El sistema recuerda tu elección.',
          side: 'right',
          align: 'center',
        },
      },
      {
        element: '#config-size-interface',
        popover: {
          title: 'Tamaño de Interfaz',
          description:
            'Ajusta el <strong>zoom de la interfaz</strong>: Normal, Grande o Muy Grande.',
          side: 'right',
          align: 'center',
        },
        onDeselected: () => {
          const configBtn = document.querySelector<HTMLElement>('#config-btn');
          const panel = document.querySelector('.config-panel');
          if (configBtn && panel) {
            configBtn.click();
          }
        }
      },
      {
        element: '#nav-dashboard',
        popover: {
          title: 'Panel de Control',
          description:
            'Regresa al <strong>Panel de Control principal</strong> en cualquier momento desde aquí. Es tu punto de inicio.',
          side: 'right',
          align: 'start',
        },
      },
      {
        element: '#nav-modules',
        popover: {
          title: 'Módulos del Sistema',
          description:
            'Los módulos están organizados por <strong>área</strong>. Haz clic en cualquier módulo para acceder a su funcionalidad específica.',
          side: 'right',    
          align: 'center',
        },
      },
      {
        element: '#logout-btn',
        popover: {
          title: 'Cerrar Sesión',
          description:
            'Cuando termines de trabajar, usa el botón <strong>Cerrar Sesión</strong> para salir de forma segura del sistema.',
          side: 'right',
          align: 'end',
        },
      },
      {
        element: '#tour-btn',
        popover: {
          title: 'Botón de Ayuda',
          description:
            'Puedes iniciar este tour en cualquier momento haciendo clic aquí.',
          side: 'left',
          align: 'end',
        },
      },
    ],
  });

  driverObj.drive();
};




export const startModuleTour = (moduleName: string) => {
  let moduleDesc = '';
  
  if (moduleName.toLowerCase().includes('usuario')) {
    moduleDesc = 'Aquí puedes gestionar a todos los usuarios del sistema.';
  } else if (moduleName.toLowerCase().includes('perfil')) {
    moduleDesc = 'Administra los diferentes perfiles del sistema y define sus permisos.';
  } else if (moduleName.toLowerCase().includes('fotot')) {
    moduleDesc = 'Accede y administra las imágenes o fotografías de la colección.';
  } else {
    moduleDesc = 'Administra los registros principales de este módulo.';
  }

  const driverObj = driver({
    showProgress: true,
    animate: true,
    smoothScroll: true,
    allowClose: true,
    overlayColor: 'rgba(0, 0, 0, 0.75)',
    stagePadding: 6,
    stageRadius: 10,
    progressText: 'Paso {{current}} de {{total}}',
    nextBtnText: 'Siguiente',
    prevBtnText: 'Anterior',
    doneBtnText: 'Entendido',
    steps: [
      {
        element: '#module-header-title',
        popover: {
          title: `Módulo de ${moduleName}`,
          description: moduleDesc,
          side: 'bottom',
          align: 'start',
        },
      },
      {
        element: '#btn-alta',
        popover: {
          title: 'Nuevo Registro',
          description: 'Utiliza este botón para agregar un nuevo registro a la base de datos.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#btn-actualizar',
        popover: {
          title: 'Actualizar',
          description: 'Selecciona este botón cuando necesites modificar la información de un registro existente.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#btn-eliminar',
        popover: {
          title: 'Eliminar / Baja',
          description: 'Permite dar de baja o eliminar un registro correspondiente de manera cautelosa.',
          side: 'bottom',
          align: 'center',
        },
      },
      {
        element: '#search-bar',
        popover: {
          title: 'Búsqueda Rápida',
          description: 'Escribe aquí para filtrar rápidamente los registros en la tabla inferior.',
          side: 'top',
          align: 'start',
        },
      }
    ]
  });

  driverObj.drive();
};

