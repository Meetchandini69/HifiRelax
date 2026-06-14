// VITE_API_URL — set this for Cloudflare Pages / external deployments
// e.g. VITE_API_URL=https://api.yourdomain.com
// Leave unset for local dev (uses Vite proxy to localhost:8080)
const API = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : `${import.meta.env.BASE_URL.replace(/\/$/, "")}/api`;

function getToken() {
  return localStorage.getItem("ec_token");
}

function headers(extra: Record<string, string> = {}) {
  const h: Record<string, string> = { "Content-Type": "application/json", ...extra };
  const t = getToken();
  if (t) h["Authorization"] = `Bearer ${t}`;
  return h;
}

async function request(url: string, options: RequestInit = {}) {
  const res = await fetch(url, { ...options, headers: headers(options.headers as any) });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export const api = {
  // Auth
  register: (body: { email: string; password: string; name: string }) =>
    request(`${API}/classifieds/auth/register`, { method: "POST", body: JSON.stringify(body) }),
  login: (body: { email: string; password: string }) =>
    request(`${API}/classifieds/auth/login`, { method: "POST", body: JSON.stringify(body) }),
  me: () => request(`${API}/classifieds/auth/me`),

  // Locations
  getLocations: () => request(`${API}/classifieds/locations`),
  getStates: () => request(`${API}/classifieds/locations/states`),
  getStatePage: (state_slug: string) => request(`${API}/classifieds/locations/state/${state_slug}`),
  getCityPage: (city_slug: string) => request(`${API}/classifieds/locations/city/${city_slug}`),
  getAreaPage: (area_slug: string) => request(`${API}/classifieds/locations/area/${area_slug}`),
  lookupLocation: (slug: string) => request(`${API}/classifieds/locations/lookup/${slug}`),
  createLocation: (body: object) => request(`${API}/classifieds/locations`, { method: "POST", body: JSON.stringify(body) }),
  updateLocation: (id: number, body: object) => request(`${API}/classifieds/locations/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteLocation: (id: number) => request(`${API}/classifieds/locations/${id}`, { method: "DELETE" }),

  // Profiles (public)
  getProfiles: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`${API}/classifieds/profiles${qs ? `?${qs}` : ""}`);
  },
  getProfileBySlug: (slug: string) => request(`${API}/classifieds/profiles/slug/${slug}`),
  getStats: () => request(`${API}/classifieds/profiles/stats`),

  // Profiles (user)
  postProfile: (body: object) => request(`${API}/classifieds/profiles`, { method: "POST", body: JSON.stringify(body) }),
  getMyProfiles: () => request(`${API}/classifieds/profiles/mine`),
  getMyProfileById: (id: number) => request(`${API}/classifieds/profiles/mine/${id}`),
  updateProfile: (id: number, body: object) => request(`${API}/classifieds/profiles/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteProfile: (id: number) => request(`${API}/classifieds/profiles/${id}`, { method: "DELETE" }),

  // Admin – Profiles
  adminGetProfiles: (params: Record<string, string> = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`${API}/classifieds/profiles/admin/all${qs ? `?${qs}` : ""}`);
  },
  adminApprove: (id: number, body: object = {}) =>
    request(`${API}/classifieds/profiles/admin/${id}/approve`, { method: "PUT", body: JSON.stringify(body) }),
  adminReject: (id: number, reason: string) =>
    request(`${API}/classifieds/profiles/admin/${id}/reject`, { method: "PUT", body: JSON.stringify({ reason }) }),
  adminDeleteProfile: (id: number) => request(`${API}/classifieds/profiles/admin/${id}`, { method: "DELETE" }),

  // Settings (public)
  getPublicSettings: () => request(`${API}/classifieds/settings/public`),

  // Settings (admin)
  adminGetSettings: () => request(`${API}/classifieds/settings`),
  adminUpdateSettings: (body: Record<string, string>) =>
    request(`${API}/classifieds/settings`, { method: "PUT", body: JSON.stringify(body) }),
  adminUpdateProfile: (body: object) =>
    request(`${API}/classifieds/settings/profile`, { method: "PUT", body: JSON.stringify(body) }),
  adminGetSeoFiles: () => request(`${API}/classifieds/settings/seo-files`),
  adminSaveSeoFiles: (body: object) =>
    request(`${API}/classifieds/settings/seo-files`, { method: "POST", body: JSON.stringify(body) }),
  adminGenerateSitemap: () => request(`${API}/classifieds/settings/generate-sitemap`),

  // Users (admin)
  adminGetAllUsers: () => request(`${API}/classifieds/settings/users`),
  adminUpdateUserStatus: (id: number, status: string) =>
    request(`${API}/classifieds/settings/users/${id}/status`, { method: "PUT", body: JSON.stringify({ status }) }),
  adminGetUsers: () => request(`${API}/classifieds/auth/admin/users`),
  adminCreateUser: (body: object) =>
    request(`${API}/classifieds/auth/admin/users`, { method: "POST", body: JSON.stringify(body) }),
  adminUpdateUser: (id: number, body: object) =>
    request(`${API}/classifieds/auth/admin/users/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  adminDeleteUser: (id: number) =>
    request(`${API}/classifieds/auth/admin/users/${id}`, { method: "DELETE" }),
  adminVerifyProfile: (id: number, verified: boolean) =>
    request(`${API}/classifieds/profiles/admin/${id}/verify`, { method: "PUT", body: JSON.stringify({ verified }) }),
  getMyLimits: () => request(`${API}/classifieds/profiles/my-limits`),

  // User account settings
  updateMe: (name: string) =>
    request(`${API}/classifieds/auth/me`, { method: "PUT", body: JSON.stringify({ name }) }),
  changePassword: (current_password: string, new_password: string) =>
    request(`${API}/classifieds/auth/change-password`, { method: "PUT", body: JSON.stringify({ current_password, new_password }) }),

  // Boosts (public)
  getBoostPlans: () => request(`${API}/classifieds/boosts/plans`),

  // Boosts (user)
  requestBoost: (profile_id: number, plan_slug: string, tier_slug?: string, addon_gallery?: boolean) =>
    request(`${API}/classifieds/boosts/request`, { method: "POST", body: JSON.stringify({ profile_id, plan_slug, tier_slug, addon_gallery }) }),
  getMyBoostRequests: () => request(`${API}/classifieds/boosts/my-requests`),

  // Boosts (admin)
  adminGetBoostRequests: (status?: string) => {
    const qs = status ? `?status=${status}` : "";
    return request(`${API}/classifieds/boosts/admin/requests${qs}`);
  },
  adminApproveBoost: (id: number, note?: string) =>
    request(`${API}/classifieds/boosts/admin/requests/${id}/approve`, { method: "PUT", body: JSON.stringify({ note }) }),
  adminRejectBoost: (id: number, note?: string) =>
    request(`${API}/classifieds/boosts/admin/requests/${id}/reject`, { method: "PUT", body: JSON.stringify({ note }) }),
  adminApplyBoost: (profile_id: number, plan_slug: string, tier_slug?: string, duration_days?: number, addon_gallery?: boolean) =>
    request(`${API}/classifieds/boosts/admin/apply`, { method: "POST", body: JSON.stringify({ profile_id, plan_slug, tier_slug, duration_days, addon_gallery }) }),
  adminRemoveBoost: (profileId: number, type?: "gallery" | "all") => {
    const qs = type ? `?type=${type}` : "";
    return request(`${API}/classifieds/boosts/admin/apply/${profileId}${qs}`, { method: "DELETE" });
  },
  adminSeedPlans: () => request(`${API}/classifieds/boosts/admin/seed-plans`, { method: "POST" }),
  adminGetBoostPlans: () => request(`${API}/classifieds/boosts/admin/plans`),
  adminUpdateBoostPlan: (id: number, body: object) =>
    request(`${API}/classifieds/boosts/admin/plans/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  adminUpdateBoostTier: (id: number, price: number) =>
    request(`${API}/classifieds/boosts/admin/tiers/${id}`, { method: "PUT", body: JSON.stringify({ price }) }),
  adminGetApprovedProfiles: () => request(`${API}/classifieds/boosts/admin/approved-profiles`),

  // Page Content (public)
  getPageContent: (page_key: string) =>
    request(`${API}/classifieds/page-content?page_key=${encodeURIComponent(page_key)}`),

  // Page Content (admin)
  adminGetPageContentList: () => request(`${API}/classifieds/page-content/admin/list`),
  adminGetAllPages: () => request(`${API}/classifieds/page-content/admin/all-pages`),
  adminUpsertPageContent: (body: object) =>
    request(`${API}/classifieds/page-content/admin/upsert`, { method: "POST", body: JSON.stringify(body) }),
  adminDeletePageContent: (id: number) =>
    request(`${API}/classifieds/page-content/admin/${id}`, { method: "DELETE" }),
};
