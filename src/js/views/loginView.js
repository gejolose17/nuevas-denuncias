/**
 * UAM ReportHub - Login View
 * Interfaz institucional de autenticación con cuentas corporativas Microsoft (@uam.net.ni).
 */

import { authService } from '../services/authService.js';
import { toast } from '../components/toast.js';

export class LoginView {
  constructor(containerEl, onLoginSuccess = null) {
    this.container = containerEl;
    this.onLoginSuccess = onLoginSuccess;
    this.errorMessage = null;
    this.isLoading = false;
    this.showTestSection = false;
  }

  render() {
    if (!this.container) return;

    const azureConfig = authService.getAzureConfig();
    const isConfigured = azureConfig.clientId &&
      azureConfig.clientId !== 'tu_client_id_de_azure' &&
      azureConfig.clientId !== 'YOUR_AZURE_CLIENT_ID' &&
      azureConfig.clientId.length > 10;

    this.container.innerHTML = `
      <div class="login-card">
        <!-- CABECERA INSTITUCIONAL -->
        <div class="login-header">
          <img src="./image/logo.png" alt="UAM ReportHub" class="login-logo-img" onerror="this.style.display='none'" />
          <span class="login-badge-sys">Sistema Institucional</span>
          <h1 class="login-title">UAM ReportHub</h1>
          <p class="login-subtitle">Gestión Integral, Dictamen y Seguimiento de Denuncias Universitarias</p>
        </div>

        <!-- AVISO DE RESTRICCIÓN DE DOMINIO -->
        <div class="login-domain-notice">
          <div class="login-notice-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <p class="login-notice-text">
            <strong>Acceso Restringido:</strong> Exclusivo para autoridades, docentes y personal institucional con cuenta corporativa <span class="login-domain-highlight">@uam.net.ni</span>.
          </p>
        </div>

        <!-- ALERTA DE ERROR SI EXISTE -->
        ${this.errorMessage ? `
          <div class="login-error-alert" id="login-error-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="flex-shrink:0;">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
            <div>
              <strong>Error de Acceso:</strong>
              <div>${this.escapeHtml(this.errorMessage)}</div>
            </div>
          </div>
        ` : ''}

        <!-- BOTÓN PRINCIPAL MICROSOFT SSO -->
        <button type="button" class="btn-microsoft-auth" id="btn-ms-login" ${this.isLoading ? 'disabled' : ''}>
          <!-- Icono Oficial 4 Cuadros Microsoft -->
          <svg class="ms-logo-svg" viewBox="0 0 21 21">
            <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
            <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
            <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
            <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
          </svg>
          <span>${this.isLoading ? 'Verificando credenciales...' : 'Iniciar sesión con Microsoft (@uam.net.ni)'}</span>
        </button>

        <!-- PANEL DE VERIFICACIÓN / DIAGNÓSTICO -->
        <div class="login-test-section">
          <div class="login-test-header" id="toggle-test-section">
            <span>⚙️ Opciones de Diagnóstico & Modo Demo</span>
            <span id="test-section-arrow">${this.showTestSection ? '▲' : '▼'}</span>
          </div>

          <div class="login-test-content" id="test-content-area" style="display: ${this.showTestSection ? 'flex' : 'none'};">
            <!-- Estado de configuración Azure -->
            <div>
              <span class="azure-status-badge ${isConfigured ? 'is-connected' : 'is-pending'}">
                ${isConfigured ? '● Microsoft Entra ID Configurado' : '○ Modo Local / Demo (Client ID pendiente)'}
              </span>
            </div>

            <!-- Botón de prueba rápida Superadmin autorizada -->
            <button type="button" class="btn-test-action" id="btn-demo-superadmin">
              <span>👤 Probar ingreso como Ing. Gerardo López (@uam.net.ni)</span>
            </button>

            <!-- Botón de prueba para verificar RECHAZO de dominio ajeno -->
            <button type="button" class="btn-test-action btn-test-reject" id="btn-demo-reject">
              <span>🚫 Probar bloqueo con cuenta no institucional (ej. usuario@gmail.com)</span>
            </button>

            <!-- Formulario de configuración de Azure Client ID -->
            <div class="azure-config-form">
              <span class="azure-input-label">Azure Application (Client) ID:</span>
              <input type="text" class="azure-input-field" id="cfg-client-id" value="${this.escapeHtml(azureConfig.clientId)}" placeholder="Ej: 12345678-abcd-1234-ef01-123456789abc" />

              <span class="azure-input-label">Azure Directory (Tenant) ID:</span>
              <input type="text" class="azure-input-field" id="cfg-tenant-id" value="${this.escapeHtml(azureConfig.tenantId)}" placeholder="organizations o tu Tenant ID" />

              <div style="display: flex; gap: 8px; margin-top: 4px;">
                <button type="button" class="btn-test-action" id="btn-save-azure" style="background: var(--uam-teal); color: #fff; border-color: var(--uam-teal); flex: 1;">
                  Guardar Credenciales
                </button>
                <button type="button" class="btn-test-action" id="btn-reset-azure" style="width: auto;">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- PIE DE TARJETA -->
        <div class="login-footer-info">
          © 2026 Universidad Americana • Managua, Nicaragua<br/>
          Dirección de Tecnología y Sistemas Institucionales
        </div>
      </div>
    `;

    this.bindEvents();
  }

