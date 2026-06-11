/**
 * Online Calculators — Calculator Engine
 * Reusable framework for input validation, calculation, and formatting
 */
(function (global) {
  'use strict';

  class CalculatorEngine {
    constructor(options = {}) {
      this.form = options.form || null;
      this.onCalculate = options.onCalculate || null;
      this.onError = options.onError || null;
      this.locale = options.locale || 'en-IN';
      this.currency = options.currency || 'INR';
      this.debounceMs = options.debounceMs || 150;
      this._timer = null;
    }

    init() {
      if (!this.form) return;
      this.form.addEventListener('input', (e) => this._handleInput(e));
      this.form.addEventListener('change', (e) => this._handleInput(e));
      this.form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.calculate();
      });
      this.calculate();
    }

    _handleInput() {
      clearTimeout(this._timer);
      this._timer = setTimeout(() => this.calculate(), this.debounceMs);
    }

    validate() {
      const errors = [];
      if (!this.form) return errors;

      this.form.querySelectorAll('[data-validate]').forEach((input) => {
        const rules = (input.dataset.validate || '').split('|');
        const value = input.value.trim();
        this._clearError(input);

        rules.forEach((rule) => {
          const err = this._checkRule(rule, value, input);
          if (err) {
            errors.push({ field: input.name, message: err });
            this._showError(input, err);
          }
        });
      });

      return errors;
    }

    _checkRule(rule, value, input) {
      const label = input.labels?.[0]?.textContent || input.name || 'Field';

      if (rule === 'required' && !value) {
        return `${label} is required`;
      }
      if (rule.startsWith('min:')) {
        const min = parseFloat(rule.split(':')[1]);
        if (value && parseFloat(value) < min) {
          return `${label} must be at least ${min}`;
        }
      }
      if (rule.startsWith('max:')) {
        const max = parseFloat(rule.split(':')[1]);
        if (value && parseFloat(value) > max) {
          return `${label} must be at most ${max}`;
        }
      }
      if (rule === 'number' && value && isNaN(parseFloat(value))) {
        return `${label} must be a valid number`;
      }
      if (rule === 'date' && value && isNaN(Date.parse(value))) {
        return `${label} must be a valid date`;
      }
      return null;
    }

    _showError(input, message) {
      input.classList.add('error');
      input.setAttribute('aria-invalid', 'true');
      let errEl = input.parentElement.querySelector('.form-error');
      if (!errEl) {
        errEl = document.createElement('p');
        errEl.className = 'form-error';
        errEl.setAttribute('role', 'alert');
        input.parentElement.appendChild(errEl);
      }
      errEl.textContent = message;
    }

    _clearError(input) {
      input.classList.remove('error');
      input.removeAttribute('aria-invalid');
      const errEl = input.parentElement.querySelector('.form-error');
      if (errEl) errEl.remove();
    }

    getValues() {
      if (!this.form) return {};
      const data = new FormData(this.form);
      const values = {};
      for (const [key, val] of data.entries()) {
        values[key] = this._sanitize(val);
      }
      return values;
    }

    _sanitize(value) {
      if (typeof value !== 'string') return value;
      return value.replace(/[<>"'&]/g, '').trim();
    }

    parseNumber(value, fallback = 0) {
      const n = parseFloat(String(value).replace(/,/g, ''));
      return isNaN(n) ? fallback : n;
    }

    calculate() {
      const errors = this.validate();
      if (errors.length > 0) {
        if (this.onError) this.onError(errors);
        return null;
      }
      const values = this.getValues();
      if (this.onCalculate) {
        const result = this.onCalculate(values, this);
        this._announceResult(result);
        return result;
      }
      return null;
    }

    _announceResult(result) {
      const live = document.getElementById('calc-live-region');
      if (live && result?.primary) {
        live.textContent = `Result: ${result.primary}`;
      }
    }

    formatNumber(num, decimals = 2) {
      if (num === null || num === undefined || isNaN(num)) return '—';
      return new Intl.NumberFormat(this.locale, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(num);
    }

    formatCurrency(num, decimals = 2) {
      if (num === null || num === undefined || isNaN(num)) return '—';
      return new Intl.NumberFormat(this.locale, {
        style: 'currency',
        currency: this.currency,
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals
      }).format(num);
    }

    formatPercent(num, decimals = 2) {
      if (num === null || num === undefined || isNaN(num)) return '—';
      return `${this.formatNumber(num, decimals)}%`;
    }

    renderResults(container, result) {
      if (!container || !result) return;
      container.innerHTML = '';

      if (result.primary !== undefined) {
        const primary = document.createElement('div');
        primary.className = 'result-primary';
        primary.innerHTML = `
          <div class="result-label">${this._escape(result.primaryLabel || 'Result')}</div>
          <div class="result-value" aria-live="polite">${this._escape(String(result.primary))}</div>
        `;
        container.appendChild(primary);
      }

      if (result.items?.length) {
        const grid = document.createElement('div');
        grid.className = 'result-grid';
        result.items.forEach((item) => {
          const el = document.createElement('div');
          el.className = 'result-item';
          el.innerHTML = `
            <div class="result-label">${this._escape(item.label)}</div>
            <div class="result-value">${this._escape(String(item.value))}</div>
          `;
          grid.appendChild(el);
        });
        container.appendChild(grid);
      }
    }

    _escape(str) {
      const div = document.createElement('div');
      div.textContent = str;
      return div.innerHTML;
    }
  }

  global.CalculatorEngine = CalculatorEngine;
})(typeof window !== 'undefined' ? window : this);
