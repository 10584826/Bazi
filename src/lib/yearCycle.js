const ganList = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const zhiList = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

// 1984 為甲子年
export function getYearGanzhi(year) {
  const offset = year - 1984;
  const gan = ganList[((offset % 10) + 10) % 10];
  const zhi = zhiList[((offset % 12) + 12) % 12];
  return { gan, zhi, label: `${gan}${zhi}` };
}

export function getRecentLiuNian(count = 5, baseYear = new Date().getFullYear()) {
  const result = [];
  for (let i = 0; i < count; i++) {
    const year = baseYear - (count - 1 - i);
    const gz = getYearGanzhi(year);
    result.push({
      year,
      ...gz
    });
  }
  return result;
}

export function getFutureLiuNian(count = 5, baseYear = new Date().getFullYear()) {
  const result = [];
  for (let i = 1; i <= count; i++) {
    const year = baseYear + i;
    const gz = getYearGanzhi(year);
    result.push({
      year,
      ...gz
    });
  }
  return result;
}