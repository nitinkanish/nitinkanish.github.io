document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="volume"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });
  const shapeEl = form.querySelector('#shape');
  const boxF = form.querySelector('#vol-box-fields');
  const cylF = form.querySelector('#vol-cylinder-fields');
  const sphF = form.querySelector('#vol-sphere-fields');

  shapeEl?.addEventListener('change', () => {
    const s = shapeEl.value;
    boxF.hidden = s !== 'box';
    cylF.hidden = s !== 'cylinder';
    sphF.hidden = s !== 'sphere';
    engine.calculate();
  });

  engine.onCalculate = (v) => {
    const shape = v.shape || 'box';
    const unit = v.unit === 'm' ? 'm' : 'ft';
    const unitCu = unit === 'm' ? 'cu m' : 'cu ft';
    let vol = 0;

    if (shape === 'cylinder') {
      const r = engine.parseNumber(v.radius);
      const h = engine.parseNumber(v.cyl_height);
      if (!r || !h) return null;
      vol = Math.PI * r * r * h;
    } else if (shape === 'sphere') {
      const r = engine.parseNumber(v.sphere_radius);
      if (!r) return null;
      vol = (4 / 3) * Math.PI * r * r * r;
    } else {
      const l = engine.parseNumber(v.length);
      const w = engine.parseNumber(v.width);
      const h = engine.parseNumber(v.height);
      if (!l || !w || !h) return null;
      vol = l * w * h;
    }

    const cuYd = vol / 27;
    const cuM = unit === 'ft' ? vol * 0.0283168 : vol;
    const cuFt = unit === 'm' ? vol * 35.3147 : vol;

    UI.publishDashboard(engine, {
      primary: engine.formatNumber(vol, 2) + ' ' + unitCu,
      metrics: [
        engine.formatNumber(cuFt, 2) + ' cu ft',
        engine.formatNumber(cuYd, 2) + ' cu yd',
        shape.charAt(0).toUpperCase() + shape.slice(1)
      ],
      compare: engine.formatNumber(vol, 2) + ' ' + unitCu,
      shareBadge: engine.formatNumber(vol, 2) + ' ' + unitCu,
      shareText: `Volume: ${engine.formatNumber(vol, 2)} ${unitCu}`,
      insights: [
        { icon: '🏗️', text: `≈ ${engine.formatNumber(cuYd, 2)} cubic yards of material.` },
        { icon: '📦', text: `Add 5–10% waste: ~${engine.formatNumber(vol * 1.08, 2)} ${unitCu}.` },
        { icon: '🔄', text: `${engine.formatNumber(cuFt, 2)} cu ft / ${engine.formatNumber(cuM, 2)} cu m.` },
        { icon: '📏', text: 'Verify dimensions on-site before ordering concrete or fill.' }
      ]
    });
    return { vol, shape };
  };

  engine.init();
  engine.calculate();
});
