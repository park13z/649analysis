(() => {
  const KEY = "lotto649_manual_draws_v1";
  const { sortedUnique, validate, estimate, trend, predictModes, backtest, predictBonus } = window.LottoLogic;
  const { setupInputs, getNums, getBonus, renderHistory, renderStats, renderBonusPick, renderTrend, renderPicks, renderBacktest, setStatus, el } = window.LottoUI;
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
    renderHistory(draws);
    renderStats(draws, report);
    renderBonusPick(predictBonus(draws));
    renderTrend(trend(draws)); renderPicks(predictModes(draws)); renderBacktest(backtest(draws));
  };

  const idOf = (d) => `${d.date}|${d.nums.join("-")}|${d.bonus ?? 0}`;
  const loadManual = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } };
  const saveManual = (draws) => localStorage.setItem(KEY, JSON.stringify(draws));
  const mergeUnique = (base, extra) => {
    const seen = new Set(base.map(idOf));
    extra.forEach((d) => { const k = idOf(d); if (!seen.has(k)) { base.push(d); seen.add(k); } });
    return base;
  };

  const init = async () => {
    setupInputs();
    renderOddsInfo();
    const fileDraws = await loadDraws();
    const manualDraws = loadManual();
    const allDraws = mergeUnique(fileDraws.slice(), manualDraws);
    refresh(allDraws);

    el("drawForm").addEventListener("submit", (e) => {
      e.preventDefault();
      const date = el("drawDate").value;
      const nums = sortedUnique(getNums());
      const bonus = getBonus();
      const msg = validate(nums);
      if (!date || msg) return alert(msg || "กรุณาเลือกวันที่");
      if (!bonus || bonus < 1 || bonus > 49) return alert("Bonus ต้องเป็นเลข 1-49");
      manualDraws.push({ date, nums, bonus });
      saveManual(manualDraws);
      refresh(mergeUnique(fileDraws.slice(), manualDraws));
      setStatus("บันทึกข้อมูลในเครื่องและคำนวณใหม่แล้ว");
      e.target.reset();
    });

    el("resetLocalBtn").addEventListener("click", () => {
      if (!confirm("ล้างเฉพาะข้อมูลที่กรอกเองในเครื่องนี้ใช่ไหม")) return;
      manualDraws.length = 0;
      saveManual(manualDraws);
      refresh(fileDraws.slice());
      setStatus("ล้างข้อมูลที่กรอกเองแล้ว");
    });
  };
  init();
})();
