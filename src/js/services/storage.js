/**
 * UAM ReportHub - Storage Service
 * Gestiona la persistencia en LocalStorage y provee eventos reactivos.
 */
import {
  INITIAL_DEPARTAMENTOS,
  INITIAL_FACULTADES,
  INITIAL_CATEGORIAS,
  INITIAL_TIPOS_DENUNCIA,
  INITIAL_USERS,
  INITIAL_CASES
} from '../data/initialData.js';

const STORAGE_KEYS = {
  CASES: 'uam_reporthub_cases_v1',
  DEPARTAMENTOS: 'uam_reporthub_departamentos_v1',
  FACULTADES: 'uam_reporthub_facultades_v1',
  CATEGORIAS: 'uam_reporthub_categorias_v1',
  TIPOS_DENUNCIA: 'uam_reporthub_tipos_v1',
  USERS: 'uam_reporthub_users_v1',
  CURRENT_USER: 'uam_reporthub_current_user_v1',
  TRASH: 'uam_reporthub_trash_v1'
};

class StorageService {
  constructor() {
    this.listeners = new Set();
    this.init();
  }

  init() {
    if (!localStorage.getItem(STORAGE_KEYS.DEPARTAMENTOS)) {
      localStorage.setItem(STORAGE_KEYS.DEPARTAMENTOS, JSON.stringify(INITIAL_DEPARTAMENTOS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.FACULTADES)) {
      localStorage.setItem(STORAGE_KEYS.FACULTADES, JSON.stringify(INITIAL_FACULTADES));
    }
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIAS)) {
      localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(INITIAL_CATEGORIAS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TIPOS_DENUNCIA)) {
      localStorage.setItem(STORAGE_KEYS.TIPOS_DENUNCIA, JSON.stringify(INITIAL_TIPOS_DENUNCIA));
    }
    if (!localStorage.getItem(STORAGE_KEYS.TRASH)) {
      localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify([]));
    }

    // Migración y garantía del nuevo Plan de 4 Roles (SUPERADMIN, ADMIN, SUPERVISOR, ESTANDAR)
    const storedUsers = localStorage.getItem(STORAGE_KEYS.USERS);
    if (!storedUsers) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    } else {
      try {
        const parsed = JSON.parse(storedUsers);
        let changed = false;

        parsed.forEach(u => {
          // Garantizar Superadmin Ing. Gerardo López
          if (u.id === 'usr-01' || (u.email && u.email.toLowerCase() === 'gerardo.lopez@uam.net.ni')) {
            u.id = 'usr-01';
            u.nombre = 'Ing. Gerardo López';
            u.email = 'gerardo.lopez@uam.net.ni';
            u.rol = 'SUPERADMIN';
            u.cargo = 'Administrador General del Sistema ReportHub';
            u.dependencia = 'Rectoría / Dirección de Tecnología';
            u.activo = true;
            changed = true;
          } else if (u.rol === 'RESPONSABLE' || u.rol === 'SETEC_AUDITOR') {
            u.rol = 'SUPERVISOR';
            changed = true;
          } else if (u.rol === 'CONSULTOR' || !['SUPERADMIN', 'ADMIN', 'SUPERVISOR', 'ESTANDAR'].includes(u.rol)) {
            u.rol = 'ESTANDAR';
            changed = true;
          }
        });

        // Asegurar que usr-01 esté presente
        if (!parsed.some(u => u.id === 'usr-01' || u.email === 'gerardo.lopez@uam.net.ni')) {
          parsed.unshift(INITIAL_USERS[0]);
          changed = true;
        }

        if (changed) {
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(parsed));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
      }
    }

    // Ensure cases use GD format if previously had CASO-
    const storedCases = localStorage.getItem(STORAGE_KEYS.CASES);
    if (!storedCases) {
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    } else {
      try {
        const parsedCases = JSON.parse(storedCases);
        if (parsedCases.some(c => c.id && c.id.startsWith('CASO-'))) {
          localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
      }
    }

    // Default current user to Superadmin Gerardo Lopez
    const currentUsrStr = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (!currentUsrStr) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    } else {
      try {
        const curr = JSON.parse(currentUsrStr);
        if (curr.rol === 'SUPERADMIN' || curr.id === 'usr-01') {
          curr.nombre = 'Ing. Gerardo López';
          curr.email = 'gerardo.lopez@uam.net.ni';
          curr.dependencia = 'Rectoría / Dirección de Tecnología';
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(curr));
        }
      } catch (e) {
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
      }
    }
  }

  subscribe(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notify(eventType, payload) {
    this.listeners.forEach(cb => {
      try {
        cb(eventType, payload);
      } catch (err) {
        console.error('Storage listener error:', err);
      }
    });
  }

  // --- CASES ---
  getCases() {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CASES);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  getCaseById(id) {
    return this.getCases().find(c => c.id === id) || null;
  }

  saveCase(caseData) {
    const cases = this.getCases();
    const existingIndex = cases.findIndex(c => c.id === caseData.id);
    const currentUser = this.getCurrentUser();

    if (existingIndex >= 0) {
      // Update
      const oldCase = cases[existingIndex];
      const updatedCase = {
        ...oldCase,
        ...caseData,
        historial: [
          ...(oldCase.historial || []),
          {
            fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
            accion: `Actualización de información del caso`,
            usuario: currentUser ? currentUser.nombre : 'Sistema'
          }
        ]
      };
      cases[existingIndex] = updatedCase;
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
      this.notify('CASE_UPDATED', updatedCase);
      return updatedCase;
    } else {
      // Create
      const newCase = {
        ...caseData,
        registroCompletado: caseData.registroCompletado || false,
        faseActual: caseData.faseActual || 1,
        estado: caseData.estado || 'Registrado',
        historial: [
          {
            fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
            accion: 'Registro formal del caso y generación de folio',
            usuario: currentUser ? currentUser.nombre : 'Ventanilla SETEC'
          }
        ]
      };
      cases.unshift(newCase);
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
      this.notify('CASE_CREATED', newCase);
      return newCase;
    }
  }

  updateCaseResolution(caseId, resolutionData, markClosed = false) {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id === caseId);
    if (index === -1) return null;

    const currentCase = cases[index];
    const currentUser = this.getCurrentUser();

    const isFullySigned =
      resolutionData.autoridades?.secretariaGeneralId &&
      resolutionData.autoridades?.decanoId &&
      resolutionData.autoridades?.planificacionCalidadId;

    let newEstado = currentCase.estado;
    let newFase = currentCase.faseActual;

    if (markClosed) {
      newEstado = 'Concluido y Notificado';
      newFase = 4;
    } else if (resolutionData.conclusiones) {
      newEstado = 'Dictamen Registrado';
      newFase = 3;
    } else if (resolutionData.fundamentacionNormativa || resolutionData.aspectosTecnicos) {
      newEstado = 'En Evaluación Académica';
      newFase = 2;
    }

    const updatedCase = {
      ...currentCase,
      registroCompletado: true,
      estado: newEstado,
      faseActual: newFase,
      resolucion: {
        ...(currentCase.resolucion || {}),
        ...resolutionData,
        fechaCierre: markClosed ? (resolutionData.fechaCierre || new Date().toISOString().split('T')[0]) : null
      },
      historial: [
        ...(currentCase.historial || []),
        {
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          accion: markClosed ? 'Guardado formal y Cierre institucional del dictamen' : 'Actualización de dictamen técnico y académico',
          usuario: currentUser ? currentUser.nombre : 'Sistema'
        }
      ]
    };

    cases[index] = updatedCase;
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    this.notify('CASE_RESOLUTION_SAVED', updatedCase);
    return updatedCase;
  }

  // --- CIERRE DE CASO POR NO CUMPLIR CRITERIOS ---
  closeCaseWithoutAdmission(caseId, descripcionCierre) {
    const cases = this.getCases();
    const index = cases.findIndex(c => c.id === caseId);
    if (index === -1) return null;

    const currentCase = cases[index];
    const currentUser = this.getCurrentUser();
    const today = new Date().toISOString().split('T')[0];

    const updatedCase = {
      ...currentCase,
      registroCompletado: true,
      estado: 'Cerrado - No Admite Trámite',
      faseActual: 4,
      resolucion: {
        ...(currentCase.resolucion || {}),
        cumpleCriterios: false,
        descripcionCierre: descripcionCierre,
        fechaCierre: today
      },
      historial: [
        ...(currentCase.historial || []),
        {
          fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
          accion: `Cierre del expediente por no cumplir criterios de admisión: "${descripcionCierre}"`,
          usuario: currentUser ? currentUser.nombre : 'Comisión de Admisión'
        }
      ]
    };

    cases[index] = updatedCase;
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
    this.notify('CASE_CLOSED_NO_ADMISSION', updatedCase);
    return updatedCase;
  }

  // --- PAPELERA Y SOFT-DELETE DE CASOS ---
  deleteCase(id) {
    const cases = this.getCases();
    const targetCase = cases.find(c => c.id === id);
    if (!targetCase) return false;

    const currentUser = this.getCurrentUser();
    const trash = this.getTrash();

    trash.unshift({
      trashId: `trash-caso-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'CASO',
      itemId: targetCase.id,
      title: `${targetCase.id} • ${targetCase.codigoSetec}`,
      subtitle: `${targetCase.afectado?.nombreCompleto || 'Sin nombre'} (${targetCase.academicos?.facultad || ''})`,
      deletedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      deletedBy: currentUser ? currentUser.nombre : 'Sistema',
      data: targetCase
    });

    this.saveTrash(trash);

    const remaining = cases.filter(c => c.id !== id);
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(remaining));
    this.notify('CASE_DELETED', { id });
    return true;
  }

  generateNextCaseNumber() {
    const cases = this.getCases();
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);
    const dateCode = `${dd}${mm}${yy}`; // e.g. 131026

    const numbers = cases.map(c => {
      const match = c.id && c.id.match(/^GD-(\d+)-/);
      return match ? parseInt(match[1], 10) : 0;
    });
    const maxNum = numbers.length > 0 ? Math.max(...numbers, 0) : 0;
    const nextConsecutive = String(maxNum + 1).padStart(2, '0');
    return `GD-${nextConsecutive}-${dateCode}`;
  }

  generateSetecCode() {
    return '';
  }

  // --- CONFIG: DEPARTAMENTOS & MUNICIPIOS ---
  getDepartamentos() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.DEPARTAMENTOS)) || [];
    } catch {
      return [];
    }
  }

  saveDepartamentos(deps) {
    localStorage.setItem(STORAGE_KEYS.DEPARTAMENTOS, JSON.stringify(deps));
    this.notify('CONFIG_UPDATED', { type: 'departamentos' });
  }

  // --- CONFIG: FACULTADES & CARRERAS ---
  getFacultades() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.FACULTADES)) || [];
    } catch {
      return [];
    }
  }

  saveFacultades(facs) {
    localStorage.setItem(STORAGE_KEYS.FACULTADES, JSON.stringify(facs));
    this.notify('CONFIG_UPDATED', { type: 'facultades' });
  }

  addFacultad(nombre) {
    const facs = this.getFacultades();
    const cleanName = (nombre || '').trim();
    if (!cleanName) return null;
    const newId = `fac-${Date.now().toString().slice(-5)}`;
    const newFac = {
      id: newId,
      nombre: cleanName,
      carreras: []
    };
    facs.push(newFac);
    this.saveFacultades(facs);
    return newFac;
  }

  deleteFacultad(id) {
    const facs = this.getFacultades();
    if (facs.length <= 1) return false;
    const remaining = facs.filter(f => f.id !== id);
    this.saveFacultades(remaining);
    return true;
  }

  addCarrera(facId, carreraNombre) {
    const facs = this.getFacultades();
    const target = facs.find(f => f.id === facId);
    if (!target) return false;
    const clean = (carreraNombre || '').trim();
    if (!clean) return false;
    target.carreras.push(clean);
    this.saveFacultades(facs);
    return true;
  }

  deleteCarrera(facId, index) {
    const facs = this.getFacultades();
    const target = facs.find(f => f.id === facId);
    if (!target || !target.carreras || target.carreras.length <= 1) return false;
    target.carreras.splice(index, 1);
    this.saveFacultades(facs);
    return true;
  }

  // --- CONFIG: CATEGORIAS & TIPOS ---
  getCategorias() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIAS)) || [];
    } catch {
      return [];
    }
  }

  saveCategorias(cats) {
    localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(cats));
    this.notify('CONFIG_UPDATED', { type: 'categorias' });
  }

  getTiposDenuncia() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TIPOS_DENUNCIA)) || [];
    } catch {
      return [];
    }
  }

  saveTiposDenuncia(tipos) {
    localStorage.setItem(STORAGE_KEYS.TIPOS_DENUNCIA, JSON.stringify(tipos));
    this.notify('CONFIG_UPDATED', { type: 'tiposDenuncia' });
  }

  // --- USERS & ROLES ---
  getUsers() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    } catch {
      return [];
    }
  }

  saveUsers(users) {
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    this.notify('USERS_UPDATED', users);
  }

  getCurrentUser() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) || INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  }

  setCurrentUser(user) {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    this.notify('CURRENT_USER_CHANGED', user);
  }

  // Helper to filter users by authority type
  getUsersByAuthorityType(tipo) {
    const users = this.getUsers().filter(u => u.activo);
    if (!tipo) return users;
    return users.filter(u => u.tipoAutoridad === tipo || u.cargo.toLowerCase().includes(tipo.toLowerCase()));
  }

  updateUser(userData) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === userData.id);
    if (index === -1) return false;
    users[index] = { ...users[index], ...userData };
    this.saveUsers(users);
    const current = this.getCurrentUser();
    if (current && current.id === userData.id) {
      this.setCurrentUser(users[index]);
    }
    return users[index];
  }

  toggleUserStatus(id) {
    const users = this.getUsers();
    const target = users.find(u => u.id === id);
    if (!target) return false;
    target.activo = !target.activo;
    this.saveUsers(users);
    return target;
  }

  deleteUser(id) {
    const users = this.getUsers();
    const targetUser = users.find(u => u.id === id);
    if (!targetUser || targetUser.rol === 'SUPERADMIN' || targetUser.id === 'usr-01') return false;

    const currentUser = this.getCurrentUser();
    const trash = this.getTrash();

    trash.unshift({
      trashId: `trash-usr-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      type: 'USUARIO',
      itemId: targetUser.id,
      title: `${targetUser.nombre} (${targetUser.rol})`,
      subtitle: `${targetUser.cargo} • ${targetUser.email}`,
      deletedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      deletedBy: currentUser ? currentUser.nombre : 'Sistema',
      data: targetUser
    });

    this.saveTrash(trash);

    const remaining = users.filter(u => u.id !== id);
    this.saveUsers(remaining);
    return true;
  }

  // --- GESTIÓN DE PAPELERA ---
  getTrash() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.TRASH)) || [];
    } catch {
      return [];
    }
  }

  saveTrash(trashList) {
    localStorage.setItem(STORAGE_KEYS.TRASH, JSON.stringify(trashList));
    this.notify('TRASH_UPDATED', trashList);
  }

  restoreFromTrash(trashId) {
    const trash = this.getTrash();
    const itemIndex = trash.findIndex(t => t.trashId === trashId);
    if (itemIndex === -1) return false;

    const item = trash[itemIndex];
    if (item.type === 'CASO') {
      const cases = this.getCases();
      cases.unshift(item.data);
      localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(cases));
      this.notify('CASE_CREATED', item.data);
    } else if (item.type === 'USUARIO') {
      const users = this.getUsers();
      users.push(item.data);
      this.saveUsers(users);
    }

    trash.splice(itemIndex, 1);
    this.saveTrash(trash);
    return true;
  }

  permanentDeleteFromTrash(trashId) {
    const trash = this.getTrash();
    const remaining = trash.filter(t => t.trashId !== trashId);
    this.saveTrash(remaining);
    return true;
  }

  emptyTrash() {
    this.saveTrash([]);
    return true;
  }

  resetToDefault() {
    localStorage.setItem(STORAGE_KEYS.DEPARTAMENTOS, JSON.stringify(INITIAL_DEPARTAMENTOS));
    localStorage.setItem(STORAGE_KEYS.FACULTADES, JSON.stringify(INITIAL_FACULTADES));
    localStorage.setItem(STORAGE_KEYS.CATEGORIAS, JSON.stringify(INITIAL_CATEGORIAS));
    localStorage.setItem(STORAGE_KEYS.TIPOS_DENUNCIA, JSON.stringify(INITIAL_TIPOS_DENUNCIA));
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(INITIAL_USERS));
    localStorage.setItem(STORAGE_KEYS.CASES, JSON.stringify(INITIAL_CASES));
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(INITIAL_USERS[0]));
    this.notify('RESET_ALL', null);
  }
}

export const storage = new StorageService();
