document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });
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

    const result = {
      primary: engine.formatCurrency(total),
      primaryLabel: 'Total Amount',
      items: [
        { label: 'Base Amount', value: engine.formatCurrency(base) },
        { label: `GST (${rate}%)`, value: engine.formatCurrency(gst) },
        { label: 'CGST', value: engine.formatCurrency(gst / 2) },
        { label: 'SGST', value: engine.formatCurrency(gst / 2) }
      ]
    };
    engine.renderResults(results, result);
    return result;
  };
  engine.init();
});
