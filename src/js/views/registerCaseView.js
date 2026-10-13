/**
 * RegisterCaseView
 * Sección "REGISTRAR CASO"
 * 
 * Flujo en 2 Fases:
 * 1. Selección Previa Obligatoria de Canal/Tipo:
 *    - "Denuncia UAM": No carga el campo de código SETEC.
 *    - "Denuncia SETEC": Pregunta y captura previamente el Código SETEC, el cual
 *      se transfiere al formulario en modo NO EDITABLE (bloqueado/readonly).
 * 2. Formulario de Radicación:
 *    - 3 columnas de control y plazo máximo reglamentario de 10 días (con cálculo de fecha límite).
 *    - Departamento y Municipio con buscador.
 *    - Foto del estudiante/denunciante a la par del título.
 *    - Datos del afectado y académicos (con filtrado médico).
 *    - Descripción, Solicitud y Evidencias.
 */

import { storage } from '../services/storage.js';
import { SearchableSelect } from '../components/searchableSelect.js';
import { toast } from '../components/toast.js';
import { SlaHelper } from '../services/slaHelper.js';

export class RegisterCaseView {
  constructor(containerEl, onCaseCreated = null) {
    this.container = containerEl;
    this.onCaseCreated = onCaseCreated;
    this.caseType = null; // 'UAM' | 'SETEC'
    this.setecCode = '';
    this.attachedFiles = [];
    this.studentPhotoBase64 = null;
    this.depSelect = null;
    this.munSelect = null;
    this.facSelect = null;
    this.carSelect = null;
  }

  render() {
    // Si aún no ha seleccionado el tipo de denuncia, mostrar pantalla previa de selección
    if (!this.caseType) {
      this.renderTypeSelector();
      return;
    }

    this.renderForm();
  }

