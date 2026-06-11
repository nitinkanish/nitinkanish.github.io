document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('calc-form');
  const results = document.getElementById('calc-results');
  if (!form) return;

  const engine = new CalculatorEngine({ form });
  engine.onCalculate = (v) => {
    const birth = new Date(v.birthdate);
    const end = v.enddate ? new Date(v.enddate) : new Date();
    if (isNaN(birth.getTime())) return null;

    let years = end.getFullYear() - birth.getFullYear();
    let months = end.getMonth() - birth.getMonth();
    let days = end.getDate() - birth.getDate();

    if (days < 0) { months--; days += new Date(end.getFullYear(), end.getMonth(), 0).getDate(); }
    if (months < 0) { years--; months += 12; }

    const totalDays = Math.floor((end - birth) / (1000 * 60 * 60 * 24));

    const result = {
      primary: `${years} years, ${months} months, ${days} days`,
      primaryLabel: 'Your Age',
      items: [
        { label: 'Total Days', value: engine.formatNumber(totalDays, 0) },
        { label: 'Total Months', value: engine.formatNumber(years * 12 + months, 0) },
        { label: 'Birth Date', value: birth.toLocaleDateString() }
      ]
    };
    engine.renderResults(results, result);
    return result;
  };
  engine.init();
});
