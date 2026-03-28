window.LottoUI = (() => {
  const el = (id) => document.getElementById(id);
  const mkBall = (n, cls) => `<div class="ball ${cls}">${n}</div>`;
  const balls = (nums, cls) => nums.map((n) => mkBall(n, cls)).join("");

  const setupInputs = () => {
    const box = el("nums");
    box.innerHTML = "";
    for (let i = 0; i < 6; i += 1) {
      const inp = document.createElement("input");
      inp.type = "number"; inp.min = "1"; inp.max = "49";
      inp.required = true; inp.placeholder = `${i + 1}`;
      box.appendChild(inp);
    }
    const sep = document.createElement("span");
    sep.className = "bonus-sep"; sep.textContent = "+ Bonus";
    box.appendChild(sep);
    const b = document.createElement("input");
    b.type = "number"; b.min = "1"; b.max = "49";
    b.required = true; b.id = "bonusNum"; b.placeholder = "B";
    box.appendChild(b);
  };

  const getNums = () => [...el("nums").querySelectorAll("input:not(#bonusNum)")].map((x) => Number(x.value));
  const getBonus = () => Number(el("bonusNum")?.value || 0);

  const renderHistory = (draws) => {
    el("historyBody").innerHTML = draws.slice().reverse().slice(0, 10)
      .map((d) => `<tr><td>${d.date}</td><td>${d.nums.join(" · ")}</td><td class="bonus">${d.bonus || "-"}</td></tr>`)
      .join("");
  };

  const renderStats = (draws, report) => {
    el("summary").textContent = `จำนวนงวดทั้งหมด: ${draws.length} งวด`;
    const tb = el("topBanner");
    if (draws.length) {
      tb.style.display = "";
      el("topBalls").innerHTML = balls(report.top, "ball-main");
    } else { tb.style.display = "none"; }
    el("freqGrid").innerHTML = report.freq.slice(1)
      .map((c, i) => `<div class="chip"><div class="cn">${i + 1}</div><div class="cp">${(report.odds[i + 1] * 100).toFixed(1)}%</div></div>`)
      .join("");
    window.LottoChart.drawFreq("freqChart", report.freq);
  };

  const renderBonusPick = (nums) => {
    const bb = el("bonusBanner");
    if (!nums || !nums.length) { bb.style.display = "none"; return; }
    bb.style.display = "";
    el("bonusBalls").innerHTML = nums.map((n) => mkBall(n, "ball-bonusPick")).join("");
  };

  const renderTrend = (rows) => {
    el("trendBox").innerHTML = rows.map((r) =>
      `<div class="trend-card"><div class="tl">${r.label}</div><div class="balls">${balls(r.top, "ball-main")}</div></div>`
    ).join("");
  };

  const modeMap = { hot: "🔥 Hot", cold: "❄️ Cold", balanced: "⚖️ Balanced", oddEven: "🎯 Odd/Even", spread: "📐 Spread" };
  const modeCls = { hot: "ball-hot", cold: "ball-cold", balanced: "ball-balanced", oddEven: "ball-oddEven", spread: "ball-spread" };

  const renderPicks = (p) => {
    const modes = ["hot", "cold", "balanced", "oddEven", "spread"];
    el("pickBox").innerHTML = modes.map((k) =>
      `<div class="pick-row"><span class="pick-label">${modeMap[k]}</span><div class="balls">${balls(p[k], modeCls[k])}</div></div>`
    ).join("");
  };

  const renderBacktest = (rows) => {
    el("backtestBox").innerHTML = rows.map((r) =>
      `<div class="bt-card"><div class="bt-score">${r.avg}</div><div class="bt-sub">avg · best ${r.best}/6</div><div class="bt-mode">${modeMap[r.mode] || r.mode}</div></div>`
    ).join("");
  };

  const setStatus = (text) => { el("updateStatus").textContent = text; };
  return { setupInputs, getNums, getBonus, renderHistory, renderStats, renderBonusPick, renderTrend, renderPicks, renderBacktest, setStatus, el };
})();
