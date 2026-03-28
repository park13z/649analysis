import requests
from bs4 import BeautifulSoup
import csv
import json

url = "https://www.welovelotto.com/lottery-results/canada-lotto-649/draw-history"
res = requests.get(url)
soup = BeautifulSoup(res.text, "html.parser")
results = []
for row in soup.find_all("tr"):
    cols = row.find_all("td")
    if len(cols) >= 3:
        date = cols[1].get_text(strip=True)
        nums = cols[2].get_text(strip=True)
        nums = [int(n) for n in nums.replace("-", " ").split() if n.isdigit()]
        if len(nums) == 6:
            results.append({"date": date, "nums": nums})
# Save as CSV
with open("lotto649_results_welovelotto.csv", "w", newline="", encoding="utf-8") as f:
    writer = csv.writer(f)
    writer.writerow(["date", "n1", "n2", "n3", "n4", "n5", "n6"])
    for r in results:
        writer.writerow([r["date"]] + r["nums"])
# Save as JSON
with open("lotto649_results_welovelotto.json", "w", encoding="utf-8") as f:
    json.dump(results, f, ensure_ascii=False, indent=2)
print(f"Saved {len(results)} results to lotto649_results_welovelotto.csv and lotto649_results_welovelotto.json")
