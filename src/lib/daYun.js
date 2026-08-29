import { Solar } from "lunar-javascript";

const ganList = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const zhiList = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

const yangGan = ["甲", "丙", "戊", "庚", "壬"];

function nextGanZhi(gz, step = 1) {
  if (!gz || gz.length < 2) return "";
  const gan = gz.charAt(0);
  const zhi = gz.charAt(1);
  const ganIndex = ganList.indexOf(gan);
  const zhiIndex = zhiList.indexOf(zhi);
  if (ganIndex < 0 || zhiIndex < 0) return "";

  const nextGan = ganList[(ganIndex + step + 10) % 10];
  const nextZhi = zhiList[(zhiIndex + step + 12) % 12];
  return `${nextGan}${nextZhi}`;
}

function getSolarFromBirth(birth) {
  return Solar.fromYmdHms(
    birth.year,
    birth.month,
    birth.day,
    birth.unknownHour ? 0 : birth.hour || 0,
    birth.minute || 0,
    0
  );
}

function getNextSolarTermDate(solar) {
  try {
    const lunar = solar.getLunar();
    const nextJieQi = lunar.getNextJieQi();
    if (!nextJieQi) return null;
    return nextJieQi.getSolar();
  } catch {
    return null;
  }
}

function getPrevSolarTermDate(solar) {
  try {
    const lunar = solar.getLunar();
    const prevJieQi = lunar.getPrevJieQi();
    if (!prevJieQi) return null;
    return prevJieQi.getSolar();
  } catch {
    return null;
  }
}

function getDirection(gender, yearGan) {
  const isYang = yangGan.includes(yearGan);
  if (gender === "male") {
    return isYang ? "順行" : "逆行";
  }
  return isYang ? "逆行" : "順行";
}

function calcStartAgeInYears(birthSolar, direction) {
  const targetSolar =
    direction === "順行"
      ? getNextSolarTermDate(birthSolar)
      : getPrevSolarTermDate(birthSolar);

  if (!targetSolar) {
    return { years: 0, months: 0, days: 0, rawDays: 0 };
  }

  const diffMs = Math.abs(
    targetSolar.getCalendar().getTime() - birthSolar.getCalendar().getTime()
  );
  const rawDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  // 傳統常用：3天 = 1歲
  const totalMonths = Math.round((rawDays / 3) * 12);
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  return {
    years,
    months,
    days: rawDays,
    rawDays,
  };
}

export function calcDaYun(pillars, gender, birth = null) {
  const yearGan = pillars?.year?.gan || "";
  const monthGan = pillars?.month?.gan || "";
  const monthZhi = pillars?.month?.zhi || "";

  const direction = getDirection(gender, yearGan);

  let startAge = { years: 0, months: 0, days: 0, rawDays: 0 };

  if (birth) {
    try {
      const birthSolar = getSolarFromBirth(birth);
      startAge = calcStartAgeInYears(birthSolar, direction);
    } catch {
      startAge = { years: 0, months: 0, days: 0, rawDays: 0 };
    }
  }

  const base = `${monthGan}${monthZhi}`;
  const cycles = [];

  for (let i = 1; i <= 10; i++) {
    const step = direction === "順行" ? i : -i;
    const gz = nextGanZhi(base, step);
    cycles.push({
      ageRange: `${startAge.years + (i - 1) * 10}-${startAge.years + (i - 1) * 10 + 9}`,
      gan: gz.charAt(0) || "",
      zhi: gz.charAt(1) || "",
      label: gz,
    });
  }

  return {
    direction,
    startAge,
    cycles,
  };
}