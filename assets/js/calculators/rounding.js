document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="rounding"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form });

  engine.onCalculate = (v) => {
    const value = engine.parseNumber(v.value);
    const decimals = Math.min(10, Math.max(0, Math.round(engine.parseNumber(v.decimals))));
    const mode = v.mode || 'round';
    if (value === undefined) return null;

    const factor = Math.pow(10, decimals);
    let result;

    switch (mode) {
      case 'floor':
        result = Math.floor(value * factor) / factor;
        break;
      case 'ceil':
        result = Math.ceil(value * factor) / factor;
        break;
      case 'truncate':
        result = Math.trunc(value * factor) / factor;
        break;
      default:
        result = Math.round(value * factor) / factor;
    }

    const modeLabels = { round: 'Round', floor: 'Floor', ceil: 'Ceil', truncate: 'Truncate' };

    UI.publishDashboard(engine, {
      primary: result,
      primaryFormat: 'number',
      decimals,
      metrics: [
        engine.formatNumber(value, 10),
        modeLabels[mode] || 'Round',
        decimals + ' places'
      ],
      compare: engine.formatNumber(result, decimals),
      shareBadge: engine.formatNumber(result, decimals),
      shareText: `${engine.formatNumber(value, 6)} → ${engine.formatNumber(result, decimals)} (${modeLabels[mode]}, ${decimals} dp)`,
      insights: [
        { icon: '🔢', text: `${engine.formatNumber(value, 10)} → ${engine.formatNumber(result, decimals)}` },
        { icon: '📐', text: `${modeLabels[mode]} to ${decimals} decimal place${decimals === 1 ? '' : 's'}.` },
        { icon: '💡', text: mode === 'round' ? 'Standard half-up rounding: .5 rounds away from zero.' : mode === 'truncate' ? 'Truncate cuts digits without rounding up or down.' : `${modeLabels[mode]} always rounds ${mode === 'floor' ? 'down' : 'up'}.` },
        { icon: '✅', text: decimals === 2 ? 'Common for currency — 2 decimal places.' : 'Adjust decimal places for your precision needs.' }
      ]
    });
    return { result };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      const factor = Math.pow(10, d.decimals || 0);
      const val = parseFloat(d.value);
      let r;
      switch (d.mode) {
        case 'floor': r = Math.floor(val * factor) / factor; break;
        case 'ceil': r = Math.ceil(val * factor) / factor; break;
        case 'truncate': r = Math.trunc(val * factor) / factor; break;
        default: r = Math.round(val * factor) / factor;
      }
      return engine.formatNumber(r, d.decimals || 0);
    },
    apply: (d, f) => {
      if (d.mode) f.querySelector('#mode').value = d.mode;
      setVal(f, 'value', d.value);
      setVal(f, 'decimals', d.decimals);
      engine.calculate();
    }
  });

  function setVal(f, id, val) {
    const el = f.querySelector('#' + id);
    if (el) { el.value = val; el.dispatchEvent(new Event('input', { bubbles: true })); }
  }
});
