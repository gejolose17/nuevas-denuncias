/**
 * HistoryView
 * Sección "Histórico de Casos"
 * Listado integral de todos los casos con filtros avanzados, búsqueda rápida,
 * selección masiva, exportación en PDF individual y masiva (ficha completa con Parte I y Parte II),
 * y menú de acciones por caso (Ver, Dictaminar, Asignar, Eliminar).
 */

import { storage } from '../services/storage.js';
import { PdfService } from '../services/pdfService.js';
import { toast } from '../components/toast.js';
import { SlaHelper } from '../services/slaHelper.js';

export class HistoryView {
  constructor(containerEl, onNavigateToManage = null) {
    this.container = containerEl;
    this.onNavigateToManage = onNavigateToManage;
    this.searchQuery = '';
    this.filterStatus = 'all';
    this.filterFaculty = 'all';
    this.selectedCaseIds = new Set();
  }

  render() {
    const cases = storage.getCases();
    const facultades = storage.getFacultades();

    const filtered = cases.filter(c => {
      if (this.filterStatus !== 'all' && c.estado !== this.filterStatus) return false;
      if (this.filterFaculty !== 'all' && c.academicos?.facultad !== this.filterFaculty) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const str = `${c.id} ${c.codigoSetec} ${c.afectado?.nombreCompleto} ${c.afectado?.cif} ${c.afectado?.cedula} ${c.academicos?.facultad} ${c.academicos?.carrera} ${c.academicos?.tipoDenuncia} ${c.departamento} ${c.municipio}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });

    const isAllSelected = filtered.length > 0 && filtered.every(c => this.selectedCaseIds.has(c.id));

    this.container.innerHTML = `
      <div class="card history-card animate-fade-in">
        <!-- HEADER -->
        <div class="card-header border-bottom">
          <div class="header-icon-box" style="background: rgba(128, 130, 132, 0.1); color: #808284;">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="16" y1="13" x2="8" y2="13"></line>
              <line x1="16" y1="17" x2="8" y2="17"></line>
              <polyline points="10 9 9 9 8 9"></polyline>
            </svg>
          </div>
          <div style="flex: 1;">
            <h2 class="card-title">HISTÓRICO GENERAL DE EXPEDIENTES Y DENUNCIAS</h2>
            <p class="card-subtitle">Repositorio institucional de expedientes con exportación de fichas completas y auditoría</p>
          </div>
          <!-- BOTONES DE EXPORTACIÓN MASIVA -->
          <div class="header-actions-group">
            <button type="button" class="btn btn-outline" id="btn-export-massive-selected" ${this.selectedCaseIds.size === 0 ? 'disabled' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Exportar Seleccionados en PDF (${this.selectedCaseIds.size})
            </button>

            <button type="button" class="btn btn-primary" id="btn-export-all-pdf">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Exportar Todo el Histórico en PDF
            </button>
          </div>
        </div>

        <!-- FILTROS Y BÚSQUEDA -->
        <div class="history-filter-bar">
          <div class="filter-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="hist-search-input" class="form-control" placeholder="Buscar por Folio, SETEC, Nombre, Cédula, CIF, Carrera..." value="${this.searchQuery}" />
          </div>

          <div class="filter-dropdowns">
            <select id="hist-filter-status" class="form-control filter-select">
              <option value="all" ${this.filterStatus === 'all' ? 'selected' : ''}>Todos los Estados</option>
              <option value="Registrado" ${this.filterStatus === 'Registrado' ? 'selected' : ''}>Registrado</option>
              <option value="En Evaluación Académica" ${this.filterStatus === 'En Evaluación Académica' ? 'selected' : ''}>En Evaluación Académica</option>
              <option value="Dictamen Registrado" ${this.filterStatus === 'Dictamen Registrado' ? 'selected' : ''}>Dictamen Registrado</option>
              <option value="Concluido y Notificado" ${this.filterStatus === 'Concluido y Notificado' ? 'selected' : ''}>Concluido y Notificado</option>
              <option value="Cerrado - No Admite Trámite" ${this.filterStatus === 'Cerrado - No Admite Trámite' ? 'selected' : ''}>Cerrado - No Admite Trámite</option>
            </select>

            <select id="hist-filter-faculty" class="form-control filter-select">
              <option value="all" ${this.filterFaculty === 'all' ? 'selected' : ''}>Todas las Facultades</option>
              ${facultades.map(f => `
                <option value="${f.nombre}" ${this.filterFaculty === f.nombre ? 'selected' : ''}>${f.nombre}</option>
              `).join('')}
            </select>
          </div>
        </div>

        <!-- TABLA DE CASOS -->
        <div class="table-responsive">
          <table class="table modern-table" id="table-history">
            <thead>
              <tr>
                <th style="width: 36px; text-align: center;">
                  <input type="checkbox" id="check-all-cases" ${isAllSelected ? 'checked' : ''} title="Seleccionar todos los visibles" />
                </th>
                <th style="min-width: 110px;">No. Caso / SETEC</th>
                <th style="min-width: 125px;">Fecha y Plazo</th>
                <th style="min-width: 150px;">Afectado / CIF</th>
                <th style="min-width: 165px;">Facultad y Carrera</th>
                <th style="min-width: 140px;">Tipo de Denuncia</th>
                <th style="min-width: 130px;">Estado Actual</th>
                <th style="min-width: 90px; text-align: center;">Días Cierre</th>
                <th style="min-width: 125px; text-align: right;">Acciones</th>
              </tr>
            </thead>
            <tbody>
              ${filtered.length === 0 ? `
                <tr>
                  <td colspan="9" class="table-empty-row">
                    <div class="empty-table-state">
                      <span>🔍</span>
                      <p>No se encontraron expedientes con los criterios seleccionados.</p>
                    </div>
                  </td>
                </tr>
              ` : filtered.map(c => {
                const isChecked = this.selectedCaseIds.has(c.id);
                const statusBadge = this.getStatusBadgeClass(c.estado);
                const sla = SlaHelper.getCaseSla(c);
                const slaBadge = SlaHelper.renderSlaBadge(c);
                const res = c.resolucion || {};

                return `
                  <tr class="table-row ${isChecked ? 'row-selected' : ''}">
                    <td style="text-align: center;">
                      <input type="checkbox" class="case-row-checkbox" data-id="${c.id}" ${isChecked ? 'checked' : ''} />
                    </td>
                    <td>
                      <div class="cell-case-id bold-teal">${c.id}</div>
                      <div class="cell-sub-setec">${c.codigoSetec}</div>
                    </td>
                    <td>
                      <div class="cell-date bold" style="margin-bottom: 4px;">📅 ${c.fechaGenerada}</div>
                      ${slaBadge}
                    </td>
                    <td>
                      <div class="cell-name bold" title="${c.afectado?.nombreCompleto || 'N/D'}">${c.afectado?.nombreCompleto || 'N/D'}</div>
                      <div class="cell-cif">CIF: <span class="bold">${c.afectado?.cif || 'N/D'}</span></div>
                    </td>
                    <td>
                      <div class="cell-faculty" title="${c.academicos?.facultad || ''}">${c.academicos?.facultad || ''}</div>
                      <div class="cell-career" title="${c.academicos?.carrera || ''}">${c.academicos?.carrera || ''}</div>
                    </td>
                    <td>
                      <div class="cell-type" title="${c.academicos?.tipoDenuncia || ''}">${c.academicos?.tipoDenuncia || ''}</div>
                    </td>
                    <td>
                      <span class="badge ${statusBadge}">${c.estado}</span>
                      ${res.descripcionCierre ? `
                        <div class="cell-close-reason" title="${res.descripcionCierre}">
                          Motivo: ${res.descripcionCierre}
                        </div>
                      ` : ''}
                    </td>
                    <td style="text-align: center;">
                      ${sla.isClosed ? `
                        <div style="display: inline-flex; flex-direction: column; align-items: center; gap: 2px;">
                          <span class="badge badge-success" style="font-weight: 700; font-size: 11px; padding: 3px 7px; white-space: nowrap;" title="Caso resuelto y cerrado en ${sla.daysTaken} días">
                            🏁 ${sla.daysTaken} día${sla.daysTaken === 1 ? '' : 's'}
                          </span>
                        </div>
                      ` : `
                        <span class="badge" style="background: #F1F5F9; color: #64748B; font-size: 11px; font-weight: 500; white-space: nowrap;" title="El caso sigue en proceso institucional">
                          En trámite
                        </span>
                      `}
                    </td>
                    <td style="text-align: right;">
                      <div class="row-actions-group" style="justify-content: flex-end; gap: 4px;">
                        <button type="button" class="btn-action-compact btn-act-pdf" data-action="pdf" data-id="${c.id}" title="Exportar Ficha Oficial en PDF">
                          📄 PDF
                        </button>
                        <button type="button" class="btn-action-compact btn-act-manage" data-action="manage" data-id="${c.id}" title="Ver / Gestionar Dictamen">
                          ⚖️ Ver
                        </button>
                        <button type="button" class="btn-action-compact btn-act-delete" data-action="delete" data-id="${c.id}" title="Enviar a la Papelera">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>

        <div class="table-footer-meta">
          <span>Mostrando <strong>${filtered.length}</strong> de <strong>${cases.length}</strong> expedientes registrados</span>
          <span>${this.selectedCaseIds.size} seleccionados para operaciones por lote</span>
        </div>
      </div>
    `;

    this.bindEvents(cases, filtered);
  }

  getStatusBadgeClass(estado) {
    if (estado === 'Concluido y Notificado') return 'badge-success';
    if (estado && estado.includes('No Admite')) return 'badge-danger';
    if (estado === 'Dictamen Registrado' || estado === 'Dictamen y Gestión de Autoridades') return 'badge-purple';
    if (estado === 'En Evaluación Académica') return 'badge-info';
    return 'badge-warning';
  }

  bindEvents(allCases, filteredCases) {
    // Search input
    const searchInput = document.getElementById('hist-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.render();
        const inputRef = document.getElementById('hist-search-input');
        if (inputRef) {
          inputRef.focus();
          inputRef.setSelectionRange(this.searchQuery.length, this.searchQuery.length);
        }
      });
    }

    // Filter status
    const statusSelect = document.getElementById('hist-filter-status');
    if (statusSelect) {
      statusSelect.addEventListener('change', () => {
        this.filterStatus = statusSelect.value;
        this.render();
      });
    }

    // Filter faculty
    const facultySelect = document.getElementById('hist-filter-faculty');
    if (facultySelect) {
      facultySelect.addEventListener('change', () => {
        this.filterFaculty = facultySelect.value;
        this.render();
      });
    }

    // Check all checkbox
    const checkAll = document.getElementById('check-all-cases');
    if (checkAll) {
      checkAll.addEventListener('change', (e) => {
        if (e.target.checked) {
          filteredCases.forEach(c => this.selectedCaseIds.add(c.id));
        } else {
          filteredCases.forEach(c => this.selectedCaseIds.delete(c.id));
        }
        this.render();
      });
    }

    // Individual row checkboxes
    this.container.querySelectorAll('.case-row-checkbox').forEach(box => {
      box.addEventListener('change', (e) => {
        const id = box.getAttribute('data-id');
        if (e.target.checked) {
          this.selectedCaseIds.add(id);
        } else {
          this.selectedCaseIds.delete(id);
        }
        this.render();
      });
    });

    // Action buttons in rows
    this.container.querySelectorAll('.btn-action, .btn-action-compact').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const action = btn.getAttribute('data-action');
        const caseId = btn.getAttribute('data-id');
        const caso = allCases.find(c => c.id === caseId);
        if (!caso) return;

        if (action === 'pdf') {
          PdfService.exportSingleCasePdf(caso);
        } else if (action === 'manage') {
          if (typeof this.onNavigateToManage === 'function') {
            this.onNavigateToManage(caso.id);
          }
        } else if (action === 'delete') {
          if (confirm(`¿Está seguro de enviar a la papelera el expediente ${caso.id} (${caso.codigoSetec})?\nPodrá restaurarlo en cualquier momento desde la pestaña PAPELERA.`)) {
            storage.deleteCase(caso.id);
            this.selectedCaseIds.delete(caso.id);
            toast.success(`Expediente ${caso.id} enviado a la papelera.`);
            this.render();
          }
        }
      });
    });

    // Massive export of selected
    const btnExportMassive = document.getElementById('btn-export-massive-selected');
    if (btnExportMassive) {
      btnExportMassive.addEventListener('click', () => {
        if (this.selectedCaseIds.size === 0) {
          toast.warning('Seleccione al menos un expediente para exportar.');
          return;
        }
        const selectedCases = allCases.filter(c => this.selectedCaseIds.has(c.id));
        PdfService.exportMassiveCasesPdf(selectedCases, `REPORTE CONSOLIDADO DE ${selectedCases.length} EXPEDIENTES SELECCIONADOS`);
      });
    }

    // Export ALL in PDF
    const btnExportAll = document.getElementById('btn-export-all-pdf');
    if (btnExportAll) {
      btnExportAll.addEventListener('click', () => {
        if (allCases.length === 0) {
          toast.warning('No hay expedientes para exportar.');
          return;
        }
        PdfService.exportMassiveCasesPdf(allCases, `CONSOLIDADO HISTÓRICO GENERAL DE TODAS LAS DENUNCIAS (${allCases.length} EXPEDIENTES)`);
      });
    }
  }
}
