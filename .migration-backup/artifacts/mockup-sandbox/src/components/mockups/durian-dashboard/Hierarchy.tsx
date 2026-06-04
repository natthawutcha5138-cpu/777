import React, { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  Sprout, 
  CloudSun, 
  Droplets, 
  Wind,
  TrendingUp,
  AlertCircle
} from "lucide-react";

export function Hierarchy() {
  // Inject Google Font
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div 
      className="min-h-screen p-8 text-slate-800"
      style={{ 
        fontFamily: "'Sarabun', sans-serif",
        backgroundColor: "#f5f1e8"
      }}
    >
      <div className="max-w-[1280px] mx-auto space-y-6">
        
        {/* Header */}
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-3xl font-bold text-[#2d6a2d]">แดชบอร์ดสวนทุเรียน</h1>
            <p className="text-slate-500 mt-1">ภาพรวมและผลประกอบการ ณ ปัจจุบัน</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="bg-white border-[#2d6a2d]/20 text-[#2d6a2d] hover:bg-[#f5f1e8]">ดาวน์โหลดรายงาน</Button>
            <Button className="bg-[#2d6a2d] hover:bg-[#225022] text-white">บันทึกรายการใหม่</Button>
          </div>
        </header>

        {/* ZONE 1: FINANCIAL HEALTH (Is the farm profitable?) - Most urgent */}
        <section className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-6 bg-[#2d6a2d] rounded-full"></div>
            <h2 className="text-xl font-semibold text-slate-800">1. สุขภาพการเงิน</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* The Dominant Metric */}
            <Card className="md:col-span-4 border-none shadow-sm flex flex-col justify-center bg-white relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-green-100 rounded-bl-full -mr-16 -mt-16 opacity-50"></div>
              <CardContent className="pt-6">
                <p className="text-sm font-medium text-slate-500 mb-1">กำไรสุทธิ (ปีปัจจุบัน)</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-5xl font-bold text-[#2d6a2d]">156,600</h3>
                  <span className="text-lg font-medium text-slate-500">บาท</span>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-none px-2 py-0.5">
                    <ArrowUpRight className="w-3 h-3 mr-1" />
                    ROI 23.5%
                  </Badge>
                  <span className="text-xs text-slate-400">อัปเดตล่าสุด: วันนี้</span>
                </div>
              </CardContent>
            </Card>

            {/* Secondary Financial Metrics */}
            <Card className="md:col-span-8 border-none shadow-sm bg-white">
              <CardContent className="p-0 h-full flex flex-col sm:flex-row divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-500">รายรับรวม</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ArrowUpRight className="w-4 h-4 text-green-500" />
                      <p className="text-2xl font-semibold text-slate-800">245,800 <span className="text-sm text-slate-500">บาท</span></p>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <div className="flex justify-between text-xs mb-2">
                      <span className="text-slate-500">ความคืบหน้าสู่เป้าหมาย</span>
                      <span className="font-medium text-[#2d6a2d]">82%</span>
                    </div>
                    <Progress value={82} className="h-1.5 [&>div]:bg-[#2d6a2d]" />
                  </div>
                </div>

                <div className="flex-1 p-6 flex flex-col justify-between bg-slate-50/50">
                  <div>
                    <p className="text-sm font-medium text-slate-500">รายจ่ายรวม</p>
                    <div className="flex items-center gap-2 mt-1">
                      <ArrowDownRight className="w-4 h-4 text-rose-500" />
                      <p className="text-2xl font-semibold text-slate-800">89,200 <span className="text-sm text-slate-500">บาท</span></p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-2">
                    <p className="text-xs text-slate-500 mb-2">สัดส่วนรายจ่ายหลัก</p>
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div className="bg-amber-400 w-[45%]" title="ปุ๋ย/ยา 45%"></div>
                      <div className="bg-blue-400 w-[30%]" title="น้ำ/ไฟ 30%"></div>
                      <div className="bg-slate-300 w-[25%]" title="อื่นๆ 25%"></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chart Section - Supporting Evidence */}
          <Card className="border-none shadow-sm bg-white mt-4">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">กระแสเงินสดรายเดือน</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-48 w-full flex items-end justify-between gap-2 pt-4 px-2">
                {[
                  { month: 'ม.ค.', inc: 40, exp: 20 },
                  { month: 'ก.พ.', inc: 35, exp: 25 },
                  { month: 'มี.ค.', inc: 45, exp: 30 },
                  { month: 'เม.ย.', inc: 60, exp: 40 },
                  { month: 'พ.ค.', inc: 100, exp: 35 },
                  { month: 'มิ.ย.', inc: 85, exp: 20 },
                ].map((data, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 group">
                    <div className="flex items-end gap-1 w-full justify-center h-36 mb-2">
                      <div 
                        className="w-[30%] max-w-[24px] bg-[#2d6a2d]/80 rounded-t-sm group-hover:bg-[#2d6a2d] transition-colors relative" 
                        style={{ height: `${data.inc}%` }}
                      >
                        <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                          {data.inc}k
                        </div>
                      </div>
                      <div 
                        className="w-[30%] max-w-[24px] bg-rose-300 rounded-t-sm group-hover:bg-rose-400 transition-colors relative" 
                        style={{ height: `${data.exp}%` }}
                      >
                         <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10 transition-opacity">
                          {data.exp}k
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{data.month}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-center gap-6 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-[#2d6a2d]/80"></div>
                  <span>รายรับ</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-sm bg-rose-300"></div>
                  <span>รายจ่าย</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
          {/* ZONE 2: WHAT'S HAPPENING NOW - Compact */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-amber-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-slate-800">2. สถานะปัจจุบัน</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-amber-100 text-amber-700 rounded-lg">
                      <CloudSun className="w-5 h-5" />
                    </div>
                    <span className="font-medium">สภาพอากาศวันนี้</span>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-3xl font-light">28<span className="text-lg">°C</span></span>
                      <span className="text-sm text-slate-500">ฟ้าโปร่ง</span>
                    </div>
                    
                    <div className="flex gap-4 text-sm text-slate-600">
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5 text-blue-500" />
                        <span>82%</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Wind className="w-3.5 h-3.5 text-slate-400" />
                        <span>5 km/h</span>
                      </div>
                    </div>
                    
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-100 rounded-md flex gap-2 items-start">
                      <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <p className="text-xs text-blue-800 font-medium">ข้อแนะนำ: ไม่ต้องรดน้ำ ดินมีความชื้นเพียงพอ</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-sm bg-white">
                <CardContent className="p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2.5 bg-[#2d6a2d]/10 text-[#2d6a2d] rounded-lg">
                      <Sprout className="w-5 h-5" />
                    </div>
                    <span className="font-medium">ข้อมูลแปลง</span>
                  </div>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-slate-50 p-3 rounded-md">
                        <p className="text-xs text-slate-500 mb-1">จำนวนแปลง</p>
                        <p className="text-lg font-semibold text-slate-800">2 <span className="text-xs font-normal text-slate-500">แปลง</span></p>
                      </div>
                      <div className="bg-slate-50 p-3 rounded-md">
                        <p className="text-xs text-slate-500 mb-1">จำนวนต้น</p>
                        <p className="text-lg font-semibold text-slate-800">84 <span className="text-xs font-normal text-slate-500">ต้น</span></p>
                      </div>
                    </div>
                    
                    <div className="pt-2 border-t border-slate-100">
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-slate-500">ต้นทุน/ไร่</span>
                        <span className="text-sm font-medium">12,400 บาท</span>
                      </div>
                      <div className="flex justify-between items-center py-1">
                        <span className="text-sm text-slate-500">รายรับ/ต้น</span>
                        <span className="text-sm font-medium">2,926 บาท</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* ZONE 3: PLAN AHEAD - Understated but present */}
          <section className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-1.5 h-6 bg-indigo-500 rounded-full"></div>
              <h2 className="text-xl font-semibold text-slate-800">3. วางแผนล่วงหน้า</h2>
            </div>
            
            <Card className="border-none shadow-sm bg-white h-[calc(100%-2.5rem)]">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                      <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-medium text-slate-800">คาดการณ์สิ้นปีนี้</h3>
                      <p className="text-xs text-slate-500">ประเมินจากผลผลิตปัจจุบัน</p>
                    </div>
                  </div>
                  <Badge className="bg-indigo-50 text-indigo-700 border-indigo-200">
                    +18.2% เทียบปีก่อน
                  </Badge>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-end justify-between border-b border-slate-100 pb-4">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">รายรับที่คาดการณ์</p>
                      <p className="text-xl font-semibold text-slate-800">280,000 <span className="text-sm font-normal text-slate-500">บาท</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-slate-500 mb-1">รายจ่ายที่คาดการณ์</p>
                      <p className="text-xl font-semibold text-slate-800">95,000 <span className="text-sm font-normal text-slate-500">บาท</span></p>
                    </div>
                  </div>
                  
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-4 rounded-lg border border-indigo-100/50">
                    <p className="text-sm text-indigo-800/70 mb-1">กำไรสุทธิที่คาดการณ์</p>
                    <p className="text-3xl font-bold text-indigo-900">185,000 <span className="text-base font-normal opacity-70">บาท</span></p>
                    
                    <div className="mt-4 pt-4 border-t border-indigo-900/10 flex gap-2">
                      <Button size="sm" variant="outline" className="bg-white/50 border-indigo-200 hover:bg-white text-indigo-800 h-8">
                        ปรับปรุงแผนค่าใช้จ่าย
                      </Button>
                      <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white h-8">
                        ดูรายละเอียด
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

      </div>
    </div>
  );
}
