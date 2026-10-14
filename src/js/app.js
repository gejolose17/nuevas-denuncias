/**
 * UAM ReportHub - Main Application Controller
 * Coordina las vistas, pestañas, sesión de usuario, autenticación institucional y eventos reactivos del sistema.
 */

import { storage } from './services/storage.js';
import { authService } from './services/authService.js';
import { LoginView } from './views/loginView.js';
import { RegisterCaseView } from './views/registerCaseView.js';
import { ManageCaseView } from './views/manageCaseView.js';
import { AlertTrackingView } from './views/alertTrackingView.js';
import { HistoryView } from './views/historyView.js';
import { ConfigView } from './views/configView.js';
import { TrashView } from './views/trashView.js';
import { toast } from './components/toast.js';

class App {
  constructor() {
    this.mainContainer = document.getElementById('app-main-content');
    this.appLayoutEl = document.getElementById('app-layout');
    this.loginScreenEl = document.getElementById('login-screen');
    this.activeTab = 'seguimiento'; // Default to dashboard for immediate overview
    this.selectedCaseIdForManage = null;
    this.loginViewInstance = null;
    this.hasInitializedApp = false;

    // View instances
    this.views = {
      registrar: null,
      registrado: null,
      seguimiento: null,
      historico: null,
      configuracion: null,
      papelera: null
    };

    // Estado visual inicial inmediato: NUNCA mostrar la app interna sin sesión confirmada
    if (authService.isAuthenticated()) {
      this.showAppLayout();
    } else {
      this.showLoginScreen();
    }

    this.init();
  }

  async init() {
    // 1. Escuchar cambios de autenticación
    authService.subscribe((event, data) => {
      if (event === 'AUTH_STATE_CHANGED') {
        if (data.state === 'logged_in') {
          this.showAppLayout();
        } else if (data.state === 'logged_out') {
          this.showLoginScreen();
        }
      }
    });

    // 2. Escuchar eventos de almacenamiento
    storage.subscribe((eventType, payload) => {
      if (authService.isAuthenticated()) {
        this.updateTabBadges();
        if (eventType === 'CURRENT_USER_CHANGED') {
          this.updateUserSessionUI();
        }
      }
    });

    // 3. Inicializar MSAL y procesar retorno de redirección de Microsoft Entra ID
    await authService.init();

    // 4. Si tras el retorno de Microsoft se autenticó exitosamente
    if (authService.isAuthenticated()) {
      this.showAppLayout();
    } else if (authService.lastAuthError) {
      this.showLoginScreen(authService.lastAuthError);
    }
  }

  showLoginScreen(errorMessage = null) {
    if (this.appLayoutEl) this.appLayoutEl.style.display = 'none';
    if (this.loginScreenEl) {
      this.loginScreenEl.style.display = 'flex';
      this.loginViewInstance = new LoginView(this.loginScreenEl, (session) => {
        this.showAppLayout();
      });
      if (errorMessage) {
        this.loginViewInstance.errorMessage = errorMessage;
      }
      this.loginViewInstance.render();
    }
  }

  showAppLayout() {
    if (this.loginScreenEl) this.loginScreenEl.style.display = 'none';
    if (this.appLayoutEl) this.appLayoutEl.style.display = 'flex';

    if (!this.hasInitializedApp) {
      this.bindTabNavigation();
      this.bindHashRouting();
      this.hasInitializedApp = true;
    }

    this.updateUserSessionUI();
    this.updateTabBadges();

    // Cargar la pestaña activa actual
    const getCleanHash = () => window.location.hash.replace('#', '').trim();
    const initialHash = getCleanHash();
    if (['registrar', 'registrado', 'seguimiento', 'historico', 'configuracion', 'papelera'].includes(initialHash)) {
      this.switchTab(initialHash);
    } else {
      this.switchTab('seguimiento');
    }

    // Bienvenida Toast
    const currentUser = storage.getCurrentUser();
    setTimeout(() => {
      toast.info(`Bienvenido a UAM ReportHub, ${currentUser.nombre}.`, 'Sesión Activa');
    }, 300);
  }

  bindHashRouting() {
    const getCleanHash = () => window.location.hash.replace('#', '').trim();
    window.addEventListener('hashchange', () => {
      if (!authService.isAuthenticated()) return;
      const h = getCleanHash();
      if (['registrar', 'registrado', 'seguimiento', 'historico', 'configuracion', 'papelera'].includes(h)) {
        if (this.activeTab !== h) {
          this.switchTab(h);
        }
      }
    });
  }

