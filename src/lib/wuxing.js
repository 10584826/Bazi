const stemElementMap = {
  甲: "木",
  乙: "木",
  丙: "火",
  丁: "火",
  戊: "土",
  己: "土",
  庚: "金",
  辛: "金",
  壬: "水",
  癸: "水",
};

const branchElementMap = {
  子: "水",
  丑: "土",
  寅: "木",
  卯: "木",
  辰: "土",
  巳: "火",
  午: "火",
  未: "土",
  申: "金",
  酉: "金",
  戌: "土",
  亥: "水",
};

export function countElements(pillars) {
  const counts = { 木: 0, 火: 0, 土: 0, 金: 0, 水: 0 };

  Object.values(pillars || {}).forEach((pillar) => {
    const gan = pillar?.gan;
    const zhi = pillar?.zhi;

    if (gan && stemElementMap[gan]) {
      counts[stemElementMap[gan]] += 1;
    }

    if (zhi && branchElementMap[zhi]) {
      counts[branchElementMap[zhi]] += 1;
    }
  });

  return counts;
}

export function dominantElement(elementCounts) {
  if (!elementCounts) return "";
  return Object.entries(elementCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
}