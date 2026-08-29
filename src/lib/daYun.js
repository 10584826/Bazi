const ganList = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
const zhiList = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

function nextGanZhi(gan, zhi, step = 1) {
  const gIndex = ganList.indexOf(gan);
  const zIndex = zhiList.indexOf(zhi);
  if (gIndex === -1 || zIndex === -1) return { gan: "未知", zhi: "未知" };

  const ng = (gIndex + step + 10) % 10;
  const nz = (zIndex + step + 12) % 12;

  return {
    gan: ganList[ng],
    zhi: zhiList[nz]
  };
}

export function calcDaYun(pillars, gender) {
  const isMale = gender === "male";

  // 簡化順逆：陽男陰女順，陰男陽女逆
  // 這裡用年干陰陽當參考，正式版可再精準化
  const yearGan = pillars.year.gan;
  const yangStems = ["甲", "丙", "戊", "庚", "壬"];
  const isYangYear = yangStems.includes(yearGan);

  const forward = (isMale && isYangYear) || (!isMale && !isYangYear);

  const base = pillars.month;
  const result = [];

  let current = { ...base };
  for (let i = 1; i <= 8; i++) {
    current = nextGanZhi(current.gan, current.zhi, forward ? 1 : -1);
    result.push({
      ageRange: `${i * 10}~${i * 10 + 9}`,
      gan: current.gan,
      zhi: current.zhi
    });
  }

  return {
    direction: forward ? "順行" : "逆行",
    startAge: 10,
    cycles: result
  };
}