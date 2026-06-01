import React, { useEffect } from 'react';
import { 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  MinusCircle, 
  Map, 
  CloudSun, 
  Wind, 
  Droplets,
  Sprout,
  Activity,
  Home,
  ChevronRight,
  Plus,
  TreePine,
  DollarSign
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { Button } from "../../ui/button";

export function Interaction() {
  useEffect(() => {
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  const chartData = [
    { month: 'ม.ค.', value: 40, expense: 20 },
    { month: 'ก.พ.', value: 30, expense: 15 },
    { month: 'มี.ค.', value: 50, expense: 25 },
    { month: 'เม.ย.', value: 80, expense: 30 },
    { month: 'พ.ค.', value: 120, expense: 40 },
    { month: 'มิ.ย.', value: 150, expense: 50 },
    { month: 'ก.ค.', value: 200, expense: 60 },
    { month: 'ส.ค.', value: 180, expense: 55 },
    { month: 'ก.ย.', value: 90, expense: 35 },
    { month: 'ต.ค.', value: 60, expense: 25 },
    { month: 'พ.ย.', value: 40, expense: 20 },
    { month: 'ธ.ค.', value: 35, expense: 18 },
  ];
  
  const maxVal = Math.max(...chartData.map(d => Math.max(d.value, d.expense)));

  return (
    <div 
      className="min-h-screen w-full relative pb-24"
      style={{ 
        fontFamily: "'Sarabun', sans-serif",
        backgroundColor: '#f5f1e8',
        color: '#1a1a1a'
      }}
    >
      {/* Header & Breadcrumbs */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-sm">
            <Home className="w-4 h-4 text-gray-500" />
            <ChevronRight className="w-4 h-4 text-gray-400" />
            <span className="font-semibold text-gray-900">ภาพรวมสวน</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" className="border-[#2d6a2d] text-[#2d6a2d] hover:bg-[#2d6a2d] hover:text-white transition-colors">
              ส่งออกรายงาน
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Weather Strip - Informational (Flat) */}
        <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 flex flex-wrap items-center justify-between gap-4 border border-gray-200">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <CloudSun className="w-6 h-6 text-orange-500" />
              <span className="font-medium text-lg text-gray-700">28°C</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <Droplets className="w-5 h-5 text-blue-500" />
              <span className="text-gray-600">ความชื้น 82%</span>
            </div>
            <div className="h-6 w-px bg-gray-300"></div>
            <div className="flex items-center space-x-2">
              <Wind className="w-5 h-5 text-gray-400" />
              <span className="text-gray-600">ลม 5 km/h</span>
            </div>
          </div>
          <div className="bg-[#2d6a2d]/10 px-4 py-2 rounded-lg border border-[#2d6a2d]/20">
            <span className="text-[#2d6a2d] font-semibold flex items-center gap-2">
              <Sprout className="w-4 h-4" /> แนะนำ: ไม่ต้องรดน้ำวันนี้
            </span>
          </div>
        </div>

        {/* Quick Actions Panel - Explicit Affordance */}
        <section>
          <h2 className="text-lg font-bold mb-4 text-gray-800 flex items-center gap-2">
            <Activity className="w-5 h-5" /> การกระทำด่วน
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button className="flex items-center p-4 bg-white rounded-xl shadow-[0_4px_14px_0_rgba(45,106,45,0.1)] border-2 border-transparent hover:border-[#2d6a2d] hover:-translate-y-1 transition-all group text-left">
              <div className="w-12 h-12 rounded-full bg-[#2d6a2d]/10 flex items-center justify-center mr-4 group-hover:bg-[#2d6a2d] group-hover:text-white transition-colors text-[#2d6a2d]">
                <PlusCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">บันทึกรายรับ</h3>
                <p className="text-sm text-gray-500">เพิ่มรายการขายทุเรียน</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-[#2d6a2d]" />
            </button>

            <button className="flex items-center p-4 bg-white rounded-xl shadow-[0_4px_14px_0_rgba(220,38,38,0.1)] border-2 border-transparent hover:border-red-500 hover:-translate-y-1 transition-all group text-left">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mr-4 group-hover:bg-red-500 group-hover:text-white transition-colors text-red-600">
                <MinusCircle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">บันทึกรายจ่าย</h3>
                <p className="text-sm text-gray-500">ค่าปุ๋ย ค่ายา ค่าแรง</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-red-500" />
            </button>

            <button className="flex items-center p-4 bg-white rounded-xl shadow-[0_4px_14px_0_rgba(0,0,0,0.05)] border-2 border-transparent hover:border-blue-500 hover:-translate-y-1 transition-all group text-left">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center mr-4 group-hover:bg-blue-500 group-hover:text-white transition-colors text-blue-600">
                <Map className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 text-lg">จัดการแปลง</h3>
                <p className="text-sm text-gray-500">ดูข้อมูลรายแปลง</p>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-500" />
            </button>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Financial Stats - Interactive Cards */}
          <section className="lg:col-span-2 space-y-4">
            <h2 className="text-lg font-bold text-gray-800">ภาพรวมการเงิน (ปีนี้)</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 hover:shadow-md hover:border-[#2d6a2d]/50 transition-all cursor-pointer group relative overflow-hidden">
                <div className="absolute top-4 right-4 bg-gray-50 p-2 rounded-full group-hover:bg-[#2d6a2d]/10 transition-colors">
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#2d6a2d]" />
                </div>
                <p className="text-sm font-medium text-gray-500 mb-1">กำไรสุทธิ</p>
                <div className="text-3xl font-bold text-gray-900 mb-2">156,600 <span className="text-lg font-normal text-gray-500">บาท</span></div>
                <div className="flex items-center text-sm font-medium text-[#2d6a2d] bg-[#2d6a2d]/10 w-fit px-2 py-1 rounded">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  ROI 23.5%
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group relative">
                  <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">รายรับรวม</p>
                  <div className="text-xl font-bold text-[#2d6a2d]">245,800</div>
                </div>
                
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer group relative">
                   <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-3 h-3 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-500 mb-1">รายจ่ายรวม</p>
                  <div className="text-xl font-bold text-red-600">89,200</div>
                </div>

                <div className="col-span-2 bg-gradient-to-r from-gray-800 to-gray-900 p-4 rounded-xl text-white shadow-md relative overflow-hidden group cursor-pointer hover:shadow-lg transition-all">
                  <div className="absolute top-0 right-0 p-4 opacity-50 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-white" />
                  </div>
                  <p className="text-sm font-medium text-gray-300 mb-1">ประมาณการสิ้นปี</p>
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xl font-bold text-white mb-1">รายรับ 280,000</div>
                      <div className="text-sm text-gray-400">กำไร 185k • <span className="text-green-400">+18.2% YoY</span></div>
                    </div>
                  </div>
                </div>
              </div>

            </div>

            {/* Chart Area */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-gray-800">กระแสเงินสดรายเดือน</h3>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-[#2d6a2d]"></div>รายรับ</div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-red-400"></div>รายจ่าย</div>
                </div>
              </div>
              <div className="h-64 flex items-end justify-between gap-2 px-2">
                {chartData.map((d, i) => (
                  <div key={i} className="flex flex-col items-center flex-1 group cursor-pointer">
                    <div className="w-full relative h-48 flex items-end justify-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <div 
                        className="w-full max-w-[16px] bg-[#2d6a2d] rounded-t-sm"
                        style={{ height: `${(d.value / maxVal) * 100}%` }}
                      ></div>
                      <div 
                        className="w-full max-w-[16px] bg-red-400 rounded-t-sm"
                        style={{ height: `${(d.expense / maxVal) * 100}%` }}
                      ></div>
                      
                      {/* Tooltip on hover */}
                      <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                        รับ: {d.value}k | จ่าย: {d.expense}k
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 mt-3">{d.month}</span>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* Orchard Stats - Informational (Muted/Flat) */}
          <section className="space-y-4">
             <h2 className="text-lg font-bold text-gray-800">ข้อมูลสวน</h2>
             <div className="bg-gray-100/50 p-6 rounded-2xl border border-gray-200">
                <div className="grid grid-cols-2 gap-y-6 gap-x-4">
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <Map className="w-4 h-4" /> <span className="text-sm font-medium">จำนวนแปลง</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">2 <span className="text-sm font-normal text-gray-500">แปลง</span></div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 text-gray-500 mb-1">
                      <TreePine className="w-4 h-4" /> <span className="text-sm font-medium">จำนวนต้น</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-800">84 <span className="text-sm font-normal text-gray-500">ต้น</span></div>
                  </div>
                  <div className="col-span-2 h-px bg-gray-200 my-2"></div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">ต้นทุนเฉลี่ย / ไร่</div>
                    <div className="text-lg font-bold text-gray-800">12,400 ฿</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">รายรับเฉลี่ย / ต้น</div>
                    <div className="text-lg font-bold text-[#2d6a2d]">2,926 ฿</div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button variant="outline" className="w-full bg-white border-gray-300 hover:bg-gray-50 hover:text-gray-900 group">
                    ดูรายละเอียดสวน <ArrowRight className="w-4 h-4 ml-2 text-gray-400 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </div>
             </div>

             {/* Recent Activity Mini-list */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">รายการล่าสุด</h3>
                  <button className="text-sm text-[#2d6a2d] font-medium hover:underline">ดูทั้งหมด</button>
                </div>
                <div className="space-y-4">
                  {[
                    { title: "ขายทุเรียนหมอนทอง", amount: "+45,000", type: "income", date: "วันนี้" },
                    { title: "ซื้อปุ๋ยสูตร 8-24-24", amount: "-4,500", type: "expense", date: "เมื่อวาน" },
                    { title: "ค่าแรงคนงาน", amount: "-1,200", type: "expense", date: "3 วันที่แล้ว" }
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${item.type === 'income' ? 'bg-[#2d6a2d]/10 text-[#2d6a2d]' : 'bg-red-50 text-red-500'}`}>
                          {item.type === 'income' ? <Plus className="w-4 h-4" /> : <MinusCircle className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">{item.title}</p>
                          <p className="text-xs text-gray-500">{item.date}</p>
                        </div>
                      </div>
                      <span className={`font-semibold text-sm ${item.type === 'income' ? 'text-[#2d6a2d]' : 'text-red-600'}`}>{item.amount}</span>
                    </div>
                  ))}
                </div>
             </div>
          </section>

        </div>
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-8 right-8 w-16 h-16 bg-[#2d6a2d] hover:bg-[#235323] text-white rounded-full shadow-[0_8px_30px_rgba(45,106,45,0.4)] hover:shadow-[0_8px_30px_rgba(45,106,45,0.6)] flex items-center justify-center transition-all hover:scale-105 z-40 group">
        <Plus className="w-8 h-8 group-hover:rotate-90 transition-transform duration-300" />
      </button>

    </div>
  );
}
