const branchClash = {
  子: "午",
  丑: "未",
  寅: "申",
  卯: "酉",
  辰: "戌",
  巳: "亥",
  午: "子",
  未: "丑",
  申: "寅",
  酉: "卯",
  戌: "辰",
  亥: "巳",
};

const branchCombine = {
  子: "丑",
  丑: "子",
  寅: "亥",
  亥: "寅",
  卯: "戌",
  戌: "卯",
  辰: "酉",
  酉: "辰",
  巳: "申",
  申: "巳",
  午: "未",
  未: "午",
};

export function checkBranchRelation(branchA, branchB) {
  if (!branchA || !branchB) return null;
  if (branchClash[branchA] === branchB) return "沖";
  if (branchCombine[branchA] === branchB) return "合";
  return null;
}

export function summarizeLiunianImpact(chartPillars, flowYear) {
  const impacts = [];

  const yearBranchRelation = checkBranchRelation(chartPillars.year.zhi, flowYear.zhi);
  const monthBranchRelation = checkBranchRelation(chartPillars.month.zhi, flowYear.zhi);
  const dayBranchRelation = checkBranchRelation(chartPillars.day.zhi, flowYear.zhi);
  const hourBranchRelation = checkBranchRelation(chartPillars.hour.zhi, flowYear.zhi);

  if (yearBranchRelation) impacts.push(`流年支與年支 ${yearBranchRelation}`);
  if (monthBranchRelation) impacts.push(`流年支與月支 ${monthBranchRelation}`);
  if (dayBranchRelation) impacts.push(`流年支與日支 ${dayBranchRelation}`);
  if (hourBranchRelation) impacts.push(`流年支與時支 ${hourBranchRelation}`);

  const hasConflict = impacts.some((x) => x.includes("沖"));
  const hasCombine = impacts.some((x) => x.includes("合"));

  let tone = "平穩";
  if (hasConflict && hasCombine) tone = "動中有機會，變化較大";
  else if (hasConflict) tone = "變動較多，需留意衝突與決策";
  else if (hasCombine) tone = "有合作、人際與機會連動";
  else tone = "整體平穩，可穩步推進";

  return {
    impacts,
    tone,
  };
}