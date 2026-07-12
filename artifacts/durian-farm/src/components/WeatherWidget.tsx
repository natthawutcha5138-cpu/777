import { useState, useEffect, useCallback, useRef } from "react";
import { RefreshCw } from "lucide-react";

interface WeatherData {
  temperature: number; humidity: number; windSpeed: number;
  weatherCode: number; precipitationProbabilityMax: number;
  dailyWeatherCode: number; hourlyRain: { hour: number; prob: number }[];
  lat: number; lon: number;
}

const LOCATIONS = [
  { label: "จ.จันทบุรี",       lat: 12.6037, lon: 102.104  },
  { label: "จ.ระยอง",          lat: 12.6814, lon: 101.2816 },
  { label: "จ.ตราด",           lat: 12.2427, lon: 102.5178 },
  { label: "จ.ชุมพร",          lat: 10.4935, lon: 99.18    },
  { label: "จ.สุราษฎร์ธานี",  lat:  9.1382, lon: 99.3217  },
  { label: "จ.นนทบุรี",        lat: 13.8621, lon: 100.5144 },
  { label: "กรุงเทพมหานคร",    lat: 13.7563, lon: 100.5018 },
  { label: "ใช้ GPS ของฉัน",   lat: 0,       lon: 0        },
];

const REFRESH_INTERVAL_MS = 10 * 60 * 1000;

function weatherLabel(code: number) {
  if (code === 0)  return "ท้องฟ้าแจ่มใส";
  if (code <= 3)   return "มีเมฆบางส่วน";
  if (code <= 48)  return "ท้องฟ้าครึ้ม";
  if (code <= 57)  return "ฝนละออง";
  if (code <= 67)  return "ฝนตก";
  if (code <= 82)  return "ฝนตกหนัก";
  return "พายุฝนฟ้าคะนอง";
}

function weatherEmoji(code: number) {
  if (code === 0)  return "☀️";
  if (code <= 3)   return "⛅";
  if (code <= 48)  return "☁️";
  if (code <= 57)  return "🌦️";
  if (code <= 67)  return "🌧️";
  if (code <= 82)  return "⛈️";
  return "🌪️";
}

function irrigationAdvice(prob: number, code: number) {
  const raining = code >= 51;
  if (raining || prob >= 70) return { level: "ไม่ต้องรดน้ำ", detail: `โอกาสฝนตกสูง ${prob}% — ประหยัดน้ำได้วันนี้`, color: "text-blue-700", bar: "bg-blue-500" };
  if (prob >= 40)            return { level: "รอดูสภาพอากาศ", detail: `โอกาสฝนตก ${prob}% — รอดูช่วงบ่ายก่อน`,  color: "text-amber-700", bar: "bg-amber-500" };
  return                            { level: "ควรรดน้ำวันนี้",  detail: `โอกาสฝนตกต่ำ ${prob}% — ทุเรียนต้องการน้ำ`, color: "text-primary", bar: "bg-primary" };
}

function relativeTime(date: Date | null): string {
  if (!date) return "";
  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);
  if (diffMin < 1) return "เมื่อกี้";
  if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
  return `${Math.floor(diffMin / 60)} ชั่วโมงที่แล้ว`;
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude",  String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current",   "temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m");
  url.searchParams.set("hourly",    "precipitation_probability");
  url.searchParams.set("daily",     "precipitation_probability_max,weather_code");
  url.searchParams.set("timezone",  "Asia/Bangkok");
  url.searchParams.set("forecast_days", "1");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error();
  const j = await res.json();
  const nowH = new Date().getHours();
  const hourlyRain = (j.hourly.time as string[])
    .map((t, i) => ({ hour: parseInt(t.split("T")[1]), prob: j.hourly.precipitation_probability[i] as number }))
    .filter(x => x.hour >= nowH && x.hour <= 21).slice(0, 9);
  return {
    temperature: Math.round(j.current.temperature_2m),
    humidity:    j.current.relative_humidity_2m,
    windSpeed:   Math.round(j.current.wind_speed_10m),
    weatherCode: j.current.weather_code,
    precipitationProbabilityMax: j.daily.precipitation_probability_max[0] ?? 0,
    dailyWeatherCode: j.daily.weather_code[0],
    hourlyRain, lat, lon,
  };
}

