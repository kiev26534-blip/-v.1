import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl, type InsertGoodnessRecord, type UpdateGoodnessRecordStatusRequest } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useGoodnessRecords(params?: { userId?: number; status?: "pending" | "approved" | "rejected" }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const queryKey = [api.goodness.list.path, JSON.stringify(params)];

  const { data: records, isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      const url = new URL(api.goodness.list.path, window.location.origin);
      if (params?.userId) url.searchParams.set("userId", String(params.userId));
      if (params?.status) url.searchParams.set("status", params.status);
      
      const res = await fetch(url.toString(), { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch records");
      return api.goodness.list.responses[200].parse(await res.json());
    },
  });

  const createRecord = useMutation({
    mutationFn: async (data: InsertGoodnessRecord) => {
      const res = await fetch(api.goodness.create.path, {
        method: api.goodness.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to submit record");
      return api.goodness.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.goodness.list.path] });
      toast({ title: "ส่งข้อมูลสำเร็จ", description: "บันทึกความดีของคุณถูกส่งแล้ว รอการตรวจสอบ" });
    },
    onError: () => {
      toast({ title: "เกิดข้อผิดพลาด", description: "ไม่สามารถส่งข้อมูลได้ กรุณาลองใหม่", variant: "destructive" });
    }
  });

  const reviewRecord = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateGoodnessRecordStatusRequest }) => {
      const url = buildUrl(api.goodness.review.path, { id });
      const res = await fetch(url, {
        method: api.goodness.review.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to review record");
      return api.goodness.review.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.goodness.list.path] });
      toast({ title: "บันทึกผลการตรวจสอบแล้ว", description: "ข้อมูลได้รับการอัปเดตเรียบร้อย" });
    },
  });

  return {
    records,
    isLoading,
    createRecord,
    reviewRecord,
  };
}
