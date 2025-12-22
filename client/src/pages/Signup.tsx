import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import { apiRequest } from "@/lib/queryClient";

export default function Signup() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    classLevel: "",
  });
  const [error, setError] = useState("");

  const signupMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await apiRequest("POST", "/api/auth/signup", {
        username: data.username,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        classLevel: data.classLevel,
      });
      return res.json();
    },
    onSuccess: () => {
      navigate("/dashboard");
    },
    onError: (err: any) => {
      setError(err.message || "ข้อผิดพลาดในการสมัครสมาชิก");
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (!formData.username || !formData.password || !formData.firstName || !formData.lastName || !formData.classLevel) {
      setError("กรุณากรอกข้อมูลให้ครบ");
      return;
    }

    signupMutation.mutate(formData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 relative overflow-hidden p-4">
      {/* Background Blobs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-3xl animate-pulse" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-cyan-400/20 blur-3xl animate-pulse delay-1000" />

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Button 
          variant="ghost" 
          onClick={() => navigate("/login")}
          className="mb-4 -ml-4 text-slate-500 hover:text-slate-800"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          กลับไปเข้าสู่ระบบ
        </Button>
        
        <Card className="border-none shadow-2xl shadow-blue-900/10">
          <CardHeader className="space-y-1 text-center pb-8 pt-10">
            <div className="w-16 h-16 bg-gradient-to-tr from-blue-600 to-cyan-400 rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/30">
              ส.ท.
            </div>
            <CardTitle className="text-2xl font-bold text-slate-800">สมัครสมาชิก</CardTitle>
            <CardDescription className="text-slate-500">
              สร้างบัญชีใหม่เพื่อเข้าใช้งานระบบสภานักเรียนปี 69
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">ชื่อ</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="เช่น สมชาย"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">นามสกุล</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="เช่น ใจดี"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="classLevel">ชั้น/ห้อง</Label>
                <Input
                  id="classLevel"
                  name="classLevel"
                  placeholder="เช่น ม.1/1"
                  value={formData.classLevel}
                  onChange={handleChange}
                  className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="username">ชื่อผู้ใช้</Label>
                <Input
                  id="username"
                  name="username"
                  placeholder="Student ID / Username"
                  value={formData.username}
                  onChange={handleChange}
                  className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">ยืนยันรหัสผ่าน</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="rounded-xl border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.02] active:scale-[0.98] mt-6 font-semibold text-lg"
                disabled={signupMutation.isPending}
              >
                {signupMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    กำลังสมัครสมาชิก...
                  </>
                ) : (
                  "สมัครสมาชิก"
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center pb-8 pt-2">
            <p className="text-sm text-slate-400">
              ระบบสภานักเรียนปี 69
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
