import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { Users, FileText, CheckCircle, Clock, MapPin, ArrowRight } from "lucide-react";
import AdminNav from "@/components/AdminNav";

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [, nav] = useLocation();
  const [stats, setStats] = useState<any>(null);
  const [pending, setPending] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "admin")) nav("/login");
  }, [user, authLoading]);

  useEffect(() => {
    if (user?.role === "admin") {
      api.getStats().then(setStats).catch(() => {});
      api.adminGetProfiles({ status: "pending", page: "1" }).then(d => setPending(d.profiles?.slice(0, 5) || [])).catch(() => {});
      api.adminGetUsers().then(setUsers).catch(() => {});
    }
  }, [user]);

  if (authLoading) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 text-sm mt-0.5">Manage all listings, locations, and users</p>
        </div>

        <AdminNav />

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Listings", val: stats?.total || 0, icon: FileText, color: "text-blue-600 bg-blue-50" },
            { label: "Approved", val: stats?.approved || 0, icon: CheckCircle, color: "text-green-600 bg-green-50" },
            { label: "Pending Review", val: pending.length, icon: Clock, color: "text-yellow-600 bg-yellow-50" },
            { label: "Registered Users", val: users.length, icon: Users, color: "text-purple-600 bg-purple-50" },
          ].map(({ label, val, icon: Icon, color }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
              <div className={`inline-flex items-center justify-center w-9 h-9 rounded-lg ${color} mb-3`}>
                <Icon size={18} />
              </div>
              <div className="text-2xl font-bold text-gray-900">{val}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Pending Profiles */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Clock size={16} className="text-yellow-600" /> Pending Approval
              </h2>
              <Link href="/admin/profiles?status=pending" className="text-xs text-rose-600 font-medium hover:underline flex items-center gap-1">
                View all <ArrowRight size={12} />
              </Link>
            </div>
            {pending.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No pending listings</p>
            ) : (
              <div className="space-y-2">
                {pending.map(p => (
                  <div key={p.id} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0">
                      {p.photos?.[0] ? <img src={p.photos[0]} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><span className="text-gray-300 font-bold">{p.name[0]}</span></div>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{p.title}</p>
                      <p className="text-xs text-gray-500">{p.area || "—"} · {p.user_email}</p>
                    </div>
                    <Link href={`/admin/profiles?status=pending`} className="text-xs bg-rose-50 text-rose-700 hover:bg-rose-100 px-2 py-1 rounded-lg font-medium transition-colors">
                      Review
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Users */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2 mb-4">
              <Users size={16} className="text-purple-600" /> Recent Registrations
            </h2>
            {users.length === 0 ? (
              <p className="text-sm text-gray-400 text-center py-6">No users yet</p>
            ) : (
              <div className="space-y-2">
                {users.slice(0, 6).map((u: any) => (
                  <div key={u.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{u.name}</p>
                      <p className="text-xs text-gray-500">{u.email}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${u.role === "admin" ? "bg-rose-100 text-rose-700" : "bg-gray-100 text-gray-600"}`}>
                        {u.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
