import { useEffect, useMemo, useState } from "react";
import { Lunar } from "lunar-javascript";
import { calculateBazi } from "./lib/bazi";
import { buildBaziPrompt } from "./lib/prompt";

const currentYear = new Date().getFullYear();
const yearOptions = Array.from({ length: 136 }, (_, i) => currentYear - i); // 約 1900 ~ 現在
const monthOptions = Array.from({ length: 12 }, (_, i) => i + 1);

const shichenOptions = [
  { label: "子時 23:00–00:59", hour: 23 },
  { label: "丑時 01:00–02:59", hour: 1 },
  { label: "寅時 03:00–04:59", hour: 3 },
  { label: "卯時 05:00–06:59", hour: 5 },
  { label: "辰時 07:00–08:59", hour: 7 },
  { label: "巳時 09:00–10:59", hour: 9 },
  { label: "午時 11:00–12:59", hour: 11 },
  { label: "未時 13:00–14:59", hour: 13 },
  { label: "申時 15:00–16:59", hour: 15 },
  { label: "酉時 17:00–18:59", hour: 17 },
  { label: "戌時 19:00–20:59", hour: 19 },
  { label: "亥時 21:00–22:59", hour: 21 },
  { label: "不確定", hour: null },
];

const getDaysInSolarMonth = (year, month) => new Date(year, month, 0).getDate();

// 精準農曆月份天數：用「本月初一」到「下月初一」的日期差來計算
const getDaysInLunarMonth = (year, month, isLeapMonth = false) => {
  try {
    const lunarThis = Lunar.fromYmd(year, month, 1);
    if (isLeapMonth && typeof lunarThis.setLeap === "function") {
      lunarThis.setLeap(true);
    }

    let nextYear = year;
    let nextMonth = month + 1;

    if (nextMonth > 12) {
      nextMonth = 1;
      nextYear += 1;
    }

    const lunarNext = Lunar.fromYmd(nextYear, nextMonth, 1);

    const solarThis = lunarThis.getSolar();
    const solarNext = lunarNext.getSolar();

    const diffMs = solarNext.getCalendar().getTime() - solarThis.getCalendar().getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

    // 農曆月份通常只有 29 或 30 天，做個保底
    return Math.max(29, Math.min(30, diffDays));
  } catch (error) {
    console.warn("getDaysInLunarMonth fallback:", error);
    return 30;
  }
};

function PillarCard({ title, gan, zhi, tenGod, hiddenStems }) {
  return (
    <div className="rounded-2xl border border-[#d8c59a] bg-white/75 p-4 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-2 text-3xl font-semibold text-[#2b2418]">
        {gan}
        {zhi}
      </div>
      <div className="mt-3 text-sm leading-6 text-gray-700">
        <div>十神：{tenGod}</div>
        <div>藏干：{hiddenStems?.length ? hiddenStems.join("、") : "無"}</div>
      </div>
    </div>
  );
}

function ElementBar({ element, count }) {
  const barColor =
    element === "木"
      ? "bg-green-500"
      : element === "火"
      ? "bg-red-500"
      : element === "土"
      ? "bg-yellow-600"
      : element === "金"
      ? "bg-gray-500"
      : "bg-blue-500";

  return (
    <div className="flex items-center gap-3">
      <div className="w-8 text-sm font-medium text-[#4a3c26]">{element}</div>
      <div className="h-3 flex-1 overflow-hidden rounded-full bg-black/10">
        <div
          className={`h-full rounded-full ${barColor}`}
          style={{ width: `${Math.min(100, count * 20)}%` }}
        />
      </div>
      <div className="w-6 text-right text-sm text-gray-700">{count}</div>
    </div>
  );
}

function SectionTitle({ children }) {
  return <h3 className="mb-3 font-semibold text-[#2b2418]">{children}</h3>;
}

