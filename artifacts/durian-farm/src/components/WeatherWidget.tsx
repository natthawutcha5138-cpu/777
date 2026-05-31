import { useState, useEffect, useCallback } from "react";

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

function weatherLabel(code: number) {
  if (code === 0)  return "ท้องฟ้าแจ่มใส";
  if (code <= 3)   return "มีเมฆบางส่วน";
  if (code <= 48)  return "ท้องฟ้าครึ้ม";
  if (code <= 57)  return "ฝนละออง";
  if (code <= 67)  return "ฝนตก";
  if (code <= 82)  return "ฝนตกหนัก";
  return "พายุฝนฟ้าคะนอง";
}

function irrigationAdvice(prob: number, code: number) {
  const raining = code >= 51;
  if (raining || prob >= 70) return { level: "ไม่ต้องรดน้ำ", detail: `โอกาสฝนตกสูง ${prob}% — ประหยัดน้ำได้วันนี้`, color: "text-blue-700", bar: "bg-blue-500" };
  if (prob >= 40)             return { level: "รอดูสภาพอากาศ",detail: `โอกาสฝนตก ${prob}% — รอดูช่วงบ่ายก่อน`,  color: "text-amber-700",bar: "bg-amber-500" };
  return                             { level: "ควรรดน้ำวันนี้", detail: `โอกาสฝนตกต่ำ ${prob}% — ทุเรียนต้องการน้ำ`,color: "text-primary",  bar: "bg-primary" };
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

export default function WeatherWidget() {
  const [weather,       setWeather]       = useState<WeatherData | null>(null);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);
  const [locationLabel, setLocationLabel] = useState(LOCATIONS[0].label);
  const [lastUpdated,   setLastUpdated]   = useState<Date | null>(null);

  const load = useCallback(async (lat: number, lon: number, label: string) => {
    setLoading(true); setError(null); setLocationLabel(label);
    try {
      setWeather(await fetchWeather(lat, lon));
      setLastUpdated(new Date());
    } catch { setError("ไม่สามารถดึงข้อมูลอากาศได้"); }
    finally  { setLoading(false); }
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

  useEffect(() => { const d = LOCATIONS[0]; load(d.lat, d.lon, d.label); }, [load]);

  const maxProb = weather?.precipitationProbabilityMax ?? 0;
  const advice  = weather ? irrigationAdvice(maxProb, weather.dailyWeatherCode) : null;

  return (
    <div className="bg-card border border-border rounded-lg p-5 shadow-xs">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
        <div>
          <h2 className="text-sm font-semibold text-foreground">สภาพอากาศและการรดน้ำ</h2>
          {weather && <p className="text-xs text-muted-foreground mt-0.5">{weatherLabel(weather.dailyWeatherCode)}</p>}
        </div>
        <div className="flex items-center gap-2">
          <select value={locationLabel} onChange={handleLocationChange}
            className="border border-border rounded px-2.5 py-1.5 text-xs bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary/40">
            {LOCATIONS.map(l => <option key={l.label} value={l.label}>{l.label}</option>)}
          </select>
          <button
            onClick={() => { const loc = LOCATIONS.find(l => l.label === locationLabel) ?? LOCATIONS[0]; if (loc.lat) load(loc.lat, loc.lon, loc.label); }}
            disabled={loading}
            className="text-xs text-muted-foreground hover:text-primary transition-colors disabled:opacity-40 px-1"
            title="รีเฟรช">
            รีเฟรช
          </button>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          <div className="h-12 bg-muted/50 rounded animate-pulse" />
          <div className="grid grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => <div key={i} className="h-16 bg-muted/50 rounded animate-pulse" />)}
          </div>
        </div>
      ) : error ? (
        <p className="text-sm text-destructive py-2">{error}</p>
      ) : weather && advice ? (
        <div className="space-y-4">
          <div className="flex items-start gap-3 px-4 py-3 bg-muted/30 rounded border border-border">
            <div>
              <p className={`text-sm font-semibold ${advice.color}`}>{advice.level}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{advice.detail}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              { label: "อุณหภูมิ",  value: `${weather.temperature}°C` },
              { label: "ความชื้น",  value: `${weather.humidity}%`      },
              { label: "ความเร็วลม", value: `${weather.windSpeed} km/h` },
            ].map(s => (
              <div key={s.label} className="bg-muted/30 rounded px-3 py-2.5 border border-border text-center">
                <p className="text-base font-semibold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          <div>
            <div className="flex justify-between text-xs mb-1.5">
              <span className="text-muted-foreground font-medium">โอกาสฝนตกสูงสุดวันนี้</span>
              <span className={`font-semibold ${advice.color}`}>{maxProb}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div className={`h-full rounded-full transition-all duration-700 ${advice.bar}`} style={{ width: `${maxProb}%` }} />
            </div>
          </div>

          {weather.hourlyRain.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-2">โอกาสฝนรายชั่วโมง</p>
              <div className="flex items-end gap-1.5 h-14 bg-muted/20 rounded px-2 py-1.5 border border-border">
                {weather.hourlyRain.map(({ hour, prob }) => (
                  <div key={hour} className="flex flex-col items-center gap-0.5 flex-1">
                    <div
                      className={`w-full rounded-sm transition-all ${prob >= 70 ? "bg-blue-400" : prob >= 40 ? "bg-amber-400" : "bg-primary/50"}`}
                      style={{ height: `${Math.max(3, (prob / 100) * 36)}px` }}
                      title={`${hour}:00 — ${prob}%`}
                    />
                    <span className="text-[9px] text-muted-foreground">{hour}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lastUpdated && (
            <p className="text-[10px] text-muted-foreground text-right">
              {locationLabel} · อัพเดต {lastUpdated.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })} น.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
