/**
 * ConfigView
 * Sección "CONFIGURACIÓN"
 * Dividida en 3 vistas claramente separadas:
 * 1. ADMINISTRAR LISTAS DESPLEGABLES (Departamentos/Municipios, Facultades/Carreras, Tipos, Categorías)
 * 2. ALTA DE NUEVOS USUARIOS (Formulario exclusivo para crear y dar de alta usuarios)
 * 3. USUARIOS REGISTRADOS Y ASIGNACIÓN DE ROLES (Tabla completa de funcionarios, asignación de roles, permisos y simulador de sesión)
 */

import { storage } from '../services/storage.js';
import { toast } from '../components/toast.js';
import { ROLES_SISTEMA } from '../data/initialData.js';

export class ConfigView {
  constructor(containerEl, onUserChanged = null) {
    this.container = containerEl;
    this.onUserChanged = onUserChanged;
    this.activeSubtab = 'listas'; // 'listas' | 'alta_usuario' | 'usuarios_roles'
    this.selectedDepId = null;
    this.selectedFacId = null;
  }

  render() {
    const departamentos = storage.getDepartamentos();
    const facultades = storage.getFacultades();
    const categorias = storage.getCategorias();
    const tipos = storage.getTiposDenuncia();
    const users = storage.getUsers();
    const currentUser = storage.getCurrentUser();

    if (!this.selectedDepId && departamentos.length > 0) {
      this.selectedDepId = departamentos[0].id;
    }
    if (!this.selectedFacId && facultades.length > 0) {
      this.selectedFacId = facultades[0].id;
    }

    const currentDep = departamentos.find(d => d.id === this.selectedDepId) || departamentos[0];
    const currentFac = facultades.find(f => f.id === this.selectedFacId) || facultades[0];

    this.container.innerHTML = `
      <div class="card config-card animate-fade-in">
        <!-- HEADER -->
        <div class="card-header border-bottom">
          <div class="header-icon-box" style="background: rgba(0, 153, 168, 0.1); color: #0099A8;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <div style="flex: 1;">
            <h2 class="card-title">PANEL DE CONFIGURACIÓN DEL SISTEMA</h2>
            <p class="card-subtitle">Administración de catálogos institucionales, altas de usuarios y control de roles</p>
          </div>
          <div>
            <button type="button" class="btn btn-outline" id="btn-reset-defaults" title="Restablecer catálogos y datos iniciales">
              🔄 Restablecer Datos Demo
            </button>
          </div>
        </div>

        <!-- 3 SUB-PESTAÑAS SEPARADAS DE CONFIGURACIÓN -->
        <div class="config-tabs-nav">
          <button type="button" class="cfg-tab-btn ${this.activeSubtab === 'listas' ? 'is-active' : ''}" data-subtab="listas">
            📁 ADMINISTRAR LISTAS DESPLEGABLES
          </button>
          <button type="button" class="cfg-tab-btn ${this.activeSubtab === 'alta_usuario' ? 'is-active' : ''}" data-subtab="alta_usuario">
            👤 ALTA DE NUEVOS USUARIOS
          </button>
          <button type="button" class="cfg-tab-btn ${this.activeSubtab === 'usuarios_roles' ? 'is-active' : ''}" data-subtab="usuarios_roles">
            👥 USUARIOS REGISTRADOS Y ASIGNACIÓN DE ROLES (${users.length})
          </button>
        </div>

        <div class="config-content-body">
          ${this.renderSubtabContent(departamentos, currentDep, facultades, currentFac, categorias, tipos, users, currentUser)}
        </div>
      </div>
    `;

    this.bindEvents(departamentos, facultades, categorias, tipos, users);
  }

  renderSubtabContent(departamentos, currentDep, facultades, currentFac, categorias, tipos, users, currentUser) {
    switch (this.activeSubtab) {
      case 'listas':
        return this.renderListasTab(departamentos, currentDep, facultades, currentFac, categorias, tipos);
      case 'alta_usuario':
        return this.renderAltaUsuarioTab();
      case 'usuarios_roles':
        return this.renderUsuariosRolesTab(users, currentUser);
      default:
        return this.renderListasTab(departamentos, currentDep, facultades, currentFac, categorias, tipos);
    }
  }

