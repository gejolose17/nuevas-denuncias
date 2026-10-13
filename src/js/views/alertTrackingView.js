/**
 * AlertTrackingView
 * Sección "Alerta de Seguimiento"
 * Dashboard de métricas y alertas institucionales con listado de casos.
 * Al hacer clic en cualquier caso, despliega su flujo visual interactivo de estatus
 * mostrando en qué fase se encuentra, su historial y tiempos de respuesta.
 */

import { storage } from '../services/storage.js';
import { PdfService } from '../services/pdfService.js';
import { toast } from '../components/toast.js';
import { SlaHelper } from '../services/slaHelper.js';

export class AlertTrackingView {
  constructor(containerEl, onSelectCaseToManage = null) {
    this.container = containerEl;
    this.onSelectCaseToManage = onSelectCaseToManage;
    this.selectedCaseId = null;
    this.filterStatus = 'all';
    this.searchQuery = '';
  }

  render() {
    const cases = storage.getCases();

    // Metrics calculation
    const total = cases.length;
    const fase1Count = cases.filter(c => c.faseActual === 1 || c.estado === 'Registrado').length;
    const enEvalCount = cases.filter(c => c.faseActual === 2 || c.estado === 'En Evaluación Académica').length;
    const enDictamenCount = cases.filter(c => c.faseActual === 3 || c.estado === 'Dictamen y Gestión de Autoridades').length;
    const concluidosCount = cases.filter(c => c.faseActual === 4 || c.estado === 'Concluido y Notificado').length;

    // SLA Alert: Cases older than 4 days that are not completed
    const now = new Date();
    const urgentCount = cases.filter(c => {
      if (c.estado === 'Concluido y Notificado') return false;
      const caseDate = new Date(c.fechaGenerada);
      const diffDays = Math.floor((now - caseDate) / (1000 * 60 * 60 * 24));
      return diffDays >= 4;
    }).length;

    // If no case is selected, pick the first
    if (!this.selectedCaseId && cases.length > 0) {
      this.selectedCaseId = cases[0].id;
    }

    const filteredCases = cases.filter(c => {
      if (this.filterStatus !== 'all' && c.estado !== this.filterStatus) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const matchId = c.id.toLowerCase().includes(q);
        const matchSetec = (c.codigoSetec || '').toLowerCase().includes(q);
        const matchName = (c.afectado?.nombreCompleto || '').toLowerCase().includes(q);
        const matchCif = (c.afectado?.cif || '').toLowerCase().includes(q);
        const matchFac = (c.academicos?.facultad || '').toLowerCase().includes(q);
        if (!matchId && !matchSetec && !matchName && !matchCif && !matchFac) return false;
      }
      return true;
    });

    const activeCase = cases.find(c => c.id === this.selectedCaseId) || cases[0];

