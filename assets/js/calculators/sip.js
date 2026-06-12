document.addEventListener('DOMContentLoaded', () => {
  const root = document.querySelector('[data-calculator="sip"]');
  if (!root) return;

  const form = document.getElementById('calc-form');
  const UI = window.DashboardUI;
  const engine = new CalculatorEngine({ form, locale: 'en-IN', currency: 'INR' });

  UI.bindSliders(form);
  UI.bindChips(form);

  engine.onCalculate = (v) => {
    const lumpsum = engine.parseNumber(v.lumpsum);
    const monthly = engine.parseNumber(v.monthly);
    const rate = engine.parseNumber(v.return);
    const years = engine.parseNumber(v.years);
    if (!monthly || !rate || !years) return null;

    const data = computeSip({ lumpsum, monthly, rate, years });
    publish(data, engine);
    return data;
  };

  engine.init();
  engine.calculate();

  UI.bindExamples(form, {
    preview: (d) => {
      const r = computeSip({ lumpsum: d.lumpsum || 0, monthly: d.monthly, rate: d.return, years: d.years });
      return engine.formatCurrency(r.fv) + ' corpus';
    },
    apply: (d, f) => {
      setField(f, 'lumpsum', d.lumpsum || 0);
      setField(f, 'monthly', d.monthly);
      setField(f, 'return', d.return);
      setField(f, 'years', d.years);
      engine.calculate();
    }
  });

  function computeSip({ lumpsum, monthly, rate, years }) {
    const months = years * 12;
    const r = rate / 12 / 100;
    const fv = lumpsum * Math.pow(1 + r, months)
      + monthly * ((Math.pow(1 + r, months) - 1) / r) * (1 + r);
    const invested = lumpsum + monthly * months;
    const gains = fv - invested;
    const multiplier = invested > 0 ? fv / invested : 0;

    const timelineYears = [1, 5, 10, 20, 30].filter((y) => y <= years);
    if (!timelineYears.includes(years) && years < 30) timelineYears.push(years);
    timelineYears.sort((a, b) => a - b);

    const milestones = timelineYears.map((y) => {
      const m = y * 12;
      const bal = lumpsum * Math.pow(1 + r, m) + monthly * ((Math.pow(1 + r, m) - 1) / r) * (1 + r);
      const inv = lumpsum + monthly * m;
      return {
        label: 'Year ' + y,
        balance: engine.formatCurrency(bal),
        growth: '+' + engine.formatNumber(inv > 0 ? ((bal - inv) / inv) * 100 : 0, 0) + '% growth',
        milestone: milestoneLabel(bal)
      };
    });

    const yearlyData = [];
    for (let y = 1; y <= years; y++) {
      const m = y * 12;
      const bal = lumpsum * Math.pow(1 + r, m) + monthly * ((Math.pow(1 + r, m) - 1) / r) * (1 + r);
      const inv = lumpsum + monthly * m;
      yearlyData.push({ year: y, balance: bal, invested: inv, gains: bal - inv });
    }

    const doubleYears = rate > 0 ? Math.log(2) / Math.log(1 + rate / 100) : 0;
    const compoundCrossYear = yearlyData.find((d) => d.gains > d.invested - lumpsum)?.year || years;

    return { fv, invested, gains, multiplier, rate, monthly, lumpsum, years, yearlyData, milestones, doubleYears, compoundCrossYear };
  }

  function milestoneLabel(bal) {
    if (bal >= 10000000) return '🏆 Crorepati Track';
    if (bal >= 5000000) return '💎 ₹50L Milestone';
    if (bal >= 1000000) return '🎯 ₹10L Achieved';
    if (bal >= 500000) return '📈 Half Million';
    return '🌱 Wealth Building';
  }

  function publish(d, eng) {
    const extra = 2000;
    const r = d.rate / 12 / 100;
    const extraFv = d.fv + extra * ((Math.pow(1 + r, d.years * 12) - 1) / r) * (1 + r) - extra * d.years * 12;

    UI.publishDashboard(eng, {
      primary: d.fv,
      metrics: [
        eng.formatCurrency(d.invested),
        eng.formatCurrency(d.gains),
        eng.formatNumber(d.multiplier, 1) + 'x'
      ],
      compare: eng.formatCurrency(d.fv),
      shareBadge: eng.formatNumber(d.multiplier, 1) + 'x Growth',
      shareText: `My SIP projection: ${eng.formatCurrency(d.fv)} in ${d.years} years — ${eng.formatNumber(d.multiplier, 1)}x growth!`,
      timeline: d.milestones,
      goalValue: d.fv,
      yearlyData: d.yearlyData,
      chartValueFn: UI.financeChartFn,
      fieldDisplays: {
        lumpsum: eng.formatCurrency(d.lumpsum),
        monthly: eng.formatCurrency(d.monthly),
        return: eng.formatPercent(d.rate, 1),
        years: d.years + ' yrs'
      },
      insights: [
        { icon: '⏱', text: `Your money doubles approximately every ${eng.formatNumber(d.doubleYears, 1)} years at ${eng.formatPercent(d.rate, 1)}.` },
        { icon: '📊', text: `Compounding contributes more than your contributions after year ${d.compoundCrossYear}.` },
        { icon: '💡', text: `Adding ₹2,000/month could create ${eng.formatCurrency(extraFv - d.fv)} more wealth.` },
        { icon: '🚀', text: `You're on track for ${eng.formatNumber(d.multiplier, 1)}x growth — ${eng.formatNumber(d.multiplier * 100, 0)}% total return.` }
      ]
    });
  }

  function setField(f, id, val) {
    const input = f.querySelector('#' + id);
    const range = f.querySelector('#' + id + '-range');
    if (input) { input.value = val; input.dispatchEvent(new Event('input', { bubbles: true })); }
    if (range) range.value = val;
  }
});
