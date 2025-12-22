import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertAnnouncement } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useAnnouncements() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: announcements, isLoading } = useQuery({
    queryKey: [api.announcements.list.path],
    queryFn: async () => {
      const res = await fetch(api.announcements.list.path);
      if (!res.ok) throw new Error("Failed to fetch announcements");
      return api.announcements.list.responses[200].parse(await res.json());
    },
  });

  const createAnnouncement = useMutation({
    mutationFn: async (data: InsertAnnouncement) => {
      const res = await fetch(api.announcements.create.path, {
        method: api.announcements.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create announcement");
      return api.announcements.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.announcements.list.path] });
      toast({ title: "สำเร็จ", description: "เพิ่มประกาศเรียบร้อยแล้ว" });
    },
    onError: () => {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถเพิ่มประกาศได้", variant: "destructive" });
    }
  });

  const deleteAnnouncement = useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.announcements.delete.path, { id });
      const res = await fetch(url, { 
        method: api.announcements.delete.method,
        credentials: "include" 
      });
      if (!res.ok) throw new Error("Failed to delete announcement");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.announcements.list.path] });
      toast({ title: "ลบสำเร็จ", description: "ลบประกาศเรียบร้อยแล้ว" });
    },
  });

  return {
    announcements,
    isLoading,
    createAnnouncement,
    deleteAnnouncement,
  };
}
