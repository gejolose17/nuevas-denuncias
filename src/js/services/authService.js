/**
 * UAM ReportHub - Authentication Service (Microsoft Entra ID)
 * Autenticación corporativa estricta con Microsoft Entra ID para dominio @uam.net.ni.
 */

import { PublicClientApplication } from '@azure/msal-browser';
import { storage } from './storage.js';

const AUTH_STORAGE_KEY = 'uam_reporthub_auth_session_v1';

class AuthService {
  constructor() {
    this.msalInstance = null;
    this.isInitialized = false;
    this.lastAuthError = null;
    this.listeners = new Set();
    this.allowedDomains = ['uam.net.ni', 'uam.edu.ni'];
    this.primaryDomain = 'uam.net.ni';
  }

  /**
   * Obtiene la configuración de Azure AD desde las variables de entorno de Vite.
   */
  getAzureConfig() {
    const rawRedirect = (import.meta.env.VITE_AZURE_REDIRECT_URI || '').trim();
    // Limpiar hash, query params y diagonales finales para coincidencia exacta con Microsoft Entra ID
    const cleanRedirect = rawRedirect
      ? rawRedirect.split('#')[0].split('?')[0].replace(/\/+$/, '')
      : window.location.origin.replace(/\/+$/, '');

    return {
      clientId: (import.meta.env.VITE_AZURE_CLIENT_ID || '').trim(),
      tenantId: (import.meta.env.VITE_AZURE_TENANT_ID || 'organizations').trim(),
      redirectUri: cleanRedirect || window.location.origin
    };
  }

  /**
   * Inicializa la instancia MSAL y procesa retornos de redirección si existen.
   */
  async init() {
    if (this.isInitialized && this.msalInstance) return;

    this.lastAuthError = null;
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
            redirectUri: config.redirectUri || window.location.origin,
            navigateToLoginRequestUrl: false
          },
          cache: {
            cacheLocation: 'localStorage',
            storeAuthStateInCookie: true
          }
        };

        this.msalInstance = new PublicClientApplication(msalConfig);
        await this.msalInstance.initialize();

        // Procesar respuesta si se retornó de un redirect de Microsoft
        const redirectResponse = await this.msalInstance.handleRedirectPromise();
        if (redirectResponse && redirectResponse.account) {
          await this.processMsalAccount(redirectResponse.account);
        }
      } catch (err) {
        console.error('[UAM Auth] Inicialización o procesamiento de retorno MSAL:', err);
        this.lastAuthError = err.message || 'Error en la respuesta de autenticación de Microsoft.';
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
   * Validación estricta del dominio de la cuenta (@uam.net.ni o @uam.edu.ni).
   */
  isAllowedDomain(email) {
    if (!email || typeof email !== 'string') return false;
    const clean = email.toLowerCase().trim();
    return this.allowedDomains.some(dom => clean.endsWith(`@${dom}`));
  }

  /**
   * Procesa la cuenta de Microsoft autenticada, valida el dominio y sincroniza con el catálogo de usuarios.
   */
  async processMsalAccount(account) {
    if (!account) return null;

    const email = (
      account.username ||
      account.idTokenClaims?.preferred_username ||
      account.idTokenClaims?.email ||
      account.idTokenClaims?.upn ||
      ''
    ).toLowerCase().trim();

    // 1. RESTRICCIÓN ESTRICTA DE DOMINIO INSTITUCIONAL
    if (!this.isAllowedDomain(email)) {
      throw new Error(`Acceso denegado: La cuenta "${email}" no pertenece al dominio oficial @${this.primaryDomain}.`);
    }

    // 2. BUSCAR O SINCRONIZAR USUARIO CON EL NUEVO FORMATO DE ROLES
    const users = storage.getUsers();
    const isGerardo = email.includes('gerardo.lopez') || email === 'gerardo.lopez@uam.net.ni';

    let user = users.find(u => u.email.toLowerCase() === email || (isGerardo && (u.id === 'usr-01' || u.rol === 'SUPERADMIN')));

    if (isGerardo) {
      // Garantía estricta de Superadmin para Ing. Gerardo López
      if (!user) {
        user = {
          id: 'usr-01',
          nombre: account.name || 'Ing. Gerardo López',
          email: 'gerardo.lopez@uam.net.ni',
          rol: 'SUPERADMIN',
          cargo: 'Administrador General del Sistema ReportHub',
          dependencia: 'Rectoría / Dirección de Tecnología',
          activo: true
        };
        users.unshift(user);
      } else {
        user.id = 'usr-01';
        user.nombre = 'Ing. Gerardo López';
        user.email = 'gerardo.lopez@uam.net.ni';
        user.rol = 'SUPERADMIN';
        user.cargo = 'Administrador General del Sistema ReportHub';
        user.dependencia = 'Rectoría / Dirección de Tecnología';
        user.activo = true;
      }
      storage.saveUsers(users);
    } else if (user) {
      // Usuario existente: si tiene un rol legado, migrarlo
      if (user.rol === 'RESPONSABLE') user.rol = 'SUPERVISOR';
      if (user.rol === 'CONSULTOR') user.rol = 'ESTANDAR';
      storage.updateUser(user);
    } else {
      // Auto-registro institucional para nuevos funcionarios (Rol base: ESTANDAR)
      const displayName = account.name || (account.idTokenClaims?.name) || email.split('@')[0];
      user = {
        id: `usr-ms-${Date.now().toString().slice(-6)}`,
        nombre: displayName,
        email: email,
        rol: 'ESTANDAR', // Nivel 4 del nuevo plan de seguridad
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
   * Inicia sesión interactiva con Microsoft Entra ID usando redirección en la misma pestaña.
   * Elimina completamente errores de ventanas emergentes (block_nested_popups) y bloqueadores de popups.
   */
  async loginWithMicrosoft() {
    const config = this.getAzureConfig();
    const hasValidClientId = config.clientId &&
      config.clientId !== 'tu_client_id_de_azure' &&
      config.clientId !== 'YOUR_AZURE_CLIENT_ID' &&
      config.clientId.length > 10;

    if (!hasValidClientId) {
      throw new Error('Configuración de Azure pendiente. Verifique las variables de entorno de Vercel.');
    }

    if (!this.msalInstance) {
      await this.init();
    }

    if (!this.msalInstance) {
      throw new Error('No se pudo inicializar la librería de Microsoft MSAL.');
    }

    const loginRequest = {
      scopes: ['User.Read'],
      prompt: 'select_account'
    };

    // Redirección directa y limpia: solución definitiva a block_nested_popups
    await this.msalInstance.loginRedirect(loginRequest);
    return null;
  }

  /**
   * Cierra la sesión activa en la aplicación de forma limpia.
   */
  async logout() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    sessionStorage.clear();

    if (this.msalInstance) {
      try {
        const accounts = this.msalInstance.getAllAccounts();
        for (const account of accounts) {
          await this.msalInstance.clearCache();
        }
      } catch (err) {
        console.warn('[UAM Auth] Limpieza de sesión:', err);
      }
    }

    this.notify('AUTH_STATE_CHANGED', { state: 'logged_out', user: null });
  }
}

export const authService = new AuthService();