  /**
   * PANTALLA 1: SELECCIÓN PREVIA DE TIPO DE DENUNCIA (UAM vs SETEC)
   */
  renderTypeSelector() {
    this.container.innerHTML = `
      <div class="card form-card animate-fade-in">
        <div class="card-header border-bottom">
          <div class="header-icon-box" style="background: rgba(0, 153, 168, 0.1); color: #0099A8;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="3" x2="9" y2="21"></line>
              <line x1="15" y1="3" x2="15" y2="21"></line>
            </svg>
          </div>
          <div>
            <h2 class="card-title">SELECCIONE EL TIPO DE DENUNCIA A REGISTRAR</h2>
            <p class="card-subtitle">
              Indique el canal de procedencia y radicación del expediente para configurar automáticamente los parámetros y requisitos normativos
            </p>
          </div>
        </div>

        <div class="case-type-selector-wrapper">
          <!-- OPCIÓN 1: DENUNCIA UAM -->
          <div class="case-type-choice-card" id="card-choice-uam">
            <div class="choice-image-box">
              <img src="./image/UAM.png" alt="UAM" class="choice-brand-img choice-brand-uam" />
            </div>
            <h3 class="choice-title">Denuncia UAM</h3>
            <p class="choice-desc">
              Denuncia radicada directamente ante las instancias universitarias de la Universidad Americana (UAM). 
              Este expediente se gestiona de manera interna bajo el reglamento institucional y <strong>no requiere Código SETEC</strong>.
            </p>
            <button type="button" class="btn btn-primary btn-select-uam" id="btn-select-uam" style="width: 100%;">
              Continuar con Denuncia UAM →
            </button>
          </div>

          <!-- OPCIÓN 2: DENUNCIA SETEC -->
          <div class="case-type-choice-card" id="card-choice-setec">
            <div class="choice-image-box">
              <img src="./image/SETEC.png" alt="SETEC" class="choice-brand-img choice-brand-setec" />
            </div>
            <h3 class="choice-title">Denuncia SETEC</h3>
            <p class="choice-desc">
              Denuncia canalizada a través del Sistema Estatal de Trazabilidad Educativa y Consultas (SETEC). 
              <strong>Requiere digitar el Código SETEC oficial</strong>, el cual quedará registrado en el expediente en modo de solo lectura.
            </p>

            <div class="setec-input-drawer" id="setec-input-drawer" style="display: none;">
              <label class="form-label" for="initial-setec-input">
                Digite el Código SETEC Oficial: <span class="required">*</span>
              </label>
              <div style="display: flex; gap: 8px; margin-top: 6px;">
                <input type="text" id="initial-setec-input" class="form-control" placeholder="Ej. SETEC-01-4495" autocomplete="off" />
                <button type="button" class="btn btn-primary" id="btn-confirm-setec" style="white-space: nowrap;">
                  Continuar al Formulario →
                </button>
              </div>
              <small class="field-hint" style="color:#0099A8; font-weight: 500;">
                ℹ️ Este código se agregará al formulario y permanecerá no editable.
              </small>
            </div>

            <button type="button" class="btn btn-outline" id="btn-open-setec-drawer" style="width: 100%;">
              Elegir Denuncia SETEC →
            </button>
          </div>
        </div>
      </div>
    `;

    // Eventos de selección
    const btnUam = document.getElementById('btn-select-uam');
    if (btnUam) {
      btnUam.addEventListener('click', () => {
        this.caseType = 'UAM';
        this.setecCode = '';
        this.render();
      });
    }

    const btnOpenSetec = document.getElementById('btn-open-setec-drawer');
    const drawer = document.getElementById('setec-input-drawer');
    const inputSetec = document.getElementById('initial-setec-input');
    const btnConfirmSetec = document.getElementById('btn-confirm-setec');

    if (btnOpenSetec && drawer) {
      btnOpenSetec.addEventListener('click', () => {
        btnOpenSetec.style.display = 'none';
        drawer.style.display = 'block';
        if (inputSetec) inputSetec.focus();
      });
    }

    const handleConfirmSetec = () => {
      const code = inputSetec.value.trim();
      if (!code) {
        toast.warning('Por favor digite el código SETEC oficial para continuar.');
        inputSetec.focus();
        return;
      }
      this.caseType = 'SETEC';
      this.setecCode = code;
      this.render();
    };

    if (btnConfirmSetec) {
      btnConfirmSetec.addEventListener('click', handleConfirmSetec);
    }
    if (inputSetec) {
      inputSetec.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleConfirmSetec();
        }
      });
    }
  }

  /**
   * PANTALLA 2: FORMULARIO DE REGISTRO ADAPTADO SEGÚN EL TIPO ELEGIDO
   */
  renderForm() {
    const nextCaseId = storage.generateNextCaseNumber();
    const today = new Date().toISOString().split('T')[0];
    const limitDate = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const departamentos = storage.getDepartamentos();
    const facultades = storage.getFacultades();
    const categorias = storage.getCategorias();
    const tiposDenuncia = storage.getTiposDenuncia();

    this.container.innerHTML = `
      <div class="card form-card animate-fade-in">
        <!-- HEADER CON TITULO, TIPO DE DENUNCIA, PLAZO 10 DÍAS Y CUADRO DE FOTO -->
        <div class="card-header border-bottom header-with-photo-row">
          <div class="header-main-info">
            <div class="header-icon-box" style="background: rgba(0, 153, 168, 0.1); color: #0099A8;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div>
              <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                <h2 class="card-title">REGISTRAR NUEVA DENUNCIA UNIVERSITARIA</h2>
                <span class="badge ${this.caseType === 'UAM' ? 'badge-purple' : 'badge-info'}" style="font-size: 11.5px;">
                  TIPO: DENUNCIA ${this.caseType}
                </span>
                <button type="button" class="btn btn-sm btn-outline" id="btn-change-case-type" style="padding: 2px 8px; font-size: 11px;" title="Volver a la selección inicial">
                  ← Cambiar Tipo
                </button>
              </div>
              <p class="card-subtitle" style="margin-top: 4px;">
                ${this.caseType === 'UAM' 
                  ? 'Expediente interno UAM. Trámite normativo institucional con plazo máximo de 10 días.' 
                  : `Expediente con trazabilidad SETEC. Código asignado: <strong>${this.setecCode}</strong> (no editable).`}
              </p>
            </div>
          </div>

          <!-- CUADRO DONDE SE PUEDE CARGAR FOTO DEL ESTUDIANTE O DENUNCIANTE -->
          <div class="student-photo-uploader" id="student-photo-uploader">
            <input type="file" id="reg-student-photo-input" accept="image/*" class="file-input-hidden" />
            <div class="photo-dropzone" id="photo-dropzone" title="Clic para cargar foto del estudiante">
              <div class="photo-empty-state" id="photo-empty-state" style="${this.studentPhotoBase64 ? 'display: none;' : ''}">
                <div class="photo-cam-icon">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                    <circle cx="12" cy="13" r="4"></circle>
                  </svg>
                </div>
                <span class="photo-label-main">Foto del Estudiante</span>
                <span class="photo-label-sub">Cargar o arrastrar</span>
              </div>
              <div class="photo-filled-state" id="photo-filled-state" style="${this.studentPhotoBase64 ? 'display: flex;' : 'display: none;'}">
                <img id="photo-preview-img" src="${this.studentPhotoBase64 || ''}" alt="Foto del estudiante" class="photo-preview-image" />
                <span class="photo-change-hint">Cambiar foto</span>
              </div>
            </div>
            <button type="button" class="btn-clear-student-photo" id="btn-clear-photo" style="${this.studentPhotoBase64 ? 'display: block;' : 'display: none;'}" title="Eliminar foto">&times;</button>
          </div>
        </div>

        <form id="register-case-form" class="form-body" novalidate>
          <!-- BLOQUE 1: 3 COLUMNAS -->
          <div class="form-section-header">
            <span class="step-num">1</span>
            <span class="step-title">DATOS DE RADICACIÓN Y CONTROL</span>
          </div>

          <div class="grid grid-3 form-row">
            <!-- Columna 1: No. Caso consecutivo GD-01-131026 -->
            <div class="form-group">
              <label class="form-label" for="reg-case-id">
                No. Caso <span class="required">*</span>
              </label>
              <div class="input-with-icon">
                <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
                <input type="text" id="reg-case-id" class="form-control" value="${nextCaseId}" required readonly style="background-color: #f8fafc; font-weight: 700; color: #0099A8; letter-spacing: 0.5px;" />
              </div>
              <small class="field-hint">Consecutivo GD (Gestión de Denuncia - Correlativo - Fecha)</small>
            </div>

            ${this.caseType === 'SETEC' ? `
              <!-- Columna 2 (SETEC): Código SETEC CARGADO Y NO EDITABLE -->
              <div class="form-group">
                <label class="form-label" for="reg-setec-code">
                  Código SETEC <span class="badge-lock-tag">🔒 No Editable</span>
                </label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                    <polyline points="2 17 12 22 22 17"></polyline>
                    <polyline points="2 12 12 17 22 12"></polyline>
                  </svg>
                  <input type="text" id="reg-setec-code" class="form-control" value="${this.setecCode}" readonly style="background-color: #f8fafc; font-weight: 700; color: #0099A8;" title="Código SETEC digitado en la etapa previa (no editable)" />
                </div>
                <small class="field-hint" style="color: #0099A8;">✓ Código SETEC oficial asignado</small>
              </div>

              <!-- Columna 3 (SETEC): Fecha Generada fija con plazo 10 días -->
              <div class="form-group">
                <label class="form-label" for="reg-fecha">
                  Fecha Generada <span class="badge-lock-tag">🔒 Fija del Sistema</span>
                </label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input type="date" id="reg-fecha" class="form-control" value="${today}" readonly disabled style="background-color: #F1F5F9; cursor: not-allowed; font-weight: 600; color: #475569;" />
                </div>
                <small class="field-hint" style="color: #D97706; font-weight: 600;">⏱️ Plazo Máximo: 10 días (Vence: ${limitDate})</small>
              </div>
            ` : `
              <!-- Columna 2 (UAM): Fecha Generada fija (NO SE CARGA CAMPO SETEC) -->
              <div class="form-group">
                <label class="form-label" for="reg-fecha">
                  Fecha Generada <span class="badge-lock-tag">🔒 Fija del Sistema</span>
                </label>
                <div class="input-with-icon">
                  <svg class="input-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <input type="date" id="reg-fecha" class="form-control" value="${today}" readonly disabled style="background-color: #F1F5F9; cursor: not-allowed; font-weight: 600; color: #475569;" />
                </div>
                <small class="field-hint" style="color: #0099A8;">✓ Generada automáticamente según fecha actual</small>
              </div>

              <!-- Columna 3 (UAM): Plazo máximo de 10 días normativos -->
              <div class="form-group">
                <label class="form-label">
                  Plazo Máximo de Resolución <span class="badge-lock-tag" style="background:#e0f2fe; color:#0369a1;">⏱️ 10 Días</span>
                </label>
                <div class="input-with-icon">
                  <input type="text" class="form-control" value="10 Días Máximo (Fecha Límite: ${limitDate})" readonly disabled style="background-color: #F0FDF4; font-weight: 700; color: #059669;" />
                </div>
                <small class="field-hint" style="color: #059669; font-weight: 600;">✓ Contador de 10 días hábiles activo</small>
              </div>
            `}
          </div>

          <!-- BLOQUE 2: 2 COLUMNAS (Departamento con buscador, Municipio con buscador) -->
          <div class="grid grid-2 form-row" style="margin-top: 14px;">
            <div class="form-group">
              <label class="form-label">
                Departamento (Nicaragua) <span class="required">*</span>
              </label>
              <div id="select-departamento-container"></div>
              <small class="field-hint">Seleccione o busque el departamento de procedencia</small>
            </div>

            <div class="form-group">
              <label class="form-label">
                Municipio <span class="required">*</span>
              </label>
              <div id="select-municipio-container"></div>
              <small class="field-hint">Se precarga automáticamente según el departamento seleccionado</small>
            </div>
          </div>

          <div class="form-divider"></div>

          <!-- BLOQUE 3: DATOS DEL AFECTADO -->
          <div class="form-section-header">
            <span class="step-num">2</span>
            <span class="step-title">DATOS DEL AFECTADO O DENUNCIANTE</span>
          </div>

          <div class="grid grid-3 form-row">
            <div class="form-group">
              <label class="form-label" for="reg-afectado-nombre">
                Nombre Completo <span class="required">*</span>
              </label>
              <input type="text" id="reg-afectado-nombre" class="form-control" required placeholder="Nombres y Apellidos completos" />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-afectado-cedula">
                Número de Cédula <span class="required">*</span>
              </label>
              <input type="text" id="reg-afectado-cedula" class="form-control" required placeholder="001-000000-0000X" />
              <small class="field-hint">Formato de identidad nacional</small>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-afectado-cif">
                Número CIF (Carnet UAM) <span class="required">*</span>
              </label>
              <input type="text" id="reg-afectado-cif" class="form-control" required placeholder="Ej. 21-0492" />
              <small class="field-hint">Código de Identificación Financiera / Estudiantil</small>
            </div>
          </div>

          <div class="grid grid-2 form-row" style="margin-top: 14px;">
            <div class="form-group">
              <label class="form-label" for="reg-afectado-email">
                Correo Electrónico <span class="required">*</span>
              </label>
              <input type="email" id="reg-afectado-email" class="form-control" required placeholder="estudiante@uamv.edu.ni o personal" />
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-afectado-movil">
                Teléfono Móvil <span class="required">*</span>
              </label>
              <input type="tel" id="reg-afectado-movil" class="form-control" required placeholder="+505 8888-8888" />
            </div>
          </div>

          <div class="form-divider"></div>

          <!-- BLOQUE 4: DATOS ACADÉMICOS -->
          <div class="form-section-header">
            <span class="step-num">3</span>
            <span class="step-title">DATOS ACADÉMICOS Y TIPIFICACIÓN DE LA DENUNCIA</span>
          </div>

          <div class="grid grid-2 form-row">
            <div class="form-group">
              <label class="form-label" for="reg-categoria">
                Categoría de Tipo <span class="required">*</span>
              </label>
              <select id="reg-categoria" class="form-control custom-select" required>
                <option value="">-- Seleccione Categoría --</option>
                ${categorias.map(cat => `<option value="${cat.nombre}">${cat.nombre}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-tipo-denuncia">
                Tipo de Denuncia <span class="required">*</span>
              </label>
              <select id="reg-tipo-denuncia" class="form-control custom-select" required>
                <option value="">-- Seleccione primero una Categoría --</option>
              </select>
            </div>
          </div>

          <div class="grid grid-2 form-row" style="margin-top: 14px;">
            <div class="form-group">
              <label class="form-label" for="reg-facultad">
                Facultad <span class="required">*</span>
              </label>
              <select id="reg-facultad" class="form-control custom-select" required>
                <option value="">-- Seleccione Facultad --</option>
                ${facultades.map(fac => `<option value="${fac.nombre}">${fac.nombre}</option>`).join('')}
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="reg-carrera">
                Carrera <span class="required">*</span>
              </label>
              <select id="reg-carrera" class="form-control custom-select" required>
                <option value="">-- Seleccione primero la Facultad --</option>
              </select>
            </div>
          </div>

          <div class="form-divider"></div>

          <!-- BLOQUE 5: DESCRIPCIÓN, SOLICITUD Y EVIDENCIAS -->
          <div class="form-section-header">
            <span class="step-num">4</span>
            <span class="step-title">HECHOS, PETITORIA Y EVIDENCIAS ADJUNTAS</span>
          </div>

          <div class="form-group form-row">
            <label class="form-label" for="reg-descripcion">
              Descripción del Caso (Hechos Narrados) <span class="required">*</span>
            </label>
            <textarea id="reg-descripcion" class="form-control" rows="4" required placeholder="Describa de forma precisa, clara y cronológica los hechos ocurridos..."></textarea>
          </div>

          <div class="form-group form-row">
            <label class="form-label" for="reg-solicitud">
              Solicitud Formal (Petitoria Concreta del Denunciante) <span class="required">*</span>
            </label>
            <textarea id="reg-solicitud" class="form-control" rows="3" required placeholder="Indique la solicitud concreta o medida correctiva requerida por el afectado..."></textarea>
          </div>

          <div class="form-group form-row">
            <label class="form-label">
              Evidencias presentadas por el denunciante (Carga de Archivos)
            </label>
            <div class="file-upload-drop-zone" id="file-drop-zone">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
              <div class="drop-zone-text">
                <strong>Arrastre y suelte sus archivos aquí</strong>
                <span>o haga clic para examinar desde su equipo (PDF, DOCX, JPG, PNG)</span>
              </div>
              <input type="file" id="reg-evidencias-input" multiple style="display: none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
            </div>
            <div id="attached-files-container" class="attached-files-list"></div>
          </div>

          <!-- BOTONES DE ACCIÓN FINAL -->
          <div class="form-actions-bar" style="margin-top: 24px;">
            <button type="button" class="btn btn-secondary" id="btn-limpiar-form">
              Limpiar Campos
            </button>
            <button type="submit" class="btn btn-primary btn-lg" id="btn-guardar-generar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                <polyline points="17 21 17 13 7 13 7 21"></polyline>
                <polyline points="7 3 7 8 15 8"></polyline>
              </svg>
              Guardar y Generar Denuncia
            </button>
          </div>
        </form>
      </div>
    `;

    this.bindFormEvents(departamentos, facultades, categorias, tiposDenuncia);
  }

  bindFormEvents(departamentos, facultades, categorias, tiposDenuncia) {
    // Botón para cambiar tipo
    document.getElementById('btn-change-case-type')?.addEventListener('click', () => {
      this.caseType = null;
      this.setecCode = '';
      this.render();
    });

    // Foto del estudiante
    this.bindPhotoUploader();

    // Selectores buscables de Departamento y Municipio
    this.initSearchableLocationSelects(departamentos);

    // Filtros dependientes de Categoría -> Tipos
    this.bindCategoryFilter(categorias, tiposDenuncia);

    // Filtros dependientes de Facultad -> Carreras
    this.bindFacultyFilter(facultades);

    // Carga de evidencias
    this.bindFileUpload();

    // Sumisión del formulario
    this.bindFormSubmit();
  }

  bindPhotoUploader() {
    const photoInput = document.getElementById('reg-student-photo-input');
    const photoDropzone = document.getElementById('photo-dropzone');
    const emptyState = document.getElementById('photo-empty-state');
    const filledState = document.getElementById('photo-filled-state');
    const previewImg = document.getElementById('photo-preview-img');
    const btnClear = document.getElementById('btn-clear-photo');

    if (!photoInput || !photoDropzone) return;

    photoDropzone.addEventListener('click', () => photoInput.click());

    photoInput.addEventListener('change', () => {
      if (photoInput.files && photoInput.files[0]) {
        const file = photoInput.files[0];
        const reader = new FileReader();
        reader.onload = (e) => {
          this.studentPhotoBase64 = e.target.result;
          previewImg.src = this.studentPhotoBase64;
          emptyState.style.display = 'none';
          filledState.style.display = 'flex';
          btnClear.style.display = 'block';
        };
        reader.readAsDataURL(file);
      }
    });

    btnClear?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.studentPhotoBase64 = null;
      photoInput.value = '';
      previewImg.src = '';
      emptyState.style.display = 'flex';
      filledState.style.display = 'none';
      btnClear.style.display = 'none';
    });
  }

  initSearchableLocationSelects(departamentos) {
    const depContainer = document.getElementById('select-departamento-container');
    const munContainer = document.getElementById('select-municipio-container');

    const depOptions = departamentos.map(d => ({ value: d.nombre, label: d.nombre, id: d.id }));

    this.depSelect = new SearchableSelect(depContainer, {
      id: 'reg-departamento-searchable',
      placeholder: 'Buscar departamento...',
      options: depOptions,
      initialValue: 'Managua',
      onChange: (selectedDepName) => {
        this.updateMunicipiosForDepartment(selectedDepName, departamentos);
      }
    });

    this.munSelect = new SearchableSelect(munContainer, {
      id: 'reg-municipio-searchable',
      placeholder: 'Buscar municipio...',
      options: [],
      initialValue: ''
    });

    this.updateMunicipiosForDepartment('Managua', departamentos, 'Managua');
  }

  updateMunicipiosForDepartment(depName, departamentos, defaultMun = null) {
    const foundDep = departamentos.find(d => d.nombre.toLowerCase() === (depName || '').toLowerCase());
    const municipios = foundDep ? foundDep.municipios : [];
    const munOptions = municipios.map(m => ({ value: m, label: m }));

    this.munSelect.setOptions(munOptions);

    if (defaultMun && municipios.includes(defaultMun)) {
      this.munSelect.setValue(defaultMun);
    } else if (municipios.length > 0) {
      this.munSelect.setValue(municipios[0]);
    }
  }

  bindCategoryFilter(categorias, tiposDenuncia) {
    const catSelect = document.getElementById('reg-categoria');
    const tipoSelect = document.getElementById('reg-tipo-denuncia');

    catSelect.addEventListener('change', () => {
      const selectedCat = catSelect.value;
      tipoSelect.innerHTML = '';

      if (!selectedCat) {
        tipoSelect.innerHTML = '<option value="">-- Seleccione primero una Categoría --</option>';
        return;
      }

      const filtered = tiposDenuncia.filter(t => t.categoria.toLowerCase() === selectedCat.toLowerCase());
      if (filtered.length === 0) {
        tipoSelect.innerHTML = '<option value="">-- Sin tipos asociados --</option>';
        return;
      }

      tipoSelect.innerHTML = '<option value="">-- Seleccione Tipo de Denuncia --</option>' +
        filtered.map(t => `<option value="${t.nombre}">${t.nombre}</option>`).join('');
    });
  }

  bindFacultyFilter(facultades) {
    const facSelect = document.getElementById('reg-facultad');
    const carSelect = document.getElementById('reg-carrera');

    facSelect.addEventListener('change', () => {
      const selectedFac = facSelect.value;
      carSelect.innerHTML = '';

      if (!selectedFac) {
        carSelect.innerHTML = '<option value="">-- Seleccione primero la Facultad --</option>';
        return;
      }

      const found = facultades.find(f => f.nombre.toLowerCase() === selectedFac.toLowerCase());
      if (found && found.carreras && found.carreras.length > 0) {
        carSelect.innerHTML = '<option value="">-- Seleccione Carrera --</option>' +
          found.carreras.map(c => `<option value="${c}">${c}</option>`).join('');
      } else {
        carSelect.innerHTML = '<option value="">-- Sin carreras registradas --</option>';
      }
    });
  }

  bindFileUpload() {
    const dropZone = document.getElementById('file-drop-zone');
    const fileInput = document.getElementById('reg-evidencias-input');

    if (!dropZone || !fileInput) return;

    dropZone.addEventListener('click', () => fileInput.click());

    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('is-dragover');
    });

    ['dragleave', 'dragend'].forEach(evt => {
      dropZone.addEventListener(evt, () => dropZone.classList.remove('is-dragover'));
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('is-dragover');
      if (e.dataTransfer.files) this.addFiles(e.dataTransfer.files);
    });

    fileInput.addEventListener('change', () => {
      if (fileInput.files) {
        this.addFiles(fileInput.files);
        fileInput.value = '';
      }
    });
  }

  addFiles(fileList) {
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
      const sizeStr = file.size > 1024 * 1024 
        ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(file.size / 1024)} KB`;

      this.attachedFiles.push({
        name: file.name,
        size: sizeStr,
        type: file.name.split('.').pop().toLowerCase(),
        date: new Date().toISOString().split('T')[0]
      });
    }
    this.renderAttachedFiles();
  }

  renderAttachedFiles() {
    const container = document.getElementById('attached-files-container');
    if (!container) return;

    if (this.attachedFiles.length === 0) {
      container.innerHTML = `<div class="empty-files-hint">No hay evidencias adjuntas actualmente</div>`;
      return;
    }

    container.innerHTML = `
      <div class="files-grid">
        ${this.attachedFiles.map((f, idx) => `
          <div class="file-chip">
            <div class="file-icon">📄</div>
            <div class="file-info">
              <span class="file-name" title="${f.name}">${f.name}</span>
              <span class="file-size">${f.size} • ${f.date}</span>
            </div>
            <button type="button" class="file-remove-btn" data-index="${idx}" title="Eliminar archivo">&times;</button>
          </div>
        `).join('')}
      </div>
    `;

    container.querySelectorAll('.file-remove-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.getAttribute('data-index'), 10);
        this.attachedFiles.splice(index, 1);
        this.renderAttachedFiles();
      });
    });
  }

  bindFormSubmit() {
    const form = document.getElementById('register-case-form');
    const btnLimpiar = document.getElementById('btn-limpiar-form');

    btnLimpiar?.addEventListener('click', () => {
      if (confirm('¿Desea limpiar todos los campos del formulario?')) {
        this.studentPhotoBase64 = null;
        this.render();
        toast.info('Formulario restablecido.');
      }
    });

    form?.addEventListener('submit', (e) => {
      e.preventDefault();

      const caseId = document.getElementById('reg-case-id').value.trim();
      const fecha = document.getElementById('reg-fecha').value;
      const departamento = this.depSelect ? this.depSelect.getValue() : '';
      const municipio = this.munSelect ? this.munSelect.getValue() : '';

      const nombreAfectado = document.getElementById('reg-afectado-nombre').value.trim();
      const cedula = document.getElementById('reg-afectado-cedula').value.trim();
      const email = document.getElementById('reg-afectado-email').value.trim();
      const movil = document.getElementById('reg-afectado-movil').value.trim();
      const cif = document.getElementById('reg-afectado-cif').value.trim();

      const categoria = document.getElementById('reg-categoria').value;
      const tipoDenuncia = document.getElementById('reg-tipo-denuncia').value;
      const facultad = document.getElementById('reg-facultad').value;
      const carrera = document.getElementById('reg-carrera').value;

      const descripcion = document.getElementById('reg-descripcion').value.trim();
      const solicitud = document.getElementById('reg-solicitud').value.trim();

      // Validación código SETEC según tipo
      let setecCodeToSave = 'N/A (Trámite UAM)';
      if (this.caseType === 'SETEC') {
        const inputSetec = document.getElementById('reg-setec-code');
        setecCodeToSave = inputSetec ? inputSetec.value.trim() : this.setecCode;
        if (!setecCodeToSave) {
          toast.error('El código SETEC oficial es requerido para esta denuncia.');
          return;
        }
      }

      // Validaciones generales
      if (!caseId) {
        toast.error('Número de caso no generado.');
        return;
      }
      if (!departamento || !municipio) {
        toast.error('Seleccione el Departamento y Municipio de radicación.');
        return;
      }
      if (!nombreAfectado || !cedula || !email || !movil || !cif) {
        toast.error('Por favor complete todos los datos del afectado (Nombre, Cédula, Correo, Móvil, CIF).');
        return;
      }
      if (!categoria || !tipoDenuncia || !facultad || !carrera) {
        toast.error('Complete la información académica (Categoría, Tipo, Facultad y Carrera).');
        return;
      }
      if (!descripcion || !solicitud) {
        toast.error('La descripción de los hechos y la solicitud formal son campos obligatorios.');
        return;
      }

      const newCaseData = {
        id: caseId,
        tipoOrigen: this.caseType, // 'UAM' | 'SETEC'
        codigoSetec: setecCodeToSave,
        fechaGenerada: fecha,
        departamento,
        municipio,
        fotoEstudiante: this.studentPhotoBase64 || null,
        afectado: {
          nombreCompleto: nombreAfectado,
          cedula,
          correo: email,
          movil,
          cif,
          foto: this.studentPhotoBase64 || null
        },
        academicos: {
          categoria,
          tipoDenuncia,
          facultad,
          carrera,
          descripcion,
          solicitud,
          evidencias: [...this.attachedFiles]
        },
        registroCompletado: false,
        estado: 'Registrado',
        faseActual: 1,
        diasPlazoMaximo: 10,
        resolucion: {
          cumpleCriterios: null,
          fundamentacionNormativa: '',
          aspectosTecnicos: '',
          conclusiones: '',
          evidenciasUniversidad: [],
          fechaCierre: null
        }
      };

      const savedCase = storage.saveCase(newCaseData);
      toast.success(
        `Expediente ${savedCase.id} generado exitosamente (${this.caseType === 'UAM' ? 'Denuncia UAM' : `SETEC: ${savedCase.codigoSetec}`}).`, 
        'Denuncia Radicada'
      );

      // Resetear para próxima radicación
      this.caseType = null;
      this.setecCode = '';
      this.studentPhotoBase64 = null;
      this.attachedFiles = [];

      if (typeof this.onCaseCreated === 'function') {
        this.onCaseCreated(savedCase);
      }
    });
  }
}
