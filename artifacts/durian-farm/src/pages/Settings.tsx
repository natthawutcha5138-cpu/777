import { useEffect, useState } from "react";
import { useGetOrgSettings, useUpdateOrgSettings, getGetOrgSettingsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Globe, BellRing, Save } from "lucide-react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

export default function SettingsPage() {
  const { user } = useAuthContext();
  const isAuthed = !!user?.id;
  const qc = useQueryClient();
  const { toast } = useToast();

  const { data: settings, isLoading } = useGetOrgSettings({ query: { queryKey: getGetOrgSettingsQueryKey(), enabled: isAuthed } });
  const updateSettings = useUpdateOrgSettings({ 
    mutation: { 
      onSuccess: () => { 
        qc.invalidateQueries({ queryKey: getGetOrgSettingsQueryKey() }); 
        toast({ title: "บันทึกสำเร็จ", description: "ข้อมูลการตั้งค่าถูกบันทึกเรียบร้อยแล้ว", variant: "default" });
      } 
    } 
  });

  const [form, setForm] = useState({ orgName: "", farmName: "", language: "th", timezone: "Asia/Bangkok", notifyEmail: true, notifyPush: true });

  useEffect(() => {
    if (settings) {
      setForm({
        orgName: settings.orgName, farmName: settings.farmName, language: settings.language, 
        timezone: settings.timezone, notifyEmail: settings.notifyEmail, notifyPush: settings.notifyPush
      });
    }
  }, [settings]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateSettings.mutate({ data: form });
  }

  if (isLoading) return <div className="max-w-4xl mx-auto space-y-6"><Skeleton className="h-8 w-48" /><Skeleton className="h-96 w-full" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-10">
      <div>
        <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">ตั้งค่าระบบ (Settings)</h1>
        <p className="text-[13px] text-gray-400 mt-0.5">จัดการข้อมูลองค์กรและปรับแต่งการใช้งาน</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Org Info */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">ข้อมูลองค์กรและฟาร์ม</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-gray-600 dark:text-gray-400">ชื่อองค์กร / บริษัท</label>
              <input type="text" value={form.orgName} onChange={e => setForm({ ...form, orgName: e.target.value })} className="input-base" required />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-gray-600 dark:text-gray-400">ชื่อฟาร์ม</label>
              <input type="text" value={form.farmName} onChange={e => setForm({ ...form, farmName: e.target.value })} className="input-base" required />
            </div>
          </div>
        </div>

        {/* Localization */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <Globe className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">ภาษาและเวลา</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-gray-600 dark:text-gray-400">ภาษา</label>
              <select value={form.language} onChange={e => setForm({ ...form, language: e.target.value })} className="input-base">
                <option value="th">ไทย (Thai)</option>
                <option value="en">English</option>
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-semibold text-gray-600 dark:text-gray-400">โซนเวลา (Timezone)</label>
              <select value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })} className="input-base">
                <option value="Asia/Bangkok">Asia/Bangkok (GMT+7)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="card-premium p-6">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
              <BellRing className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </div>
            <h2 className="text-[15px] font-bold text-gray-900 dark:text-white">การแจ้งเตือน</h2>
          </div>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.notifyEmail} onChange={e => setForm({ ...form, notifyEmail: e.target.checked })} className="w-5 h-5 rounded text-green-600 focus:ring-green-500 border-gray-300" />
              <div>
                <p className="text-[14px] font-medium text-gray-900 dark:text-white">แจ้งเตือนผ่านอีเมล</p>
                <p className="text-[12px] text-gray-500">รับสรุปรายงานประจำสัปดาห์และการแจ้งเตือนสำคัญ</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.notifyPush} onChange={e => setForm({ ...form, notifyPush: e.target.checked })} className="w-5 h-5 rounded text-green-600 focus:ring-green-500 border-gray-300" />
              <div>
                <p className="text-[14px] font-medium text-gray-900 dark:text-white">แจ้งเตือนในระบบ (Push Notifications)</p>
                <p className="text-[12px] text-gray-500">แจ้งเตือนกิจกรรมที่ต้องทำทันทีในเว็บไซต์</p>
              </div>
            </label>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" disabled={updateSettings.isPending} className="btn-primary text-[14px] px-6 py-2.5">
            <Save className="w-4 h-4" /> {updateSettings.isPending ? "กำลังบันทึก..." : "บันทึกการตั้งค่า"}
          </button>
        </div>
      </form>
    </div>
  );
}
