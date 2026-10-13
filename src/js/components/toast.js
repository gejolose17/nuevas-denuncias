/**
 * Toast Notification System
 * Proporciona notificaciones elegantes, accesibles y temporizadas.
 */

class ToastService {
  constructor() {
    this.container = null;
    this.init();
  }

  init() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }
    this.container = container;
  }

  show({ title = '', message = '', type = 'info', duration = 4000 }) {
    if (!this.container) this.init();

    const toast = document.createElement('div');
    toast.className = `toast-item toast-${type}`;

    const iconSvg = this.getIcon(type);

    toast.innerHTML = `
      <div class="toast-icon-wrap">${iconSvg}</div>
      <div class="toast-content">
        ${title ? `<strong class="toast-title">${title}</strong>` : ''}
        <p class="toast-msg">${message}</p>
      </div>
      <button type="button" class="toast-close" aria-label="Cerrar">&times;</button>
      <div class="toast-progress"></div>
    `;

    this.container.appendChild(toast);

    // Animate in
    requestAnimationFrame(() => {
      toast.classList.add('is-visible');
    });

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.remove('is-visible');
      toast.classList.add('is-hiding');
      setTimeout(() => {
        if (toast.parentNode) {
          toast.parentNode.removeChild(toast);
        }
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);

    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  }

  success(message, title = 'Éxito') {
    this.show({ title, message, type: 'success' });
  }

  error(message, title = 'Error') {
    this.show({ title, message, type: 'error', duration: 5500 });
  }

  warning(message, title = 'Atención') {
    this.show({ title, message, type: 'warning', duration: 4500 });
  }

  info(message, title = 'Información') {
    this.show({ title, message, type: 'info' });
  }

  getIcon(type) {
    switch (type) {
      case 'success':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
      case 'error':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
      case 'warning':
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
      default:
        return `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }
  }
}

export const toast = new ToastService();
