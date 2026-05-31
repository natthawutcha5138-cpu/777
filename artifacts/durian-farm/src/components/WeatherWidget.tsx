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
  timezone: string;
}

function getWeatherInfo(code: number): { label: string; icon: string } {
  if (code === 0) return { label: "ท้องฟ้าแจ่มใส", icon: "☀️" };
  if (code <= 3) return { label: "มีเมฆบางส่วน", icon: "🌤️" };
  if (code <= 48) return { label: "หมอก/ท้องฟ้าครึ้ม", icon: "🌫️" };
  if (code <= 57) return { label: "ฝนละออง", icon: "🌦️" };
  if (code <= 67) return { label: "ฝนตก", icon: "🌧️" };
  if (code <= 77) return { label: "หิมะ", icon: "❄️" };
  if (code <= 82) return { label: "ฝนตกหนัก", icon: "🌧️" };
  if (code <= 86) return { label: "พายุหิมะ", icon: "🌨️" };
  if (code <= 99) return { label: "พายุฝนฟ้าคะนอง", icon: "⛈️" };
  return { label: "ไม่ทราบสภาพ", icon: "🌡️" };
}

function getIrrigationAdvice(rainProb: number, weatherCode: number): {
  should: boolean;
  level: "ควรรดน้ำ" | "พิจารณาตามสภาพ" | "ไม่ต้องรดน้ำ";
  reason: string;
  color: string;
  bg: string;
  border: string;
  icon: string;
} {
  const isRaining = weatherCode >= 51;
  if (isRaining || rainProb >= 70) {
    return {
      should: false,
      level: "ไม่ต้องรดน้ำ",
      reason: `โอกาสฝนตกสูง ${rainProb}% — ประหยัดน้ำได้วันนี้`,
      color: "text-sky-700",
      bg: "from-sky-50 to-blue-50",
      border: "border-sky-200/60",
      icon: "💧",
    };
  }
  if (rainProb >= 40) {
    return {
      should: false,
      level: "พิจารณาตามสภาพ",
      reason: `โอกาสฝนตก ${rainProb}% — รอดูอากาศช่วงบ่ายก่อน`,
      color: "text-amber-700",
      bg: "from-amber-50 to-yellow-50",
      border: "border-amber-200/60",
      icon: "🌤️",
    };
  }
  return {
    should: true,
    level: "ควรรดน้ำ",
    reason: `โอกาสฝนตกต่ำ ${rainProb}% — ทุเรียนต้องการน้ำวันนี้`,
    color: "text-emerald-700",
    bg: "from-emerald-50 to-teal-50",
    border: "border-emerald-200/60",
    icon: "🚿",
  };
}

async function fetchWeather(lat: number, lon: number): Promise<WeatherData> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "temperature_2m,relative_humidity_2m,precipitation_probability,weather_code,wind_speed_10m");
  url.searchParams.set("hourly", "precipitation_probability");
  url.searchParams.set("daily", "precipitation_probability_max,weather_code");
  url.searchParams.set("timezone", "auto");
  url.searchParams.set("forecast_days", "1");

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error("Weather API error");
  const json = await res.json();

  const now = new Date();
  const currentHour = now.getHours();
  const hourlyHours: number[] = json.hourly.time.map((t: string) => new Date(t).getHours());
  const hourlyProbs: number[] = json.hourly.precipitation_probability;

  const hourlyRain = hourlyHours
    .map((h: number, i: number) => ({ hour: h, prob: hourlyProbs[i] }))
    .filter((x: { hour: number; prob: number }) => x.hour >= currentHour && x.hour <= 20)
    .slice(0, 8);

  return {
    temperature: Math.round(json.current.temperature_2m),
    humidity: json.current.relative_humidity_2m,
    windSpeed: Math.round(json.current.wind_speed_10m),
    weatherCode: json.current.weather_code,
    precipitationProbability: json.current.precipitation_probability ?? 0,
    precipitationProbabilityMax: json.daily.precipitation_probability_max[0] ?? 0,
    dailyWeatherCode: json.daily.weather_code[0],
    hourlyRain,
    lat,
    lon,
    timezone: json.timezone,
  };
}