export default function App() {
  const [form, setForm] = useState({
    name: "",
    gender: "male",
    calendarType: "solar",
    year: currentYear,
    month: 1,
    day: 1,
    isLeapMonth: false,
    hour: 9,
    minute: 0,
    unknownHour: false,
    shichen: 9,
    question: "請分析我的事業、財運與感情運勢",
  });

  const [result, setResult] = useState(null);
  const [aiText, setAiText] = useState("");
  const [loading, setLoading] = useState(false);

  const setField = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const maxDay =
    form.calendarType === "solar"
      ? getDaysInSolarMonth(form.year, form.month)
      : getDaysInLunarMonth(form.year, form.month, form.isLeapMonth);

  const dayOptions = Array.from({ length: maxDay }, (_, i) => i + 1);

  useEffect(() => {
    if (form.day > maxDay) {
      setField("day", maxDay);
    }
  }, [form.year, form.month, form.day, form.calendarType, form.isLeapMonth, maxDay]);

  const previewResult = useMemo(() => {
    if (!result) return null;
    return [
      { key: "木", count: result.elements.木 },
      { key: "火", count: result.elements.火 },
      { key: "土", count: result.elements.土 },
      { key: "金", count: result.elements.金 },
      { key: "水", count: result.elements.水 },
    ];
  }, [result]);

  const handleShichenChange = (value) => {
    const selected = shichenOptions.find((opt) => String(opt.hour) === value);

    if (!selected || selected.hour === null) {
      setField("unknownHour", true);
      setField("hour", 0);
      setField("minute", 0);
      setField("shichen", "");
      return;
    }

    setField("unknownHour", false);
    setField("hour", selected.hour);
    setField("minute", 0);
    setField("shichen", selected.hour);
  };

  const handleUnknownHourToggle = (checked) => {
    setField("unknownHour", checked);
    if (checked) {
      setField("hour", 0);
      setField("minute", 0);
      setField("shichen", "");
    } else {
      setField("hour", 9);
      setField("minute", 0);
      setField("shichen", 9);
    }
  };

  const handleGenerate = async () => {
    setLoading(true);
    setAiText("");

    try {
      const bazi = calculateBazi(form);
      setResult(bazi);

      const prompt = buildBaziPrompt(bazi, form.question);

      const res = await fetch("/api/gemini", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const rawText = await res.text();
      let data = {};

      try {
        data = rawText ? JSON.parse(rawText) : {};
      } catch {
        throw new Error(`後端回傳不是合法 JSON：${rawText || "空回應"}`);
      }

      if (!res.ok) {
        throw new Error(
          `${data.error || "API 呼叫失敗"}：${
            typeof data.detail === "string"
              ? data.detail
              : JSON.stringify(data.detail || {})
          }`
        );
      }

      setAiText(data.text || "AI 沒有回傳內容");
    } catch (error) {
      setAiText(`錯誤：${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <header className="rounded-3xl border border-[#d8c59a] bg-white/55 p-6 text-center shadow-[0_10px_30px_rgba(0,0,0,.06)] backdrop-blur">
          <h1 className="text-3xl md:text-5xl font-bold tracking-wide text-[#2b2418]">
            AI 八字排盤與解讀
          </h1>
          <p className="mt-3 text-sm md:text-base text-[#6b5a3b]">
            東方國風美學 × 免費排盤邏輯 × Gemini AI 解讀
          </p>
        </header>

        <section className="card rounded-3xl p-5 md:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-bold text-[#2b2418]">出生資料輸入</h2>
            <span className="rounded-full border border-[#d8c59a] bg-[#fbf7ef] px-4 py-1 text-sm text-[#6b5a3b]">
              公曆 / 農曆切換版
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a]"
              placeholder="姓名 / 暱稱（選填）"
              value={form.name}
              onChange={(e) => setField("name", e.target.value)}
            />

            <select
              className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a]"
              value={form.gender}
              onChange={(e) => setField("gender", e.target.value)}
            >
              <option value="male">男</option>
              <option value="female">女</option>
            </select>

            <select
              className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a]"
              value={form.calendarType}
              onChange={(e) => setField("calendarType", e.target.value)}
            >
              <option value="solar">公曆 / 國曆</option>
              <option value="lunar">農曆 / 陰曆</option>
            </select>

            <label className="flex items-center gap-3 rounded-xl border border-[#d8c59a] bg-white/70 px-3 py-3 text-sm text-[#4a3c26]">
              <input
                type="checkbox"
                checked={form.unknownHour}
                onChange={(e) => handleUnknownHourToggle(e.target.checked)}
              />
              出生時辰未知
            </label>

            {form.calendarType === "solar" ? (
              <>
                <select
                  className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a]"
                  value={form.year}
                  onChange={(e) => setField("year", Number(e.target.value))}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      {y} 年
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a]"
                  value={form.month}
                  onChange={(e) => setField("month", Number(e.target.value))}
                >
                  {monthOptions.map((m) => (
                    <option key={m} value={m}>
                      {m} 月
                    </option>
                  ))}
                </select>

                <select
                  className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a]"
                  value={form.day}
                  onChange={(e) => setField("day", Number(e.target.value))}
                >
                  {dayOptions.map((d) => (
                    <option key={d} value={d}>
                      {d} 日
                    </option>
                  ))}
                </select>
              </>
            ) : (
              <>
                <select
                  className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a]"
                  value={form.year}
                  onChange={(e) => setField("year", Number(e.target.value))}
                >
                  {yearOptions.map((y) => (
                    <option key={y} value={y}>
                      農曆 {y} 年
                    </option>
                  ))}
                </select>

                <div className="grid grid-cols-2 gap-3">
                  <select
                    className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a]"
                    value={form.month}
                    onChange={(e) => setField("month", Number(e.target.value))}
                  >
                    {monthOptions.map((m) => (
                      <option key={m} value={m}>
                        農曆 {m} 月
                      </option>
                    ))}
                  </select>

                  <label className="flex items-center gap-3 rounded-xl border border-[#d8c59a] bg-white/70 px-3 py-3 text-sm text-[#4a3c26]">
                    <input
                      type="checkbox"
                      checked={form.isLeapMonth}
                      onChange={(e) => setField("isLeapMonth", e.target.checked)}
                    />
                    閏月
                  </label>
                </div>

                <select
                  className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a]"
                  value={form.day}
                  onChange={(e) => setField("day", Number(e.target.value))}
                >
                  {dayOptions.map((d) => (
                    <option key={d} value={d}>
                      農曆 {d} 日
                    </option>
                  ))}
                </select>
              </>
            )}

            <select
              className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a]"
              value={form.shichen === "" ? "" : String(form.shichen)}
              onChange={(e) => handleShichenChange(e.target.value)}
              disabled={form.unknownHour}
            >
              {shichenOptions.map((opt) => (
                <option
                  key={opt.label}
                  value={opt.hour === null ? "" : String(opt.hour)}
                >
                  {opt.label}
                </option>
              ))}
            </select>

            <input
              type="number"
              min="0"
              max="59"
              className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a] md:col-span-2"
              value={form.minute}
              onChange={(e) => setField("minute", Number(e.target.value))}
              placeholder="分鐘（選填，預設 0）"
              disabled={form.unknownHour}
            />

            <textarea
              className="rounded-xl border border-[#d8c59a] bg-white/80 p-3 outline-none focus:ring-2 focus:ring-[#c8a96a] md:col-span-2"
              rows={4}
              placeholder="你特別想問的問題，例如：事業、感情、財運..."
              value={form.question}
              onChange={(e) => setField("question", e.target.value)}
            />

            <button
              onClick={handleGenerate}
              disabled={loading}
              className="md:col-span-2 rounded-xl bg-[#2b2418] py-3 font-medium text-white transition hover:bg-[#3a3022] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "生成中..." : "生成八字命盤"}
            </button>
          </div>
        </section>

        {result && (
          <section className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="card rounded-3xl p-5 md:p-8 space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-2xl font-bold text-[#2b2418]">八字命盤</h2>
                  <div className="rounded-full border border-[#d8c59a] bg-[#fbf7ef] px-4 py-1 text-sm text-[#6b5a3b]">
                    日主：<span className="font-semibold">{result.dayMaster}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <PillarCard
                    title="年柱"
                    gan={result.pillars.year.gan}
                    zhi={result.pillars.year.zhi}
                    tenGod={result.tenGods.year}
                    hiddenStems={result.hiddenStems.year}
                  />
                  <PillarCard
                    title="月柱"
                    gan={result.pillars.month.gan}
                    zhi={result.pillars.month.zhi}
                    tenGod={result.tenGods.month}
                    hiddenStems={result.hiddenStems.month}
                  />
                  <PillarCard
                    title="日柱"
                    gan={result.pillars.day.gan}
                    zhi={result.pillars.day.zhi}
                    tenGod={result.tenGods.day}
                    hiddenStems={result.hiddenStems.day}
                  />
                  <PillarCard
                    title="時柱"
                    gan={result.pillars.hour.gan}
                    zhi={result.pillars.hour.zhi}
                    tenGod={result.tenGods.hour}
                    hiddenStems={result.hiddenStems.hour}
                  />
                </div>

                <div className="rounded-2xl border border-[#d8c59a] bg-white/70 p-4 text-sm leading-7 text-gray-700">
                  <div>
                    出生模式：
                    {form.calendarType === "solar" ? "公曆 / 國曆" : "農曆 / 陰曆"}
                  </div>
                  {form.calendarType === "lunar" && (
                    <div>閏月：{form.isLeapMonth ? "是" : "否"}</div>
                  )}
                  <div className="mt-1">出生原始資料：{result.lunarText}</div>
                  <div className="mt-1">主要五行：{result.dominantElement}</div>
                  <div>日主強弱：{result.strength}</div>
                  <div>大運方向：{result.daYun.direction}</div>
                </div>

                <div className="rounded-2xl border border-[#d8c59a] bg-white/70 p-4">
                  <SectionTitle>五行統計</SectionTitle>
                  <div className="space-y-3">
                    {previewResult?.map((item) => (
                      <ElementBar
                        key={item.key}
                        element={item.key}
                        count={item.count}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d8c59a] bg-white/70 p-4">
                  <SectionTitle>近十年大運骨架</SectionTitle>
                  <div className="grid gap-2 md:grid-cols-2">
                    {result.daYun.cycles?.map((cycle, idx) => (
                      <div
                        key={idx}
                        className="rounded-xl border border-[#eadab6] bg-[#fbf7ef] px-4 py-3 text-sm"
                      >
                        <div className="font-medium text-[#2b2418]">
                          {cycle.ageRange} 歲
                        </div>
                        <div className="text-[#6b5a3b]">
                          {cycle.gan}
                          {cycle.zhi}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d8c59a] bg-white/70 p-4">
                  <SectionTitle>近五年流年</SectionTitle>
                  <div className="grid gap-2 md:grid-cols-2">
                    {result.recentLiuNian?.map((item) => (
                      <div
                        key={item.year}
                        className="rounded-xl border border-[#eadab6] bg-[#fbf7ef] px-4 py-3 text-sm"
                      >
                        <div className="font-medium text-[#2b2418]">
                          {item.year} 年
                        </div>
                        <div className="text-[#6b5a3b]">
                          {item.label} ｜ 十神：{item.tenGod}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#d8c59a] bg-white/70 p-4">
                  <SectionTitle>未來五年流年</SectionTitle>
                  <div className="grid gap-2 md:grid-cols-2">
                    {result.futureLiuNian?.map((item) => (
                      <div
                        key={item.year}
                        className="rounded-xl border border-[#eadab6] bg-[#fbf7ef] px-4 py-3 text-sm"
                      >
                        <div className="font-medium text-[#2b2418]">
                          {item.year} 年
                        </div>
                        <div className="text-[#6b5a3b]">
                          {item.label} ｜ 十神：{item.tenGod}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="card rounded-3xl p-5 md:p-8">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-2xl font-bold text-[#2b2418]">AI 八字解讀</h2>
                {loading && (
                  <span className="rounded-full border border-[#d8c59a] bg-[#fbf7ef] px-3 py-1 text-sm text-[#6b5a3b]">
                    Gemini 分析中
                  </span>
                )}
              </div>

              {loading ? (
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="h-4 w-2/3 animate-pulse rounded bg-black/10" />
                  <div className="h-4 w-full animate-pulse rounded bg-black/10" />
                  <div className="h-4 w-5/6 animate-pulse rounded bg-black/10" />
                  <div className="h-4 w-4/5 animate-pulse rounded bg-black/10" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-black/10" />
                </div>
              ) : (
                <pre className="whitespace-pre-wrap text-sm leading-7 text-[#2a2117]">
                  {aiText || "請先點擊「生成八字命盤」"}
                </pre>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}