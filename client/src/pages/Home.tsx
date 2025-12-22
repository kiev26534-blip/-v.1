import { Navbar } from "@/components/Navbar";
import { useAnnouncements } from "@/hooks/use-announcements";
import { motion } from "framer-motion";
import { Calendar, Megaphone, Activity } from "lucide-react";
import { format } from "date-fns";
import { th } from "date-fns/locale";

export default function Home() {
  const { announcements, isLoading } = useAnnouncements();

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 md:pt-24 md:pb-40">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 -left-20 w-72 h-72 bg-cyan-400/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="container px-4 md:px-6 mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl text-slate-900 mb-6">
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-cyan-500">
                สภานักเรียน
              </span>
              <br />
              <span className="text-2xl md:text-4xl font-medium text-slate-600 mt-2 block">
                ร่วมสร้างสรรค์ พัฒนาโรงเรียนของเรา
              </span>
            </h1>
            <p className="mx-auto max-w-[700px] text-slate-500 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mb-8">
              พื้นที่สำหรับติดตามข่าวสาร กิจกรรม และการทำความดีของนักเรียนทุกคน
            </p>
          </motion.div>
        </div>
      </section>

      {/* Announcements Section */}
      <section className="container px-4 md:px-6 mx-auto pb-20 -mt-20">
        <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-6 md:p-10 border border-slate-100">
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 rounded-2xl bg-blue-100 text-blue-600">
              <Megaphone className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800">ประกาศและข่าวสาร</h2>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : announcements && announcements.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {announcements.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="group relative bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1"
                >
                  {item.imageUrl ? (
                    <div className="h-48 overflow-hidden">
                      <img 
                        src={item.imageUrl} 
                        alt={item.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                  ) : (
                    <div className="h-48 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                      <Activity className="w-12 h-12 text-blue-200" />
                    </div>
                  )}
                  
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-400 mb-3">
                      <Calendar className="w-4 h-4" />
                      {item.createdAt && format(new Date(item.createdAt), "d MMMM yyyy", { locale: th })}
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-slate-600 line-clamp-3 text-sm leading-relaxed">
                      {item.content}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 text-slate-400">
              <Megaphone className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>ยังไม่มีประกาศในขณะนี้</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
