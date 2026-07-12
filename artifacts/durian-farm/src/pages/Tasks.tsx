import { useState } from "react";
import { 
  useListTasks, useCreateTask, useUpdateTask, useDeleteTask, useGetTaskSummary,
  getListTasksQueryKey, getGetTaskSummaryQueryKey, useListPlots, useListWorkers, getListPlotsQueryKey, getListWorkersQueryKey,
  Task, TaskStatus, TaskPriority, TaskInputStatus, TaskInputPriority
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Plus, CheckCircle2, Clock, Circle, MoreVertical, Pencil, Trash2, Calendar, MapPin, User, AlertCircle, X, Check, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PRIORITIES = [
  { value: "low", label: "ต่ำ", color: "text-gray-600 dark:text-gray-400", bg: "bg-gray-100 dark:bg-gray-800 border border-gray-200/50" },
  { value: "medium", label: "ปานกลาง", color: "text-blue-700 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50" },
  { value: "high", label: "สูง", color: "text-amber-700 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50" },
  { value: "urgent", label: "ด่วน", color: "text-red-700 dark:text-red-400", bg: "bg-red-50 dark:bg-red-950/30 border border-red-200/50" },
];

const STATUSES = [
  { value: "todo", label: "รอดำเนินการ", icon: Circle, color: "text-gray-400", activeBg: "bg-gray-100 dark:bg-gray-800" },
  { value: "in_progress", label: "กำลังทำ", icon: Clock, color: "text-amber-500", activeBg: "bg-amber-100 dark:bg-amber-900/30" },
  { value: "done", label: "เสร็จสิ้น", icon: CheckCircle2, color: "text-green-500", activeBg: "bg-green-100 dark:bg-green-900/30" },
];

const emptyForm = () => ({ title: "", description: "", status: "todo" as TaskInputStatus, priority: "medium" as TaskInputPriority, category: "", plotId: "", workerId: "", dueDate: "" });

export default function Tasks() {
  const { user } = useAuthContext();
  const { toast } = useToast();
  const isAuthed = !!user?.id;
  const qc = useQueryClient();

  const { data: tasks = [], isLoading } = useListTasks({}, { query: { queryKey: getListTasksQueryKey(), enabled: isAuthed } });
  const { data: summary } = useGetTaskSummary({ query: { queryKey: getGetTaskSummaryQueryKey(), enabled: isAuthed } });
  const { data: plots = [] } = useListPlots({ query: { queryKey: getListPlotsQueryKey(), enabled: isAuthed } });
  const { data: workers = [] } = useListWorkers({ query: { queryKey: getListWorkersQueryKey(), enabled: isAuthed } });

  const createTask = useCreateTask({ 
    mutation: { 
      onSuccess: () => { 
        qc.invalidateQueries({ queryKey: getListTasksQueryKey() }); 
        qc.invalidateQueries({ queryKey: getGetTaskSummaryQueryKey() }); 
        setShowForm(false); 
        setForm(emptyForm()); 
        toast({ title: "เพิ่มงานสำเร็จ", description: "บันทึกงานใหม่เข้าสู่ระบบเรียบร้อยแล้ว" });
      },
      onError: () => toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถเพิ่มงานได้", variant: "destructive" })
    } 
  });
  
  const updateTask = useUpdateTask({ 
    mutation: { 
      onSuccess: () => { 
        qc.invalidateQueries({ queryKey: getListTasksQueryKey() }); 
        qc.invalidateQueries({ queryKey: getGetTaskSummaryQueryKey() }); 
        setEditId(null); 
        setForm(emptyForm()); 
        setShowForm(false);
      },
      onError: () => toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถอัปเดตงานได้", variant: "destructive" })
    } 
  });
  
  const deleteTask = useDeleteTask({ 
    mutation: { 
      onSuccess: () => { 
        qc.invalidateQueries({ queryKey: getListTasksQueryKey() }); 
        qc.invalidateQueries({ queryKey: getGetTaskSummaryQueryKey() }); 
        toast({ title: "ลบงานสำเร็จ" });
      },
      onError: () => toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถลบงานได้", variant: "destructive" })
    } 
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [activeTab, setActiveTab] = useState<"todo" | "in_progress" | "done">("todo");

  function startEdit(t: Task) {
    setEditId(t.id);
    setForm({
      title: t.title, description: t.description || "", status: t.status, priority: t.priority, category: t.category || "",
      plotId: t.plotId ? String(t.plotId) : "", workerId: t.workerId ? String(t.workerId) : "", dueDate: t.dueDate || ""
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const data = {
      title: form.title, description: form.description || undefined, status: form.status, priority: form.priority, category: form.category || undefined,
      plotId: form.plotId ? parseInt(form.plotId) : undefined, workerId: form.workerId ? parseInt(form.workerId) : undefined, dueDate: form.dueDate || undefined
    };
    editId !== null ? updateTask.mutate({ id: editId, data }) : createTask.mutate({ data });
  }

  function handleStatusChange(id: number, status: TaskInputStatus) {
    updateTask.mutate({ id, data: { status } });
    if (status === "done") {
      toast({ title: "ทำเครื่องหมายเสร็จสิ้น", description: "งานถูกย้ายไปยังสถานะเสร็จสิ้นแล้ว" });
    }
  }

  const getPriorityInfo = (p: string) => PRIORITIES.find(x => x.value === p) || PRIORITIES[0];
  const getPlotName = (id: number | null | undefined) => plots.find(p => p.id === id)?.name;
  const getWorkerName = (id: number | null | undefined) => workers.find(w => w.id === id)?.name;

  const filteredTasks = tasks.filter(t => t.status === activeTab);

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-10 page-enter stagger">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-center shrink-0">
            <ClipboardList className="w-6 h-6 text-green-600 dark:text-green-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white tracking-tight">กระดานงานฟาร์ม</h1>
            <p className="text-sm text-gray-500 mt-1">วางแผน ติดตาม และจัดการงานของคนงานและแปลงต่างๆ</p>
          </div>
        </div>
        <button onClick={() => { setShowForm(!showForm); setEditId(null); setForm(emptyForm()); }} className="btn-primary text-sm shadow-sm">
          {showForm && !editId ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {showForm && !editId ? "ยกเลิก" : "มอบหมายงานใหม่"}
        </button>
      </div>

      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="stat-card border-l-4 border-l-gray-300 dark:border-l-gray-600 relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity">
              <Circle className="w-24 h-24 -mt-4 -mr-4" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">รอดำเนินการ</p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white num">{summary.todo}</p>
          </div>
          <div className="stat-card border-l-4 border-l-amber-400 relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity text-amber-500">
              <Clock className="w-24 h-24 -mt-4 -mr-4" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">กำลังทำ</p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white num">{summary.inProgress}</p>
          </div>
          <div className="stat-card border-l-4 border-l-green-500 relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity text-green-500">
              <CheckCircle2 className="w-24 h-24 -mt-4 -mr-4" />
            </div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">เสร็จสิ้นแล้ว</p>
            <p className="text-3xl font-extrabold text-gray-900 dark:text-white num">{summary.done}</p>
          </div>
          <div className="stat-card border-l-4 border-l-red-500 bg-red-50/30 dark:bg-red-950/10 relative overflow-hidden group">
            <div className="absolute right-0 top-0 opacity-5 group-hover:opacity-10 transition-opacity text-red-500">
              <AlertCircle className="w-24 h-24 -mt-4 -mr-4" />
            </div>
            <p className="text-xs font-semibold text-red-500/80 uppercase tracking-wider mb-2">เลยกำหนด</p>
            <p className="text-3xl font-extrabold text-red-600 dark:text-red-500 num">{summary.overdue}</p>
          </div>
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="card-premium p-6 sm:p-8 fade-up border-green-100 dark:border-green-900/30 shadow-md">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 dark:border-gray-800 pb-4">
            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center">
              <Pencil className="w-4 h-4 text-green-700 dark:text-green-400" />
            </div>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white">{editId ? "แก้ไขรายละเอียดงาน" : "มอบหมายงานใหม่"}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ชื่องาน <span className="text-red-500">*</span></label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="input-base text-sm py-3" placeholder="เช่น ใส่ปุ๋ยแปลงเหนือ, ตัดหญ้า" required autoFocus />
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">สถานะ <span className="text-red-500">*</span></label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as TaskInputStatus })} className="input-base cursor-pointer">
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ความสำคัญ <span className="text-red-500">*</span></label>
              <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value as TaskInputPriority })} className="input-base cursor-pointer">
                {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">แปลงที่เกี่ยวข้อง</label>
              <select value={form.plotId} onChange={e => setForm({ ...form, plotId: e.target.value })} className="input-base cursor-pointer">
                <option value="">-- ไม่ระบุ --</option>
                {plots.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">ผู้รับผิดชอบ</label>
              <select value={form.workerId} onChange={e => setForm({ ...form, workerId: e.target.value })} className="input-base cursor-pointer">
                <option value="">-- ไม่ระบุ --</option>
                {workers.map(w => <option key={w.id} value={w.id}>{w.name}</option>)}
              </select>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">กำหนดเสร็จ</label>
              <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="input-base cursor-pointer" />
            </div>
            
            <div className="flex flex-col gap-2 sm:col-span-2">
              <label className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">รายละเอียดเพิ่มเติม</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-base h-24 resize-none" placeholder="อธิบายขั้นตอนหรืออุปกรณ์ที่ต้องใช้ (ไม่บังคับ)" />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-8 pt-5 border-t border-gray-100 dark:border-gray-800">
            <button type="button" onClick={() => { setShowForm(false); setEditId(null); setForm(emptyForm()); }} className="btn-secondary text-sm">ยกเลิก</button>
            <button type="submit" disabled={createTask.isPending || updateTask.isPending} className="btn-primary text-sm min-w-[120px] justify-center">
              {(createTask.isPending || updateTask.isPending) ? (
                 <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/> กำลังบันทึก...</span>
              ) : "บันทึกงาน"}
            </button>
          </div>
        </form>
      )}

      <div className="card-premium overflow-hidden">
        <div className="flex bg-gray-50/50 dark:bg-gray-900/50 border-b border-gray-100 dark:border-gray-800 p-2 gap-2">
          {STATUSES.map(s => {
            const isActive = activeTab === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setActiveTab(s.value as any)}
                className={cn(
                  "flex-1 py-2.5 px-4 text-sm font-bold transition-all rounded-xl flex items-center justify-center gap-2.5 focus-ring",
                  isActive 
                    ? "bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10" 
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-black/5 dark:hover:bg-white/5"
                )}
              >
                <s.icon className={cn("w-4 h-4", isActive ? s.color : "text-gray-400")} /> 
                {s.label}
                <span className={cn(
                  "ml-1 text-xs px-2 py-0.5 rounded-full font-semibold tabular-nums",
                  isActive ? s.activeBg : "bg-transparent text-gray-400"
                )}>
                  {tasks.filter(t => t.status === s.value).length}
                </span>
              </button>
            );
          })}
        </div>

        <div className="p-4 sm:p-5 bg-white dark:bg-gray-900 min-h-[300px]">
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => <div key={i} className="skeleton h-[100px] rounded-xl" />)}
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 fade-up">
              <div className="w-16 h-16 bg-gray-50 dark:bg-gray-800/80 rounded-2xl flex items-center justify-center mb-4 text-gray-300 dark:text-gray-600">
                <ClipboardList className="w-8 h-8" />
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 mb-1">ไม่มีงานในสถานะนี้</h3>
              <p className="text-sm text-gray-500 max-w-[250px]">
                {activeTab === "todo" ? "ยังไม่มีงานที่รอดำเนินการ กดปุ่มมอบหมายงานใหม่เพื่อเริ่มต้น" : 
                 activeTab === "in_progress" ? "ยังไม่มีงานที่กำลังดำเนินการในขณะนี้" : 
                 "ยังไม่มีงานที่ทำเสร็จสิ้น"}
              </p>
              {activeTab === "todo" && (
                <button onClick={() => setShowForm(true)} className="mt-5 btn-secondary text-sm">
                  <Plus className="w-4 h-4" /> มอบหมายงาน
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task, idx) => {
                const prio = getPriorityInfo(task.priority);
                const plotName = getPlotName(task.plotId);
                const workerName = getWorkerName(task.workerId);
                const isOverdue = task.dueDate && task.status !== "done" && new Date(task.dueDate) < new Date(new Date().setHours(0,0,0,0));
                
                return (
                  <div 
                    key={task.id} 
                    className={cn(
                      "group p-4 sm:p-5 rounded-xl border flex gap-4 transition-all duration-200 animate-in fade-in slide-in-from-bottom-2",
                      task.status === "done" 
                        ? "bg-gray-50/50 dark:bg-gray-800/20 border-transparent opacity-75 hover:opacity-100" 
                        : "bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800 hover:border-green-300 dark:hover:border-green-700 hover:shadow-sm"
                    )}
                    style={{ animationDelay: `${idx * 50}ms`}}
                  >
                    <button
                      onClick={() => handleStatusChange(task.id, task.status === "done" ? "todo" : "done")}
                      aria-label={task.status === "done" ? "เปลี่ยนเป็นยังไม่เสร็จ" : "ทำเครื่องหมายว่าเสร็จแล้ว"}
                      className={cn(
                        "w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all focus-ring focus:ring-offset-1 focus:ring-green-400", 
                        task.status === "done" 
                          ? "bg-green-500 border-green-500 text-white" 
                          : "border-gray-300 dark:border-gray-600 text-transparent hover:border-green-500 hover:text-green-500"
                      )}
                    >
                      <Check className="w-4 h-4 stroke-[3]" />
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                        <div className="pr-4">
                          <h3 className={cn("text-base font-bold transition-colors", task.status === "done" ? "text-gray-500 line-through" : "text-gray-900 dark:text-white group-hover:text-green-700 dark:group-hover:text-green-400")}>
                            {task.title}
                          </h3>
                          {task.description && <p className={cn("text-sm mt-1 line-clamp-2", task.status === "done" ? "text-gray-400" : "text-gray-600 dark:text-gray-400")}>{task.description}</p>}
                        </div>
                        <span className={cn("px-2.5 py-1 rounded-md text-[11px] font-bold shrink-0 self-start inline-flex items-center", prio.bg, prio.color)}>
                          ความสำคัญ: {prio.label}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-4 flex-wrap">
                        {plotName && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                            <MapPin className="w-3.5 h-3.5" /> {plotName}
                          </span>
                        )}
                        {workerName && (
                          <span className="flex items-center gap-1.5 text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-md">
                            <User className="w-3.5 h-3.5" /> {workerName}
                          </span>
                        )}
                        {task.dueDate && (
                          <span className={cn(
                            "flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-md", 
                            isOverdue 
                              ? "text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400" 
                              : "text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800"
                          )}>
                            {isOverdue ? <AlertCircle className="w-3.5 h-3.5" /> : <Calendar className="w-3.5 h-3.5" />}
                            {new Date(task.dueDate).toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })}
                            {isOverdue && " (เลยกำหนด)"}
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-1.5 shrink-0 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => startEdit(task)} 
                        aria-label="แก้ไขงาน" 
                        title="แก้ไข" 
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-900/30 rounded-xl transition-all focus-ring focus:opacity-100"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => { if(confirm(`คุณแน่ใจหรือไม่ที่จะลบงาน "${task.title}"?`)) deleteTask.mutate({ id: task.id }); }} 
                        aria-label="ลบงาน" 
                        title="ลบ" 
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-xl transition-all focus-ring focus:opacity-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