    this.container.innerHTML = `
      <div class="dashboard-wrapper animate-fade-in">
        <!-- HEADER DASHBOARD -->
        <div class="dash-top-bar">
          <div>
            <h2 class="section-main-title">ALERTA DE SEGUIMIENTO Y DASHBOARD DE CONTROL</h2>
            <p class="section-sub-title">Monitoreo en tiempo real del ciclo de vida, trazabilidad SETEC y alertas operativas de denuncias</p>
          </div>
          <button type="button" class="dash-quick-badge btn-monitor-active-uam" id="btn-monitor-active-uam" title="Monitoreo Activo UAM - Tiempo Real (Haga clic para sincronizar)">
            <span class="live-dot"></span>
            <span class="monitor-btn-text">Monitoreo Activo UAM</span>
            <span class="monitor-btn-tag">EN VIVO</span>
          </button>
        </div>

        <!-- TARJETAS KPI / ALERTAS -->
        <div class="kpi-grid">
          <div class="kpi-card ${this.filterStatus === 'all' ? 'is-active-kpi' : ''}" data-status="all">
            <div class="kpi-icon-wrap" style="color: #0099A8; background: #e0f4f7;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
            </div>
            <div class="kpi-data">
              <span class="kpi-val">${total}</span>
              <span class="kpi-lbl">Total de Casos</span>
            </div>
          </div>

          <div class="kpi-card ${this.filterStatus === 'Registrado' ? 'is-active-kpi' : ''}" data-status="Registrado">
            <div class="kpi-icon-wrap" style="color: #d97706; background: #fef3c7;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"></circle>
                <polyline points="12 6 12 12 16 14"></polyline>
              </svg>
            </div>
            <div class="kpi-data">
              <span class="kpi-val">${fase1Count}</span>
              <span class="kpi-lbl">Registrados (Fase 1)</span>
            </div>
          </div>

          <div class="kpi-card ${this.filterStatus === 'En Evaluación Académica' ? 'is-active-kpi' : ''}" data-status="En Evaluación Académica">
            <div class="kpi-icon-wrap" style="color: #2563eb; background: #dbeafe;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <div class="kpi-data">
              <span class="kpi-val">${enEvalCount}</span>
              <span class="kpi-lbl">En Evaluación</span>
            </div>
          </div>

          <div class="kpi-card ${this.filterStatus === 'Dictamen y Gestión de Autoridades' ? 'is-active-kpi' : ''}" data-status="Dictamen y Gestión de Autoridades">
            <div class="kpi-icon-wrap" style="color: #7c3aed; background: #ede9fe;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
            </div>
            <div class="kpi-data">
              <span class="kpi-val">${enDictamenCount}</span>
              <span class="kpi-lbl">En Dictamen</span>
            </div>
          </div>

          <div class="kpi-card ${this.filterStatus === 'Concluido y Notificado' ? 'is-active-kpi' : ''}" data-status="Concluido y Notificado">
            <div class="kpi-icon-wrap" style="color: #059669; background: #d1fae5;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <div class="kpi-data">
              <span class="kpi-val">${concluidosCount}</span>
              <span class="kpi-lbl">Concluidos</span>
            </div>
          </div>

          <!-- Alerta Urgencia SLA -->
          <div class="kpi-card kpi-alert-box">
            <div class="kpi-icon-wrap" style="color: #dc2626; background: #fee2e2;">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                <line x1="12" y1="9" x2="12" y2="13"></line>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
            </div>
            <div class="kpi-data">
              <span class="kpi-val" style="color: #dc2626;">${urgentCount}</span>
              <span class="kpi-lbl">Alerta Tiempo (&gt;4d)</span>
            </div>
          </div>
        </div>

        <!-- CONTENIDO PRINCIPAL: 2 COLUMNAS (LISTADO DE CASOS + FLUJO VISUAL DE ESTATUS DEL SELECCIONADO) -->
        <div class="tracking-split-layout">
          <!-- COLUMNA IZQUIERDA: LISTADO DE CASOS -->
          <div class="cases-list-panel">
            <div class="panel-header-search">
              <div class="search-input-wrap">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <input type="text" id="tracking-search-input" class="search-field" placeholder="Buscar por CIF, nombre, No. Caso o SETEC..." value="${this.searchQuery}" />
              </div>
              <div class="filter-tag-pill">
                Filtro: <strong>${this.filterStatus === 'all' ? 'Todos' : this.filterStatus}</strong>
              </div>
            </div>

            <div class="cases-scroll-container">
              ${filteredCases.length === 0 ? `
                <div class="empty-list-message">
                  <p>No se encontraron casos con el filtro actual.</p>
                </div>
              ` : filteredCases.map(c => {
                const isSelected = activeCase && c.id === activeCase.id;
                const statusBadgeClass = this.getStatusBadgeClass(c.estado);
                const slaBadge = SlaHelper.renderSlaBadge(c);
                return `
                  <div class="case-tracking-card ${isSelected ? 'is-selected' : ''}" data-case-id="${c.id}">
                    <div class="ct-card-top">
                      <span class="ct-id">${c.id}</span>
                      <span class="badge ${statusBadgeClass}">${c.estado}</span>
                    </div>
                    <div style="margin: 4px 0;">
                      ${slaBadge}
                    </div>
                    <div class="ct-card-middle">
                      <strong class="ct-name">${c.afectado?.nombreCompleto || 'Sin nombre'}</strong>
                      <span class="ct-cif">CIF: ${c.afectado?.cif || 'N/D'}</span>
                    </div>
                    <div class="ct-card-bottom">
                      <span class="ct-faculty">🎓 ${c.academicos?.facultad || ''}</span>
                      <span class="ct-date">📅 ${c.fechaGenerada}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- COLUMNA DERECHA: FLUJO DE ESTATUS INTERACTIVO DEL CASO SELECCIONADO -->
          <div class="workflow-detail-panel">
            ${activeCase ? this.renderWorkflowDetail(activeCase) : `
              <div class="empty-workflow-card">
                <p>Seleccione un caso de la lista para visualizar su flujo de estatus en detalle.</p>
              </div>
            `}
          </div>
        </div>
      </div>
    `;

    this.bindEvents(cases);
  }

  renderWorkflowDetail(c) {
    const statusBadgeClass = this.getStatusBadgeClass(c.estado);
    const fase = c.faseActual || 1;
    const res = c.resolucion || {};
    const aut = res.autoridades || {};

    return `
      <div class="workflow-card-inner">
        <!-- SLA 10-DAY COUNTDOWN BANNER -->
        ${SlaHelper.renderSlaWidget(c)}

