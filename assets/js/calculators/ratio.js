document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="ratio"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const value3Group = document.getElementById('value3-group');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  form.querySelector('#mode').addEventListener('change', (e) => {
    value3Group.hidden = e.target.value !== 'proportion';
    engine.calculate();
  });
  value3Group.hidden = form.querySelector('#mode').value !== 'proportion';

  engine.onCalculate = (v) => {
    const mode = v.mode || 'simplify';
    const a = engine.parseNumber(v.value1);
    const b = engine.parseNumber(v.value2);
    if (a === undefined || b === undefined) return null;

    if (mode === 'simplify') {
      if (b === 0) return null;
      const g = gcd(Math.abs(Math.round(a * 1000)), Math.abs(Math.round(b * 1000)));
      const sa = Math.round(a * 1000) / g;
      const sb = Math.round(b * 1000) / g;
      const scale = g / 1000;
      const ratioStr = `${formatRatioPart(sa)} : ${formatRatioPart(sb)}`;
      const decimal = a / b;

      UI.publishDashboard(engine, {
        primary: ratioStr,
        primaryFormat: 'text',
        metrics: ['Simplify', engine.formatNumber(decimal, 4), `GCD factor: ${scale > 1 ? scale : '1'}`],
        compare: ratioStr,
        shareBadge: ratioStr,
        shareText: `${a}:${b} simplifies to ${ratioStr}`,
        insights: [
          { icon: '🔢', text: `${a} : ${b} → ${ratioStr} (lowest terms).` },
          { icon: '📐', text: `As a decimal ratio: ${engine.formatNumber(decimal, 4)}.` },
          { icon: '💡', text: 'Divide both parts by their GCD to simplify any ratio.' },
          { icon: '✅', text: 'Order matters — swap values if your ratio is reversed.' }
        ]
      });
      return { ratio: ratioStr };
    }

    const c = engine.parseNumber(v.value3);
    if (c === undefined || b === 0 || a === 0) return null;
    const missing = (c * b) / a;
    const ratioStr = `${formatRatioPart(a)} : ${formatRatioPart(b)} = ${formatRatioPart(c)} : ${formatRatioPart(missing)}`;

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(missing, 4),
      metrics: [ratioStr, 'Proportion', `Cross-multiply: ${c} × ${b} ÷ ${a}`],
      compare: `? = ${engine.formatNumber(missing, 4)}`,
      shareBadge: `? = ${engine.formatNumber(missing, 2)}`,
      shareText: `${a}:${b} = ${c}:? → ? = ${engine.formatNumber(missing, 4)}`,
      insights: [
        { icon: '🔢', text: `${a}:${b} = ${c}:${engine.formatNumber(missing, 4)}` },
        { icon: '📐', text: `Formula: ? = (${c} × ${b}) / ${a} = ${engine.formatNumber(missing, 4)}` },
        { icon: '💡', text: 'Cross-multiplication: a × ? = b × c.' },
        { icon: '✅', text: 'Verify: ' + formatRatioPart(a) + '/' + formatRatioPart(b) + ' ≈ ' + formatRatioPart(c) + '/' + engine.formatNumber(missing, 4) }
      ]
    });
    return { missing };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      if (d.mode === 'proportion') {
        const m = (d.value3 * d.value2) / d.value1;
        return isFinite(m) ? engine.formatNumber(m, 2) : '—';
      }
      return `${d.value1}:${d.value2}`;
    },
    apply: (d, f) => {
      if (d.mode) {
        f.querySelector('#mode').value = d.mode;
        value3Group.hidden = d.mode !== 'proportion';
      }
      setVal(f, 'value1', d.value1);
      setVal(f, 'value2', d.value2);
      if (d.value3 !== undefined) setVal(f, 'value3', d.value3);
      engine.calculate();
    }
  });

  function gcd(a, b) {
    while (b) { const t = b; b = a % b; a = t; }
    return a || 1;
  }

  function formatRatioPart(n) {
    return Number.isInteger(n) ? String(n) : engine.formatNumber(n, 4);
  }

  function setVal(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }
});
