export const stemMeta = {
  甲: { element: "木", yinYang: "陽" },
  乙: { element: "木", yinYang: "陰" },
  丙: { element: "火", yinYang: "陽" },
  丁: { element: "火", yinYang: "陰" },
  戊: { element: "土", yinYang: "陽" },
  己: { element: "土", yinYang: "陰" },
  庚: { element: "金", yinYang: "陽" },
  辛: { element: "金", yinYang: "陰" },
  壬: { element: "水", yinYang: "陽" },
  癸: { element: "水", yinYang: "陰" }
};

export const branchMeta = {
  子: { element: "水" },
  丑: { element: "土" },
  寅: { element: "木" },
  卯: { element: "木" },
  辰: { element: "土" },
  巳: { element: "火" },
  午: { element: "火" },
  未: { element: "土" },
  申: { element: "金" },
  酉: { element: "金" },
  戌: { element: "土" },
  亥: { element: "水" }
};

export const elementOrder = ["木", "火", "土", "金", "水"];

export function countElements(pillars) {
  const counts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  const allGanZhi = [
    pillars.year.gan,
    pillars.month.gan,
    pillars.day.gan,
    pillars.hour.gan,
    pillars.year.zhi,
    pillars.month.zhi,
    pillars.day.zhi,
    pillars.hour.zhi
  ].filter((x) => x && x !== "未知");

  for (const item of allGanZhi) {
    const meta = stemMeta[item] || branchMeta[item];
    if (meta?.element) counts[meta.element] += 1;
  }

  return counts;
}

export function dominantElement(counts) {
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "未知";
}