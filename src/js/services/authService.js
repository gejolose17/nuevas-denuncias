/**
 * UAM ReportHub - Authentication Service (Microsoft Entra ID / Azure AD)
 * Gestiona inicio de sesión con cuentas corporativas institucionales dominio @uam.net.ni.
 */

import { PublicClientApplication } from '@azure/msal-browser';
import { storage } from './storage.js';

const AUTH_STORAGE_KEY = 'uam_reporthub_auth_session_v1';
const AZURE_CONFIG_KEY = 'uam_reporthub_azure_config_v1';

class AuthService {
  constructor() {
    this.msalInstance = null;
    this.isInitialized = false;
    this.listeners = new Set();
    this.allowedDomains = ['uam.net.ni', 'uam.edu.ni'];
    this.primaryDomain = 'uam.net.ni';
  }

  /**
   * Obtiene la configuración de Azure AD desde variables de entorno de Vite o localStorage.
   */
  getAzureConfig() {
    const saved = localStorage.getItem(AZURE_CONFIG_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.clientId) {
          return {
            clientId: parsed.clientId.trim(),
            tenantId: (parsed.tenantId || 'organizations').trim(),
            redirectUri: parsed.redirectUri || window.location.origin
          };
        }
      } catch (e) {
        // Fallback a env
      }
    }

    const rawRedirect = (import.meta.env.VITE_AZURE_REDIRECT_URI || '').trim();
    // En Microsoft Entra ID (SPA), los redirect URIs no deben contener '#' (fragmentos)
    const cleanRedirect = rawRedirect ? rawRedirect.split('#')[0] : window.location.origin;

    return {
      clientId: (import.meta.env.VITE_AZURE_CLIENT_ID || '').trim(),
      tenantId: (import.meta.env.VITE_AZURE_TENANT_ID || 'organizations').trim(),
      redirectUri: cleanRedirect || window.location.origin
    };
  }

  /**
   * Permite guardar la configuración de Azure AD directamente en el navegador.
   */
  saveAzureConfig(config) {
    const cleanConfig = {
      clientId: (config.clientId || '').trim(),
      tenantId: (config.tenantId || 'organizations').trim(),
      redirectUri: (config.redirectUri || window.location.origin).trim()
    };
    localStorage.setItem(AZURE_CONFIG_KEY, JSON.stringify(cleanConfig));
    this.isInitialized = false;
    this.msalInstance = null;
    this.notify('CONFIG_UPDATED', cleanConfig);
  }

  /**
   * Restablece la configuración de Azure a los valores por defecto de entorno.
   */
  resetAzureConfig() {
    localStorage.removeItem(AZURE_CONFIG_KEY);
    this.isInitialized = false;
    this.msalInstance = null;
    this.notify('CONFIG_UPDATED', this.getAzureConfig());
  }

  /**
   * Inicializa la instancia MSAL si existe un Client ID configurado.
   */
  async init() {
    if (this.isInitialized && this.msalInstance) return;

    const config = this.getAzureConfig();
    const hasValidClientId = config.clientId &&
      config.clientId !== 'tu_client_id_de_azure' &&
      config.clientId !== 'YOUR_AZURE_CLIENT_ID' &&
      config.clientId.length > 10;

    if (hasValidClientId) {
      try {
        const msalConfig = {
          auth: {
            clientId: config.clientId,
            authority: `https://login.microsoftonline.com/${config.tenantId || 'organizations'}`,
            redirectUri: config.redirectUri || window.location.origin
          },
          cache: {
            cacheLocation: 'localStorage',
            storeAuthStateInCookie: false
          }
        };

        this.msalInstance = new PublicClientApplication(msalConfig);
        await this.msalInstance.initialize();

        // Procesar respuesta si se retornó de un redirect previo
        const redirectResponse = await this.msalInstance.handleRedirectPromise();
        if (redirectResponse && redirectResponse.account) {
          await this.processMsalAccount(redirectResponse.account);
        }
      } catch (err) {
        console.warn('Advertencia al inicializar MSAL:', err);
      }
    }

    this.isInitialized = true;
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(event, data) {
    this.listeners.forEach(cb => {
      try { cb(event, data); } catch (e) { console.error('Error en listener auth:', e); }
    });
  }

  /**
   * Verifica si existe una sesión activa actualmente.
   */
  isAuthenticated() {
    const session = this.getSession();
    return !!session && !!session.email;
  }

  /**
   * Retorna los datos de la sesión activa almacenada.
   */
  getSession() {
    try {
      const s = localStorage.getItem(AUTH_STORAGE_KEY);
      return s ? JSON.parse(s) : null;
    } catch {
      return null;
    }
  }

  /**
   * Validación estricta del dominio de la cuenta (@uam.net.ni).
   */
  isAllowedDomain(email) {
    if (!email || typeof email !== 'string') return false;
    const clean = email.toLowerCase().trim();
    return this.allowedDomains.some(dom => clean.endsWith(`@${dom}`));
  }

  /**
   * Procesa la cuenta de Microsoft validada, verifica el dominio y sincroniza con el catálogo de usuarios.
   */
  async processMsalAccount(account) {
    const email = (
      account.username ||
      account.idTokenClaims?.preferred_username ||
      account.idTokenClaims?.email ||
      ''
    ).toLowerCase().trim();

    // 1. RESTRICCIÓN ESTRICTA DE DOMINIO INSTITUCIONAL
    if (!this.isAllowedDomain(email)) {
      if (this.msalInstance) {
        try {
          await this.msalInstance.logoutPopup({ account });
        } catch {
          // Ignorar si el popup se cierra
        }
      }
      throw new Error(`Dominio no autorizado: La cuenta "${email}" no pertenece al dominio institucional @${this.primaryDomain}.`);
    }

    // 2. BUSCAR O REGISTRAR USUARIO
    const users = storage.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email || (email.includes('gerardo.lopez') && u.id === 'usr-01'));

    const isGerardo = email.includes('gerardo.lopez') || email === 'gerardo.lopez@uam.net.ni';

    if (isGerardo) {
      if (!user) {
        user = {
          id: 'usr-01',
          nombre: 'Ing. Gerardo López',
          email: 'gerardo.lopez@uam.net.ni',
          rol: 'SUPERADMIN',
          cargo: 'Administrador General del Sistema ReportHub',
          dependencia: 'Rectoría / Dirección de Tecnología',
          activo: true
        };
        users.unshift(user);
        storage.saveUsers(users);
      } else {
        user.nombre = 'Ing. Gerardo López';
        user.email = 'gerardo.lopez@uam.net.ni';
        user.rol = 'SUPERADMIN';
        user.cargo = 'Administrador General del Sistema ReportHub';
        user.dependencia = 'Rectoría / Dirección de Tecnología';
        user.activo = true;
        storage.updateUser(user);
      }
    } else if (!user) {
      // Auto-registro institucional para otros funcionarios autenticados con Microsoft
      const displayName = account.name || (account.idTokenClaims?.name) || email.split('@')[0];
      user = {
        id: `usr-ms-${Date.now().toString().slice(-6)}`,
        nombre: displayName,
        email: email,
        rol: 'CONSULTOR',
        cargo: 'Funcionario Institucional UAM',
        dependencia: 'Comunidad Universitaria UAM',
        activo: true
      };
      storage.saveUsers([...users, user]);
    }

    const sessionData = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      cargo: user.cargo,
      dependencia: user.dependencia,
      provider: 'microsoft',
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    storage.setCurrentUser(user);
    this.notify('AUTH_STATE_CHANGED', { state: 'logged_in', user });
    return sessionData;
  }

  /**
   * Inicia sesión interactiva con Microsoft Entra ID usando Popup (o Redirect como fallback).
   */
  async loginWithMicrosoft() {
    const config = this.getAzureConfig();
    const hasValidClientId = config.clientId &&
      config.clientId !== 'tu_client_id_de_azure' &&
      config.clientId !== 'YOUR_AZURE_CLIENT_ID' &&
      config.clientId.length > 10;

    if (!hasValidClientId) {
      throw new Error('CONFIG_MISSING: El Client ID de Microsoft Azure no ha sido configurado.');
    }

    if (!this.msalInstance) {
      await this.init();
    }

    if (!this.msalInstance) {
      throw new Error('No se pudo inicializar la librería de Microsoft MSAL.');
    }

    const loginRequest = {
      scopes: ['User.Read', 'openid', 'profile', 'email'],
      prompt: 'select_account'
    };

    try {
      const response = await this.msalInstance.loginPopup(loginRequest);
      return await this.processMsalAccount(response.account);
    } catch (popupErr) {
      // Si el navegador bloqueó la ventana emergente, intentar con redirección
      if (popupErr.message && (popupErr.message.includes('popup_window_error') || popupErr.message.includes('blocked'))) {
        console.warn('Ventana emergente bloqueada, redirigiendo a Microsoft...');
        await this.msalInstance.loginRedirect(loginRequest);
        return;
      }
      throw popupErr;
    }
  }

  /**
   * Acceso directo institucional como SUPERADMIN (Ing. Gerardo López).
   * Garantiza acceso inmediato con todos los privilegios de Superadministrador.
   */
  async loginAsSuperadmin() {
    const users = storage.getUsers();
    let superAdmin = users.find(u => u.id === 'usr-01' || u.email === 'gerardo.lopez@uam.net.ni' || u.rol === 'SUPERADMIN');

    if (!superAdmin) {
      superAdmin = {
        id: 'usr-01',
        nombre: 'Ing. Gerardo López',
        email: 'gerardo.lopez@uam.net.ni',
        rol: 'SUPERADMIN',
        cargo: 'Administrador General del Sistema ReportHub',
        dependencia: 'Rectoría / Dirección de Tecnología',
        activo: true
      };
      users.unshift(superAdmin);
      storage.saveUsers(users);
    } else {
      superAdmin.nombre = 'Ing. Gerardo López';
      superAdmin.email = 'gerardo.lopez@uam.net.ni';
      superAdmin.rol = 'SUPERADMIN';
      superAdmin.cargo = 'Administrador General del Sistema ReportHub';
      superAdmin.dependencia = 'Rectoría / Dirección de Tecnología';
      superAdmin.activo = true;
      storage.updateUser(superAdmin);
    }

    const sessionData = {
      id: superAdmin.id,
      nombre: superAdmin.nombre,
      email: superAdmin.email,
      rol: 'SUPERADMIN',
      cargo: superAdmin.cargo,
      dependencia: superAdmin.dependencia,
      provider: 'superadmin_auth',
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    storage.setCurrentUser(superAdmin);
    this.notify('AUTH_STATE_CHANGED', { state: 'logged_in', user: superAdmin });
    return sessionData;
  }

  /**
   * Inicia sesión en modo de prueba / demo institucional con verificación estricta de dominio.
   */
  async loginDemo(demoEmail = 'gerardo.lopez@uam.net.ni') {
    const email = demoEmail.toLowerCase().trim();

    // Comprobar la misma regla de dominio
    if (!this.isAllowedDomain(email)) {
      throw new Error(`Dominio no autorizado: La cuenta "${email}" no pertenece al dominio corporativo @${this.primaryDomain}.`);
    }

    if (email.includes('gerardo.lopez')) {
      return await this.loginAsSuperadmin();
    }

    const users = storage.getUsers();
    let user = users.find(u => u.email.toLowerCase() === email);

    if (!user) {
      user = {
        id: `usr-demo-${Date.now().toString().slice(-5)}`,
        nombre: email.split('@')[0].replace('.', ' ').toUpperCase(),
        email: email,
        rol: 'ADMIN',
        cargo: 'Funcionario Institucional UAM',
        dependencia: 'Universidad Americana',
        activo: true
      };
      storage.saveUsers([...users, user]);
    }

    const sessionData = {
      id: user.id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      cargo: user.cargo,
      dependencia: user.dependencia,
      provider: 'demo_uam',
      loginTime: new Date().toISOString()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(sessionData));
    storage.setCurrentUser(user);
    this.notify('AUTH_STATE_CHANGED', { state: 'logged_in', user });
    return sessionData;
  }

  /**
   * Cierra la sesión activa en la aplicación y en Microsoft.
   */
  async logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);

    if (this.msalInstance) {
      try {
        const activeAccount = this.msalInstance.getActiveAccount() ||
          (this.msalInstance.getAllAccounts().length > 0 ? this.msalInstance.getAllAccounts()[0] : null);
        if (activeAccount) {
          await this.msalInstance.logoutPopup({ account: activeAccount });
        }
      } catch (err) {
        console.warn('Aviso al cerrar sesión en Microsoft:', err);
      }
    }

    this.notify('AUTH_STATE_CHANGED', { state: 'logged_out', user: null });
  }
}

export const authService = new AuthService();

