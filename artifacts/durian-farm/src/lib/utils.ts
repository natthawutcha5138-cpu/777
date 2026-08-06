import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatBaht(amount: number): string {
  return amount.toLocaleString("th-TH") + " บาท";
}

export function formatNumber(n: number): string {
  return n.toLocaleString("th-TH");
}

export const MONTHS_TH = [
  "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
  "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
];

export const EXPENSE_CATEGORIES = [
  "ปุ๋ย",
  "ยา/สารเคมี",
  "แรงงาน",
  "น้ำ/ไฟฟ้า",
  "อุปกรณ์",
  "อื่นๆ",
];

export const INCOME_CATEGORIES = [
  "ขายทุเรียนสด",
  "ขายทุเรียนแช่แข็ง",
  "อื่นๆ",
];

export const VARIETIES = [
  "หมอนทอง",
  "ชะนี",
  "กระดุม",
  "พวงมณี",
  "ก้านยาว",
];

export const STAGE_NAMES = [
  "เตรียมออกดอก (ต.ค.–ธ.ค.)",
  "ออกดอก–ดูแลดอก (ม.ค.–ก.พ.)",
  "ติดผล–พัฒนาผล (มี.ค.–เม.ย.)",
  "ก่อนเก็บเกี่ยว–หลังเก็บ (พ.ค.–มิ.ย.)",
  "ทำใบ / ฟื้นฟูต้น (มิ.ย.–ก.ย.)",
];
