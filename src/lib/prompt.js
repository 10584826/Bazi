export function buildBaziPrompt(result, userQuestion = "") {
  const recent = result.recentLiuNian || [];
  const future = result.futureLiuNian || [];

  return `
你是一位專業、溫和、具備中文表達能力的八字命理分析師。
請根據以下命盤資料，提供結構化、清楚、具體、可行的分析。
請避免過度武斷，語氣要兼顧專業與關懷，並提醒命理僅供參考。

【使用者資料】
姓名/暱稱：${result.name || "未提供"}
性別：${result.gender === "male" ? "男" : "女"}
出生資料：${result.birth.year}-${result.birth.month}-${result.birth.day} ${result.birth.hour}:${String(result.birth.minute).padStart(2, "0")}
出生模式：${result.calendarType === "solar" ? "公曆/國曆" : "農曆/陰曆"}
是否閏月：${result.birth.isLeapMonth ? "是" : "否"}
是否未知時辰：${result.birth.unknownHour ? "是" : "否"}

【八字四柱】
年柱：${result.pillars.year.gan}${result.pillars.year.zhi}
月柱：${result.pillars.month.gan}${result.pillars.month.zhi}
日柱：${result.pillars.day.gan}${result.pillars.day.zhi}
時柱：${result.pillars.hour.gan}${result.pillars.hour.zhi}

【日主】
${result.dayMaster}

【十神】
年柱：${result.tenGods.year}
月柱：${result.tenGods.month}
日柱：${result.tenGods.day}
時柱：${result.tenGods.hour}

【藏干】
年支藏干：${result.hiddenStems.year.join("、") || "無"}
月支藏干：${result.hiddenStems.month.join("、") || "無"}
日支藏干：${result.hiddenStems.day.join("、") || "無"}
時支藏干：${result.hiddenStems.hour.join("、") || "無"}

【五行統計】
木：${result.elements.木}、火：${result.elements.火}、土：${result.elements.土}、金：${result.elements.金}、水：${result.elements.水}
主要五行：${result.dominantElement}
日主強弱：${result.strength}

【大運方向】
${result.daYun.direction}

【近十年大運骨架】
${result.daYun.cycles.map((y) => `- ${y.ageRange}：${y.gan}${y.zhi}`).join("\n")}

【近五年流年】
${recent.map((y) => `- ${y.year}：${y.label}（十神：${y.tenGod}）`).join("\n")}

【未來五年流年】
${future.map((y) => `- ${y.year}：${y.label}（十神：${y.tenGod}）`).join("\n")}

【使用者想問的重點】
${userQuestion || "未特別指定，請提供整體分析"}

請輸出以下章節：
1. 五行喜忌與性格分析
2. 事業與財運建議
3. 感情與人際關係
4. 近五年運勢提醒與開運建議
5. 最後用 3-5 點列出實用建議

請使用繁體中文，條列清楚，避免空泛話術。
`;
}