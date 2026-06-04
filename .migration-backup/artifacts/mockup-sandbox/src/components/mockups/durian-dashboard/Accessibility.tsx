import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Cloud, Droplets, Wind, ArrowUp, ArrowDown, Trees, TrendingUp, DollarSign } from "lucide-react";

export function Accessibility() {
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700;800&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const chartData = [
    { month: "ม.ค.", income: 120, expense: 40 },
    { month: "ก.พ.", income: 150, expense: 45 },
    { month: "มี.ค.", income: 180, expense: 50 },
    { month: "เม.ย.", income: 210, expense: 60 },
    { month: "พ.ค.", income: 245, expense: 89 },
    { month: "มิ.ย.", income: 200, expense: 70 },
    { month: "ก.ค.", income: 160, expense: 50 },
    { month: "ส.ค.", income: 140, expense: 40 },
    { month: "ก.ย.", income: 130, expense: 45 },
    { month: "ต.ค.", income: 150, expense: 55 },
    { month: "พ.ย.", income: 170, expense: 60 },
    { month: "ธ.ค.", income: 190, expense: 65 },
  ];

  const maxVal = 250;

  return (
    <div 
      className="min-h-screen p-4 md:p-8" 
      style={{ 
        fontFamily: "'Sarabun', sans-serif", 
        backgroundColor: "#f5f1e8",
        color: "#1a4a1a"
      }}
    >
      <div className="max-w-[1280px] mx-auto space-y-6 md:space-y-8">
        
        {/* Header & Weather */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#1a4a1a] uppercase">ภาพรวมสวนทุเรียน</h1>
            <p className="text-lg font-semibold mt-2 text-[#1a4a1a]">ข้อมูลอัพเดทล่าสุด: วันนี้ 08:30 น.</p>
          </div>
          
          <Card className="w-full lg:w-auto border-2 border-[#2d6a2d] shadow-md bg-white">
            <CardContent className="p-4 flex flex-wrap gap-6 items-center font-bold text-lg text-[#1a4a1a]">
              <div className="flex items-center gap-2">
                <Cloud className="w-8 h-8 text-[#2d6a2d]" />
                <span className="text-2xl">28°C</span>
              </div>
              <div className="flex items-center gap-2">
                <Droplets className="w-6 h-6 text-[#2d6a2d]" />
                <span>ความชื้น 82%</span>
              </div>
              <div className="flex items-center gap-2">
                <Wind className="w-6 h-6 text-[#2d6a2d]" />
                <span>ลม 5 km/h</span>
              </div>
              <div className="flex items-center gap-2 bg-[#e6f0e6] px-4 py-2 rounded-md border border-[#2d6a2d]">
                <span className="text-[#2d6a2d] font-bold">แนะนำ: ไม่ต้องรดน้ำ</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-[#2d6a2d] text-white shadow-lg border-none">
            <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full">
              <h2 className="text-xl font-bold uppercase mb-2">กำไรสุทธิ (YTD)</h2>
              <div className="text-4xl md:text-5xl font-extrabold mb-4">156,600 <span className="text-2xl">บาท</span></div>
              <div className="flex items-center gap-2 text-lg font-bold bg-white/20 w-fit px-3 py-1 rounded">
                <ArrowUp className="w-5 h-5" />
                <span>+18.2% YoY</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-[#1a4a1a]/20 shadow-md">
            <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full text-[#1a4a1a]">
              <h2 className="text-xl font-bold uppercase mb-2">รายรับรวม</h2>
              <div className="text-4xl font-extrabold mb-4">245,800 <span className="text-xl">บาท</span></div>
              <div className="flex items-center gap-2 text-lg font-bold text-[#2d6a2d]">
                <ArrowUp className="w-5 h-5" />
                <span>+ 12.5%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-[#1a4a1a]/20 shadow-md">
            <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full text-[#1a4a1a]">
              <h2 className="text-xl font-bold uppercase mb-2">รายจ่ายรวม</h2>
              <div className="text-4xl font-extrabold mb-4">89,200 <span className="text-xl">บาท</span></div>
              <div className="flex items-center gap-2 text-lg font-bold text-red-700">
                <ArrowDown className="w-5 h-5" />
                <span>− 4.3%</span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white border-2 border-[#1a4a1a]/20 shadow-md">
            <CardContent className="p-6 md:p-8 flex flex-col justify-between h-full text-[#1a4a1a]">
              <h2 className="text-xl font-bold uppercase mb-2">ROI</h2>
              <div className="text-4xl font-extrabold mb-4">23.5%</div>
              <div className="text-lg font-bold text-[#1a4a1a]/70">ผลตอบแทนการลงทุน</div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          
          {/* Chart Section */}
          <Card className="lg:col-span-2 bg-white border-2 border-[#1a4a1a]/20 shadow-md">
            <CardContent className="p-6 md:p-8">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold uppercase text-[#1a4a1a]">รายรับ-รายจ่าย รายเดือน</h2>
                <div className="flex gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#2d6a2d]"></div>
                    <span className="font-bold text-lg">รายรับ</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-red-700"></div>
                    <span className="font-bold text-lg">รายจ่าย</span>
                  </div>
                </div>
              </div>

              <div className="h-64 flex items-end gap-2 md:gap-4 overflow-x-auto pb-4">
                {chartData.map((d, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center justify-end min-w-[50px]">
                    <div className="w-full flex gap-1 justify-center items-end h-48 relative">
                      <div 
                        className="w-1/2 bg-[#2d6a2d] relative group" 
                        style={{ height: `${(d.income / maxVal) * 100}%` }}
                      >
                        <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-sm font-bold text-[#1a4a1a]">
                          {d.income}K
                        </span>
                      </div>
                      <div 
                        className="w-1/2 bg-red-700 relative group" 
                        style={{ height: `${(d.expense / maxVal) * 100}%` }}
                      >
                      </div>
                    </div>
                    <span className="mt-4 font-bold text-lg text-[#1a4a1a]">{d.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Side Info */}
          <div className="space-y-6 md:space-y-8">
            <Card className="bg-white border-2 border-[#1a4a1a]/20 shadow-md">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl font-bold uppercase text-[#1a4a1a] mb-6 flex items-center gap-2">
                  <Trees className="w-6 h-6 text-[#2d6a2d]" />
                  ข้อมูลแปลงปลูก
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b-2 border-gray-100 pb-4">
                    <span className="text-lg font-bold text-[#1a4a1a]">จำนวนแปลง</span>
                    <span className="text-2xl font-extrabold text-[#2d6a2d]">2 แปลง</span>
                  </div>
                  <div className="flex justify-between items-center border-b-2 border-gray-100 pb-4">
                    <span className="text-lg font-bold text-[#1a4a1a]">จำนวนต้น</span>
                    <span className="text-2xl font-extrabold text-[#2d6a2d]">84 ต้น</span>
                  </div>
                  <div className="flex justify-between items-center border-b-2 border-gray-100 pb-4">
                    <span className="text-lg font-bold text-[#1a4a1a]">ต้นทุน / ไร่</span>
                    <span className="text-xl font-extrabold text-[#1a4a1a]">12,400 บาท</span>
                  </div>
                  <div className="flex justify-between items-center pb-2">
                    <span className="text-lg font-bold text-[#1a4a1a]">รายรับ / ต้น</span>
                    <span className="text-xl font-extrabold text-[#1a4a1a]">2,926 บาท</span>
                  </div>
                </div>
                <Button className="w-full mt-6 bg-[#2d6a2d] hover:bg-[#1a4a1a] text-white h-14 text-lg font-bold uppercase shadow-md">
                  ดูรายละเอียดแปลง
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-[#e6f0e6] border-2 border-[#2d6a2d] shadow-md">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-2xl font-bold uppercase text-[#1a4a1a] mb-6 flex items-center gap-2">
                  <TrendingUp className="w-6 h-6 text-[#2d6a2d]" />
                  คาดการณ์สิ้นปี
                </h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#1a4a1a]">รายรับคาดหวัง</span>
                    <span className="text-xl font-extrabold text-[#2d6a2d]">280,000</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-[#1a4a1a]">รายจ่ายคาดหวัง</span>
                    <span className="text-xl font-extrabold text-red-700">95,000</span>
                  </div>
                  <div className="pt-4 border-t-2 border-[#2d6a2d]/30 flex justify-between items-center">
                    <span className="text-lg font-bold text-[#1a4a1a]">กำไรคาดหวัง</span>
                    <span className="text-2xl font-extrabold text-[#2d6a2d]">185,000</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}
