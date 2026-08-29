import { stemMeta, branchMeta } from "./wuxing";
import { getTenGod } from "./tenGod";

const ganList = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const zhiList = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 2024 為 甲辰年，這裡用作錨點
const ANCHOR_YEAR = 2024;
const ANCHOR_GAN_INDEX = ganList.indexOf("甲");
const ANCHOR_ZHI_INDEX = zhiList.indexOf("辰");

function mod(n, m) {
  return ((n % m) + m) % m;
}

export function getYearGanzhi(year) {
  const diff = year - ANCHOR_YEAR;
  const gan = ganList[mod(ANCHOR_GAN_INDEX + diff, 10)];
  const zhi = zhiList[mod(ANCHOR_ZHI_INDEX + diff, 12)];
  return { gan, zhi };
}

export function getFlowYears(pillars, startYear, count = 5) {
  const result = [];

  for (let i = 0; i < count; i++) {
    const year = startYear + i;
    const ganzhi = getYearGanzhi(year);
    const gan = ganzhi.gan;
    const zhi = ganzhi.zhi;

    const ganMeta = stemMeta[gan];
    const zhiMeta = branchMeta[zhi];

    result.push({
      year,
      gan,
      zhi,
      element: ganMeta?.element || zhiMeta?.element || "未知",
      tenGod: getTenGod(pillars.day.gan, gan),
    });
  }

  return result;
}