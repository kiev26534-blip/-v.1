import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/hooks/use-auth";
import { useGoodnessRecords } from "@/hooks/use-goodness";
import { useAnnouncements } from "@/hooks/use-announcements";
import { useUsers } from "@/hooks/use-users";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { 
  Users, 
  Megaphone, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Trash2,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function AdminDashboard() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      setLocation("/");
    }
  }, [user, setLocation]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      
      <main className="container px-4 py-8 mx-auto">
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-slate-800">
            แผงควบคุมผู้ดูแลระบบ
          </h1>
          <p className="text-slate-500 mt-2">จัดการประกาศ ตรวจสอบความดี และข้อมูลสมาชิก</p>
        </div>

        <Tabs defaultValue="approve" className="space-y-8">
          <TabsList className="bg-white p-1 rounded-2xl shadow-sm border border-slate-200">
            <TabsTrigger value="approve" className="rounded-xl px-6">ตรวจสอบความดี</TabsTrigger>
            <TabsTrigger value="announcements" className="rounded-xl px-6">จัดการประกาศ</TabsTrigger>
            <TabsTrigger value="users" className="rounded-xl px-6">จัดการสมาชิก</TabsTrigger>
          </TabsList>

          <TabsContent value="approve">
             <PendingReviews />
          </TabsContent>

          <TabsContent value="announcements">
             <ManageAnnouncements />
          </TabsContent>

          <TabsContent value="users">
             <ManageUsers />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function PendingReviews() {
  const { records, isLoading, reviewRecord } = useGoodnessRecords({ status: "pending" });
  const [selectedRecord, setSelectedRecord] = useState<number | null>(null);
  const [points, setPoints] = useState<number>(5);
  const [feedback, setFeedback] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleReview = (status: "approved" | "rejected") => {
     if (selectedRecord === null) return;
     
     reviewRecord.mutate({
       id: selectedRecord,
       data: {
         status,
         pointsAwarded: status === 'approved' ? points : 0,
         adminFeedback: feedback
       }
     });
     setIsDialogOpen(false);
     setFeedback("");
     setPoints(5);
  };

  const openReview = (id: number) => {
    setSelectedRecord(id);
    setIsDialogOpen(true);
  }

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="grid gap-6">
      {records && records.length > 0 ? (
        records.map((record) => (
          <Card key={record.id} className="overflow-hidden border-none shadow-lg">
            <CardContent className="p-0 flex flex-col md:flex-row">
              <div className="flex-1 p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold text-lg text-blue-900">
                    {record.user ? `${record.user.firstName} ${record.user.lastName}` : "Unknown User"}
                  </span>
                  <span className="text-slate-400 text-sm bg-slate-100 px-2 py-0.5 rounded-full">
                    {format(new Date(record.datePerformed), "d MMM yyyy", { locale: th })}
                  </span>
                </div>
                <p className="text-slate-700 mb-4">{record.description}</p>
                {record.imageUrl && (
                   <a href={record.imageUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-sm hover:underline inline-flex items-center gap-1">
                     ดูรูปภาพแนบ
                   </a>
                )}
              </div>
              <div className="bg-slate-50 p-6 flex items-center gap-3 border-t md:border-t-0 md:border-l border-slate-100 justify-end md:justify-center w-full md:w-auto">
                <Dialog open={isDialogOpen && selectedRecord === record.id} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
                  <DialogTrigger asChild>
                    <Button onClick={() => openReview(record.id)} className="bg-blue-600 hover:bg-blue-700">
                      ตรวจสอบ
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>ตรวจสอบความดี</DialogTitle>
                      <DialogDescription>
                        รายละเอียด: {record.description}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                      <div className="space-y-2">
                        <Label>คะแนนที่จะให้</Label>
                        <Input 
                          type="number" 
                          value={points} 
                          onChange={(e) => setPoints(Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>ความคิดเห็น (Optional)</Label>
                        <Textarea 
                          value={feedback} 
                          onChange={(e) => setFeedback(e.target.value)} 
                          placeholder="เช่น ยอดเยี่ยมมาก, ควรเพิ่มรายละเอียด"
                        />
                      </div>
                      <div className="flex gap-3 pt-4">
                        <Button 
                          className="flex-1 bg-green-600 hover:bg-green-700" 
                          onClick={() => handleReview("approved")}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" /> อนุมัติ
                        </Button>
                        <Button 
                          className="flex-1" 
                          variant="destructive"
                          onClick={() => handleReview("rejected")}
                        >
                          <XCircle className="w-4 h-4 mr-2" /> ปฏิเสธ
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-100">
          <CheckCircle className="w-16 h-16 text-green-200 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-800">ตรวจสอบครบแล้ว</h3>
          <p className="text-slate-500">ไม่มีรายการรอตรวจสอบในขณะนี้</p>
        </div>
      )}
    </div>
  );
}

function ManageAnnouncements() {
  const { announcements, isLoading, createAnnouncement, deleteAnnouncement } = useAnnouncements();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createAnnouncement.mutateAsync({ title, content, imageUrl });
    setIsOpen(false);
    setTitle("");
    setContent("");
    setImageUrl("");
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">รายการประกาศทั้งหมด</h2>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" /> เพิ่มประกาศ
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>เพิ่มประกาศใหม่</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>หัวข้อ</Label>
                <Input value={title} onChange={e => setTitle(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>เนื้อหา</Label>
                <Textarea value={content} onChange={e => setContent(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>รูปภาพ URL</Label>
                <Input value={imageUrl} onChange={e => setImageUrl(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">โพสต์ประกาศ</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? <div>Loading...</div> : announcements?.map((ann) => (
          <Card key={ann.id} className="flex flex-row items-center p-4 gap-4">
            <div className="flex-1">
              <h3 className="font-bold">{ann.title}</h3>
              <p className="text-sm text-slate-500 line-clamp-1">{ann.content}</p>
            </div>
            <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50 hover:text-red-600" onClick={() => deleteAnnouncement.mutate(ann.id)}>
              <Trash2 className="w-5 h-5" />
            </Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

function ManageUsers() {
  const { users, isLoading, updateUser } = useUsers();
  
  if (isLoading) return <div>Loading...</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>รายชื่อสมาชิกทั้งหมด</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users?.map(u => (
            <div key={u.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <div className="font-bold">{u.firstName} {u.lastName}</div>
                <div className="text-sm text-slate-500">@{u.username} • {u.classLevel || "ไม่ระบุชั้น"}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm font-medium text-blue-600">{u.points} แต้ม</div>
                <Select 
                  defaultValue={u.role} 
                  onValueChange={(val) => updateUser.mutate({ id: u.id, role: val as "admin" | "student" })}
                >
                  <SelectTrigger className="w-32 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">นักเรียน</SelectItem>
                    <SelectItem value="admin">ผู้ดูแล</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
