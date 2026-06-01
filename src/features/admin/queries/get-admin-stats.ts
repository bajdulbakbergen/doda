import "server-only";
import { createClient } from "@/lib/supabase/server";

export type AdminStats = {
  totalUsers: number;
  verifiedUsers: number;
  pendingVerifications: number;
  totalLots: number;
  openLots: number;
  totalDeals: number;
  closedDeals: number;
  totalConsents: number;
  pendingDeletions: number;
};

export async function getAdminStats(): Promise<AdminStats> {
  const supabase = await createClient();
  const [u, vu, pv, l, ol, d, cd, c, pd] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("is_verified", true),
    supabase
      .from("verifications")
      .select("id", { count: "exact", head: true })
      .eq("status", "pending"),
    supabase.from("lots").select("id", { count: "exact", head: true }),
    supabase
      .from("lots")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "closing"]),
    supabase.from("deals").select("id", { count: "exact", head: true }),
    supabase
      .from("deals")
      .select("id", { count: "exact", head: true })
      .eq("status", "closed"),
    supabase.from("user_consents").select("id", { count: "exact", head: true }),
    supabase
      .from("account_deletion_requests")
      .select("user_id", { count: "exact", head: true })
      .is("cancelled_at", null),
  ]);

  return {
    totalUsers: u.count ?? 0,
    verifiedUsers: vu.count ?? 0,
    pendingVerifications: pv.count ?? 0,
    totalLots: l.count ?? 0,
    openLots: ol.count ?? 0,
    totalDeals: d.count ?? 0,
    closedDeals: cd.count ?? 0,
    totalConsents: c.count ?? 0,
    pendingDeletions: pd.count ?? 0,
  };
}

export type AdminUserRow = {
  id: string;
  display_name: string;
  slug: string;
  is_verified: boolean;
  is_admin: boolean;
  created_at: string;
  consents_count: number;
  email: string | null;
};

export type AdminUsersFilters = {
  page?: number;
  pageSize?: number;
  search?: string;
};

export type AdminUsersPage = {
  rows: AdminUserRow[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
};

const ADMIN_USERS_PAGE_SIZE = 50;

export async function getAdminUsers(filters: AdminUsersFilters = {}): Promise<AdminUsersPage> {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? ADMIN_USERS_PAGE_SIZE));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;
  const search = filters.search?.trim();

  let query = supabase
    .from("profiles")
    .select(
      `id, display_name, slug, is_verified, is_admin, created_at,
       user_consents(document_slug)`,
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (search) {
    query = query.or(`display_name.ilike.%${search}%,slug.ilike.%${search}%`);
  }

  const { data, count } = await query;
  if (!data) {
    return { rows: [], total: 0, page, pageSize, totalPages: 0 };
  }

  const rows: AdminUserRow[] = data.map((p) => ({
    id: p.id,
    display_name: p.display_name,
    slug: p.slug,
    is_verified: p.is_verified,
    is_admin: p.is_admin,
    created_at: p.created_at,
    email: null,
    consents_count: Array.isArray(p.user_consents) ? p.user_consents.length : 0,
  }));

  const total = count ?? 0;
  return {
    rows,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  };
}

export type AdminUserDetail = {
  profile: {
    id: string;
    display_name: string;
    slug: string;
    is_verified: boolean;
    is_admin: boolean;
    city: string | null;
    bio: string | null;
    avatar_url: string | null;
    created_at: string;
  };
  consents: Array<{
    document_slug: string;
    document_version: string;
    accepted_at: string;
    source: string;
    ip: string | null;
    user_agent: string | null;
  }>;
  verifications: Array<{
    id: string;
    entity_type: string;
    legal_name: string;
    bin: string;
    status: string;
    submitted_at: string;
    reviewed_at: string | null;
    reviewer_notes: string | null;
  }>;
  recentActions: Array<{
    id: string;
    action: string;
    target_type: string | null;
    target_id: string | null;
    metadata: unknown;
    created_at: string;
  }>;
  deletionRequest: {
    requested_at: string;
    scheduled_for: string;
    cancelled_at: string | null;
    reason: string | null;
  } | null;
};

export async function getAdminUserDetail(userId: string): Promise<AdminUserDetail | null> {
  const supabase = await createClient();
  const [profileRes, consentsRes, verificationsRes, auditRes, deletionRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", userId).maybeSingle(),
    supabase
      .from("user_consents")
      .select("document_slug, document_version, accepted_at, source, ip, user_agent")
      .eq("user_id", userId)
      .order("accepted_at", { ascending: false }),
    supabase
      .from("verifications")
      .select("id, entity_type, legal_name, bin, status, submitted_at, reviewed_at, reviewer_notes")
      .eq("user_id", userId)
      .order("submitted_at", { ascending: false }),
    supabase
      .from("audit_logs")
      .select("id, action, target_type, target_id, metadata, created_at")
      .eq("actor_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("account_deletion_requests")
      .select("requested_at, scheduled_for, cancelled_at, reason")
      .eq("user_id", userId)
      .maybeSingle(),
  ]);

  if (!profileRes.data) return null;

  return {
    profile: profileRes.data,
    consents: consentsRes.data ?? [],
    verifications: verificationsRes.data ?? [],
    recentActions: auditRes.data ?? [],
    deletionRequest: deletionRes.data ?? null,
  };
}
