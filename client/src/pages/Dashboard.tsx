import { useState } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useGoodnessRecords } from "@/hooks/use-goodness";
import { format } from "date-fns";
import { th } from "date-fns/locale";
import { motion } from "framer-motion";
import { 
  Trophy, 
  Send, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  Calendar as CalendarIcon, 
  ImageIcon 
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Dashboard() {
  const { user } = useAuth();
  
  if (!user) return null; // Protected by redirect in useAuth

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      <main className="container px-4 py-8 mx-auto">
        {/* Welcome Section */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">
            สวัสดี, <span className="text-primary">{user.firstName}</span>
          </h1>
          <p className="text-slate-500 mt-2">ยินดีต้อนรับสู่ระบบสะสมความดี</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {/* User Info Card */}
          <Card className="bg-white rounded-3xl border-none shadow-xl shadow-slate-200/50 overflow-hidden relative group">
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-400" />
            <CardContent className="pt-8 text-center relative z-10">
              <div className="w-24 h-24 bg-gradient-to-tr from-blue-100 to-cyan-100 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl font-bold text-blue-600 border-4 border-white shadow-lg">
                {user.firstName.charAt(0)}
              </div>
              <h2 className="text-xl font-bold text-slate-800">{user.firstName} {user.lastName}</h2>
              <div className="flex justify-center gap-2 mt-2">
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                  {user.studentNumber ? `เลขที่ ${user.studentNumber}` : "ไม่ระบุเลขที่"}
                </Badge>
                <Badge variant="secondary" className="bg-slate-100 text-slate-600">
                  {user.classLevel || "ไม่ระบุชั้น"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Points Card */}
          <Card className="bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-3xl border-none shadow-xl shadow-blue-500/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16" />
            <CardContent className="pt-8 flex flex-col items-center justify-center h-full relative z-10">
              <Trophy className="w-12 h-12 text-yellow-300 mb-2 drop-shadow-md" />
              <div className="text-5xl font-extrabold tracking-tight mb-1 text-white drop-shadow-sm">
                {user.points}
              </div>
              <p className="text-blue-100 font-medium">แต้มความดีสะสม</p>
            </CardContent>
          </Card>

          {/* Action Card */}
          <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 flex flex-col justify-center items-center border border-slate-100">
             <SubmitGoodnessDialog userId={user.id} />
             <p className="text-slate-400 text-sm mt-4 text-center">
               ทำความดีแล้วอย่าลืมบันทึก<br/>เพื่อสะสมแต้มแลกรางวัล
             </p>
          </div>
        </div>

        {/* History Section */}
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-8 border border-slate-100">
          <Tabs defaultValue="history">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-500" />
                ประวัติการทำความดี
              </h3>
              <TabsList>
                <TabsTrigger value="history">ทั้งหมด</TabsTrigger>
                <TabsTrigger value="pending">รอตรวจสอบ</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="history" className="mt-0">
              <HistoryList userId={user.id} />
            </TabsContent>
            
            <TabsContent value="pending" className="mt-0">
              <HistoryList userId={user.id} status="pending" />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}

function HistoryList({ userId, status }: { userId: number, status?: "pending" | "approved" | "rejected" }) {
  const { records, isLoading } = useGoodnessRecords({ userId, status });

  if (isLoading) return <div className="py-20 text-center text-slate-400">กำลังโหลดข้อมูล...</div>;
  if (!records || records.length === 0) return (
    <div className="py-20 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
        <Clock className="w-8 h-8" />
      </div>
      <p>ไม่มีประวัติการทำความดี</p>
    </div>
  );

  return (
    <div className="space-y-4">
      {records.map((record, index) => (
        <motion.div
          key={record.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex flex-col md:flex-row gap-4 p-4 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-lg hover:shadow-blue-100/50 transition-all duration-300 bg-white"
        >
          {/* Status Icon */}
          <div className="md:w-16 flex md:flex-col items-center justify-center gap-2 md:gap-1 text-xs font-medium shrink-0">
             {record.status === 'approved' && (
               <>
                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <span className="text-green-600">อนุมัติ</span>
               </>
             )}
             {record.status === 'rejected' && (
               <>
                <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center">
                  <XCircle className="w-6 h-6" />
                </div>
                <span className="text-red-600">ปฏิเสธ</span>
               </>
             )}
             {record.status === 'pending' && (
               <>
                <div className="w-10 h-10 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <span className="text-yellow-600">รอตรวจ</span>
               </>
             )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 text-sm text-slate-400 mb-1">
              <CalendarIcon className="w-4 h-4" />
              {format(new Date(record.datePerformed), "d MMMM yyyy", { locale: th })}
            </div>
            <p className="text-slate-800 font-medium text-lg leading-relaxed">{record.description}</p>
            {record.adminFeedback && (
              <div className="mt-3 p-3 bg-slate-50 rounded-xl text-sm text-slate-600 border border-slate-100">
                <span className="font-semibold text-slate-800">ความคิดเห็นจากผู้ดูแล:</span> {record.adminFeedback}
              </div>
            )}
          </div>

          <div className="flex flex-row md:flex-col gap-3 shrink-0 items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4 mt-2 md:mt-0">
             {record.pointsAwarded ? (
               <div className="text-center">
                 <span className="block text-2xl font-bold text-blue-600">+{record.pointsAwarded}</span>
                 <span className="text-xs text-slate-400">แต้ม</span>
               </div>
             ) : (
               <div className="text-center text-slate-300">
                 <span className="block text-xl font-bold">--</span>
                 <span className="text-xs">รอแต้ม</span>
               </div>
             )}
             
             {record.imageUrl && (
               <a href={record.imageUrl} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline flex items-center gap-1">
                 <ImageIcon className="w-4 h-4" />
                 ดูรูปภาพ
               </a>
             )}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

function SubmitGoodnessDialog({ userId }: { userId: number }) {
  const [open, setOpen] = useState(false);
  const { createRecord } = useGoodnessRecords();
  const [description, setDescription] = useState("");
  const [datePerformed, setDatePerformed] = useState(format(new Date(), "yyyy-MM-dd"));
  const [imageUrl, setImageUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await createRecord.mutateAsync({
        userId,
        description,
        datePerformed,
        imageUrl: imageUrl || undefined,
      });
      setOpen(false);
      setDescription("");
      setImageUrl("");
      setDatePerformed(format(new Date(), "yyyy-MM-dd"));
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/30 transition-all hover:-translate-y-1">
          <Plus className="mr-2 h-6 w-6" />
          ส่งบันทึกความดี
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md rounded-3xl border-none shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center text-slate-800">ส่งบันทึกความดี</DialogTitle>
          <DialogDescription className="text-center">
            กรอกรายละเอียดความดีที่คุณทำเพื่อสะสมแต้ม
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="date">วันที่ทำความดี</Label>
            <Input
              id="date"
              type="date"
              value={datePerformed}
              onChange={(e) => setDatePerformed(e.target.value)}
              required
              className="rounded-xl"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="desc">รายละเอียด</Label>
            <Textarea
              id="desc"
              placeholder="ฉันได้ช่วย..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="rounded-xl min-h-[100px]"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="image">ลิงก์รูปภาพ (ถ้ามี)</Label>
            <Input
              id="image"
              placeholder="https://..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="rounded-xl"
            />
          </div>

          <Button 
            type="submit" 
            className="w-full h-12 rounded-xl text-lg font-semibold bg-blue-600 hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "กำลังส่ง..." : "ยืนยันการส่ง"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
