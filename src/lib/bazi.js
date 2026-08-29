import { Solar, Lunar } from "lunar-javascript";
import { getHiddenStems } from "./hiddenStems";
import { getTenGod } from "./tenGod";
import { countElements, dominantElement } from "./wuxing";
import { calcDaYun } from "./daYun";
import { getRecentLiuNian, getFutureLiuNian, getYearGanzhi } from "./yearCycle";

export function calculateBazi(input) {
  const {
    name,
    gender,
    calendarType,
    year,
    month,
    day,
    hour,
    minute,
    unknownHour,
    isLeapMonth = false
  } = input;

  let solar;

  // 1) 先根據公曆 / 農曆建立 Solar
  if (calendarType === "lunar") {
    // 農曆模式：先建立 Lunar，再轉 Solar
    const lunar = Lunar.fromYmdHms(
      year,
      month,
      day,
      hour || 0,
      minute || 0,
      0
    );

    // 設定閏月
    if (isLeapMonth && typeof lunar.setLeap === "function") {
      lunar.setLeap(true);
    } else if (isLeapMonth && typeof lunar.isLeap === "function") {
      // 某些版本可能用不同 API 命名，這裡做兼容
      lunar.setLeap?.(true);
    }

    solar = lunar.getSolar();
  } else {
    // 公曆模式
    solar = Solar.fromYmdHms(year, month, day, hour || 0, minute || 0, 0);
  }

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const yearGan = eightChar.getYearGan();
  const yearZhi = eightChar.getYearZhi();
  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();

  let hourGan = "未知";
  let hourZhi = "未知";
  if (!unknownHour) {
    hourGan = eightChar.getTimeGan();
    hourZhi = eightChar.getTimeZhi();
  }

  const pillars = {
    year: { gan: yearGan, zhi: yearZhi },
    month: { gan: monthGan, zhi: monthZhi },
    day: { gan: dayGan, zhi: dayZhi },
    hour: { gan: hourGan, zhi: hourZhi }
  };

  const hiddenStems = {
    year: getHiddenStems(yearZhi),
    month: getHiddenStems(monthZhi),
    day: getHiddenStems(dayZhi),
    hour: unknownHour ? [] : getHiddenStems(hourZhi)
  };

  const tenGods = {
    year: getTenGod(dayGan, yearGan),
    month: getTenGod(dayGan, monthGan),
    day: "日主",
    hour: unknownHour ? "未知" : getTenGod(dayGan, hourGan)
  };

  const elementCounts = countElements(pillars);
  const dominant = dominantElement(elementCounts);
  const daYun = calcDaYun(pillars, gender);
  const dayMaster = dayGan;

  const strengthScore = (() => {
    let score = 0;
    if (elementCounts[dominant] >= 3) score += 2;
    if (hiddenStems.day.length > 0) score += 1;
    if (!unknownHour) score += 1;

    if (score >= 4) return "偏強";
    if (score >= 2) return "中和偏強";
    if (score >= 1) return "中和";
    return "偏弱";
  })();

  const currentYear = new Date().getFullYear();

  const recentLiuNian = getRecentLiuNian(5, currentYear).map((item) => ({
    ...item,
    tenGod: getTenGod(dayMaster, item.gan),
  }));

  const futureLiuNian = getFutureLiuNian(5, currentYear).map((item) => ({
    ...item,
    tenGod: getTenGod(dayMaster, item.gan),
  }));

  const birthYearGanzhi = getYearGanzhi(year);

  return {
    name: name || "",
    gender,
    calendarType,
    birth: { year, month, day, hour, minute, unknownHour, isLeapMonth },
    pillars,
    dayMaster,
    hiddenStems,
    tenGods,
    elements: elementCounts,
    dominantElement: dominant,
    strength: strengthScore,
    daYun,
    lunarText: lunar.toString(),
    birthYearGanzhi,
    recentLiuNian,
    futureLiuNian,
    solarText: solar.toYmdHms ? solar.toYmdHms() : `${year}-${month}-${day} ${hour || 0}:${minute || 0}:00`
  };
}