/**
 * UAM ReportHub - Institutional Login View
 * Autenticación corporativa exclusiva con Microsoft Entra ID (@uam.net.ni).
 */

import { authService } from '../services/authService.js';
import { toast } from '../components/toast.js';

export class LoginView {
  constructor(containerEl, onLoginSuccess = null) {
    this.container = containerEl;
    this.onLoginSuccess = onLoginSuccess;
    this.errorMessage = null;
    this.isLoading = false;
  }

  render() {
    if (!this.container) return;

    this.container.innerHTML = `
      <div class="login-card">
        <!-- CABECERA INSTITUCIONAL UAM -->
        <div class="login-header">
          <img src="./image/logo.png" alt="Universidad Americana (UAM)" class="login-logo-img" onerror="this.style.display='none'" />
          <span class="login-badge-sys">Portal Oficial Institucional</span>
          <h1 class="login-title">UAM ReportHub</h1>
          <p class="login-subtitle">Sistema Integral de Denuncias Universitarias y Trazabilidad SETEC</p>
        </div>

        <!-- AVISO DE ACCESO RESTRINGIDO A DOMINIO UAM -->
        <div class="login-domain-notice">
          <div class="login-notice-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <p class="login-notice-text">
            <strong>Acceso Corporativo Exclusivo:</strong> Sistema restringido a personal docente, autoridades y funcionarios universitarios con correo institucional activo <span class="login-domain-highlight">@uam.net.ni</span>.
          </p>
        </div>

        <!-- ALERTA DE ERROR SI EXISTE -->
        ${this.errorMessage ? `
          <div class="login-error-alert" id="login-error-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div style="flex: 1;">
              <strong>Error de Autenticación:</strong>
              <div style="margin-top: 2px;">${this.escapeHtml(this.errorMessage)}</div>
            </div>
          </div>
        ` : ''}

        <!-- BOTÓN EXCLUSIVO MICROSOFT SSO CORPORATIVO -->
        <button type="button" class="btn-microsoft-auth" id="btn-ms-login" ${this.isLoading ? 'disabled' : ''}>
          <!-- Icono Oficial Microsoft 4 Colores -->
          <svg class="ms-logo-svg" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          <span>${this.isLoading ? 'Verificando cuenta en Microsoft...' : 'Iniciar sesión con cuenta Microsoft (@uam.net.ni)'}</span>
        </button>

        <!-- PIE DE TARJETA INSTITUCIONAL -->
        <div class="login-footer-info">
          © 2026 Universidad Americana • Managua, Nicaragua<br/>
          Dirección de Tecnología, Sistemas y Transformación Digital
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    const btnMsLogin = this.container.querySelector('#btn-ms-login');
    if (btnMsLogin) {
      btnMsLogin.addEventListener('click', async () => {
        try {
          this.isLoading = true;
          this.errorMessage = null;
          this.render();

          const session = await authService.loginWithMicrosoft();
          if (session) {
            toast.success(`Bienvenido a UAM ReportHub, ${session.nombre}`, 'Acceso Autorizado');
            if (this.onLoginSuccess) this.onLoginSuccess(session);
          }
        } catch (err) {
          this.isLoading = false;
          let msg = err.message || 'No se pudo completar la autenticación con Microsoft.';

          // Limpiar mensajes técnicos para el usuario final
          if (msg.includes('user_cancelled')) {
            msg = 'Inicio de sesión cancelado por el usuario.';
          } else if (msg.includes('popup_window_error') || msg.includes('blocked')) {
            msg = 'El navegador bloqueó la ventana de Microsoft. Por favor autorice las ventanas emergentes (popups) o intente de nuevo.';
          } else if (msg.includes('AADSTS50011')) {
            msg = 'Error de configuración en Azure: La URL de redirección no coincide con la registrada en el portal de Microsoft Entra ID.';
          } else if (msg.includes('AADSTS50020')) {
            msg = 'La cuenta utilizada no existe en el directorio de la organización UAM o no tiene permisos asignados.';
          }

          this.errorMessage = msg;
          this.render();
        }
      });
    }
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
