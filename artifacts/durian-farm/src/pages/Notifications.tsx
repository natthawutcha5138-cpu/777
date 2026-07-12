import { 
  useListNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, getListNotificationsQueryKey, getGetUnreadNotificationCountQueryKey 
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, AlertTriangle, Info, Check, Bell, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { useLocation } from "wouter";

const SEVERITY_CONFIG = {
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/30 border-blue-200" },
  warning: { icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/30 border-amber-200" },
  urgent: { icon: AlertTriangle, color: "text-red-500", bg: "bg-red-50 dark:bg-red-950/30 border-red-200" },
};

export default function NotificationsPage() {
  const { user } = useAuthContext();
  const isAuthed = !!user?.id;
  const qc = useQueryClient();
  const [, setLocation] = useLocation();

  const { data: notifications = [], isLoading } = useListNotifications({ query: { queryKey: getListNotificationsQueryKey(), enabled: isAuthed } });
  
  const markRead = useMarkNotificationRead({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() }); qc.invalidateQueries({ queryKey: getGetUnreadNotificationCountQueryKey() }); } } });
  const markAllRead = useMarkAllNotificationsRead({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListNotificationsQueryKey() }); qc.invalidateQueries({ queryKey: getGetUnreadNotificationCountQueryKey() }); } } });

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-10">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Bell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </div>
          <div>
            <h1 className="text-[22px] font-bold text-gray-900 dark:text-white tracking-tight">การแจ้งเตือน</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">คุณมี {unreadCount} ข้อความที่ยังไม่ได้อ่าน</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <button onClick={() => markAllRead.mutate()} className="btn-secondary text-[12px] flex items-center gap-1.5 py-1.5 px-3">
            <Check className="w-3.5 h-3.5" /> อ่านทั้งหมด
          </button>
        )}
      </div>

      <div className="card-premium overflow-hidden divide-y divide-gray-50 dark:divide-gray-800/60">
        {isLoading ? (
          [...Array(5)].map((_, i) => <div key={i} className="p-4"><div className="skeleton h-16" /></div>)
        ) : notifications.length === 0 ? (
          <div className="p-10 text-center text-gray-400">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-3 text-green-500 opacity-50" />
            <p className="font-medium text-[14px]">ไม่มีการแจ้งเตือนใหม่</p>
          </div>
        ) : (
          notifications.map(n => {
            const cfg = SEVERITY_CONFIG[n.severity as keyof typeof SEVERITY_CONFIG] || SEVERITY_CONFIG.info;
            const Icon = cfg.icon;
            return (
              <div key={n.id} className={cn("p-4 md:p-5 flex gap-4 transition-colors hover:bg-gray-50/50 dark:hover:bg-gray-800/30", !n.read ? "bg-green-50/20 dark:bg-green-950/10" : "opacity-75")}>
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0 border", cfg.bg)}>
                  <Icon className={cn("w-5 h-5", cfg.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h3 className={cn("text-[14px] font-bold leading-tight", !n.read ? "text-gray-900 dark:text-white" : "text-gray-700 dark:text-gray-300")}>{n.title}</h3>
                    <span className="text-[10px] text-gray-400 shrink-0 whitespace-nowrap">
                      {new Date(n.createdAt).toLocaleDateString("th-TH", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed mb-3">{n.body}</p>
                  
                  <div className="flex items-center gap-3">
                    {n.relatedPath && (
                      <button onClick={() => { if(!n.read) markRead.mutate({ id: n.id }); setLocation(n.relatedPath!); }} className="text-[11px] font-semibold text-green-600 dark:text-green-400 hover:underline flex items-center gap-1">
                        ดูรายละเอียด <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                    {!n.read && (
                      <button onClick={() => markRead.mutate({ id: n.id })} className="text-[11px] font-medium text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                        ทำเครื่องหมายว่าอ่านแล้ว
                      </button>
                    )}
                  </div>
                </div>
                {!n.read && <div className="w-2 h-2 rounded-full bg-green-500 shrink-0 mt-2" />}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
