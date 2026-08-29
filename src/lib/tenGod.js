import { stemMeta } from "./wuxing";

const elementGenerate = {
  木: "火",
  火: "土",
  土: "金",
  金: "水",
  水: "木"
};

const elementControl = {
  木: "土",
  火: "金",
  土: "水",
  金: "木",
  水: "火"
};

export function getTenGod(dayMaster, targetStem) {
  if (!dayMaster || !targetStem || dayMaster === "未知" || targetStem === "未知") {
    return "未知";
  }

  const dm = stemMeta[dayMaster];
  const tg = stemMeta[targetStem];
  if (!dm || !tg) return "未知";

  const dmElement = dm.element;
  const tgElement = tg.element;
  const samePolarity = dm.yinYang === tg.yinYang;

  if (dmElement === tgElement) {
    return samePolarity ? "比肩" : "劫財";
  }

  if (elementGenerate[dmElement] === tgElement) {
    return samePolarity ? "食神" : "傷官";
  }

  if (elementGenerate[tgElement] === dmElement) {
    return samePolarity ? "偏印" : "正印";
  }

  if (elementControl[dmElement] === tgElement) {
    return samePolarity ? "偏財" : "正財";
  }

  if (elementControl[tgElement] === dmElement) {
    return samePolarity ? "七殺" : "正官";
  }

  return "未知";
}