  bindEvents() {
    // Botón Iniciar Sesión con Microsoft
    const btnMsLogin = this.container.querySelector('#btn-ms-login');
    if (btnMsLogin) {
      btnMsLogin.addEventListener('click', async () => {
        const azureConfig = authService.getAzureConfig();
        const hasValidClientId = azureConfig.clientId &&
          azureConfig.clientId !== 'tu_client_id_de_azure' &&
          azureConfig.clientId !== 'YOUR_AZURE_CLIENT_ID' &&
          azureConfig.clientId.length > 10;

        if (!hasValidClientId) {
          this.errorMessage = 'Para iniciar sesión con Microsoft en vivo, configure el "Azure Client ID" en el panel de opciones abajo o en las variables de entorno de Vercel (VITE_AZURE_CLIENT_ID).';
          this.showTestSection = true;
          this.render();
          return;
        }

        try {
          this.isLoading = true;
          this.errorMessage = null;
          this.render();
          const session = await authService.loginWithMicrosoft();
          toast.success(`Bienvenido, ${session.nombre}`, 'Acceso Institucional Autorizado');
          if (this.onLoginSuccess) this.onLoginSuccess(session);
        } catch (err) {
          this.isLoading = false;
          this.errorMessage = err.message || 'Error al autenticar con Microsoft.';
          this.render();
        }
      });
    }

    // Toggle de la sección de diagnóstico
    const toggleHeader = this.container.querySelector('#toggle-test-section');
    if (toggleHeader) {
      toggleHeader.addEventListener('click', () => {
        this.showTestSection = !this.showTestSection;
        const area = this.container.querySelector('#test-content-area');
        const arrow = this.container.querySelector('#test-section-arrow');
        if (area) area.style.display = this.showTestSection ? 'flex' : 'none';
        if (arrow) arrow.textContent = this.showTestSection ? '▲' : '▼';
      });
    }

    // Probar ingreso con cuenta Superadmin @uam.net.ni
    const btnDemoSuperadmin = this.container.querySelector('#btn-demo-superadmin');
    if (btnDemoSuperadmin) {
      btnDemoSuperadmin.addEventListener('click', async () => {
        try {
          this.isLoading = true;
          const session = await authService.loginDemo('gerardo.lopez@uam.net.ni');
          toast.success(`Sesión iniciada con éxito como ${session.nombre} (${session.email})`, 'Acceso Concedido');
          if (this.onLoginSuccess) this.onLoginSuccess(session);
        } catch (err) {
          this.errorMessage = err.message;
          this.isLoading = false;
          this.render();
        }
      });
    }

    // Probar bloqueo de correo NO institucional
    const btnDemoReject = this.container.querySelector('#btn-demo-reject');
    if (btnDemoReject) {
      btnDemoReject.addEventListener('click', async () => {
        try {
          // Intentar ingresar con cuenta personal ajena
          await authService.loginDemo('usuario.externo@gmail.com');
        } catch (err) {
          this.errorMessage = err.message;
          toast.error(err.message, 'Restricción de Dominio');
          this.render();
        }
      });
    }

    // Guardar credenciales de Azure
    const btnSaveAzure = this.container.querySelector('#btn-save-azure');
    if (btnSaveAzure) {
      btnSaveAzure.addEventListener('click', () => {
        const clientIdEl = this.container.querySelector('#cfg-client-id');
        const tenantIdEl = this.container.querySelector('#cfg-tenant-id');
        const newClientId = clientIdEl ? clientIdEl.value.trim() : '';
        const newTenantId = tenantIdEl ? tenantIdEl.value.trim() : 'organizations';

        authService.saveAzureConfig({
          clientId: newClientId,
          tenantId: newTenantId,
          redirectUri: window.location.origin
        });

        toast.success('Credenciales de Azure AD actualizadas en el navegador.', 'Configuración Guardada');
        this.errorMessage = null;
        this.render();
      });
    }

    // Resetear credenciales
    const btnResetAzure = this.container.querySelector('#btn-reset-azure');
    if (btnResetAzure) {
      btnResetAzure.addEventListener('click', () => {
        authService.resetAzureConfig();
        toast.info('Credenciales de Azure restablecidas a los valores de entorno.', 'Restablecido');
        this.render();
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
