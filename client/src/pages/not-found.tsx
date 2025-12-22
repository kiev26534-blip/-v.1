import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-slate-50 text-slate-900">
      <div className="p-8 bg-white rounded-3xl shadow-xl text-center max-w-md w-full border border-slate-100">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500 animate-bounce">
          <AlertCircle className="w-10 h-10" />
        </div>
        
        <h1 className="text-4xl font-bold text-slate-900 mb-2">404</h1>
        <h2 className="text-xl font-medium text-slate-600 mb-6">ไม่พบหน้านี้</h2>
        
        <p className="text-slate-500 mb-8 leading-relaxed">
          หน้าเว็บที่คุณพยายามเข้าถึงอาจถูกย้าย หรือไม่มีอยู่ในระบบ
        </p>

        <Link href="/">
          <Button className="w-full h-12 text-lg rounded-xl bg-slate-900 hover:bg-slate-800">
            กลับหน้าแรก
          </Button>
        </Link>
      </div>
    </div>
  );
}
