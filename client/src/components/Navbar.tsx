import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { 
  LogOut, 
  User, 
  LayoutDashboard, 
  Home, 
  Shield 
} from "lucide-react";
import { motion } from "framer-motion";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60"
    >
      <div className="container flex h-16 items-center px-4 md:px-8">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center text-white font-bold text-lg">
            ส
          </div>
          <span className="hidden font-display font-bold text-xl text-blue-900 sm:inline-block">
            สภานักเรียน
          </span>
        </Link>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            {/* Could add search here if needed */}
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" size="sm" className="hidden md:flex gap-2">
                <Home className="h-4 w-4" />
                หน้าแรก
              </Button>
            </Link>

            {user ? (
              <>
                <Link href={user.role === 'admin' ? "/admin" : "/dashboard"}>
                  <Button variant="ghost" size="sm" className="gap-2">
                    {user.role === 'admin' ? <Shield className="h-4 w-4" /> : <LayoutDashboard className="h-4 w-4" />}
                    {user.role === 'admin' ? "ผู้ดูแลระบบ" : "แดชบอร์ด"}
                  </Button>
                </Link>
                
                <div className="h-6 w-px bg-border mx-2 hidden sm:block" />
                
                <div className="flex items-center gap-2 text-sm font-medium mr-2 hidden sm:flex text-slate-600">
                  <User className="h-4 w-4 text-primary" />
                  {user.firstName}
                </div>
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => logout()}
                  className="rounded-full px-4"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  ออก
                </Button>
              </>
            ) : (
              <Link href="/login">
                <Button className="rounded-full bg-primary hover:bg-primary/90 px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105 active:scale-95">
                  เข้าสู่ระบบ
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </motion.nav>
  );
}
