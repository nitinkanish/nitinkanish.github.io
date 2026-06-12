document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="gst"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });

  UI.bindSliders(form);
  UI.bindChips(form);

  engine.onCalculate = (v) => {
    const amount = engine.parseNumber(v.amount);
    const rate = engine.parseNumber(v.rate);
    const mode = v.mode || 'exclusive';
    if (!amount || !rate) return null;

    let base, gst, total;
    if (mode === 'exclusive') {
      base = amount;
      gst = amount * rate / 100;
      total = amount + gst;
    } else {
      total = amount;
      base = amount / (1 + rate / 100);
      gst = total - base;
    }

    UI.publishDashboard(engine, {
      primary: total,
      metrics: [
        engine.formatCurrency(base),
        engine.formatCurrency(gst),
        engine.formatCurrency(gst / 2) + ' + ' + engine.formatCurrency(gst / 2)
      ],
      compare: engine.formatCurrency(total) + ' (' + rate + '% GST)',
      shareBadge: rate + '% GST',
      shareText: `GST calculation: ${engine.formatCurrency(total)} total (${rate}% GST)`,
      fieldDisplays: {
        amount: engine.formatCurrency(amount),
        rate: rate + '%'
      },
      insights: [
        { icon: '🧾', text: `GST of ${engine.formatCurrency(gst)} on base ${engine.formatCurrency(base)} at ${rate}%.` },
        { icon: '⚖️', text: `CGST: ${engine.formatCurrency(gst / 2)} · SGST: ${engine.formatCurrency(gst / 2)} (intra-state).` },
        { icon: '💡', text: mode === 'exclusive' ? 'Amount entered is pre-GST (exclusive).' : 'Amount entered includes GST (inclusive).' },
        { icon: '📋', text: 'Common slabs: 5% essentials, 12% processed, 18% standard, 28% luxury.' }
      ]
    });

    return { base, gst, total };
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      const t = d.mode === 'exclusive' ? d.amount * (1 + d.rate / 100) : d.amount;
      return engine.formatCurrency(t);
    },
    apply: (d, f) => {
      setField(f, 'amount', d.amount);
      setField(f, 'rate', d.rate);
      if (d.mode) f.querySelector('#mode').value = d.mode;
      engine.calculate();
    }
  });

  function setField(f, id, val) {
    const input = f.querySelector('#' + id);
    const range = f.querySelector('#' + id + '-range');
    if (input) { input.value = val; input.dispatchEvent(new Event('input', { bubbles: true })); }
    if (range) range.value = val;
  }
});
