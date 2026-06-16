document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="area"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  const shapeEl = form.querySelector('#shape');
  const rectFields = form.querySelector('#rect-fields');
  const circleFields = form.querySelector('#circle-fields');
  const triangleFields = form.querySelector('#triangle-fields');

  shapeEl?.addEventListener('change', () => {
    const s = shapeEl.value;
    rectFields.hidden = s !== 'rectangle';
    circleFields.hidden = s !== 'circle';
    triangleFields.hidden = s !== 'triangle';
    engine.calculate();
  });

  engine.onCalculate = (v) => {
    const shape = v.shape || 'rectangle';
    const unit = v.unit === 'm' ? 'm' : 'ft';
    const unitSq = unit === 'm' ? 'sq m' : 'sq ft';
    let area = 0;
    let detail = '';

    if (shape === 'circle') {
      const r = engine.parseNumber(v.radius);
      if (!r) return null;
      area = Math.PI * r * r;
      detail = `π × ${r}²`;
    } else if (shape === 'triangle') {
      const b = engine.parseNumber(v.base);
      const h = engine.parseNumber(v.height);
      if (!b || !h) return null;
      area = 0.5 * b * h;
      detail = `½ × ${b} × ${h}`;
    } else {
      const l = engine.parseNumber(v.length);
      const w = engine.parseNumber(v.width);
      if (!l || !w) return null;
      area = l * w;
      detail = `${l} × ${w}`;
    }

    const areaFt = unit === 'm' ? area * 10.7639 : area;
    const areaM = unit === 'ft' ? area * 0.0929 : area;

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(area, 2) + ' ' + unitSq,
      metrics: [
        engine.formatNumber(areaFt, 2) + ' sq ft',
        engine.formatNumber(areaM, 2) + ' sq m',
        shape.charAt(0).toUpperCase() + shape.slice(1)
      ],
      compare: engine.formatNumber(area, 2) + ' ' + unitSq,
      shareBadge: engine.formatNumber(area, 2) + ' ' + unitSq,
      shareText: `Area: ${engine.formatNumber(area, 2)} ${unitSq} (${detail})`,
      fieldDisplays: { shape: shape, unit: unitSq },
      insights: [
        { icon: '📐', text: `Formula: ${detail} = ${engine.formatNumber(area, 2)} ${unitSq}.` },
        { icon: '🏗️', text: `Add 5–10% waste factor for flooring: ~${engine.formatNumber(area * 1.08, 2)} ${unitSq}.` },
        { icon: '🔄', text: `Converted: ${engine.formatNumber(areaFt, 2)} sq ft / ${engine.formatNumber(areaM, 2)} sq m.` },
        { icon: '📏', text: 'Always verify on-site measurements before ordering materials.' }
      ]
    });

    return { area, shape, unit };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: () => '120 sq ft',
    apply: (d, f) => {
      if (d.shape) {
        const s = f.querySelector('#shape');
        if (s) { s.value = d.shape; s.dispatchEvent(new Event('change', { bubbles: true })); }
      }
      if (d.length) setField(f, 'length', d.length);
      if (d.width) setField(f, 'width', d.width);
      engine.calculate();
    }
  });

  function setField(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }
});