export default function WeatherWidget() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [manualLat, setManualLat] = useState("13.736717");
  const [manualLon, setManualLon] = useState("100.523186");
  const [showManual, setShowManual] = useState(false);

  const load = useCallback(async (lat: number, lon: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(lat, lon);
      setWeather(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError("ไม่สามารถดึงข้อมูลอากาศได้");
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setShowManual(true);
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => { load(pos.coords.latitude, pos.coords.longitude); },
      () => {
        setPermissionDenied(true);
        setLoading(false);
        setShowManual(true);
      },
      { timeout: 8000 }
    );
  }, [load]);

  useEffect(() => {
    requestLocation();
  }, [requestLocation]);

  const advice = weather
    ? getIrrigationAdvice(weather.precipitationProbabilityMax, weather.dailyWeatherCode)
    : null;
  const weatherInfo = weather ? getWeatherInfo(weather.dailyWeatherCode) : null;

  if (loading && !weather) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/50 rounded-2xl p-5 shadow-sm animate-pulse">
        <div className="h-4 bg-sky-200/50 rounded w-32 mb-3" />
        <div className="h-8 bg-sky-200/50 rounded w-24 mb-2" />
        <div className="h-3 bg-sky-200/50 rounded w-48" />
      </div>
    );
  }

  if (permissionDenied && showManual && !weather) {
    return (
      <div className="bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-200/50 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-lg">🌦️</span>
          <h3 className="text-sm font-semibold text-foreground">พยากรณ์อากาศสวน</h3>
        </div>
        <p className="text-xs text-muted-foreground mb-3">ไม่สามารถเข้าถึง GPS — กรอกพิกัดสวนด้วยตนเอง</p>
        <div className="flex gap-2 mb-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-muted-foreground">ละติจูด</label>
            <input type="number" step="any" value={manualLat} onChange={(e) => setManualLat(e.target.value)}
              className="border border-border/60 rounded-xl px-2.5 py-1.5 text-xs bg-white/80 text-foreground" />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-muted-foreground">ลองจิจูด</label>
            <input type="number" step="any" value={manualLon} onChange={(e) => setManualLon(e.target.value)}
              className="border border-border/60 rounded-xl px-2.5 py-1.5 text-xs bg-white/80 text-foreground" />
          </div>
        </div>
        <button onClick={() => load(parseFloat(manualLat), parseFloat(manualLon))} disabled={loading}
          className="w-full py-2 bg-sky-500 text-white text-xs font-medium rounded-xl hover:opacity-90 transition-opacity disabled:opacity-60">
          {loading ? "กำลังโหลด..." : "ดูพยากรณ์อากาศ"}
        </button>
        <p className="text-xs text-muted-foreground mt-2">
          💡 เช่น จ.จันทบุรี: 12.6037, 102.1040 | จ.ระยอง: 12.6814, 101.2816
        </p>
      </div>
    );
  }

  if (!weather) return null;

  const maxProb = weather.precipitationProbabilityMax;

  return (
    <div className={`bg-gradient-to-br ${advice?.bg} border ${advice?.border} rounded-2xl p-5 shadow-sm`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{weatherInfo?.icon}</span>
          <div>
            <h3 className="text-sm font-semibold text-foreground">พยากรณ์อากาศสวน</h3>
            <p className="text-xs text-muted-foreground">{weatherInfo?.label}</p>
          </div>
        </div>
        <button onClick={requestLocation} disabled={loading}
          className="text-xs text-sky-600 hover:underline disabled:opacity-50"
          title="รีเฟรชข้อมูลอากาศ">
          {loading ? "⏳" : "🔄"}
        </button>
      </div>

      <div className={`mb-4 p-3.5 rounded-xl border ${advice?.border} bg-white/60`}>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-base">{advice?.icon}</span>
          <span className={`text-sm font-bold ${advice?.color}`}>{advice?.level}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{advice?.reason}</p>
      </div>

      <div className="grid grid-cols-3 gap-2.5 mb-4">
        {[
          { label: "อุณหภูมิ", value: `${weather.temperature}°C`, icon: "🌡️" },
          { label: "ความชื้น", value: `${weather.humidity}%`, icon: "💧" },
          { label: "ลม", value: `${weather.windSpeed} km/h`, icon: "💨" },
        ].map((s) => (
          <div key={s.label} className="bg-white/70 rounded-xl p-2.5 text-center border border-white/60">
            <p className="text-base mb-0.5">{s.icon}</p>
            <p className="text-sm font-bold text-foreground">{s.value}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-1">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground font-medium">โอกาสฝนตกสูงสุดวันนี้</span>
          <span className={`text-sm font-bold ${advice?.color}`}>{maxProb}%</span>
        </div>
        <div className="h-2 bg-white/50 rounded-full overflow-hidden border border-white/60">
          <div
            className={`h-full rounded-full transition-all duration-700 ${maxProb >= 70 ? "bg-blue-400" : maxProb >= 40 ? "bg-amber-400" : "bg-emerald-400"}`}
            style={{ width: `${maxProb}%` }}
          />
        </div>
      </div>

      {weather.hourlyRain.length > 0 && (
        <div className="mt-3.5">
          <p className="text-[10px] text-muted-foreground font-medium mb-2">โอกาสฝนรายชั่วโมง</p>
          <div className="flex items-end gap-1 h-10">
            {weather.hourlyRain.map(({ hour, prob }) => (
              <div key={hour} className="flex flex-col items-center gap-0.5 flex-1">
                <div
                  className={`w-full rounded-t-sm transition-all ${prob >= 70 ? "bg-blue-400" : prob >= 40 ? "bg-amber-300" : "bg-emerald-300"}`}
                  style={{ height: `${Math.max(4, (prob / 100) * 32)}px` }}
                  title={`${hour}:00 — ${prob}%`}
                />
                <span className="text-[8px] text-muted-foreground">{hour}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {lastUpdated && (
        <p className="text-[10px] text-muted-foreground mt-3 text-right">
          📡 ข้อมูลล่าสุด: {lastUpdated.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} | {weather.lat.toFixed(4)}, {weather.lon.toFixed(4)}
        </p>
      )}
    </div>
  );
}
