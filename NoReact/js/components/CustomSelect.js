/**
 * CustomSelect (vanilla JS)
 * Equivalente funcional al CustomSelect.tsx + extras:
 *  - searchable: input de filtro dentro del dropdown
 *  - clear (X) cuando hay valor
 *  - hidden input para FormData
 *  - API: setOptions, setValue, getValue, destroy
 *
 * Uso:
 *   const sel = new CustomSelect(containerEl, {
 *     options: [{value:'1', label:'Coleoptera'}],
 *     value: '',
 *     placeholder: 'Seleccionar...',
 *     searchable: true,
 *     name: 'orden_id',
 *     onChange: (v) => console.log(v)
 *   });
 */
(function (window, document) {
  'use strict';

  function CustomSelect(container, opts) {
    if (!container) throw new Error('CustomSelect: container requerido');
    opts = opts || {};

    this.container = container;
    this.options = Array.isArray(opts.options) ? opts.options.slice() : [];
    this.value = opts.value != null ? String(opts.value) : '';
    this.placeholder = opts.placeholder || 'Seleccionar...';
    this.searchable = !!opts.searchable;
    this.name = opts.name || '';
    this.className = opts.className || '';
    this.compact = !!opts.compact;
    this.openUpwards = !!opts.openUpwards;
    this.onChange = typeof opts.onChange === 'function' ? opts.onChange : function () {};
    this.disabled = !!opts.disabled;

    this.isOpen = false;
    this.searchTerm = '';

    this._onDocClick = this._onDocClick.bind(this);

    this._build();
    this._render();
  }

  CustomSelect.prototype._build = function () {
    this.root = document.createElement('div');
    this.root.className = 'custom-select-container ' + (this.className || '');
    this.root.style.position = 'relative';
    this.root.style.width = '100%';

    this.trigger = document.createElement('div');
    this.trigger.className = 'custom-select-trigger ' + (this.compact ? 'select-table-compact' : 'form-input');

    this.labelSpan = document.createElement('span');
    this.labelSpan.style.overflow = 'hidden';
    this.labelSpan.style.textOverflow = 'ellipsis';
    this.labelSpan.style.whiteSpace = 'nowrap';
    this.labelSpan.style.flex = '1';

    this.controls = document.createElement('span');
    this.controls.style.display = 'inline-flex';
    this.controls.style.alignItems = 'center';
    this.controls.style.gap = '4px';
    this.controls.style.flexShrink = '0';

    this.clearBtn = document.createElement('button');
    this.clearBtn.type = 'button';
    this.clearBtn.className = 'custom-select-clear';
    this.clearBtn.setAttribute('aria-label', 'Limpiar selección');
    this.clearBtn.innerHTML = '<i data-lucide="x" style="width:14px;height:14px;"></i>';
    this.clearBtn.style.cssText = 'background:transparent;border:none;cursor:pointer;color:var(--text-muted);padding:0;display:none;align-items:center;';

    this.chevron = document.createElement('i');
    this.chevron.setAttribute('data-lucide', this.openUpwards ? 'chevron-up' : 'chevron-down');
    this.chevron.style.cssText = 'width:' + (this.compact ? '14px' : '18px') + ';height:' + (this.compact ? '14px' : '18px') + ';color:var(--text-muted);transition:transform 0.2s ease;';

    this.controls.appendChild(this.clearBtn);
    this.controls.appendChild(this.chevron);

    this.trigger.appendChild(this.labelSpan);
    this.trigger.appendChild(this.controls);

    this.dropdown = document.createElement('div');
    this.dropdown.className = 'custom-select-dropdown';
    this.dropdown.style.cssText =
      'position:absolute;left:-0.75rem;min-width:calc(100% + 1.5rem);max-height:240px;' +
      'background:var(--bg-card);border:1px solid var(--border-color);border-radius:0.5rem;' +
      'z-index:9999;box-shadow:0 4px 12px rgba(0,0,0,0.5);padding:0.25rem;display:none;' +
      'flex-direction:column;';
    if (this.openUpwards) {
      this.dropdown.style.bottom = '100%';
      this.dropdown.style.marginBottom = '0.25rem';
    } else {
      this.dropdown.style.top = '100%';
      this.dropdown.style.marginTop = '0.25rem';
    }

    if (this.searchable) {
      this.searchWrap = document.createElement('div');
      this.searchWrap.className = 'custom-select-search';
      this.searchInput = document.createElement('input');
      this.searchInput.type = 'text';
      this.searchInput.placeholder = 'Buscar...';
      this.searchInput.className = 'custom-select-search-input';
      this.searchWrap.appendChild(this.searchInput);
      this.dropdown.appendChild(this.searchWrap);

      this.searchInput.addEventListener('input', (e) => {
        this.searchTerm = e.target.value || '';
        this._renderOptions();
      });
      this.searchInput.addEventListener('click', (e) => e.stopPropagation());
    }

    this.optionsList = document.createElement('div');
    this.optionsList.className = 'custom-select-options';
    this.optionsList.style.cssText = 'overflow-y:auto;max-height:200px;';
    this.dropdown.appendChild(this.optionsList);

    this.hiddenInput = document.createElement('input');
    this.hiddenInput.type = 'hidden';
    if (this.name) this.hiddenInput.name = this.name;
    this.hiddenInput.value = this.value;

    this.root.appendChild(this.trigger);
    this.root.appendChild(this.dropdown);
    this.root.appendChild(this.hiddenInput);

    this.container.innerHTML = '';
    this.container.appendChild(this.root);

    this.trigger.addEventListener('click', (e) => {
      if (this.disabled) return;
      if (e.target.closest('.custom-select-clear')) return;
      this._toggle();
    });

    this.clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.setValue('');
    });
  };

  CustomSelect.prototype._onDocClick = function (e) {
    if (!this.root.contains(e.target)) this._close();
  };

  CustomSelect.prototype._toggle = function () {
    this.isOpen ? this._close() : this._open();
  };

  CustomSelect.prototype._open = function () {
    this.isOpen = true;
    this.dropdown.style.display = 'flex';
    this.chevron.style.transform = 'rotate(180deg)';
    this.searchTerm = '';
    if (this.searchInput) {
      this.searchInput.value = '';
      setTimeout(() => this.searchInput.focus(), 0);
    }
    this._renderOptions();
    document.addEventListener('mousedown', this._onDocClick);
  };

  CustomSelect.prototype._close = function () {
    this.isOpen = false;
    this.dropdown.style.display = 'none';
    this.chevron.style.transform = 'rotate(0deg)';
    document.removeEventListener('mousedown', this._onDocClick);
  };

  CustomSelect.prototype._render = function () {
    const sel = this._findOption(this.value);
    this.labelSpan.textContent = sel ? sel.label : this.placeholder;
    this.labelSpan.style.color = sel ? 'var(--text-color)' : 'var(--text-muted)';
    if (sel && sel.className) this.labelSpan.className = sel.className; else this.labelSpan.className = '';
    this.clearBtn.style.display = (this.value && !this.disabled) ? 'inline-flex' : 'none';
    this.hiddenInput.value = this.value;
    this._renderOptions();
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  };

  CustomSelect.prototype._renderOptions = function () {
    const term = (this.searchTerm || '').toLowerCase().trim();
    const filtered = term
      ? this.options.filter((o) => String(o.label).toLowerCase().indexOf(term) !== -1)
      : this.options;

    this.optionsList.innerHTML = '';

    if (!filtered.length) {
      const empty = document.createElement('div');
      empty.style.cssText = 'padding:0.6rem 0.75rem;color:var(--text-muted);font-size:0.85rem;text-align:center;';
      empty.textContent = 'Sin resultados';
      this.optionsList.appendChild(empty);
      return;
    }

    filtered.forEach((opt) => {
      const div = document.createElement('div');
      const isSelected = String(opt.value) === String(this.value);
      div.className = 'custom-select-option' + (isSelected ? ' selected' : '') + (opt.className ? ' ' + opt.className : '');
      div.textContent = opt.label;
      div.addEventListener('click', () => {
        this.setValue(opt.value);
        this._close();
      });
      this.optionsList.appendChild(div);
    });
  };

  CustomSelect.prototype._findOption = function (val) {
    for (let i = 0; i < this.options.length; i++) {
      if (String(this.options[i].value) === String(val)) return this.options[i];
    }
    return null;
  };

  // ── API pública ──────────────────────────────────────
  CustomSelect.prototype.setOptions = function (newOptions) {
    this.options = Array.isArray(newOptions) ? newOptions.slice() : [];
    if (this.value && !this._findOption(this.value)) {
      this.value = '';
    }
    this._render();
  };

  CustomSelect.prototype.setValue = function (newValue) {
    const v = newValue == null ? '' : String(newValue);
    if (v === this.value) {
      this._render();
      return;
    }
    this.value = v;
    this._render();
    try { this.onChange(this.value); } catch (e) { console.error(e); }
  };

  CustomSelect.prototype.getValue = function () {
    return this.value;
  };

  CustomSelect.prototype.setDisabled = function (disabled) {
    this.disabled = !!disabled;
    this.trigger.style.opacity = this.disabled ? '0.6' : '1';
    this.trigger.style.pointerEvents = this.disabled ? 'none' : 'auto';
    this._render();
  };

  CustomSelect.prototype.destroy = function () {
    this._close();
    document.removeEventListener('mousedown', this._onDocClick);
    if (this.root && this.root.parentNode) {
      this.root.parentNode.removeChild(this.root);
    }
    this.container = null;
    this.root = null;
  };

  window.CustomSelect = CustomSelect;
})(window, document);
