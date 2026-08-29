const ganList = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const zhiList = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

export function getYearGanzhi(year) {
  if (!year) return "";

  // 1984 是甲子年
  const offset = year - 1984;
  const gan = ganList[(offset % 10 + 10) % 10];
  const zhi = zhiList[(offset % 12 + 12) % 12];
  return `${gan}${zhi}`;
}

export function getRecentLiuNian(count = 5, currentYear = new Date().getFullYear()) {
  const result = [];
  for (let i = count - 1; i >= 0; i--) {
    const year = currentYear - i;
    result.push({
      year,
      label: getYearGanzhi(year),
      gan: getYearGanzhi(year).charAt(0),
      zhi: getYearGanzhi(year).charAt(1),
    });
  }
  return result;
}

export function getFutureLiuNian(count = 5, currentYear = new Date().getFullYear()) {
  const result = [];
  for (let i = 1; i <= count; i++) {
    const year = currentYear + i;
    result.push({
      year,
      label: getYearGanzhi(year),
      gan: getYearGanzhi(year).charAt(0),
      zhi: getYearGanzhi(year).charAt(1),
    });
  }
  return result;
}