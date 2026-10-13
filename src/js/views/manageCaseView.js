/**
 * ManageCaseView
 * Sección "CASOS REGISTRADOS"
 * 
 * Flujo Completo:
 * 1. Lista superior de casos con badge reactivo del contador de 10 días (SLA) y acción "Cargar Caso".
 * 2. Workspace del caso seleccionado:
 *    - Banner/Widget dinámico de cuenta regresiva de 10 días máximos para completar.
 *    - Preview no editable de los datos del registro.
 *    - COMPUERTA DE VALORACIÓN PREVIA:
 *      "¿La denuncia cumple con criterios?"
 *      -> SÍ: Carga los campos que continúan (Fundamentación, Aspectos Técnicos, Conclusiones, Evidencias, Cierre).
 *      -> NO: Muestra campo obligatorio "Descripción del Cierre / Motivo de No Admisión", botón "Cerrar Denuncia y Enviar a Histórico", y redirige a HISTÓRICO DE CASOS.
 */

import { storage } from '../services/storage.js';
import { toast } from '../components/toast.js';
import { SlaHelper } from '../services/slaHelper.js';

export class ManageCaseView {
  constructor(containerEl, currentCaseId = null, onCaseClosed = null, onNavigateToHistory = null) {
    this.container = containerEl;
    this.selectedCaseId = currentCaseId;
    this.onCaseClosed = onCaseClosed;
    this.onNavigateToHistory = onNavigateToHistory;
    this.univAttachedFiles = [];
    this.searchQuery = '';
    this.cumpleCriteriosState = null;
  }

