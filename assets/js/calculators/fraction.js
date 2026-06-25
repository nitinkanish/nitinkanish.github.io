document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="fraction"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    const mode = v.mode || 'add';
    const num1 = engine.parseNumber(v.num1);
    const den1 = engine.parseNumber(v.den1);
    const num2 = engine.parseNumber(v.num2);
    const den2 = engine.parseNumber(v.den2);

    if (den1 === 0 || den2 === 0) return null;

    let resultNum, resultDen;
    const opLabels = { add: '+', subtract: '−', multiply: '×', divide: '÷' };

    switch (mode) {
      case 'add':
        resultNum = num1 * den2 + num2 * den1;
        resultDen = den1 * den2;
        break;
      case 'subtract':
        resultNum = num1 * den2 - num2 * den1;
        resultDen = den1 * den2;
        break;
      case 'multiply':
        resultNum = num1 * num2;
        resultDen = den1 * den2;
        break;
      case 'divide':
        if (num2 === 0) return null;
        resultNum = num1 * den2;
        resultDen = den1 * num2;
        break;
      default:
        return null;
    }

    if (resultDen === 0) return null;

    const g = gcd(Math.abs(resultNum), Math.abs(resultDen));
    resultNum /= g;
    resultDen /= g;
    if (resultDen < 0) { resultNum = -resultNum; resultDen = -resultDen; }

    const decimal = resultNum / resultDen;
    const fracStr = `${resultNum}/${resultDen}`;
    const mixed = toMixed(resultNum, resultDen);
    const inputStr = `${num1}/${den1} ${opLabels[mode]} ${num2}/${den2}`;

    UI.publishDashboard(engine, {
      primary: fracStr,
      primaryFormat: 'text',
      metrics: [
        engine.formatNumber(decimal, 6),
        mixed !== fracStr ? mixed : 'Lowest terms',
        inputStr
      ],
      compare: engine.formatNumber(decimal, 4),
      shareBadge: fracStr,
      shareText: `${inputStr} = ${fracStr} (${engine.formatNumber(decimal, 4)})`,
      insights: [
        { icon: '🔢', text: `${inputStr} = ${fracStr} = ${engine.formatNumber(decimal, 6)}` },
        { icon: '📐', text: mixed !== fracStr ? `Mixed number: ${mixed}` : 'Result is already in lowest terms.' },
        { icon: '💡', text: mode === 'add' || mode === 'subtract' ? 'LCD used for common denominator before combining.' : 'Numerators and denominators combined directly.' },
        { icon: '✅', text: `Simplified using GCD = ${g}.` }
      ]
    });

    return { resultNum, resultDen, decimal };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      const r = compute(d);
      return r ? `${r.num}/${r.den}` : '—';
    },
    apply: (d, f) => {
      if (d.mode) f.querySelector('#mode').value = d.mode;
      setVal(f, 'num1', d.num1);
      setVal(f, 'den1', d.den1);
      setVal(f, 'num2', d.num2);
      setVal(f, 'den2', d.den2);
      engine.calculate();
    }
  });

  function compute(d) {
    const num1 = parseFloat(d.num1), den1 = parseFloat(d.den1);
    const num2 = parseFloat(d.num2), den2 = parseFloat(d.den2);
    if (!den1 || !den2) return null;
    let n, de;
    switch (d.mode) {
      case 'add': n = num1 * den2 + num2 * den1; de = den1 * den2; break;
      case 'subtract': n = num1 * den2 - num2 * den1; de = den1 * den2; break;
      case 'multiply': n = num1 * num2; de = den1 * den2; break;
      case 'divide': if (!num2) return null; n = num1 * den2; de = den1 * num2; break;
      default: return null;
    }
    const g = gcd(Math.abs(n), Math.abs(de));
    return { num: n / g, den: de / g };
  }

  function gcd(a, b) {
    while (b) { const t = b; b = a % b; a = t; }
    return a || 1;
  }

  function toMixed(num, den) {
    if (Math.abs(num) < Math.abs(den)) return `${num}/${den}`;
    const whole = Math.trunc(num / den);
    const rem = Math.abs(num % den);
    if (rem === 0) return String(whole);
    const sign = num < 0 ? '-' : '';
    return `${sign}${Math.abs(whole)} ${rem}/${den}`;
  }

  function setVal(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }
});