        <!-- HEADER DEL CASO SELECCIONADO -->
        <div class="workflow-header">
          <div class="wf-title-block">
            <span class="wf-case-code">${c.id}</span>
            <h3 class="wf-case-name">${c.afectado?.nombreCompleto || 'Denuncia Registrada'}</h3>
            <div class="wf-meta-tags">
              <span class="wf-tag">Código: <strong>${c.codigoSetec}</strong></span>
              <span class="wf-tag">CIF: <strong>${c.afectado?.cif || 'N/D'}</strong></span>
              <span class="wf-tag">Ubicación: <strong>${c.municipio}, ${c.departamento}</strong></span>
            </div>
          </div>
          <div class="wf-actions-block">
            <span class="badge badge-lg ${statusBadgeClass}">${c.estado}</span>
            <div class="wf-btn-group">
              <button type="button" class="btn btn-sm btn-outline" id="wf-btn-pdf" title="Descargar Ficha">
                📄 PDF
              </button>
              <button type="button" class="btn btn-sm btn-primary" id="wf-btn-manage" title="Ir a Gestión de Dictamen">
                ✏️ Gestionar Dictamen
              </button>
            </div>
          </div>
        </div>

        <div class="wf-divider"></div>

        <!-- FLUJO VISUAL DE ESTATUS (STEPPER MULTI-FASE) -->
        <div class="workflow-stepper-title">
          <h4>Flujo de Estatus del Expediente (Fases Oficiales SETEC)</h4>
          <span class="step-progress-percent">Progreso: Fase ${fase} de 4</span>
        </div>

        <div class="stepper-horizontal">
          <!-- PASO 1: Radicación Inicial -->
          <div class="step-node ${fase >= 1 ? 'is-completed' : ''} ${fase === 1 ? 'is-current' : ''}">
            <div class="step-circle">
              ${fase > 1 ? '✓' : '1'}
            </div>
            <div class="step-content">
              <div class="step-label">Fase 1: Registro Inicial</div>
              <div class="step-sub">Radicación SETEC y evidencias del denunciante</div>
              <div class="step-date">✓ ${c.fechaGenerada}</div>
            </div>
          </div>

          <div class="step-connector ${fase >= 2 ? 'is-completed' : ''}"></div>

          <!-- PASO 2: Evaluación Normativa -->
          <div class="step-node ${fase >= 2 ? 'is-completed' : ''} ${fase === 2 ? 'is-current' : ''}">
            <div class="step-circle">
              ${fase > 2 ? '✓' : '2'}
            </div>
            <div class="step-content">
              <div class="step-label">Fase 2: Evaluación Normativa</div>
              <div class="step-sub">Marco reglamentario y calidad académica</div>
              <div class="step-date">${res.fundamentacionNormativa ? '✓ Analizado' : (fase >= 2 ? 'En Proceso' : 'Pendiente')}</div>
            </div>
          </div>

          <div class="step-connector ${fase >= 3 ? 'is-completed' : ''}"></div>

          <!-- PASO 3: Dictamen Técnico -->
          <div class="step-node ${fase >= 3 ? 'is-completed' : ''} ${fase === 3 ? 'is-current' : ''}">
            <div class="step-circle">
              ${fase > 3 ? '✓' : '3'}
            </div>
            <div class="step-content">
              <div class="step-label">Fase 3: Dictamen Técnico</div>
              <div class="step-sub">Aspectos periciales, evidencias UAM y conclusiones</div>
              <div class="step-date">${res.conclusiones ? '✓ Emitido' : (fase >= 3 ? 'En Proceso' : 'Pendiente')}</div>
            </div>
          </div>

          <div class="step-connector ${fase >= 4 ? 'is-completed' : ''}"></div>

          <!-- PASO 4: Firmas y Conclusión -->
          <div class="step-node ${fase >= 4 ? 'is-completed' : ''} ${fase === 4 ? 'is-current' : ''}">
            <div class="step-circle">
              ${fase >= 4 ? '✓' : '4'}
            </div>
            <div class="step-content">
              <div class="step-label">Fase 4: Firma y Conclusión</div>
              <div class="step-sub">Validación tripartita de autoridades institucionales</div>
              <div class="step-date">${res.fechaCierre ? `✓ Cerrado: ${res.fechaCierre}` : 'Pendiente suscripción'}</div>
            </div>
          </div>
        </div>