  setCaseId(id) {
    this.selectedCaseId = id;
    this.cumpleCriteriosState = null;
    this.render();
    setTimeout(() => {
      const workspaceEl = document.getElementById('active-case-workspace');
      if (workspaceEl) {
        workspaceEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }

  render() {
    const cases = storage.getCases();
    if (cases.length === 0) {
      this.container.innerHTML = `
        <div class="card empty-state-card animate-fade-in">
          <div class="empty-state-icon">📋</div>
          <h3>No hay casos registrados en el sistema</h3>
          <p>Diríjase a la sección "REGISTRAR CASO" para aperturar un nuevo expediente de denuncia.</p>
        </div>
      `;
      return;
    }

    // Determinar caso seleccionado
    let currentCase = cases.find(c => c.id === this.selectedCaseId);
    if (!currentCase) {
      currentCase = cases.find(c => c.estado !== 'Concluido y Notificado' && !c.estado.includes('Cerrado')) || cases[0];
      this.selectedCaseId = currentCase.id;
    }

    const res = currentCase.resolucion || {};
    this.univAttachedFiles = res.evidenciasUniversidad ? [...res.evidenciasUniversidad] : [];

    // Determinar estado de cumplimiento de criterios
    if (this.cumpleCriteriosState === null) {
      if (res.cumpleCriterios === true) {
        this.cumpleCriteriosState = true;
      } else if (res.cumpleCriterios === false || currentCase.estado.includes('No Admite')) {
        this.cumpleCriteriosState = false;
      } else {
        // Por defecto, si el caso está abierto y no ha sido evaluado aún, iniciar en null para obligar a seleccionar
        this.cumpleCriteriosState = null;
      }
    }

    const isClosedCase = currentCase.estado === 'Concluido y Notificado' || currentCase.estado.includes('Cerrado') || currentCase.faseActual === 4;

    // Filtrar casos para la tabla superior
    const filteredCases = cases.filter(c => {
      if (!this.searchQuery) return true;
      const q = this.searchQuery.toLowerCase();
      const str = `${c.id} ${c.codigoSetec} ${c.afectado?.nombreCompleto} ${c.afectado?.cif} ${c.academicos?.facultad} ${c.academicos?.carrera} ${c.estado}`.toLowerCase();
      return str.includes(q);
    });

    this.container.innerHTML = `
      <div class="manage-cases-flow animate-fade-in">
        <!-- 1. LISTADO DE CASOS REGISTRADOS CON CONTADOR DE 10 DÍAS -->
        <div class="card cases-list-card" style="margin-bottom: 24px;">
          <div class="card-header border-bottom">
            <div class="header-icon-box" style="background: rgba(0, 153, 168, 0.1); color: #0099A8;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <h2 class="card-title">LISTA DE CASOS REGISTRADOS</h2>
                <span class="badge badge-info">${cases.length} Casos en Plataforma</span>
              </div>
              <p class="card-subtitle">Haga clic en <strong>"Cargar Caso"</strong> en cualquier registro para visualizar su preview y gestionar la resolución</p>
            </div>
            <div class="cases-quick-search-box">
              <input type="text" id="manage-search-input" class="form-control" placeholder="Buscar por Folio, SETEC, Denunciante..." value="${this.searchQuery}" style="width: 280px;" />
            </div>
          </div>

          <div class="table-responsive">
            <table class="table modern-table" id="table-manage-cases">
              <thead>
                <tr>
                  <th>No. Caso / SETEC</th>
                  <th>Fecha Generada</th>
                  <th>Plazo (10 Días Máx)</th>
                  <th>Denunciante / CIF</th>
                  <th>Facultad y Carrera</th>
                  <th>Estado del Caso</th>
                  <th style="text-align: right; width: 160px;">Acción</th>
                </tr>
              </thead>
              <tbody>
                ${filteredCases.map(c => {
                  const isSelected = c.id === currentCase.id;
                  const statusBadge = this.getStatusBadgeClass(c.estado);
                  const slaBadge = SlaHelper.renderSlaBadge(c);
                  return `
                    <tr class="manage-case-row ${isSelected ? 'is-active-case-row' : ''}" data-id="${c.id}" style="cursor: pointer;">
                      <td>
                        <div class="cell-case-id bold-teal" style="font-size: 13.5px;">${c.id}</div>
                        <div class="cell-sub-setec" style="font-size: 11.5px; color: #808284;">${c.codigoSetec}</div>
                      </td>
                      <td>
                        <span class="cell-date">${c.fechaGenerada}</span>
                      </td>
                      <td>
                        ${slaBadge}
                      </td>
                      <td>
                        <strong class="cell-name">${c.afectado?.nombreCompleto || 'Sin nombre'}</strong>
                        <div class="cell-cif" style="font-size: 11.5px; color: #808284;">CIF: ${c.afectado?.cif || 'N/D'}</div>
                      </td>
                      <td>
                        <div class="cell-faculty" style="font-weight: 500;">${c.academicos?.facultad || ''}</div>
                        <div class="cell-career" style="font-size: 11.5px; color: #808284;">${c.academicos?.carrera || ''}</div>
                      </td>
                      <td>
                        <span class="badge ${statusBadge}">${c.estado}</span>
                      </td>
                      <td style="text-align: right;">
                        <button type="button" class="btn btn-sm ${isSelected ? 'btn-primary' : 'btn-outline'} btn-load-selected-case" data-id="${c.id}">
                          ${isSelected ? '✓ Caso Cargado' : '📥 Cargar Caso'}
                        </button>
                      </td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
        </div>

        <!-- 2. WORKSPACE DEL CASO CARGADO -->
        <div class="card manage-card" id="active-case-workspace">
          <!-- WIDGET DE CUENTA REGRESIVA DE 10 DÍAS MÁXIMO -->
          ${SlaHelper.renderSlaWidget(currentCase)}

          <div class="card-header border-bottom">
            <div class="header-icon-box" style="background: rgba(0, 153, 168, 0.1); color: #0099A8;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <path d="M9 15l2 2 4-4"></path>
              </svg>
            </div>
            <div style="flex: 1;">
              <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
                <h2 class="card-title">EXPEDIENTE SELECCIONADO: ${currentCase.id}</h2>
                <span class="badge ${this.getStatusBadgeClass(currentCase.estado)}">
                  ${currentCase.estado}
                </span>
              </div>
              <p class="card-subtitle">
                Código: <strong style="color: #0099A8;">${currentCase.codigoSetec}</strong> | Radicado: ${currentCase.fechaGenerada} | Municipio: ${currentCase.municipio}, ${currentCase.departamento}
              </p>
            </div>
          </div>

          <!-- PREVIEW NO EDITABLE DEL REGISTRO DE CASO -->
          <div class="preview-section-container">
            <div class="preview-header-toggle" id="toggle-preview-btn">
              <div class="preview-title-box">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
                <span>PREVIEW NO EDITABLE DEL "REGISTRO CASO"</span>
              </div>
              <span class="preview-badge-status">Modo Solo Lectura</span>
            </div>

            <div class="preview-body" id="preview-body-content">
              <!-- SECCIÓN 0: RADICACIÓN GENERAL -->
              <div class="preview-section-box">
                <div class="preview-section-header">
                  <span class="preview-sec-icon">🏛️</span>
                  <span class="preview-sec-title">DATOS GENERALES DE RADICACIÓN Y UBICACIÓN</span>
                </div>
                <div class="preview-grid-3">
                  <div class="preview-item">
                    <span class="p-label">No. Caso</span>
                    <span class="p-val bold-teal">${currentCase.id}</span>
                  </div>
                  <div class="preview-item">
                    <span class="p-label">Código SETEC / Referencia</span>
                    <span class="p-val bold">${currentCase.codigoSetec}</span>
                  </div>
                  <div class="preview-item">
                    <span class="p-label">Fecha Generada</span>
                    <span class="p-val">${currentCase.fechaGenerada}</span>
                  </div>
                </div>

                <div class="preview-grid-2" style="margin-top: 14px;">
                  <div class="preview-item">
                    <span class="p-label">Departamento</span>
                    <span class="p-val">${currentCase.departamento}</span>
                  </div>
                  <div class="preview-item">
                    <span class="p-label">Municipio</span>
                    <span class="p-val">${currentCase.municipio}</span>
                  </div>
                </div>
              </div>

              <!-- SECCIÓN 1: DATOS DEL AFECTADO / DENUNCIANTE -->
              <div class="preview-section-box">
                <div class="preview-section-header">
                  <span class="preview-sec-icon">👤</span>
                  <span class="preview-sec-title">DATOS DEL AFECTADO / DENUNCIANTE</span>
                </div>
                <div class="preview-affected-flex">
                  ${currentCase.fotoEstudiante ? `
                    <div class="preview-photo-wrap">
                      <img src="${currentCase.fotoEstudiante}" alt="Foto Estudiante" class="preview-photo-img" />
                      <span class="preview-photo-tag">FOTO DENUNCIANTE</span>
                    </div>
                  ` : ''}
                  <div style="flex: 1;">
                    <div class="preview-grid-3">
                      <div class="preview-item">
                        <span class="p-label">Nombre Completo</span>
                        <span class="p-val bold">${currentCase.afectado?.nombreCompleto || 'N/D'}</span>
                      </div>
                      <div class="preview-item">
                        <span class="p-label">No. Cédula</span>
                        <span class="p-val">${currentCase.afectado?.cedula || 'N/D'}</span>
                      </div>
                      <div class="preview-item">
                        <span class="p-label">No. CIF</span>
                        <span class="p-val bold-teal">${currentCase.afectado?.cif || 'N/D'}</span>
                      </div>
                    </div>

                    <div class="preview-grid-2" style="margin-top: 14px;">
                      <div class="preview-item">
                        <span class="p-label">Correo Electrónico</span>
                        <span class="p-val">${currentCase.afectado?.correo || 'N/D'}</span>
                      </div>
                      <div class="preview-item">
                        <span class="p-label">Teléfono Móvil</span>
                        <span class="p-val">${currentCase.afectado?.movil || 'N/D'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- SECCIÓN 2: DATOS ACADÉMICOS Y NATURALEZA DE LA DENUNCIA -->
              <div class="preview-section-box">
                <div class="preview-section-header">
                  <span class="preview-sec-icon">🎓</span>
                  <span class="preview-sec-title">DATOS ACADÉMICOS Y NATURALEZA DE LA DENUNCIA</span>
                </div>
                <div class="preview-grid-2">
                  <div class="preview-item">
                    <span class="p-label">Categoría de Tipo</span>
                    <span class="p-val">${currentCase.academicos?.categoria || 'N/D'}</span>
                  </div>
                  <div class="preview-item">
                    <span class="p-label">Tipo de Denuncia</span>
                    <span class="p-val bold">${currentCase.academicos?.tipoDenuncia || 'N/D'}</span>
                  </div>
                </div>

                <div class="preview-grid-2" style="margin-top: 14px;">
                  <div class="preview-item">
                    <span class="p-label">Facultad</span>
                    <span class="p-val">${currentCase.academicos?.facultad || 'N/D'}</span>
                  </div>
                  <div class="preview-item">
                    <span class="p-label">Carrera</span>
                    <span class="p-val">${currentCase.academicos?.carrera || 'N/D'}</span>
                  </div>
                </div>
              </div>

              <!-- SECCIÓN 3: DESCRIPCIÓN, SOLICITUD Y EVIDENCIAS DEL DENUNCIANTE -->
              <div class="preview-section-box">
                <div class="preview-section-header">
                  <span class="preview-sec-icon">📝</span>
                  <span class="preview-sec-title">DESCRIPCIÓN, SOLICITUD Y EVIDENCIAS DEL DENUNCIANTE</span>
                </div>
                <div class="preview-text-block">
                  <span class="p-label">Descripción Detallada de los Hechos:</span>
                  <p class="p-text-content">${currentCase.academicos?.descripcion || 'Sin descripción radicada.'}</p>
                </div>

                <div class="preview-text-block" style="margin-top: 14px;">
                  <span class="p-label">Solicitud Concreta del Denunciante:</span>
                  <p class="p-text-content">${currentCase.academicos?.solicitud || 'Sin solicitud especificada.'}</p>
                </div>

                <div class="preview-files-block" style="margin-top: 16px;">
                  <span class="p-label">Evidencias Adjuntas por el Denunciante:</span>
                  <div class="preview-files-list">
                    ${(currentCase.academicos?.evidencias && currentCase.academicos.evidencias.length > 0) ? currentCase.academicos.evidencias.map(e => `
                      <div class="file-chip">
                        <span class="chip-icon">📎</span>
                        <span class="chip-name">${e.name}</span>
                        <span class="chip-size">${e.size}</span>
                      </div>
                    `).join('') : '<span style="color:#808284; font-size:12.5px;">No se adjuntaron evidencias externas en el registro</span>'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ============================================================== -->
          <!-- 3. COMPUERTA PREVIA OBLIGATORIA: CUMPLE CON CRITERIOS (SÍ / NO) -->
          <!-- ============================================================== -->
          <div class="admissibility-gate-card">
            <div class="admissibility-header">
              <div class="admissibility-icon-box">⚖️</div>
              <div>
                <h3 class="admissibility-title">VALORACIÓN PREVIA DE ADMISIBILIDAD Y COMPETENCIA</h3>
                <p class="admissibility-desc">
                  Antes de iniciar la fase de formulación del dictamen, determine si la denuncia cumple con los criterios de admisión y requisitos normativos institucionales.
                </p>
              </div>
            </div>

            <div class="admissibility-question-row">
              <label class="admissibility-question-label">
                ¿La denuncia cumple con los criterios para continuar el trámite de dictamen? <span class="required">*</span>
              </label>

              <div class="admissibility-options-group">
                <button type="button" class="admissibility-pill-option ${this.cumpleCriteriosState === true ? 'is-selected-yes' : ''}" id="btn-criterios-si" ${isClosedCase ? 'disabled' : ''}>
                  <span>✓ SÍ, cumple con los criterios</span>
                </button>
                <button type="button" class="admissibility-pill-option ${this.cumpleCriteriosState === false ? 'is-selected-no' : ''}" id="btn-criterios-no" ${isClosedCase ? 'disabled' : ''}>
                  <span>✕ NO cumple con los criterios</span>
                </button>
              </div>
            </div>

            <!-- BLOQUE CUANDO NO CUMPLE CRITERIOS: DESCRIPCIÓN DEL CIERRE Y ENVÍO A HISTÓRICO -->
            <div id="no-criterios-closure-box" style="display: ${this.cumpleCriteriosState === false ? 'block' : 'none'}; margin-top: 18px;" class="animate-fade-in">
              <div class="no-criterios-alert">
                <div class="form-group">
                  <label class="form-label" for="txt-cierre-criterios">
                    Descripción del Cierre / Motivo de No Admisión <span class="required">*</span>
                  </label>
                  <textarea id="txt-cierre-criterios" class="form-control" rows="4" placeholder="Explique de manera motivada y fundamentada las razones por las cuales la denuncia no cumple con los criterios de admisibilidad o no procede dictamen institucional..." ${isClosedCase ? 'readonly' : ''} required>${res.descripcionCierre || ''}</textarea>
                  <small class="field-hint" style="color:#9F1239; font-weight: 500;">
                    ℹ️ Esta justificación quedará registrada formalmente. El expediente se cerrará y se archivará en la pestaña Histórico de Casos.
                  </small>
                </div>

                ${!isClosedCase ? `
                  <div class="closure-actions-bar" style="margin-top: 14px; display: flex; justify-content: flex-end;">
                    <button type="button" class="btn btn-danger btn-lg" id="btn-cerrar-no-admite" style="background: #E11D48; border-color: #BE123C;">
                      🚫 Cerrar Denuncia y Enviar a Histórico
                    </button>
                  </div>
                ` : `
                  <div style="margin-top: 10px; font-size: 13px; color: #9F1239; font-weight: 600;">
                    ✓ Caso cerrado formalmente por no cumplir criterios (Fecha: ${res.fechaCierre || currentCase.fechaGenerada}).
                  </div>
                `}
              </div>
            </div>
          </div>

          <!-- ============================================================== -->
          <!-- 4. FORMULARIO DE DICTAMEN (SE MUESTRA SOLO SI CUMPLE CRITERIOS: SÍ) -->
          <!-- ============================================================== -->
          <div id="resolution-form-wrapper" style="display: ${this.cumpleCriteriosState === true ? 'block' : 'none'};" class="animate-fade-in">
            <form id="resolution-form" class="resolution-form-body">
              <!-- 1. FUNDAMENTACIÓN Y ASPECTOS TÉCNICOS -->
              <div class="form-section-header">
                <span class="step-num">1</span>
                <span class="step-title">FUNDAMENTACIÓN Y ANÁLISIS DE CALIDAD ACADÉMICA</span>
              </div>

              <div class="form-group form-row">
                <label class="form-label" for="res-fundamentacion">
                  Fundamentación Normativa y Calidad Académica <span class="required">*</span>
                </label>
                <textarea id="res-fundamentacion" class="form-control" rows="4" placeholder="Ingrese el sustento conforme al Reglamento Académico, Estatutos de la UAM y estándares normativos aplicables..." ${isClosedCase ? 'readonly' : ''} required>${res.fundamentacionNormativa || ''}</textarea>
                <small class="field-hint">Cite normativas institucionales, manuales de evaluación o directrices de acreditación pertinentes.</small>
              </div>

              <div class="form-group form-row">
                <label class="form-label" for="res-aspectos-tecnicos">
                  Aspectos Técnicos y Académicos de la Solicitud <span class="required">*</span>
                </label>
                <textarea id="res-aspectos-tecnicos" class="form-control" rows="4" placeholder="Detalle los hallazgos técnicos, revisión de notas, asistencia, expedientes clínicos/académicos u observaciones docentes..." ${isClosedCase ? 'readonly' : ''} required>${res.aspectosTecnicos || ''}</textarea>
                <small class="field-hint">Análisis específico de la problemática expuesta y su verificación técnica.</small>
              </div>

              <div class="form-divider" style="margin-top: 24px;"></div>

              <!-- 2. CONCLUSIONES Y EVIDENCIAS DE LA UNIVERSIDAD -->
              <div class="form-section-header">
                <span class="step-num">2</span>
                <span class="step-title">CONCLUSIONES Y EVIDENCIAS INSTITUCIONALES</span>
              </div>

              <div class="form-group form-row">
                <label class="form-label" for="res-conclusiones">
                  Conclusiones del Caso <span class="required">*</span>
                </label>
                <textarea id="res-conclusiones" class="form-control" rows="4" placeholder="Dictamen final institucional, resolución adoptada, plazos de cumplimiento o medidas correctivas dictadas..." ${isClosedCase ? 'readonly' : ''} required>${res.conclusiones || ''}</textarea>
                <small class="field-hint">Resolución vinculante y recomendaciones dictaminadas por la instancia competente.</small>
              </div>

              <div class="form-group form-row">
                <label class="form-label">
                  Evidencias presentadas por la Universidad
                </label>
                ${!isClosedCase ? `
                  <div class="file-upload-drop-zone" id="univ-file-drop-zone">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                    <div class="drop-zone-text">
                      <strong>Arrastre y suelte actas, informes o evidencias institucionales</strong>
                      <span>o haga clic para examinar archivos locales (PDF, DOCX, XLSX, JPG, PNG)</span>
                    </div>
                    <input type="file" id="univ-evidencias-input" multiple style="display: none;" accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png" />
                  </div>
                ` : ''}
                <div id="univ-attached-files-container" class="attached-files-list"></div>
              </div>

              <div class="form-divider" style="margin-top: 24px;"></div>

              <!-- BOTONES DE ACCIÓN -->
              ${!isClosedCase ? `
                <div class="form-actions-bar">
                  <button type="button" class="btn btn-secondary" id="btn-save-draft">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                      <polyline points="17 21 17 13 7 13 7 21"></polyline>
                      <polyline points="7 3 7 8 15 8"></polyline>
                    </svg>
                    Guardar Borrador de Dictamen
                  </button>

                  <button type="submit" class="btn btn-primary btn-lg" id="btn-guardar-cerrar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                      <polyline points="22 4 12 14.01 9 11.01"></polyline>
                    </svg>
                    Guardar y Cerrar Caso
                  </button>
                </div>
              ` : `
                <div class="card" style="background:#F0FDF4; border:1px solid #BBF7D0; padding:16px; border-radius:8px;">
                  <strong style="color:#166534;">✓ Expediente Concluido y Notificado</strong>
                  <p style="margin:4px 0 0 0; font-size:13px; color:#15803D;">Este caso cuenta con dictamen final emitido y ha sido archivado formalmente.</p>
                </div>
              `}
            </form>
          </div>
        </div>
      </div>
    `;

    this.bindEvents(currentCase);
    this.renderUnivAttachedFiles();
  }

  getStatusBadgeClass(estado) {
    if (estado === 'Concluido y Notificado') return 'badge-success';
    if (estado && estado.includes('No Admite')) return 'badge-danger';
    if (estado === 'Dictamen Registrado') return 'badge-purple';
    if (estado === 'En Evaluación Académica') return 'badge-info';
    return 'badge-warning';
  }

  bindEvents(currentCase) {
    // Buscador rápido de la tabla superior
    const searchInput = document.getElementById('manage-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.render();
        const ref = document.getElementById('manage-search-input');
        if (ref) {
          ref.focus();
          ref.setSelectionRange(ref.value.length, ref.value.length);
        }
      });
    }

    // Clic en fila o botón "Cargar Caso"
    this.container.querySelectorAll('.manage-case-row, .btn-load-selected-case').forEach(el => {
      el.addEventListener('click', (e) => {
        const caseId = el.getAttribute('data-id');
        if (caseId && caseId !== this.selectedCaseId) {
          this.setCaseId(caseId);
        }
      });
    });

    // Control de la compuerta de admisibilidad (SÍ / NO)
    const btnSi = document.getElementById('btn-criterios-si');
    const btnNo = document.getElementById('btn-criterios-no');
    const closureBox = document.getElementById('no-criterios-closure-box');
    const formWrapper = document.getElementById('resolution-form-wrapper');

    if (btnSi) {
      btnSi.addEventListener('click', () => {
        this.cumpleCriteriosState = true;
        btnSi.classList.add('is-selected-yes');
        btnNo?.classList.remove('is-selected-no');
        if (closureBox) closureBox.style.display = 'none';
        if (formWrapper) formWrapper.style.display = 'block';
      });
    }

    if (btnNo) {
      btnNo.addEventListener('click', () => {
        this.cumpleCriteriosState = false;
        btnNo.classList.add('is-selected-no');
        btnSi?.classList.remove('is-selected-yes');
        if (closureBox) closureBox.style.display = 'block';
        if (formWrapper) formWrapper.style.display = 'none';
      });
    }

    // Botón para cerrar y enviar a Histórico cuando NO cumple criterios
    const btnCerrarNoAdmite = document.getElementById('btn-cerrar-no-admite');
    if (btnCerrarNoAdmite) {
      btnCerrarNoAdmite.addEventListener('click', () => {
        const descCierre = document.getElementById('txt-cierre-criterios')?.value.trim();
        if (!descCierre) {
          toast.error('Debe ingresar la descripción y motivo del cierre institucional.');
          document.getElementById('txt-cierre-criterios')?.focus();
          return;
        }

        const updated = storage.closeCaseWithoutAdmission(currentCase.id, descCierre);
        toast.warning(`Expediente ${updated.id} cerrado sin trámite y archivado en Histórico de Casos.`, 'Caso Desestimado');

        if (typeof this.onNavigateToHistory === 'function') {
          this.onNavigateToHistory(updated);
        } else {
          window.location.hash = 'historico';
        }
      });
    }

    // Carga de archivos de la universidad
    const dropZone = document.getElementById('univ-file-drop-zone');
    const fileInput = document.getElementById('univ-evidencias-input');
    if (dropZone && fileInput) {
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
        if (e.dataTransfer.files) this.addUnivFiles(e.dataTransfer.files);
      });
      fileInput.addEventListener('change', () => {
        if (fileInput.files) {
          this.addUnivFiles(fileInput.files);
          fileInput.value = '';
        }
      });
    }

    // Guardar borrador de dictamen
    const btnDraft = document.getElementById('btn-save-draft');
    if (btnDraft) {
      btnDraft.addEventListener('click', () => {
        this.saveResolutionData(currentCase, false);
      });
    }

    // Guardar y cerrar formalmente
    const form = document.getElementById('resolution-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.saveResolutionData(currentCase, true);
      });
    }
  }

  addUnivFiles(fileList) {
    for (let i = 0; i < fileList.length; i++) {
      const f = fileList[i];
      const sizeStr = f.size > 1024 * 1024 
        ? `${(f.size / (1024 * 1024)).toFixed(1)} MB` 
        : `${Math.round(f.size / 1024)} KB`;

      this.univAttachedFiles.push({
        name: f.name,
        size: sizeStr,
        type: f.name.split('.').pop().toLowerCase(),
        date: new Date().toISOString().split('T')[0]
      });
    }
    this.renderUnivAttachedFiles();
  }

  renderUnivAttachedFiles() {
    const container = document.getElementById('univ-attached-files-container');
    if (!container) return;

    if (this.univAttachedFiles.length === 0) {
      container.innerHTML = `<div class="empty-files-hint">Sin evidencias institucionales adjuntas</div>`;
      return;
    }

    container.innerHTML = `
      <div class="files-grid">
        ${this.univAttachedFiles.map((f, idx) => `
          <div class="file-chip univ-chip">
            <div class="file-icon">🏛️</div>
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
        this.univAttachedFiles.splice(index, 1);
        this.renderUnivAttachedFiles();
      });
    });
  }

  saveResolutionData(currentCase, isClosing = false) {
    const fund = document.getElementById('res-fundamentacion')?.value.trim() || '';
    const aspTec = document.getElementById('res-aspectos-tecnicos')?.value.trim() || '';
    const conc = document.getElementById('res-conclusiones')?.value.trim() || '';

    if (isClosing) {
      if (!fund || !aspTec || !conc) {
        toast.error('Para cerrar formalmente el caso debe completar la Fundamentación Normativa, Aspectos Técnicos y Conclusiones.');
        return;
      }
    }

    const resolutionData = {
      cumpleCriterios: true,
      fundamentacionNormativa: fund,
      aspectosTecnicos: aspTec,
      conclusiones: conc,
      evidenciasUniversidad: [...this.univAttachedFiles]
    };

    const updated = storage.updateCaseResolution(currentCase.id, resolutionData, isClosing);

    if (isClosing) {
      toast.success(`El caso ${updated.id} ha sido Dictaminado y Cerrado formalmente.`, 'Caso Concluido');
      if (typeof this.onCaseClosed === 'function') {
        this.onCaseClosed(updated);
      } else {
        this.render();
      }
    } else {
      toast.info(`Borrador del dictamen guardado para el expediente ${updated.id}.`);
      this.render();
    }
  }
}
