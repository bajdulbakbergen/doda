import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type RatingStats = {
  totalReviews: number;
  averageRating: number;
  totalDeals: number;
  completedDeals: number;
  cancelledDeals: number;
  asCustomer: number;
  asContractor: number;
};

export const getRatingStats = cache(async (profileId: string): Promise<RatingStats> => {
  const supabase = await createClient();

  const [reviewsRes, dealsRes] = await Promise.all([
    supabase.from("reviews").select("rating").eq("reviewee_id", profileId),
    supabase
      .from("deals")
      .select("id, status, customer_id, contractor_id")
      .or(`customer_id.eq.${profileId},contractor_id.eq.${profileId}`),
  ]);

  const reviews = reviewsRes.data ?? [];
  const deals = dealsRes.data ?? [];

  const totalReviews = reviews.length;
  const averageRating =
    totalReviews > 0
      ? reviews.reduce((sum, r) => sum + Number(r.rating), 0) / totalReviews
      : 0;

  const completedDeals = deals.filter((d) => d.status === "closed").length;
  const cancelledDeals = deals.filter((d) => d.status === "cancelled").length;
  const asCustomer = deals.filter((d) => d.customer_id === profileId).length;
  const asContractor = deals.filter((d) => d.contractor_id === profileId).length;

  return {
    totalReviews,
    averageRating,
    totalDeals: deals.length,
    completedDeals,
    cancelledDeals,
    asCustomer,
    asContractor,
  };
});
