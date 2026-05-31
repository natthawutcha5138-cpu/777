import { useState, useEffect, useCallback } from "react";

interface WeatherData {
  temperature: number;
  humidity: number;
  windSpeed: number;
  weatherCode: number;
  precipitationProbability: number;
  precipitationProbabilityMax: number;
  dailyWeatherCode: number;
  hourlyRain: { hour: number; prob: number }[];
  lat: number;
  lon: number;
}

const LOCATIONS: { label: string; lat: number; lon: number }[] = [
  { label: "จ.จันทบุรี", lat: 12.6037, lon: 102.104 },
  { label: "จ.ระยอง", lat: 12.6814, lon: 101.2816 },
  { label: "จ.ตราด", lat: 12.2427, lon: 102.5178 },
  { label: "จ.นนทบุรี", lat: 13.8621, lon: 100.5144 },
  { label: "จ.ชุมพร", lat: 10.4935, lon: 99.18 },
  { label: "จ.สุราษฎร์ธานี", lat: 9.1382, lon: 99.3217 },
  { label: "กรุงเทพมหานคร", lat: 13.7563, lon: 100.5018 },
  { label: "ใช้ GPS ของฉัน", lat: 0, lon: 0 },
];

function getWeatherInfo(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "ท้องฟ้าแจ่มใส", icon: "☀️" };
  if (code <= 3) return { label: "มีเมฆบางส่วน", icon: "🌤️" };
  if (code <= 48) return { label: "หมอก/ท้องฟ้าครึ้ม", icon: "🌫️" };
  if (code <= 57) return { label: "ฝนละออง", icon: "🌦️" };
  if (code <= 67) return { label: "ฝนตก", icon: "🌧️" };
  if (code <= 77) return { label: "หิมะ", icon: "❄️" };
  if (code <= 82) return { label: "ฝนตกหนัก", icon: "🌧️" };
  if (code <= 86) return { label: "พายุหิมะ", icon: "🌨️" };
  return { label: "พายุฝนฟ้าคะนอง", icon: "⛈️" };
}

