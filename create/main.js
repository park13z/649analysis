(() => {
  const { estimate, trend, predictModes, backtest, predictBonus } = window.LottoLogic;
  const { renderStats, renderBonusPick, renderTrend, renderPicks, renderBacktest, el } = window.LottoUI;
  const { loadHistoryFile } = window.LottoWebApi;

  const choose = (n, k) => {
    const kk = Math.min(k, n - k);
    let r = 1n;
    for (let i = 1; i <= kk; i += 1) r = (r * BigInt(n - kk + i)) / BigInt(i);
    return r;
  };

  const renderOddsInfo = () => {
    const total = choose(49, 6);
    const box = el("oddsInfo");
    if (!box) return;
    box.textContent = `โอกาสถูกรางวัลเลขหลัก 6 ตัวแบบตรงทั้งหมด = 1 / ${total.toLocaleString("en-US")}`;
  };

  const loadDraws = async () => {
    try {
      const data = await loadHistoryFile();
      return data.filter((d) => d.date && Array.isArray(d.nums) && d.nums.length === 6)
        .map((d) => ({ date: d.date, nums: d.nums.map(Number), bonus: Number(d.bonus || 0) }));
    } catch {
      return [];
    }
  };

  const refresh = (draws) => {
    const report = estimate(draws);
    renderStats(draws, report);
    renderBonusPick(predictBonus(draws));
    renderTrend(trend(draws)); renderPicks(predictModes(draws)); renderBacktest(backtest(draws));
  };

  const init = async () => {
    renderOddsInfo();
    const draws = await loadDraws();
    refresh(draws);
  };
  init();
})();
