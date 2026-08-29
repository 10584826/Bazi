import { Solar, Lunar } from "lunar-javascript";
import { getHiddenStems } from "./hiddenStems";
import { getTenGod } from "./tenGod";
import { countElements, dominantElement } from "./wuxing";
import { calcDaYun } from "./daYun";
import {
  getRecentLiuNian,
  getFutureLiuNian,
  getYearGanzhi,
} from "./yearCycle";

const pad2 = (n) => String(n ?? 0).padStart(2, "0");

function buildSolarFromInput(input) {
  const {
    calendarType,
    year,
    month,
    day,
    hour,
    minute,
    isLeapMonth = false,
  } = input;

  if (calendarType === "lunar") {
    const lunar = Lunar.fromYmdHms(
      year,
      month,
      day,
      hour || 0,
      minute || 0,
      0
    );

    if (isLeapMonth) {
      if (typeof lunar.setLeap === "function") {
        lunar.setLeap(true);
      } else if (typeof lunar.setIsLeap === "function") {
        lunar.setIsLeap(true);
      }
    }

    return lunar.getSolar();
  }

  return Solar.fromYmdHms(year, month, day, hour || 0, minute || 0, 0);
}

function calcStrength(elementCounts, hiddenStems, unknownHour, dominant) {
  let score = 0;

  if ((elementCounts?.[dominant] ?? 0) >= 3) score += 2;
  if ((hiddenStems?.day || []).length > 0) score += 1;
  if (!unknownHour) score += 1;

  if (score >= 4) return "偏強";
  if (score >= 2) return "中和偏強";
  if (score >= 1) return "中和";
  return "偏弱";
}

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
    unknownHour = false,
    isLeapMonth = false,
  } = input;

  const safeHour = unknownHour ? 0 : hour || 0;
  const safeMinute = minute || 0;

  const solar = buildSolarFromInput({
    calendarType,
    year,
    month,
    day,
    hour: safeHour,
    minute: safeMinute,
    isLeapMonth,
  });

  const lunar = solar.getLunar();
  const eightChar = lunar.getEightChar();

  const yearGan = eightChar.getYearGan();
  const yearZhi = eightChar.getYearZhi();
  const monthGan = eightChar.getMonthGan();
  const monthZhi = eightChar.getMonthZhi();
  const dayGan = eightChar.getDayGan();
  const dayZhi = eightChar.getDayZhi();

  const hourGan = unknownHour ? "未知" : eightChar.getTimeGan();
  const hourZhi = unknownHour ? "未知" : eightChar.getTimeZhi();

  const pillars = {
    year: { gan: yearGan, zhi: yearZhi },
    month: { gan: monthGan, zhi: monthZhi },
    day: { gan: dayGan, zhi: dayZhi },
    hour: { gan: hourGan, zhi: hourZhi },
  };

  const hiddenStems = {
    year: getHiddenStems(yearZhi),
    month: getHiddenStems(monthZhi),
    day: getHiddenStems(dayZhi),
    hour: unknownHour ? [] : getHiddenStems(hourZhi),
  };

  const tenGods = {
    year: getTenGod(dayGan, yearGan),
    month: getTenGod(dayGan, monthGan),
    day: "日主",
    hour: unknownHour ? "未知" : getTenGod(dayGan, hourGan),
  };

  const elements = countElements(pillars);
  const dominant = dominantElement(elements);
  const strength = calcStrength(elements, hiddenStems, unknownHour, dominant);
  const dayMaster = dayGan;

  const daYun = calcDaYun(pillars, gender, {
    year,
    month,
    day,
    hour: safeHour,
    minute: safeMinute,
    unknownHour,
    isLeapMonth,
  });

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
    gender: gender || "male",
    calendarType: calendarType || "solar",
    birth: {
      year,
      month,
      day,
      hour: safeHour,
      minute: safeMinute,
      unknownHour,
      isLeapMonth,
    },
    pillars,
    dayMaster,
    hiddenStems,
    tenGods,
    elements,
    dominantElement: dominant,
    strength,
    daYun,
    lunarText: lunar.toString(),
    solarText: `${solar.getYear()}-${pad2(solar.getMonth())}-${pad2(solar.getDay())} ${pad2(
      solar.getHour()
    )}:${pad2(solar.getMinute())}:${pad2(solar.getSecond())}`,
    birthYearGanzhi,
    recentLiuNian,
    futureLiuNian,
  };
}