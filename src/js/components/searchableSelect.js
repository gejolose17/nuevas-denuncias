/**
 * SearchableSelect Component
 * Desplegable interactivo con buscador integrado en tiempo real,
 * soporte de filtrado instantáneo, teclado y selección fluida.
 */

export class SearchableSelect {
  constructor(arg1, arg2 = {}) {
    let config = {};
    if (arg1 && (arg1 instanceof HTMLElement || typeof arg1 === 'string') && typeof arg2 === 'object') {
      config = { containerId: arg1, ...arg2 };
    } else if (arg1 && typeof arg1 === 'object') {
      config = arg1;
    }

    const {
      containerId,
      placeholder = 'Seleccionar...',
      searchPlaceholder = 'Buscar en la lista...',
      options = [],
      initialValue = '',
      onChange = null,
      disabled = false,
      id = null
    } = config;

    this.container = typeof containerId === 'string' ? document.getElementById(containerId) : containerId;
    this.placeholder = placeholder;
    this.searchPlaceholder = searchPlaceholder;
    this.options = Array.isArray(options) ? options : [];
    this.selectedValue = initialValue || '';
    this.onChange = onChange;
    this.disabled = disabled;
    this.id = id || `searchable-${Math.random().toString(36).substring(2, 9)}`;
    this.isOpen = false;

    this.render();
    this.bindEvents();
  }

  normalizeOption(opt) {
    if (typeof opt === 'string') {
      return { label: opt, value: opt };
    }
    return { label: opt.label || opt.nombre || opt.name || opt.value, value: opt.value ?? opt.id ?? opt.label };
  }

  getNormalizedOptions() {
    return this.options.map(opt => this.normalizeOption(opt));
  }

  render() {
    if (!this.container) return;

    const normOptions = this.getNormalizedOptions();
    const selectedObj = normOptions.find(o => String(o.value) === String(this.selectedValue));
    const displayText = selectedObj ? selectedObj.label : this.placeholder;
    const isSelected = !!selectedObj;

    this.container.innerHTML = `
      <div class="searchable-select-wrap ${this.disabled ? 'is-disabled' : ''}" id="${this.id}-wrap">
        <button type="button" 
                class="searchable-select-trigger ${isSelected ? 'has-value' : ''}" 
                id="${this.id}-trigger" 
                aria-haspopup="listbox" 
                aria-expanded="false"
                ${this.disabled ? 'disabled' : ''}>
          <span class="trigger-label">${displayText}</span>
          <svg class="trigger-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>

        <div class="searchable-select-dropdown" id="${this.id}-dropdown" style="display: none;">
          <div class="dropdown-search-box">
            <svg class="search-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input type="text" 
                   class="dropdown-search-input" 
                   id="${this.id}-search" 
                   placeholder="${this.searchPlaceholder}" 
                   autocomplete="off" />
            <button type="button" class="search-clear-btn" style="display: none;">&times;</button>
          </div>
          <ul class="dropdown-options-list" id="${this.id}-list" role="listbox">
            ${this.renderOptionsList(normOptions, '')}
          </ul>
        </div>
      </div>
    `;

    this.wrapEl = this.container.querySelector('.searchable-select-wrap');
    this.triggerEl = this.container.querySelector('.searchable-select-trigger');
    this.dropdownEl = this.container.querySelector('.searchable-select-dropdown');
    this.searchInput = this.container.querySelector('.dropdown-search-input');
    this.clearBtn = this.container.querySelector('.search-clear-btn');
    this.listEl = this.container.querySelector('.dropdown-options-list');
  }

  renderOptionsList(normOptions, filterQuery = '') {
    const q = filterQuery.trim().toLowerCase();
    const filtered = normOptions.filter(o => o.label.toLowerCase().includes(q));

    if (filtered.length === 0) {
      return `<li class="dropdown-option-empty">Sin resultados para "${filterQuery}"</li>`;
    }

    return filtered.map(opt => {
      const isSelected = String(opt.value) === String(this.selectedValue);
      const highlightedLabel = q
        ? opt.label.replace(new RegExp(`(${q})`, 'gi'), '<mark>$1</mark>')
        : opt.label;

      return `
        <li class="dropdown-option-item ${isSelected ? 'is-selected' : ''}" 
            data-value="${this.escapeHtml(String(opt.value))}" 
            role="option" 
            aria-selected="${isSelected}">
          <span class="option-text">${highlightedLabel}</span>
          ${isSelected ? `
            <svg class="option-check" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>` : ''}
        </li>
      `;
    }).join('');
  }

  escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  bindEvents() {
    if (!this.triggerEl) return;

    this.triggerEl.addEventListener('click', (e) => {
      e.stopPropagation();
      if (this.disabled) return;
      this.toggle();
    });

    this.searchInput.addEventListener('input', () => {
      const query = this.searchInput.value;
      if (this.clearBtn) {
        this.clearBtn.style.display = query ? 'block' : 'none';
      }
      this.listEl.innerHTML = this.renderOptionsList(this.getNormalizedOptions(), query);
    });

    if (this.clearBtn) {
      this.clearBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.searchInput.value = '';
        this.clearBtn.style.display = 'none';
        this.listEl.innerHTML = this.renderOptionsList(this.getNormalizedOptions(), '');
        this.searchInput.focus();
      });
    }

    this.listEl.addEventListener('click', (e) => {
      const item = e.target.closest('.dropdown-option-item');
      if (!item) return;
      const val = item.getAttribute('data-value');
      this.selectValue(val);
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (this.isOpen && !this.wrapEl.contains(e.target)) {
        this.close();
      }
    });

    // Keyboard support
    this.wrapEl.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.close();
      }
    });
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  open() {
    // Close other selects
    document.querySelectorAll('.searchable-select-dropdown').forEach(d => {
      if (d !== this.dropdownEl) d.style.display = 'none';
    });
    document.querySelectorAll('.searchable-select-trigger').forEach(t => {
      if (t !== this.triggerEl) t.setAttribute('aria-expanded', 'false');
    });

    this.isOpen = true;
    this.dropdownEl.style.display = 'flex';
    this.triggerEl.setAttribute('aria-expanded', 'true');
    this.wrapEl.classList.add('is-open');
    this.searchInput.value = '';
    if (this.clearBtn) this.clearBtn.style.display = 'none';
    this.listEl.innerHTML = this.renderOptionsList(this.getNormalizedOptions(), '');

    setTimeout(() => {
      this.searchInput.focus();
    }, 40);
  }

  close() {
    this.isOpen = false;
    this.dropdownEl.style.display = 'none';
    this.triggerEl.setAttribute('aria-expanded', 'false');
    this.wrapEl.classList.remove('is-open');
  }

  selectValue(val) {
    this.selectedValue = val;
    const norm = this.getNormalizedOptions();
    const found = norm.find(o => String(o.value) === String(val));
    const labelSpan = this.triggerEl.querySelector('.trigger-label');
    if (labelSpan) {
      labelSpan.textContent = found ? found.label : this.placeholder;
    }
    this.triggerEl.classList.toggle('has-value', !!found);
    this.close();

    if (typeof this.onChange === 'function') {
      this.onChange(val, found);
    }
  }

  setValue(val) {
    this.selectedValue = val;
    const norm = this.getNormalizedOptions();
    const found = norm.find(o => String(o.value) === String(val));
    const labelSpan = this.triggerEl?.querySelector('.trigger-label');
    if (labelSpan) {
      labelSpan.textContent = found ? found.label : this.placeholder;
    }
    this.triggerEl?.classList.toggle('has-value', !!found);
  }

  getValue() {
    return this.selectedValue;
  }

  setOptions(newOptions, resetValue = false) {
    this.options = newOptions;
    if (resetValue) {
      this.selectedValue = '';
      const labelSpan = this.triggerEl?.querySelector('.trigger-label');
      if (labelSpan) labelSpan.textContent = this.placeholder;
      this.triggerEl?.classList.remove('has-value');
    } else {
      this.setValue(this.selectedValue);
    }
    if (this.isOpen) {
      this.listEl.innerHTML = this.renderOptionsList(this.getNormalizedOptions(), this.searchInput.value);
    }
  }

  setDisabled(disabled) {
    this.disabled = disabled;
    if (this.triggerEl) {
      this.triggerEl.disabled = disabled;
      this.wrapEl.classList.toggle('is-disabled', disabled);
    }
    if (disabled && this.isOpen) {
      this.close();
    }
  }
}
