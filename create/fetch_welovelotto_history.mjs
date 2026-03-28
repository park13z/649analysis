import fs from "node:fs/promises";

const BASE = "https://www.welovelotto.com/lottery-results/canada-lotto-649/draw-history";
const OUT_JSON = "create/data/lotto649_history.json";
const OUT_CSV = "create/data/lotto649_history.csv";

const pageUrl = (page) => (
  `${BASE}?page=${page}&per_page=10&repo=ng-table&lottery=canada-lotto-649&last_days=36500`
);

const toNums = (numbers) => numbers.split("|").map(Number).filter(Number.isFinite).slice(0, 6);
const toBonus = (numbers) => numbers.split("|").map(Number).filter(Number.isFinite)[6] ?? 0;

async function fetchPage(page) {
  const res = await fetch(pageUrl(page), {
    headers: { "X-Requested-With": "XMLHttpRequest", Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} at page ${page}`);
  const body = await res.json();
  const chunk = Array.isArray(body) ? body[0] : body;
  const rawData = Array.isArray(chunk?.data) ? chunk.data : Object.values(chunk?.data || {});
  const data = rawData.map((d) => ({ date: d.date, nums: toNums(d.numbers), bonus: toBonus(d.numbers) }))
    .filter((d) => d.nums.length === 6 && d.bonus > 0);
  return { total: Number(chunk?.total || 0), data };
}

async function run() {
  const all = [];
  let page = 1;
  let total = Infinity;
  while (all.length < total) {
    const { total: t, data } = await fetchPage(page);
    total = t || total;
    if (!data.length) break;
    all.push(...data);
    page += 1;
  }
  const seen = new Set();
  const unique = all.filter((d) => {
    const key = `${d.date}|${d.nums.join("-")}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  await fs.mkdir("create/data", { recursive: true });
  await fs.writeFile(OUT_JSON, JSON.stringify(unique, null, 2), "utf8");
  const csv = ["date,n1,n2,n3,n4,n5,n6,bonus", ...unique.map((d) => `${d.date},${d.nums.join(",")},${d.bonus}`)].join("\n");
  await fs.writeFile(OUT_CSV, `${csv}\n`, "utf8");
  console.log(`Saved ${unique.length} rows to ${OUT_JSON} and ${OUT_CSV}`);
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
