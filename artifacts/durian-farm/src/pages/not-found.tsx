import { Link } from "wouter";
import { AlertCircle, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 dark:bg-gray-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-3xl p-8 text-center border border-gray-100 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none">
        <div className="w-16 h-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="h-8 w-8 text-red-500 dark:text-red-400" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">ไม่พบหน้าที่ต้องการ</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          หน้าที่คุณพยายามเข้าถึงอาจถูกลบ ย้าย หรือไม่มีอยู่จริง กรุณาตรวจสอบ URL อีกครั้ง
        </p>

        <Link href="/">
          <a className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all shadow-md shadow-green-600/20 hover:shadow-lg focus-ring">
            <ArrowLeft className="w-4 h-4" />
            กลับสู่หน้าหลัก
          </a>
        </Link>
      </div>
    </div>
  );
}