function getIrrigationAdvice(rainProb: number, weatherCode: number) {
  const isRaining = weatherCode >= 51;
  if (isRaining || rainProb >= 70) return {
    level: "ไม่ต้องรดน้ำ", reason: `โอกาสฝนตกสูง ${rainProb}% — ประหยัดน้ำได้วันนี้`,
    color: "text-sky-700", bg: "from-sky-50 to-blue-50", border: "border-sky-200/60", icon: "💧",
  };
  if (rainProb >= 40) return {
    level: "พิจารณาตามสภาพ", reason: `โอกาสฝนตก ${rainProb}% — รอดูอากาศช่วงบ่ายก่อน`,
    color: "text-amber-700", bg: "from-amber-50 to-yellow-50", border: "border-amber-200/60", icon: "🌤️",
  };
  return {
    level: "ควรรดน้ำ", reason: `โอกาสฝนตกต่ำ ${rainProb}% — ทุเรียนต้องการน้ำวันนี้`,
    color: "text-emerald-700", bg: "from-emerald-50 to-teal-50", border: "border-emerald-200/60", icon: "🚿",
  };
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m");
  url.searchParams.set("hourly", "precipitation_probability");
  url.searchParams.set("daily", "precipitation_probability_max,weather_code");
  url.searchParams.set("timezone", "Asia/Bangkok");
  url.searchParams.set("forecast_days", "1");
  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("fetch error");
  const j = await res.json();

  const nowH = new Date().getHours();
  const hours: number[] = j.hourly.time.map((t: string) => parseInt(t.split("T")[1]));
  const probs: number[] = j.hourly.precipitation_probability;
  const hourlyRain = hours
    .map((h: number, i: number) => ({ hour: h, prob: probs[i] }))
    .filter((x: { hour: number; prob: number }) => x.hour >= nowH && x.hour <= 21)
    .slice(0, 9);

  return {
    temperature: Math.round(j.current.temperature_2m),
    humidity: j.current.relative_humidity_2m,
    windSpeed: Math.round(j.current.wind_speed_10m),
    weatherCode: j.current.weather_code,
    precipitationProbability: j.current.precipitation_probability ?? 0,
    precipitationProbabilityMax: j.daily.precipitation_probability_max[0] ?? 0,
    dailyWeatherCode: j.daily.weather_code[0],
    hourlyRain,
    lat,
    lon,
  };
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState(LOCATIONS[0].label);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const load = useCallback(async (lat: number, lon: number, label: string) => {
    setLoading(true);
    setError(null);
    setLocationLabel(label);
    try {
      const data = await fetchWeather(lat, lon);
      setWeather(data);
      setLastUpdated(new Date());
    } catch {
      setError("ไม่สามารถดึงข้อมูลอากาศได้ กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLocationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const loc = LOCATIONS.find((l) => l.label === e.target.value);
    if (!loc) return;
    if (loc.label === "ใช้ GPS ของฉัน") {
      if (!navigator.geolocation) return;
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude, "📍 ตำแหน่งของฉัน"),
        () => { setLoading(false); setError("ไม่สามารถเข้าถึง GPS ได้"); },
        { timeout: 6000 }
      );
    } else {
      load(loc.lat, loc.lon, loc.label);
    }
  };

  useEffect(() => {
    const def = LOCATIONS[0];
    load(def.lat, def.lon, def.label);
  }, [load]);

  const advice = weather ? getIrrigationAdvice(weather.precipitationProbabilityMax, weather.dailyWeatherCode) : null;
  const weatherInfo = weather ? getWeatherInfo(weather.dailyWeatherCode) : null;
  const maxProb = weather?.precipitationProbabilityMax ?? 0;

  return (
    <div className={`rounded-2xl border shadow-sm p-5 ${advice ? `bg-gradient-to-br ${advice.bg} ${advice.border}` : "bg-white/80 border-border/50"}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">{weatherInfo?.icon ?? "🌦️"}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">พยากรณ์อากาศสวน</h3>
            {weatherInfo && <p className="text-xs text-muted-foreground">{weatherInfo.label}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={locationLabel}
            onChange={handleLocationChange}
            className="border border-border/60 rounded-xl px-2.5 py-1.5 text-xs bg-white/80 text-foreground focus:outline-none"
          >
            {LOCATIONS.map((l) => <option key={l.label} value={l.label}>{l.label}</option>)}
          </select>
          <button
            onClick={() => { const loc = LOCATIONS.find((l) => l.label === locationLabel) ?? LOCATIONS[0]; if (loc.lat !== 0) load(loc.lat, loc.lon, loc.label); }}
            disabled={loading}
            className="text-sm disabled:opacity-40 hover:scale-110 transition-transform"
            title="รีเฟรช"
          >🔄</button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2.5 py-1">
          <div className="h-14 bg-white/50 rounded-xl animate-pulse" />
          <div className="grid grid-cols-3 gap-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-white/50 rounded-xl animate-pulse" />)}
          </div>
        </div>
      ) : error ? (
        <div className="text-sm text-rose-600 bg-white/60 rounded-xl px-4 py-3">{error}</div>
      ) : weather && advice ? (
        <>
          <div className={`mb-4 p-3.5 rounded-xl border ${advice.border} bg-white/60`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{advice.icon}</span>
              <span className={`text-sm font-bold ${advice.color}`}>{advice.level}</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{advice.reason}</p>
          </div>

          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {[
              { label: "อุณหภูมิ", value: `${weather.temperature}°C`, icon: "🌡️" },
              { label: "ความชื้น", value: `${weather.humidity}%`, icon: "💧" },
              { label: "ลม", value: `${weather.windSpeed} km/h`, icon: "💨" },
            ].map((s) => (
              <div key={s.label} className="bg-white/70 rounded-xl p-2.5 text-center border border-white/60 shadow-sm">
                <p className="text-base mb-0.5">{s.icon}</p>
                <p className="text-sm font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="mb-1">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-muted-foreground font-medium">โอกาสฝนตกสูงสุดวันนี้</span>
              <span className={`text-sm font-bold ${advice.color}`}>{maxProb}%</span>
            </div>
            <div className="h-2 bg-white/50 rounded-full overflow-hidden border border-white/50">
              <div
                className={`h-full rounded-full transition-all duration-700 ${maxProb >= 70 ? "bg-blue-400" : maxProb >= 40 ? "bg-amber-400" : "bg-emerald-400"}`}
                style={{ width: `${maxProb}%` }}
              />
            </div>
          </div>

          {weather.hourlyRain.length > 0 && (
            <div className="mt-3.5">
              <p className="text-[10px] text-muted-foreground font-medium mb-2">โอกาสฝนรายชั่วโมง (วันนี้)</p>
              <div className="flex items-end gap-1 h-12">
                {weather.hourlyRain.map(({ hour, prob }) => (
                  <div key={hour} className="flex flex-col items-center gap-0.5 flex-1">
                    <span className="text-[9px] text-muted-foreground">{prob}%</span>
                    <div
                      className={`w-full rounded-t-md transition-all ${prob >= 70 ? "bg-blue-400" : prob >= 40 ? "bg-amber-300" : "bg-emerald-300"}`}
                      style={{ height: `${Math.max(4, (prob / 100) * 28)}px` }}
                    />
                    <span className="text-[9px] text-muted-foreground">{hour}น.</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastUpdated && (
            <p className="text-[10px] text-muted-foreground mt-3 text-right">
              📡 {locationLabel} · อัพเดต {lastUpdated.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </>
      ) : null}
    </div>
  );
}
