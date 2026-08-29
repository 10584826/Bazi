const stems = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];

const stemToIndex = Object.fromEntries(stems.map((s, i) => [s, i]));

const fiveElementByStem = {
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

const yinYangByStem = {
  甲: "yang",
  乙: "yin",
  丙: "yang",
  丁: "yin",
  戊: "yang",
  己: "yin",
  庚: "yang",
  辛: "yin",
  壬: "yang",
  癸: "yin",
};

function generateRelation(dayElement, otherElement) {
  if (dayElement === otherElement) return "same";
  const cycle = ["木", "火", "土", "金", "水"];
  const dayIndex = cycle.indexOf(dayElement);
  const otherIndex = cycle.indexOf(otherElement);
  const diff = (otherIndex - dayIndex + 5) % 5;

  if (diff === 1) return "output";
  if (diff === 2) return "wealth";
  if (diff === 3) return "power";
  if (diff === 4) return "resource";
  return "same";
}

export function getTenGod(dayGan, otherGan) {
  if (!dayGan || !otherGan) return "";

  const dayElement = fiveElementByStem[dayGan];
  const otherElement = fiveElementByStem[otherGan];
  const dayYinYang = yinYangByStem[dayGan];
  const otherYinYang = yinYangByStem[otherGan];

  const relation = generateRelation(dayElement, otherElement);
  const samePolarity = dayYinYang === otherYinYang;

  switch (relation) {
    case "same":
      return samePolarity ? "比肩" : "劫財";
    case "output":
      return samePolarity ? "食神" : "傷官";
    case "wealth":
      return samePolarity ? "偏財" : "正財";
    case "power":
      return samePolarity ? "七殺" : "正官";
    case "resource":
      return samePolarity ? "偏印" : "正印";
    default:
      return "";
  }
}