  updateUserSessionUI() {
    const user = storage.getCurrentUser();
    const nameEl = document.getElementById('user-display-name');
    const roleEl = document.getElementById('user-display-role');
    const emailEl = document.getElementById('user-display-email');
    const avatarEl = document.getElementById('user-avatar-text');
    const dateEl = document.getElementById('top-live-date');

    if (nameEl) nameEl.textContent = user.nombre;
    if (roleEl) roleEl.textContent = user.rol;
    if (emailEl) emailEl.textContent = user.email;
    if (avatarEl) {
      const parts = user.nombre.split(' ');
      const initials = parts.length > 1 ? `${parts[0][0]}${parts[1][0]}` : user.nombre.substring(0, 2);
      avatarEl.textContent = initials.toUpperCase();
    }
    if (dateEl) {
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      dateEl.textContent = new Date().toLocaleDateString('es-NI', options);
    }
  }

  updateTabBadges() {
    const cases = storage.getCases();
    const pendingCases = cases.filter(c => c.estado !== 'Concluido y Notificado').length;
    const alertCount = cases.filter(c => c.faseActual === 1 || c.faseActual === 2).length;
    const trashCount = storage.getTrash().length;

    const badgeTotal = document.getElementById('tab-badge-total');
    const badgeReg = document.getElementById('tab-badge-registrados');
    const badgeAlert = document.getElementById('tab-badge-alertas');
    const badgePapelera = document.getElementById('tab-badge-papelera');

    if (badgeTotal) badgeTotal.textContent = cases.length;
    if (badgeReg) badgeReg.textContent = pendingCases;
    if (badgeAlert) badgeAlert.textContent = alertCount;
    if (badgePapelera) badgePapelera.textContent = trashCount;
  }

  bindTabNavigation() {
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        this.switchTab(targetTab);
      });
    });

    // Brand link clicks
    const brandLink = document.getElementById('brand-link');
    if (brandLink) {
      brandLink.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchTab('seguimiento');
      });
    }

    // User session chip click quick-switches to config
    const userChip = document.getElementById('user-session-chip');
    if (userChip) {
      userChip.addEventListener('click', () => {
        this.switchTab('configuracion');
      });
    }

    // Botón Cerrar Sesión en Sidebar
    const btnLogout = document.getElementById('btn-sidebar-logout');
    if (btnLogout) {
      btnLogout.addEventListener('click', async () => {
        if (confirm('¿Desea cerrar la sesión activa de UAM ReportHub?')) {
          await authService.logout();
          toast.info('Sesión finalizada.', 'Cierre de Sesión');
        }
      });
    }
  }

  switchTab(tabName, customParam = null) {
    if (!authService.isAuthenticated()) return;

    this.activeTab = tabName;
    window.location.hash = tabName;

    // Update tab button classes
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
      const isTarget = btn.getAttribute('data-tab') === tabName;
      btn.classList.toggle('is-active', isTarget);
    });

    // Render corresponding view
    this.renderCurrentView(customParam);
  }

  renderCurrentView(customParam = null) {
    if (!this.mainContainer || !authService.isAuthenticated()) return;

    switch (this.activeTab) {
      case 'registrar':
        this.views.registrar = new RegisterCaseView(this.mainContainer, (newCase) => {
          this.selectedCaseIdForManage = newCase.id;
          this.switchTab('registrado', newCase.id);
        });
        this.views.registrar.render();
        break;

      case 'registrado':
        const caseIdToLoad = customParam || this.selectedCaseIdForManage;
        this.views.registrado = new ManageCaseView(
          this.mainContainer,
          caseIdToLoad,
          (closedCase) => {
            this.switchTab('seguimiento');
          },
          (closedCaseNoAdmission) => {
            this.switchTab('historico');
          }
        );
        this.views.registrado.render();
        break;

      case 'seguimiento':
        this.views.seguimiento = new AlertTrackingView(
          this.mainContainer,
          (caseIdToManage) => {
            this.selectedCaseIdForManage = caseIdToManage;
            this.switchTab('registrado', caseIdToManage);
          }
        );
        this.views.seguimiento.render();
        break;

      case 'historico':
        this.views.historico = new HistoryView(
          this.mainContainer,
          (caseIdToManage) => {
            this.selectedCaseIdForManage = caseIdToManage;
            this.switchTab('registrado', caseIdToManage);
          }
        );
        this.views.historico.render();
        break;

      case 'configuracion':
        this.views.configuracion = new ConfigView(
          this.mainContainer,
          (newUser) => {
            this.updateUserSessionUI();
          }
        );
        this.views.configuracion.render();
        break;

      case 'papelera':
        this.views.papelera = new TrashView(
          this.mainContainer,
          (targetTab, targetId) => {
            this.switchTab(targetTab, targetId);
          }
        );
        this.views.papelera.render();
        break;

      default:
        this.switchTab('seguimiento');
        break;
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

// Start application on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.uamApp = new App();
});
