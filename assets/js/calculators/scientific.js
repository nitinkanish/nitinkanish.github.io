document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="scientific"]');
  const display = document.getElementById('sci-display');
  const expression = document.getElementById('sci-expression');
  if (!root || !display) return;

  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({});

  let current = '0';
  let stored = '';
  let operator = null;
  let resetNext = false;
  let angleMode = 'deg';

  document.querySelectorAll('.calc-mode button').forEach((btn) => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.calc-mode button').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      angleMode = btn.dataset.mode;
    });
  });

  document.querySelectorAll('.calc-btn').forEach((btn) => {
    btn.addEventListener('click', () => handleInput(btn.dataset.action, btn.dataset.value));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key >= '0' && e.key <= '9') handleInput('digit', e.key);
    else if (e.key === '.') handleInput('digit', '.');
    else if (['+', '-', '*', '/'].includes(e.key)) handleInput('operator', e.key);
    else if (e.key === 'Enter' || e.key === '=') handleInput('equals');
    else if (e.key === 'Escape') handleInput('clear');
    else if (e.key === 'Backspace') handleInput('backspace');
  });

  function handleInput(action, value) {
    switch (action) {
      case 'digit':
        if (resetNext) { current = value === '.' ? '0.' : value; resetNext = false; }
        else if (value === '.' && current.includes('.')) break;
        else current = current === '0' && value !== '.' ? value : current + value;
        break;
      case 'operator':
        if (operator && !resetNext) compute();
        stored = current;
        operator = value;
        resetNext = true;
        expression.textContent = `${stored} ${operator}`;
        break;
      case 'equals':
        compute();
        operator = null;
        expression.textContent = '';
        break;
      case 'clear':
        current = '0'; stored = ''; operator = null; resetNext = false;
        expression.textContent = '';
        break;
      case 'backspace':
        current = current.length > 1 ? current.slice(0, -1) : '0';
        break;
      case 'func':
        current = String(applyFunc(value, parseFloat(current)));
        resetNext = true;
        break;
      case 'const':
        current = value === 'pi' ? String(Math.PI) : String(Math.E);
        resetNext = true;
        break;
      default: break;
    }
    const formatted = formatDisplay(current);
    display.textContent = formatted;
    publishResult(formatted);
  }

  function publishResult(val) {
    UI.publishDashboard(engine, {
      primary: val,
      metrics: [angleMode === 'deg' ? 'Degrees' : 'Radians', expression.textContent || '—', '10 digits'],
      compare: val,
      shareBadge: 'Scientific',
      shareText: `Scientific calc result: ${val}`,
      insights: [
        { icon: '🔢', text: `Current result: ${val}` },
        { icon: '📐', text: `Angle mode: ${angleMode === 'deg' ? 'Degrees (DEG)' : 'Radians (RAD)'}.` },
        { icon: '⌨️', text: 'Keyboard supported: 0–9, operators, Enter (=), Escape (clear).' },
        { icon: '💡', text: 'Use sin, cos, tan, log, ln, sqrt, and power functions for advanced math.' }
      ]
    });
  }

  publishResult('0');

  function applyFunc(fn, x) {
    const rad = angleMode === 'deg' ? x * Math.PI / 180 : x;
    const map = {
      sin: Math.sin(rad), cos: Math.cos(rad), tan: Math.tan(rad),
      log: Math.log10(x), ln: Math.log(x), sqrt: Math.sqrt(x),
      square: x * x, reciprocal: 1 / x, factorial: factorial(x),
      neg: -x
    };
    const result = map[fn];
    return isFinite(result) ? result : 'Error';
  }

  function factorial(n) {
    if (n < 0 || n !== Math.floor(n)) return NaN;
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function compute() {
    if (!operator) return;
    const a = parseFloat(stored);
    const b = parseFloat(current);
    let result;
    switch (operator) {
      case '+': result = a + b; break;
      case '-': result = a - b; break;
      case '*': result = a * b; break;
      case '/': result = b !== 0 ? a / b : 'Error'; break;
      case '^': result = Math.pow(a, b); break;
      default: return;
    }
    current = String(result);
    resetNext = true;
  }

  function formatDisplay(val) {
    if (val === 'Error') return val;
    const n = parseFloat(val);
    if (isNaN(n)) return val;
    if (Math.abs(n) > 1e10 || (Math.abs(n) < 1e-6 && n !== 0)) return n.toExponential(4);
    return parseFloat(n.toPrecision(10)).toString();
  }
});