function formatCountdown(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export default function WeatherWidget({ compact = false }: { compact?: boolean }) {
  const [weather,       setWeather]       = useState<WeatherData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState(LOCATIONS[0].label);
  const [lastUpdated,   setLastUpdated]   = useState<Date | null>(null);
  const [nextRefreshMs, setNextRefreshMs] = useState<number>(REFRESH_INTERVAL_MS);
  const [refreshing,    setRefreshing]    = useState(false);
  const [relTime,       setRelTime]       = useState("");

  const currentLocRef = useRef<{ lat: number; lon: number; label: string }>(
    { lat: LOCATIONS[0].lat, lon: LOCATIONS[0].lon, label: LOCATIONS[0].label }
  );

  const load = useCallback(async (lat: number, lon: number, label: string, silent = false) => {
    if (!silent) { setLoading(true); setError(null); }
    else         { setRefreshing(true); }
    setLocationLabel(label);
    currentLocRef.current = { lat, lon, label };
    try {
      setWeather(await fetchWeather(lat, lon));
      const now = new Date();
      setLastUpdated(now);
      setRelTime(relativeTime(now));
      setNextRefreshMs(REFRESH_INTERVAL_MS);
    } catch { if (!silent) setError("ไม่สามารถดึงข้อมูลอากาศได้"); }
    finally  { setLoading(false); setRefreshing(false); }
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = LOCATIONS.find(l => l.label === e.target.value);
    if (!loc) return;
    if (loc.label === "ใช้ GPS ของฉัน") {
      if (!navigator.geolocation) { setError("เบราว์เซอร์ไม่รองรับ GPS"); return; }
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        pos => load(pos.coords.latitude, pos.coords.longitude, "ตำแหน่งปัจจุบัน"),
        ()  => { setLoading(false); setError("ไม่สามารถเข้าถึง GPS ได้"); },
        { timeout: 6000 }
      );
    } else { load(loc.lat, loc.lon, loc.label); }
  };

  const handleManualRefresh = () => {
    const { lat, lon, label } = currentLocRef.current;
    if (lat) load(lat, lon, label, true);
  };

  useEffect(() => {
    const d = LOCATIONS[0];
    load(d.lat, d.lon, d.label);
  }, [load]);

  useEffect(() => {
    const interval = setInterval(() => {
      const { lat, lon, label } = currentLocRef.current;
      if (lat) load(lat, lon, label, true);
    }, REFRESH_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [load]);

  // Countdown + relative-time ticker
  useEffect(() => {
    if (!lastUpdated) return;
    const tick = setInterval(() => {
      const elapsed = Date.now() - lastUpdated.getTime();
      setNextRefreshMs(Math.max(0, REFRESH_INTERVAL_MS - elapsed));
      setRelTime(relativeTime(lastUpdated));
    }, 30000); // update every 30s
    return () => clearInterval(tick);
  }, [lastUpdated]);

  const maxProb = weather?.precipitationProbabilityMax ?? 0;
  const advice  = weather ? irrigationAdvice(maxProb, weather.dailyWeatherCode) : null;
  const progressPct = lastUpdated
    ? Math.min(100, ((REFRESH_INTERVAL_MS - nextRefreshMs) / REFRESH_INTERVAL_MS) * 100)
    : 0;

  // Rain-soon alert: any of the next 2 hourly slots has prob >= 60
  const rainSoonAlert = weather?.hourlyRain.slice(0, 2).some(h => h.prob >= 60) ?? false;

  /* ===== COMPACT (sidebar) ===== */
  if (compact) {
    return (
      <div className="bg-gradient-to-br from-green-900/60 to-teal-900/40 border border-white/10 rounded-2xl p-3">
        {/* Rain alert banner */}
        {rainSoonAlert && (
          <div className="mb-2 flex items-center gap-1.5 bg-orange-500/90 rounded-xl px-2.5 py-1.5">
            <span className="text-sm">⚠️</span>
            <p className="text-[10px] font-bold text-white leading-tight">งดพ่นยาทันที<br/>ฝนกำลังจะตก</p>
          </div>
        )}

        {/* Header row */}
        <div className="flex items-center justify-between mb-2">
          <p className="text-[11px] font-semibold text-green-300 flex items-center gap-1">
            🌤 สภาพอากาศ
            {!loading && weather && (
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
            )}
          </p>
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
            title="รีเฟรชสภาพอากาศ"
            className="p-1 rounded-lg text-white/40 hover:text-green-300 hover:bg-white/10 transition-colors disabled:opacity-30 cursor-pointer"
          >
            <RefreshCw className={`w-3 h-3 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>

        {loading ? (
          <div className="h-10 skeleton" />
        ) : error ? (
          <div className="h-10 flex items-center justify-center bg-red-900/40 rounded-xl border border-red-500/20">
            <p className="text-[11px] text-red-400">{error}</p>
          </div>
        ) : weather ? (
          <>
            <div className="flex items-end gap-2 mb-2">
              <span className="text-xl">{weatherEmoji(weather.weatherCode)}</span>
              <span className="text-2xl font-bold text-white">{weather.temperature}°C</span>
              <span className="text-[10px] text-white/50 mb-0.5">{weatherLabel(weather.weatherCode)}</span>
            </div>
            <div className="flex gap-3 text-[10px] text-white/50 mb-2">
              <span>💧 {weather.humidity}%</span>
              <span>🌬 {weather.windSpeed} km/h</span>
              <span>🌧 {weather.precipitationProbabilityMax}%</span>
            </div>
            {/* Last updated */}
            {relTime && (
              <p className="text-[9px] text-white/30 mt-1">
                อัปเดตเมื่อ {relTime} · {locationLabel}
              </p>
            )}
          </>
        ) : null}
      </div>
    );
  }

  /* ===== FULL (standalone, e.g. on Dashboard) ===== */
  return (
    <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold text-gray-800 flex items-center gap-2">
            🌤 สภาพอากาศและการรดน้ำ
            {!loading && weather && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
              </span>
            )}
          </h2>
          {weather && <p className="text-xs text-gray-400 mt-0.5">{weatherLabel(weather.dailyWeatherCode)}</p>}
        </div>
        <div className="flex items-center gap-2">
          <select value={locationLabel} onChange={handleLocationChange}
            className="border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-green-200">
            {LOCATIONS.map(l => <option key={l.label} value={l.label}>{l.label}</option>)}
          </select>
          <button
            type="button"
            onClick={handleManualRefresh}
            disabled={loading || refreshing}
            title="รีเฟรช"
            className="w-8 h-8 rounded-xl bg-gray-100 hover:bg-green-100 flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-gray-500 hover:text-green-600 ${refreshing ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Rain alert */}
      {rainSoonAlert && weather && (
        <div className="mb-4 flex items-center gap-3 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl px-4 py-3">
          <span className="text-2xl shrink-0">⚠️</span>
          <div>
            <p className="text-sm font-bold text-white">งดพ่นยาทันที — ฝนกำลังจะตก</p>
            <p className="text-xs text-white/80 mt-0.5">
              โอกาสฝนตกในอีก 1–2 ชั่วโมง {Math.max(...weather.hourlyRain.slice(0, 2).map(h => h.prob))}%
            </p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          <div className="h-14 skeleton" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-[88px] skeleton" />)}
          </div>
          <div className="space-y-2 pt-2">
             <div className="h-4 skeleton w-1/3" />
             <div className="h-2 skeleton w-full" />
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30 rounded-2xl p-4 text-center">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          <button onClick={handleManualRefresh} className="mt-2 text-xs font-semibold text-red-600 dark:text-red-400 underline focus-ring">ลองอีกครั้ง</button>
        </div>
      ) : weather && advice ? (
        <div className="space-y-4">
          <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl ${
            advice.bar === "bg-blue-500" ? "bg-blue-50 border border-blue-100" :
            advice.bar === "bg-amber-500" ? "bg-amber-50 border border-amber-100" :
            "bg-green-50 border border-green-100"
          }`}>
            <span className="text-2xl shrink-0">{weatherEmoji(weather.weatherCode)}</span>
            <div>
              <p className={`text-sm font-bold ${advice.color}`}>{advice.level}</p>
              <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{advice.detail}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "อุณหภูมิ",   value: `${weather.temperature}°C`, emoji: "🌡️" },
              { label: "ความชื้น",   value: `${weather.humidity}%`,      emoji: "💧" },
              { label: "ความเร็วลม", value: `${weather.windSpeed} km/h`, emoji: "🌬️" },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-2xl px-3 py-3 text-center border border-gray-100">
                <div className="text-xl mb-1">{s.emoji}</div>
                <p className="text-base font-bold text-gray-800">{s.value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-xs mb-2">
              <span className="text-gray-500 font-medium">โอกาสฝนตกสูงสุดวันนี้</span>
              <span className={`font-bold ${advice.color}`}>{maxProb}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${advice.bar}`} style={{ width: `${maxProb}%` }} />
            </div>
          </div>

          {weather.hourlyRain.length > 0 && (
            <div>
              <p className="text-xs text-gray-400 font-medium mb-2">โอกาสฝนรายชั่วโมง</p>
              <div className="flex items-end gap-1.5 h-14 bg-gray-50 rounded-2xl px-3 py-2 border border-gray-100">
                {weather.hourlyRain.map(({ hour, prob }) => (
                  <div key={hour} className="flex flex-col items-center gap-0.5 flex-1">
                    <div
                      className={`w-full rounded-sm transition-all ${prob >= 70 ? "bg-blue-400" : prob >= 40 ? "bg-amber-400" : "bg-green-400/60"}`}
                      style={{ height: `${Math.max(3, (prob / 100) * 36)}px` }}
                      title={`${hour}:00 — ${prob}%`}
                    />
                    <span className="text-[9px] text-gray-400">{hour}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-[10px] text-gray-400">
              <span>
                {locationLabel} · อัปเดตเมื่อ {relTime || lastUpdated?.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="tabular-nums">รีเฟรชอัตโนมัติใน {formatCountdown(nextRefreshMs)}</span>
            </div>
            <div className="h-0.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-green-400/50 rounded-full transition-all duration-1000" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