        <!-- DETALLE DE LAS AUTORIDADES ASIGNADAS EN ESTE FLUJO -->
        <div class="wf-authorities-box">
          <h5 class="wf-box-title">Autoridades Asignadas a la Resolución:</h5>
          <div class="wf-auth-grid">
            <div class="wf-auth-item ${aut.secretariaGeneralId ? 'is-assigned' : 'is-unassigned'}">
              <span class="auth-role">Secretaría General:</span>
              <strong class="auth-name">${aut.secretariaGeneralNombre || 'Pendiente de designación'}</strong>
              <span class="auth-tag">${aut.secretariaGeneralId ? '✓ Asignado' : 'Sin asignar'}</span>
            </div>
            <div class="wf-auth-item ${aut.decanoId ? 'is-assigned' : 'is-unassigned'}">
              <span class="auth-role">Decano de la Facultad:</span>
              <strong class="auth-name">${aut.decanoNombre || 'Pendiente de designación'}</strong>
              <span class="auth-tag">${aut.decanoId ? '✓ Asignado' : 'Sin asignar'}</span>
            </div>
            <div class="wf-auth-item ${aut.planificacionCalidadId ? 'is-assigned' : 'is-unassigned'}">
              <span class="auth-role">Planificación y Calidad:</span>
              <strong class="auth-name">${aut.planificacionCalidadNombre || 'Pendiente de designación'}</strong>
              <span class="auth-tag">${aut.planificacionCalidadId ? '✓ Asignado' : 'Sin asignar'}</span>
            </div>
          </div>
        </div>

        <!-- HISTORIAL CRONOLÓGICO DE ACCIONES (AUDITORÍA) -->
        <div class="wf-history-box">
          <h5 class="wf-box-title">Historial Cronológico de Trazabilidad:</h5>
          <div class="timeline-items-list">
            ${(c.historial || []).map(h => `
              <div class="timeline-log-row">
                <div class="tl-bullet"></div>
                <div class="tl-info">
                  <div class="tl-action">${h.accion}</div>
                  <div class="tl-meta">
                    <span class="tl-user">👤 ${h.usuario}</span>
                    <span class="tl-time">🕒 ${h.fecha}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  getStatusBadgeClass(estado) {
    switch (estado) {
      case 'Concluido y Notificado': return 'badge-success';
      case 'Dictamen y Gestión de Autoridades': return 'badge-purple';
      case 'En Evaluación Académica': return 'badge-info';
      default: return 'badge-warning';
    }
  }

  bindEvents(cases) {
    // Monitor activo button
    const btnMonitor = document.getElementById('btn-monitor-active-uam');
    if (btnMonitor) {
      btnMonitor.addEventListener('click', () => {
        toast.success('Monitoreo Activo UAM: Panel de control sincronizado en tiempo real.', 'Monitoreo Activo UAM');
        this.render();
      });
    }

    // KPI card clicks filter the list
    this.container.querySelectorAll('.kpi-card[data-status]').forEach(card => {
      card.addEventListener('click', () => {
        this.filterStatus = card.getAttribute('data-status');
        this.render();
      });
    });

    // Search input
    const searchInput = document.getElementById('tracking-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.render();
        // Restore focus to input
        const newSearch = document.getElementById('tracking-search-input');
        if (newSearch) {
          newSearch.focus();
          newSearch.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
        }
      });
    }

    // Click on case card in the list
    this.container.querySelectorAll('.case-tracking-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-case-id');
        this.selectedCaseId = id;
        this.render();
      });
    });

    // PDF button in workflow detail
    const btnPdf = document.getElementById('wf-btn-pdf');
    if (btnPdf) {
      btnPdf.addEventListener('click', () => {
        const active = cases.find(c => c.id === this.selectedCaseId);
        if (active) PdfService.exportSingleCasePdf(active);
      });
    }

    // Manage button in workflow detail
    const btnManage = document.getElementById('wf-btn-manage');
    if (btnManage) {
      btnManage.addEventListener('click', () => {
        if (typeof this.onSelectCaseToManage === 'function' && this.selectedCaseId) {
          this.onSelectCaseToManage(this.selectedCaseId);
        }
      });
    }
  }
}
