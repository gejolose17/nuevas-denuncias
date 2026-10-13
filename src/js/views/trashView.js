/**
 * TrashView
 * Sección "PAPELERA"
 * Centraliza todos los elementos eliminados (Casos y Usuarios) en la aplicación.
 * Permite restaurar elementos o eliminarlos permanentemente, así como vaciar la papelera.
 */

import { storage } from '../services/storage.js';
import { toast } from '../components/toast.js';

export class TrashView {
  constructor(containerEl, onNavigate = null) {
    this.container = containerEl;
    this.onNavigate = onNavigate;
    this.filterType = 'all'; // 'all' | 'CASO' | 'USUARIO'
    this.searchQuery = '';
  }

  render() {
    const trashItems = storage.getTrash();

    const casosCount = trashItems.filter(item => item.type === 'CASO').length;
    const usuariosCount = trashItems.filter(item => item.type === 'USUARIO').length;
    const totalCount = trashItems.length;

    const filtered = trashItems.filter(item => {
      if (this.filterType !== 'all' && item.type !== this.filterType) return false;
      if (this.searchQuery) {
        const q = this.searchQuery.toLowerCase();
        const str = `${item.itemId} ${item.title} ${item.subtitle} ${item.deletedBy} ${item.deletedAt}`.toLowerCase();
        if (!str.includes(q)) return false;
      }
      return true;
    });

    this.container.innerHTML = `
      <div class="card trash-card animate-fade-in">
        <!-- HEADER PAPELERA -->
        <div class="card-header border-bottom">
          <div class="header-icon-box" style="background: rgba(225, 29, 72, 0.1); color: #e11d48;">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </div>
          <div style="flex: 1;">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
              <h2 class="card-title">PAPELERA DE RECICLAJE INSTITUCIONAL</h2>
              <span class="badge ${totalCount > 0 ? 'badge-danger' : 'badge-success'}">
                ${totalCount} elementos en papelera
              </span>
            </div>
            <p class="card-subtitle">
              Todos los casos o usuarios eliminados de la app se resguardan aquí. Puede restaurarlos a su estado activo o depurarlos definitivamente.
            </p>
          </div>
          <div>
            <button type="button" class="btn btn-outline" id="btn-empty-trash" ${totalCount === 0 ? 'disabled' : ''} style="color: #e11d48; border-color: rgba(225, 29, 72, 0.3);">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Vaciar Papelera
            </button>
          </div>
        </div>

        <!-- KPI RESUMEN DE PAPELERA -->
        <div class="trash-kpis-grid">
          <div class="trash-kpi-item ${this.filterType === 'all' ? 'is-active-filter' : ''}" data-filter="all">
            <span class="kpi-num">${totalCount}</span>
            <span class="kpi-tag">Todos los Elementos</span>
          </div>
          <div class="trash-kpi-item ${this.filterType === 'CASO' ? 'is-active-filter' : ''}" data-filter="CASO">
            <span class="kpi-num" style="color: #0099A8;">${casosCount}</span>
            <span class="kpi-tag">Casos / Expedientes</span>
          </div>
          <div class="trash-kpi-item ${this.filterType === 'USUARIO' ? 'is-active-filter' : ''}" data-filter="USUARIO">
            <span class="kpi-num" style="color: #8b5cf6;">${usuariosCount}</span>
            <span class="kpi-tag">Usuarios / Cuentas</span>
          </div>
        </div>

        <!-- FILTROS Y BÚSQUEDA -->
        <div class="trash-toolbar">
          <div class="trash-search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" id="trash-search-input" class="form-control" placeholder="Buscar por Folio, Nombre, Correo, Usuario que eliminó..." value="${this.searchQuery}" />
          </div>

          <div class="trash-filter-chips">
            <button type="button" class="btn-filter-pill ${this.filterType === 'all' ? 'is-active' : ''}" data-filter="all">
              Todos (${totalCount})
            </button>
            <button type="button" class="btn-filter-pill ${this.filterType === 'CASO' ? 'is-active' : ''}" data-filter="CASO">
              📁 Casos (${casosCount})
            </button>
            <button type="button" class="btn-filter-pill ${this.filterType === 'USUARIO' ? 'is-active' : ''}" data-filter="USUARIO">
              👤 Usuarios (${usuariosCount})
            </button>
          </div>
        </div>

        <!-- TABLA DE ELEMENTOS EN PAPELERA -->
        <div class="table-responsive" style="margin-top: 14px;">
          ${filtered.length === 0 ? `
            <div class="empty-state-card" style="padding: 40px 20px;">
              <div class="empty-state-icon" style="font-size: 40px; margin-bottom: 12px;">
                ${totalCount === 0 ? '✨' : '🔍'}
              </div>
              <h3 style="color: #808284; margin-bottom: 6px;">
                ${totalCount === 0 ? 'La papelera está vacía' : 'No hay elementos que coincidan con la búsqueda'}
              </h3>
              <p style="font-size: 13px; color: #808284; max-width: 500px; margin: 0 auto;">
                ${totalCount === 0 
                  ? 'Cualquier expediente de denuncia o usuario eliminado del sistema se resguardará en esta sección para que pueda restaurarlo en cualquier momento.' 
                  : 'Pruebe buscando con otro término o seleccionando otra categoría en los filtros superiores.'}
              </p>
            </div>
          ` : `
            <table class="table modern-table" id="table-trash">
              <thead>
                <tr>
                  <th style="width: 110px;">Tipo</th>
                  <th>Identificador / Nombre</th>
                  <th>Detalle del Elemento</th>
                  <th>Fecha de Eliminación</th>
                  <th>Eliminado Por</th>
                  <th style="text-align: right; width: 240px;">Acciones</th>
                </tr>
              </thead>
              <tbody>
                ${filtered.map(item => `
                  <tr class="trash-item-row" data-id="${item.trashId}">
                    <td>
                      <span class="badge ${item.type === 'CASO' ? 'badge-info' : 'badge-purple'}">
                        ${item.type === 'CASO' ? '📁 CASO' : '👤 USUARIO'}
                      </span>
                    </td>
                    <td>
                      <strong class="trash-item-title">${item.title}</strong>
                      <div class="trash-item-subcode" style="font-size: 11.5px; color: #808284;">ID: ${item.itemId}</div>
                    </td>
                    <td>
                      <span class="trash-item-desc">${item.subtitle || '-'}</span>
                    </td>
                    <td>
                      <span class="cell-date">${item.deletedAt}</span>
                    </td>
                    <td>
                      <span class="badge-user-tag">${item.deletedBy}</span>
                    </td>
                    <td style="text-align: right;">
                      <div class="row-actions-group" style="justify-content: flex-end;">
                        <button type="button" class="btn btn-sm btn-outline btn-restore-item" data-id="${item.trashId}" title="Restaurar elemento al sistema activo">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="1 4 1 10 7 10"></polyline>
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                          </svg>
                          Restaurar
                        </button>
                        <button type="button" class="btn btn-sm btn-outline btn-perm-delete-item" data-id="${item.trashId}" title="Eliminar de forma permanente" style="color: #e11d48; border-color: rgba(225, 29, 72, 0.3);">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          Depurar
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          `}
        </div>

        <div class="table-footer-meta" style="margin-top: 14px;">
          <span>Total en papelera: <strong>${trashItems.length}</strong> (${casosCount} casos, ${usuariosCount} usuarios)</span>
          <span>Los elementos restaurados regresan automáticamente a su respectivo catálogo con todos sus datos originales</span>
        </div>
      </div>
    `;

    this.bindEvents(trashItems);
  }

  bindEvents(trashItems) {
    // Search input
    const searchInput = document.getElementById('trash-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.trim();
        this.render();
        const inputRef = document.getElementById('trash-search-input');
        if (inputRef) {
          inputRef.focus();
          inputRef.setSelectionRange(inputRef.value.length, inputRef.value.length);
        }
      });
    }

    // Filter pills
    this.container.querySelectorAll('[data-filter]').forEach(el => {
      el.addEventListener('click', () => {
        this.filterType = el.getAttribute('data-filter');
        this.render();
      });
    });

    // Empty trash button
    const btnEmpty = document.getElementById('btn-empty-trash');
    if (btnEmpty) {
      btnEmpty.addEventListener('click', () => {
        if (trashItems.length === 0) return;
        if (confirm(`¿Está seguro de vaciar la papelera de reciclaje?\nSe eliminarán permanentemente los ${trashItems.length} elementos y esta acción NO se puede deshacer.`)) {
          storage.emptyTrash();
          toast.success('La papelera de reciclaje ha sido vaciada por completo.');
          this.render();
        }
      });
    }

    // Restore buttons
    this.container.querySelectorAll('.btn-restore-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const trashId = btn.getAttribute('data-id');
        const item = trashItems.find(t => t.trashId === trashId);
        if (!item) return;

        const success = storage.restoreFromTrash(trashId);
        if (success) {
          toast.success(`Se ha restaurado exitosamente "${item.title}" a su catálogo activo.`);
          this.render();
        } else {
          toast.error('No se pudo restaurar el elemento.');
        }
      });
    });

    // Permanent delete buttons
    this.container.querySelectorAll('.btn-perm-delete-item').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const trashId = btn.getAttribute('data-id');
        const item = trashItems.find(t => t.trashId === trashId);
        if (!item) return;

        if (confirm(`¿Desea depurar definitivamente "${item.title}"?\nEste elemento se borrará para siempre del sistema.`)) {
          storage.permanentDeleteFromTrash(trashId);
          toast.success(`"${item.title}" ha sido eliminado definitivamente.`);
          this.render();
        }
      });
    });
  }
}