  // VISTA 1: ADMINISTRAR LISTAS DESPLEGABLES
  renderListasTab(departamentos, currentDep, facultades, currentFac, categorias, tipos) {
    return `
      <div class="catalog-sections-grid animate-fade-in">
        <!-- 1. DEPARTAMENTOS Y MUNICIPIOS -->
        <div class="catalog-box">
          <div class="catalog-box-header">
            <h4>1. Departamentos y Municipios (Nicaragua)</h4>
            <span class="badge badge-info">${departamentos.length} Departamentos</span>
          </div>
          <div class="catalog-box-body">
            <div class="selector-inline">
              <label>Departamento:</label>
              <select id="cfg-dep-selector" class="form-control">
                ${departamentos.map(d => `
                  <option value="${d.id}" ${d.id === currentDep.id ? 'selected' : ''}>${d.nombre} (${d.municipios.length} municipios)</option>
                `).join('')}
              </select>
            </div>

            <div class="items-list-container">
              <div class="items-list-title">Municipios de ${currentDep.nombre}:</div>
              <ul class="catalog-items-list" id="cfg-muns-list">
                ${currentDep.municipios.map((m, idx) => `
                  <li>
                    <span>📍 ${m}</span>
                    <button type="button" class="btn-remove-item" data-type="municipio" data-index="${idx}">&times;</button>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="add-item-row">
              <input type="text" id="new-mun-input" class="form-control" placeholder="Nuevo municipio para ${currentDep.nombre}..." />
              <button type="button" class="btn btn-primary btn-sm" id="btn-add-mun">+ Agregar</button>
            </div>
          </div>
        </div>

        <!-- 2. FACULTADES Y CARRERAS -->
        <div class="catalog-box">
          <div class="catalog-box-header">
            <h4>2. Facultades y Carreras (UAM)</h4>
            <span class="badge badge-purple">${facultades.length} Facultades</span>
          </div>
          <div class="catalog-box-body">
            <!-- SELECCIONAR Y ELIMINAR FACULTAD -->
            <div class="selector-inline" style="display: flex; gap: 8px; align-items: center;">
              <label style="min-width: 65px;">Facultad:</label>
              <select id="cfg-fac-selector" class="form-control" style="flex: 1;">
                ${facultades.map(f => `
                  <option value="${f.id}" ${f.id === currentFac.id ? 'selected' : ''}>${f.nombre} (${f.carreras.length} carreras)</option>
                `).join('')}
              </select>
              <button type="button" class="btn btn-outline btn-sm btn-delete-fac" id="btn-delete-fac" title="Eliminar la facultad seleccionada" ${facultades.length <= 1 ? 'disabled style="opacity:0.5; cursor:not-allowed;"' : 'style="color:#dc2626; border-color:#fca5a5; white-space:nowrap;"'}>
                🗑️ Eliminar Facultad
              </button>
            </div>

            <!-- AGREGAR NUEVA FACULTAD -->
            <div class="add-fac-box" style="margin: 12px 0 16px; padding: 12px; background: #F8FAFC; border: 1.5px dashed #CBD5E1; border-radius: var(--radius-sm);">
              <label style="display: block; font-size: 11.5px; font-weight: 700; color: #64748B; margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.4px;">
                + Agregar Nueva Facultad Universitaria:
              </label>
              <div style="display: flex; gap: 8px;">
                <input type="text" id="new-fac-input" class="form-control" placeholder="Nombre oficial de la facultad (ej. Facultad de Odontología)..." />
                <button type="button" class="btn btn-primary btn-sm" id="btn-add-facultad" style="white-space: nowrap;">
                  + Agregar Facultad
                </button>
              </div>
            </div>

            <!-- CARRERAS ASOCIADAS A LA FACULTAD -->
            <div class="items-list-container">
              <div class="items-list-title" style="display: flex; justify-content: space-between; align-items: center;">
                <span>Carreras asociadas a <strong>${currentFac ? currentFac.nombre : ''}</strong>:</span>
                <span class="badge badge-info" style="font-size: 11px;">${currentFac ? currentFac.carreras.length : 0} carreras</span>
              </div>
              <ul class="catalog-items-list" id="cfg-carreras-list">
                ${currentFac && currentFac.carreras && currentFac.carreras.length > 0 ? currentFac.carreras.map((c, idx) => `
                  <li>
                    <span>🎓 ${c}</span>
                    <button type="button" class="btn-remove-item" data-type="carrera" data-index="${idx}" title="Eliminar carrera">&times;</button>
                  </li>
                `).join('') : `
                  <li style="color: #808284; font-size: 12.5px; font-style: italic; justify-content: center; padding: 12px;">
                    No hay carreras registradas en esta facultad. Agregue una a continuación.
                  </li>
                `}
              </ul>
            </div>

            <div class="add-item-row">
              <input type="text" id="new-carrera-input" class="form-control" placeholder="Nueva carrera para ${currentFac ? currentFac.nombre : 'facultad'}..." />
              <button type="button" class="btn btn-primary btn-sm" id="btn-add-carrera">+ Agregar Carrera</button>
            </div>
          </div>
        </div>

        <!-- 3. TIPOS DE DENUNCIA -->
        <div class="catalog-box">
          <div class="catalog-box-header">
            <h4>3. Tipos de Denuncia</h4>
            <span class="badge badge-warning">${tipos.length} Tipos</span>
          </div>
          <div class="catalog-box-body">
            <div class="items-list-container">
              <ul class="catalog-items-list" id="cfg-tipos-list">
                ${tipos.map((t, idx) => `
                  <li>
                    <span>⚖️ ${t}</span>
                    <button type="button" class="btn-remove-item" data-type="tipoDenuncia" data-index="${idx}">&times;</button>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="add-item-row">
              <input type="text" id="new-tipo-input" class="form-control" placeholder="Nuevo tipo de denuncia..." />
              <button type="button" class="btn btn-primary btn-sm" id="btn-add-tipo">+ Agregar</button>
            </div>
          </div>
        </div>

        <!-- 4. CATEGORÍAS DE TIPO -->
        <div class="catalog-box">
          <div class="catalog-box-header">
            <h4>4. Categorías de Tipo</h4>
            <span class="badge badge-success">${categorias.length} Categorías</span>
          </div>
          <div class="catalog-box-body">
            <div class="items-list-container">
              <ul class="catalog-items-list" id="cfg-cats-list">
                ${categorias.map((cat, idx) => `
                  <li>
                    <span>📂 ${cat}</span>
                    <button type="button" class="btn-remove-item" data-type="categoria" data-index="${idx}">&times;</button>
                  </li>
                `).join('')}
              </ul>
            </div>

            <div class="add-item-row">
              <input type="text" id="new-cat-input" class="form-control" placeholder="Nueva categoría de tipo..." />
              <button type="button" class="btn btn-primary btn-sm" id="btn-add-cat">+ Agregar</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // VISTA 2: ALTA DE NUEVOS USUARIOS (SEPARADA)
  renderAltaUsuarioTab() {
    return `
      <div class="card subcard form-user-dedicated-view animate-fade-in">
        <div class="dedicated-form-header">
          <div class="header-icon-box" style="background: rgba(0, 153, 168, 0.1); color: #0099A8;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div>
            <h3 class="dedicated-title">ALTA DE NUEVO USUARIO INSTITUCIONAL</h3>
            <p class="dedicated-subtitle">Registre las credenciales, dependencia universitaria y permisos de gestión para un nuevo funcionario en UAM ReportHub</p>
          </div>
        </div>

        <form id="form-add-user" class="user-dedicated-grid">
          <div class="form-group">
            <label class="form-label" for="usr-nombre">Nombre y Apellidos Completos <span class="required">*</span></label>
            <input type="text" id="usr-nombre" class="form-control" placeholder="Ej. Dra. Martha Elena Cuadra" required />
            <small class="field-hint">Nombre oficial con título profesional</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="usr-email">Correo Electrónico Institucional <span class="required">*</span></label>
            <input type="email" id="usr-email" class="form-control" placeholder="martha.cuadra@uam.net.ni" required />
            <small class="field-hint">Dominio @uam.net.ni o @uam.edu.ni</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="usr-rol">Nivel de Seguridad y Rol <span class="required">*</span></label>
            <select id="usr-rol" class="form-control custom-select" required>
              <option value="ESTANDAR">Estándar (Nivel 4 - Operador de Registro y Radicación)</option>
              <option value="SUPERVISOR">Supervisor (Nivel 3 - Auditoría, Dictámenes y SLA)</option>
              <option value="ADMIN">Administrador (Nivel 2 - Gestión y Control de Denuncias)</option>
              <option value="SUPERADMIN">Superadministrador (Nivel 1 - Control Total)</option>
            </select>
            <small class="field-hint">Nivel de autorización y permisos en la plataforma</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="usr-cargo">Cargo Oficial <span class="required">*</span></label>
            <input type="text" id="usr-cargo" class="form-control" placeholder="Ej. Decano, Secretaria General, Director..." required />
            <small class="field-hint">Puesto administrativo o académico oficial</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="usr-dependencia">Dependencia o Facultad <span class="required">*</span></label>
            <input type="text" id="usr-dependencia" class="form-control" placeholder="Ej. Facultad de Ciencias Médicas" required />
            <small class="field-hint">Área a la que pertenece el funcionario</small>
          </div>

          <div class="form-group">
            <label class="form-label" for="usr-tipo-autoridad">Tipo de Autoridad para Dictámenes</label>
            <select id="usr-tipo-autoridad" class="form-control custom-select">
              <option value="">Ninguno / Usuario Regular</option>
              <option value="Secretaria General">Secretaría General</option>
              <option value="Decano de la Facultad">Decano de la Facultad</option>
              <option value="Dirección de Planificación y Gestión de Calidad">Dirección de Planificación y Gestión de Calidad</option>
            </select>
            <small class="field-hint">Habilita firma y asignación en la fase de resolución</small>
          </div>

          <div class="form-actions-bar" style="grid-column: span 3; margin-top: 16px;">
            <button type="reset" class="btn btn-secondary">Limpiar Formulario</button>
            <button type="submit" class="btn btn-primary btn-lg" id="btn-save-new-user">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Guardar y Dar de Alta Usuario
            </button>
          </div>
        </form>

        <!-- PLAN INSTITUCIONAL DE NIVELES DE SEGURIDAD Y ROLES -->
        <div style="margin-top: 28px; padding: 22px; background: #F8FAFC; border: 1px solid var(--border-color); border-radius: 12px;">
          <h4 style="font-size: 13.5px; font-weight: 800; color: #1E293B; margin: 0 0 14px 0; display: flex; align-items: center; gap: 8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
            PLAN DE NIVELES DE SEGURIDAD INSTITUCIONAL (ROLES DE ACCESO)
          </h4>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 14px;">
            <div style="background: #FFFFFF; padding: 14px; border-radius: 8px; border-left: 4px solid #EF4444; box-shadow: var(--shadow-sm);">
              <span class="badge badge-danger">NIVEL 1: SUPERADMIN</span>
              <p style="font-size: 11.5px; color: #475569; margin: 8px 0 0 0; line-height: 1.45;">Control absoluto. Administración y asignación de todos los roles, configuración global, papelera y auditoría de la plataforma.</p>
            </div>
            <div style="background: #FFFFFF; padding: 14px; border-radius: 8px; border-left: 4px solid #F59E0B; box-shadow: var(--shadow-sm);">
              <span class="badge badge-warning">NIVEL 2: ADMIN</span>
              <p style="font-size: 11.5px; color: #475569; margin: 8px 0 0 0; line-height: 1.45;">Gestión operativa completa de denuncias, coordinación de auditoría, catálogos institucionales y alta/edición de usuarios.</p>
            </div>
            <div style="background: #FFFFFF; padding: 14px; border-radius: 8px; border-left: 4px solid #8B5CF6; box-shadow: var(--shadow-sm);">
              <span class="badge badge-purple">NIVEL 3: SUPERVISOR</span>
              <p style="font-size: 11.5px; color: #475569; margin: 8px 0 0 0; line-height: 1.45;">Auditoría de casos, seguimiento de alertas SLA, emisión y firma de dictámenes resolutivos y trazabilidad SETEC.</p>
            </div>
            <div style="background: #FFFFFF; padding: 14px; border-radius: 8px; border-left: 4px solid #0099A8; box-shadow: var(--shadow-sm);">
              <span class="badge badge-info">NIVEL 4: ESTÁNDAR</span>
              <p style="font-size: 11.5px; color: #475569; margin: 8px 0 0 0; line-height: 1.45;">Radicación y registro inicial de nuevos casos, consulta del estado y trazabilidad de expedientes asignados.</p>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // VISTA 3: USUARIOS REGISTRADOS Y ASIGNACIÓN DE ROLES (SEPARADA)
  renderUsuariosRolesTab(users, currentUser) {
    return `
      <div class="users-roles-dedicated-view animate-fade-in">
        <!-- SIMULADOR DE USUARIO ACTIVO (SWITCH) -->
        <div class="user-switch-bar">
          <div class="switch-info">
            <span class="switch-title">Sesión Activa:</span>
            <strong>${currentUser.nombre}</strong>
            <span class="badge ${this.getRoleBadge(currentUser.rol)}">${currentUser.rol}</span>
            <span class="switch-cargo">(${currentUser.cargo})</span>
          </div>
          <div class="switch-picker">
            <label>Cambiar Usuario para Probar Permisos:</label>
            <select id="cfg-switch-user" class="form-control custom-select">
              ${users.map(u => `
                <option value="${u.id}" ${u.id === currentUser.id ? 'selected' : ''}>
                  ${u.nombre} • ${u.rol} (${u.cargo})
                </option>
              `).join('')}
            </select>
          </div>
        </div>

        <div class="subcard-header-between" style="margin-bottom: 14px;">
          <div>
            <h4 class="subcard-title">CATÁLOGO DE USUARIOS Y ASIGNACIÓN DE ROLES</h4>
            <p style="font-size: 12.5px; color: #808284; margin-top: 2px;">Gestione la activación, permisos y jerarquía institucional de los funcionarios registrados</p>
          </div>
          <button type="button" class="btn btn-primary btn-sm" id="btn-goto-alta-user">
            + Dar de Alta Nuevo Usuario
          </button>
        </div>

        <div class="table-responsive">
          <table class="table modern-table">
            <thead>
              <tr>
                <th>Funcionario / Nombre</th>
                <th>Correo Institucional</th>
                <th>Nivel de Seguridad y Rol</th>
                <th>Cargo Oficial</th>
                <th>Dependencia</th>
                <th>Tipo Autoridad</th>
                <th>Estado</th>
                <th style="text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${users.map(u => `
                <tr>
                  <td>
                    <strong>${u.nombre}</strong>
                  </td>
                  <td style="color: #0099A8; font-weight: 500;">${u.email}</td>
                  <td>
                    ${this.getRoleLevelBadge(u.rol)}
                  </td>
                  <td>${u.cargo}</td>
                  <td>${u.dependencia}</td>
                  <td>
                    ${u.tipoAutoridad ? `<span class="badge badge-purple">${u.tipoAutoridad}</span>` : '<span style="color:#808284;">-</span>'}
                  </td>
                  <td>
                    <span class="badge ${u.activo ? 'badge-success' : 'badge-danger'}">
                      ${u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style="text-align: right;">
                    <div class="row-actions-group" style="justify-content: flex-end;">
                      <button type="button" class="btn-action btn-edit-user" data-id="${u.id}" title="Editar datos del usuario">
                        ✏️ Editar
                      </button>
                      <button type="button" class="btn-action btn-toggle-user ${u.activo ? 'status-active-btn' : 'status-inactive-btn'}" data-id="${u.id}" title="${u.activo ? 'Haga clic para desactivar' : 'Haga clic para activar'}">
                        ${u.activo ? '🟢 Activo' : '⚪ Inactivo'}
                      </button>
                      <button type="button" class="btn-action btn-delete-user" data-id="${u.id}" title="${u.rol === 'SUPERADMIN' ? 'El Superadmin principal no puede ser eliminado' : 'Borrar usuario y trasladar a la papelera'}" ${u.rol === 'SUPERADMIN' ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : 'style="color:#dc2626;"'}>
                        🗑️ Borrar
                      </button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>

        <!-- CONTENEDOR MODAL DE EDICIÓN DE USUARIO -->
        <div id="edit-user-modal-container"></div>
      </div>
    `;
  }

  getRoleBadge(rol) {
    switch (rol) {
      case 'SUPERADMIN': return 'badge-danger';
      case 'ADMIN': return 'badge-warning';
      case 'SUPERVISOR': return 'badge-purple';
      case 'ESTANDAR': return 'badge-info';
      default: return 'badge-info';
    }
  }

  getRoleLevelBadge(rol) {
    switch (rol) {
      case 'SUPERADMIN':
        return '<span class="badge badge-danger" title="Nivel 1: Control Total Absoluto">NIVEL 1 • SUPERADMIN</span>';
      case 'ADMIN':
        return '<span class="badge badge-warning" title="Nivel 2: Gestión y Auditoría">NIVEL 2 • ADMIN</span>';
      case 'SUPERVISOR':
        return '<span class="badge badge-purple" title="Nivel 3: Dictámenes, Auditoría y SLA">NIVEL 3 • SUPERVISOR</span>';
      case 'ESTANDAR':
        return '<span class="badge badge-info" title="Nivel 4: Radicación y Consulta">NIVEL 4 • ESTÁNDAR</span>';
      default:
        return `<span class="badge badge-info">NIVEL 4 • ${rol}</span>`;
    }
  }

  bindEvents(departamentos, facultades, categorias, tipos, users) {
    // Subtab switching
    this.container.querySelectorAll('.cfg-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.activeSubtab = btn.getAttribute('data-subtab');
        this.render();
      });
    });

    // Reset defaults button
    const btnReset = document.getElementById('btn-reset-defaults');
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        if (confirm('¿Desea restablecer todos los catálogos y casos de demostración a su estado original?')) {
          storage.resetToDefault();
          toast.success('El sistema ha sido restablecido a los valores iniciales.');
          this.render();
        }
      });
    }

    if (this.activeSubtab === 'listas') {
      // Department selector
      const depSelect = document.getElementById('cfg-dep-selector');
      if (depSelect) {
        depSelect.addEventListener('change', () => {
          this.selectedDepId = depSelect.value;
          this.render();
        });
      }

      // Add municipality
      const btnAddMun = document.getElementById('btn-add-mun');
      const inputMun = document.getElementById('new-mun-input');
      if (btnAddMun && inputMun) {
        const handleAddMun = () => {
          const val = inputMun.value.trim();
          if (!val) return;
          const deps = storage.getDepartamentos();
          const target = deps.find(d => d.id === this.selectedDepId);
          if (target) {
            target.municipios.push(val);
            storage.saveDepartamentos(deps);
            toast.success(`Municipio "${val}" agregado a ${target.nombre}.`);
            this.render();
          }
        };
        btnAddMun.addEventListener('click', handleAddMun);
        inputMun.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAddMun(); });
      }

      // Faculty selector
      const facSelect = document.getElementById('cfg-fac-selector');
      if (facSelect) {
        facSelect.addEventListener('change', () => {
          this.selectedFacId = facSelect.value;
          this.render();
        });
      }

      // Add new Facultad
      const btnAddFac = document.getElementById('btn-add-facultad');
      const inputFac = document.getElementById('new-fac-input');
      if (btnAddFac && inputFac) {
        const handleAddFac = () => {
          const val = inputFac.value.trim();
          if (!val) {
            toast.warning('Por favor escriba el nombre de la nueva facultad.');
            inputFac.focus();
            return;
          }
          const created = storage.addFacultad(val);
          if (created) {
            this.selectedFacId = created.id;
            toast.success(`Facultad "${val}" agregada exitosamente. Ahora puede asociarle carreras.`);
            this.render();
          }
        };
        btnAddFac.addEventListener('click', handleAddFac);
        inputFac.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAddFac(); });
      }

      // Delete selected Facultad
      const btnDelFac = document.getElementById('btn-delete-fac');
      if (btnDelFac) {
        btnDelFac.addEventListener('click', () => {
          const facs = storage.getFacultades();
          if (facs.length <= 1) {
            toast.warning('El sistema debe conservar al menos una facultad universitaria.');
            return;
          }
          const target = facs.find(f => f.id === this.selectedFacId);
          if (!target) return;
          this.openConfirmDeleteFacultadModal(target);
        });
      }

      // Add career
      const btnAddCar = document.getElementById('btn-add-carrera');
      const inputCar = document.getElementById('new-carrera-input');
      if (btnAddCar && inputCar) {
        const handleAddCar = () => {
          const val = inputCar.value.trim();
          if (!val) return;
          const facs = storage.getFacultades();
          const target = facs.find(f => f.id === this.selectedFacId);
          if (target) {
            target.carreras.push(val);
            storage.saveFacultades(facs);
            toast.success(`Carrera "${val}" agregada a ${target.nombre}.`);
            this.render();
          }
        };
        btnAddCar.addEventListener('click', handleAddCar);
        inputCar.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAddCar(); });
      }

      // Add Tipo Denuncia
      const btnAddTipo = document.getElementById('btn-add-tipo');
      const inputTipo = document.getElementById('new-tipo-input');
      if (btnAddTipo && inputTipo) {
        const handleAddTipo = () => {
          const val = inputTipo.value.trim();
          if (!val) return;
          const currentTipos = storage.getTiposDenuncia();
          currentTipos.push(val);
          storage.saveTiposDenuncia(currentTipos);
          toast.success(`Tipo de denuncia "${val}" agregado.`);
          this.render();
        };
        btnAddTipo.addEventListener('click', handleAddTipo);
        inputTipo.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAddTipo(); });
      }

      // Add Categoria
      const btnAddCat = document.getElementById('btn-add-cat');
      const inputCat = document.getElementById('new-cat-input');
      if (btnAddCat && inputCat) {
        const handleAddCat = () => {
          const val = inputCat.value.trim();
          if (!val) return;
          const currentCats = storage.getCategorias();
          currentCats.push(val);
          storage.saveCategorias(currentCats);
          toast.success(`Categoría "${val}" agregada.`);
          this.render();
        };
        btnAddCat.addEventListener('click', handleAddCat);
        inputCat.addEventListener('keydown', (e) => { if (e.key === 'Enter') handleAddCat(); });
      }

      // Remove items
      this.container.querySelectorAll('.btn-remove-item').forEach(btn => {
        btn.addEventListener('click', () => {
          const type = btn.getAttribute('data-type');
          const index = parseInt(btn.getAttribute('data-index'), 10);

          if (type === 'municipio') {
            const deps = storage.getDepartamentos();
            const target = deps.find(d => d.id === this.selectedDepId);
            if (target && target.municipios.length > 1) {
              const removed = target.municipios.splice(index, 1);
              storage.saveDepartamentos(deps);
              toast.info(`Municipio "${removed}" eliminado.`);
              this.render();
            } else {
              toast.warning('El departamento debe conservar al menos un municipio.');
            }
          } else if (type === 'carrera') {
            const facs = storage.getFacultades();
            const target = facs.find(f => f.id === this.selectedFacId);
            if (target && target.carreras.length > 1) {
              const removed = target.carreras.splice(index, 1);
              storage.saveFacultades(facs);
              toast.info(`Carrera "${removed}" eliminada.`);
              this.render();
            } else {
              toast.warning('La facultad debe conservar al menos una carrera.');
            }
          } else if (type === 'tipoDenuncia') {
            const currentTipos = storage.getTiposDenuncia();
            if (currentTipos.length > 1) {
              const removed = currentTipos.splice(index, 1);
              storage.saveTiposDenuncia(currentTipos);
              toast.info(`Tipo de denuncia "${removed}" eliminado.`);
              this.render();
            }
          } else if (type === 'categoria') {
            const currentCats = storage.getCategorias();
            if (currentCats.length > 1) {
              const removed = currentCats.splice(index, 1);
              storage.saveCategorias(currentCats);
              toast.info(`Categoría "${removed}" eliminada.`);
              this.render();
            }
          }
        });
      });
    } else if (this.activeSubtab === 'alta_usuario') {
      // Add user form
      const userForm = document.getElementById('form-add-user');
      if (userForm) {
        userForm.addEventListener('submit', (e) => {
          e.preventDefault();
          const nombre = document.getElementById('usr-nombre').value.trim();
          const email = document.getElementById('usr-email').value.trim();
          const rol = document.getElementById('usr-rol').value;
          const cargo = document.getElementById('usr-cargo').value.trim();
          const dependencia = document.getElementById('usr-dependencia').value.trim();
          const tipoAutoridad = document.getElementById('usr-tipo-autoridad').value;

          if (!nombre || !email || !cargo || !dependencia) {
            toast.error('Complete todos los campos del nuevo usuario.');
            return;
          }

          const newUser = {
            id: `usr-${Date.now().toString().slice(-4)}`,
            nombre,
            email,
            rol,
            cargo,
            dependencia,
            tipoAutoridad: tipoAutoridad || undefined,
            activo: true
          };

          const currentUsers = storage.getUsers();
          currentUsers.push(newUser);
          storage.saveUsers(currentUsers);
          toast.success(`Usuario ${newUser.nombre} dado de alta con éxito con rol ${newUser.rol}.`, 'Usuario Registrado');

          // Transition to users list tab to view the added user
          this.activeSubtab = 'usuarios_roles';
          this.render();
        });
      }
    } else if (this.activeSubtab === 'usuarios_roles') {
      // Quick jump button to Alta
      const btnGotoAlta = document.getElementById('btn-goto-alta-user');
      if (btnGotoAlta) {
        btnGotoAlta.addEventListener('click', () => {
          this.activeSubtab = 'alta_usuario';
          this.render();
        });
      }

      // Switch active user
      const switchSelect = document.getElementById('cfg-switch-user');
      if (switchSelect) {
        switchSelect.addEventListener('change', () => {
          const chosen = users.find(u => u.id === switchSelect.value);
          if (chosen) {
            storage.setCurrentUser(chosen);
            toast.success(`Sesión cambiada a: ${chosen.nombre} (${chosen.rol})`);
            if (typeof this.onUserChanged === 'function') {
              this.onUserChanged(chosen);
            }
            this.render();
          }
        });
      }

      // Toggle user active status
      this.container.querySelectorAll('.btn-toggle-user').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const updated = storage.toggleUserStatus(id);
          if (updated) {
            toast.info(`El usuario ${updated.nombre} ahora está ${updated.activo ? 'Activo' : 'Inactivo'}.`);
            this.render();
          }
        });
      });

      // Edit user button
      this.container.querySelectorAll('.btn-edit-user').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const target = users.find(u => u.id === id);
          if (target) {
            this.openEditUserModal(target);
          }
        });
      });

      // Delete user button (Send to Trash) - Opción Borrar
      this.container.querySelectorAll('.btn-delete-user').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const target = users.find(u => u.id === id);
          if (!target) return;

          if (target.rol === 'SUPERADMIN') {
            toast.warning('No es posible borrar al Superadmin principal del sistema.');
            return;
          }

          this.openConfirmDeleteUserModal(target);
        });
      });
    }
  }

  openEditUserModal(user) {
    const modalContainer = document.getElementById('edit-user-modal-container');
    if (!modalContainer) return;

    modalContainer.innerHTML = `
      <div class="modal-backdrop animate-fade-in" id="modal-edit-user-backdrop">
        <div class="modal-box card animate-scale-up" style="max-width: 600px; width: 95%;">
          <div class="modal-header border-bottom" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="header-icon-box" style="width: 36px; height: 36px; background: rgba(0, 153, 168, 0.1); color: #0099A8;">
                ✏️
              </div>
              <div>
                <h3 style="font-size: 16px; font-weight: 700; color: #808284; margin: 0;">EDITAR USUARIO</h3>
                <span style="font-size: 12px; color: #808284;">Modificar datos institucionales de ${user.nombre}</span>
              </div>
            </div>
            <button type="button" class="btn-close-modal" id="btn-close-edit-modal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #808284;">&times;</button>
          </div>

          <form id="form-edit-user">
            <div class="grid grid-2 form-row" style="gap: 14px;">
              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label" for="edit-usr-nombre">Nombre y Apellidos Completos <span class="required">*</span></label>
                <input type="text" id="edit-usr-nombre" class="form-control" value="${user.nombre}" required />
              </div>

              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label" for="edit-usr-email">Correo Electrónico Institucional <span class="required">*</span></label>
                <input type="email" id="edit-usr-email" class="form-control" value="${user.email}" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-usr-rol">Nivel de Seguridad y Rol <span class="required">*</span></label>
                <select id="edit-usr-rol" class="form-control custom-select" required ${user.rol === 'SUPERADMIN' ? 'disabled' : ''}>
                  <option value="ESTANDAR" ${user.rol === 'ESTANDAR' ? 'selected' : ''}>Estándar (Nivel 4 - Operador)</option>
                  <option value="SUPERVISOR" ${user.rol === 'SUPERVISOR' ? 'selected' : ''}>Supervisor (Nivel 3 - Dictamen y SLA)</option>
                  <option value="ADMIN" ${user.rol === 'ADMIN' ? 'selected' : ''}>Administrador (Nivel 2 - Gestión y Control)</option>
                  <option value="SUPERADMIN" ${user.rol === 'SUPERADMIN' ? 'selected' : ''}>Superadministrador (Nivel 1 - Control Total)</option>
                </select>
                ${user.rol === 'SUPERADMIN' ? '<small class="field-hint" style="color: #EF4444; font-weight: 700;">Rol permanente de Superadministrador (no modificable)</small>' : ''}
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-usr-activo">Estatus de la Cuenta <span class="required">*</span></label>
                <select id="edit-usr-activo" class="form-control custom-select" required>
                  <option value="true" ${user.activo ? 'selected' : ''}>Activo (Acceso Habilitado)</option>
                  <option value="false" ${!user.activo ? 'selected' : ''}>Inactivo (Acceso Suspendido)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-usr-cargo">Cargo Oficial <span class="required">*</span></label>
                <input type="text" id="edit-usr-cargo" class="form-control" value="${user.cargo}" required />
              </div>

              <div class="form-group">
                <label class="form-label" for="edit-usr-dependencia">Dependencia o Facultad <span class="required">*</span></label>
                <input type="text" id="edit-usr-dependencia" class="form-control" value="${user.dependencia}" required />
              </div>

              <div class="form-group" style="grid-column: span 2;">
                <label class="form-label" for="edit-usr-tipo-autoridad">Tipo de Autoridad para Dictámenes</label>
                <select id="edit-usr-tipo-autoridad" class="form-control custom-select">
                  <option value="" ${!user.tipoAutoridad ? 'selected' : ''}>Ninguno / Usuario Regular</option>
                  <option value="Secretaria General" ${user.tipoAutoridad === 'Secretaria General' ? 'selected' : ''}>Secretaría General</option>
                  <option value="Decano de la Facultad" ${user.tipoAutoridad === 'Decano de la Facultad' ? 'selected' : ''}>Decano de la Facultad</option>
                  <option value="Dirección de Planificación y Gestión de Calidad" ${user.tipoAutoridad === 'Dirección de Planificación y Gestión de Calidad' ? 'selected' : ''}>Dirección de Planificación y Gestión de Calidad</option>
                </select>
              </div>
            </div>

            <div class="form-actions-bar" style="margin-top: 20px; justify-content: flex-end; gap: 10px;">
              <button type="button" class="btn btn-secondary" id="btn-cancel-edit-modal">Cancelar</button>
              <button type="submit" class="btn btn-primary">
                💾 Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    `;

    const closeModal = () => {
      modalContainer.innerHTML = '';
    };

    document.getElementById('btn-close-edit-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-edit-modal')?.addEventListener('click', closeModal);
    document.getElementById('modal-edit-user-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-edit-user-backdrop') closeModal();
    });

    const editForm = document.getElementById('form-edit-user');
    if (editForm) {
      editForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const updatedData = {
          id: user.id,
          nombre: document.getElementById('edit-usr-nombre').value.trim(),
          email: document.getElementById('edit-usr-email').value.trim(),
          rol: user.rol === 'SUPERADMIN' ? 'SUPERADMIN' : document.getElementById('edit-usr-rol').value,
          cargo: document.getElementById('edit-usr-cargo').value.trim(),
          dependencia: document.getElementById('edit-usr-dependencia').value.trim(),
          tipoAutoridad: document.getElementById('edit-usr-tipo-autoridad').value || undefined,
          activo: document.getElementById('edit-usr-activo').value === 'true'
        };

        storage.updateUser(updatedData);
        toast.success(`Datos de ${updatedData.nombre} actualizados con éxito.`);
        closeModal();
        this.render();
      });
    }
  }

  getModalContainer() {
    let container = document.getElementById('edit-user-modal-container');
    if (!container) {
      container = document.getElementById('config-modal-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'config-modal-container';
        this.container.appendChild(container);
      }
    }
    return container;
  }

  openConfirmDeleteUserModal(user) {
    const modalContainer = this.getModalContainer();
    modalContainer.innerHTML = `
      <div class="modal-backdrop animate-fade-in" id="modal-delete-user-backdrop">
        <div class="modal-box card animate-scale-up" style="max-width: 480px; width: 95%;">
          <div class="modal-header border-bottom" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="header-icon-box" style="width: 38px; height: 38px; background: rgba(220, 38, 38, 0.1); color: #dc2626;">
                🗑️
              </div>
              <div>
                <h3 style="font-size: 16px; font-weight: 700; color: #dc2626; margin: 0;">BORRAR USUARIO</h3>
                <span style="font-size: 12px; color: #808284;">Mover funcionario a la papelera</span>
              </div>
            </div>
            <button type="button" class="btn-close-modal" id="btn-close-del-user-modal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #808284;">&times;</button>
          </div>

          <div style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
            ¿Está seguro de borrar y enviar a la papelera al usuario <strong>${user.nombre}</strong> (${user.rol})?
            <div style="margin-top: 10px; padding: 10px 14px; background: #FEF2F2; border-left: 3px solid #dc2626; border-radius: 4px; font-size: 12px; color: #991B1B;">
              ℹ️ El usuario dejará de tener acceso activo al sistema pero podrá ser consultado o restaurado en cualquier momento desde la pestaña <strong>PAPELERA</strong>.
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn btn-outline" id="btn-cancel-del-user">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-confirm-del-user" style="background: #dc2626; border-color: #dc2626; color: #fff;">
              🗑️ Sí, Borrar Usuario
            </button>
          </div>
        </div>
      </div>
    `;

    const closeModal = () => {
      modalContainer.innerHTML = '';
    };

    document.getElementById('btn-close-del-user-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-del-user')?.addEventListener('click', closeModal);
    document.getElementById('modal-delete-user-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-delete-user-backdrop') closeModal();
    });

    document.getElementById('btn-confirm-del-user')?.addEventListener('click', () => {
      const ok = storage.deleteUser(user.id);
      if (ok) {
        toast.success(`Usuario "${user.nombre}" borrado y trasladado a la papelera.`);
        closeModal();
        this.render();
      } else {
        toast.error('No se pudo borrar el usuario.');
      }
    });
  }

  openConfirmDeleteFacultadModal(fac) {
    const modalContainer = this.getModalContainer();
    modalContainer.innerHTML = `
      <div class="modal-backdrop animate-fade-in" id="modal-delete-fac-backdrop">
        <div class="modal-box card animate-scale-up" style="max-width: 480px; width: 95%;">
          <div class="modal-header border-bottom" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px;">
            <div style="display: flex; align-items: center; gap: 10px;">
              <div class="header-icon-box" style="width: 38px; height: 38px; background: rgba(220, 38, 38, 0.1); color: #dc2626;">
                🏛️
              </div>
              <div>
                <h3 style="font-size: 16px; font-weight: 700; color: #dc2626; margin: 0;">ELIMINAR FACULTAD</h3>
                <span style="font-size: 12px; color: #808284;">Eliminación de catálogo institucional</span>
              </div>
            </div>
            <button type="button" class="btn-close-modal" id="btn-close-del-fac-modal" style="background: none; border: none; font-size: 22px; cursor: pointer; color: #808284;">&times;</button>
          </div>

          <div style="font-size: 14px; line-height: 1.6; color: #334155; margin-bottom: 20px;">
            ¿Está seguro de eliminar la <strong>${fac.nombre}</strong> con sus ${fac.carreras.length} carreras asociadas?
            <div style="margin-top: 10px; padding: 10px 14px; background: #FFFBEB; border-left: 3px solid #D97706; border-radius: 4px; font-size: 12px; color: #92400E;">
              ⚠️ Esta acción eliminará esta facultad de las listas desplegables del sistema.
            </div>
          </div>

          <div style="display: flex; justify-content: flex-end; gap: 10px;">
            <button type="button" class="btn btn-outline" id="btn-cancel-del-fac">Cancelar</button>
            <button type="button" class="btn btn-primary" id="btn-confirm-del-fac" style="background: #dc2626; border-color: #dc2626; color: #fff;">
              🗑️ Sí, Eliminar Facultad
            </button>
          </div>
        </div>
      </div>
    `;

    const closeModal = () => {
      modalContainer.innerHTML = '';
    };

    document.getElementById('btn-close-del-fac-modal')?.addEventListener('click', closeModal);
    document.getElementById('btn-cancel-del-fac')?.addEventListener('click', closeModal);
    document.getElementById('modal-delete-fac-backdrop')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal-delete-fac-backdrop') closeModal();
    });

    document.getElementById('btn-confirm-del-fac')?.addEventListener('click', () => {
      const ok = storage.deleteFacultad(fac.id);
      if (ok) {
        const remaining = storage.getFacultades();
        this.selectedFacId = remaining.length > 0 ? remaining[0].id : null;
        toast.success(`Facultad "${fac.nombre}" eliminada correctamente.`);
        closeModal();
        this.render();
      } else {
        toast.error('No fue posible eliminar la facultad.');
      }
    });
  }
}
