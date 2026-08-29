import { Solar } from "lunar-javascript";
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
    unknownHour
  } = input;

  const solar = Solar.fromYmdHms(year, month, day, hour || 0, minute || 0, 0);
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
    birth: { year, month, day, hour, minute, unknownHour },
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
    futureLiuNian
  };
}