import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { toast } from "sonner";
import AdminNav from "@/components/AdminNav";
import { Trash2, PlusCircle, Edit2, X, Check } from "lucide-react";

interface UserRow {
  id: number;
  email: string;
  name: string;
  role: string;
  account_type: string;
  status: string;
  created_at: string;
}

const ROLES = ["user", "supervisor", "admin"];
const ACCOUNT_TYPES = ["independent", "agent"];
const STATUSES = ["active", "suspended"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<UserRow>>({});
  const [creating, setCreating] = useState(false);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "user", account_type: "independent" });
  const [search, setSearch] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.adminGetUsers();
      setUsers(data);
    } catch (err: any) {
      toast.error(err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const startEdit = (u: UserRow) => {
    setEditId(u.id);
    setEditData({ role: u.role, account_type: u.account_type, status: u.status });
  };

  const saveEdit = async () => {
    if (!editId) return;
    try {
      await api.adminUpdateUser(editId, editData);
      toast.success("User updated");
      setEditId(null);
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to update");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this user and all their data?")) return;
    try {
      await api.adminDeleteUser(id);
      toast.success("User deleted");
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.adminCreateUser(newUser);
      toast.success("User created");
      setCreating(false);
      setNewUser({ name: "", email: "", password: "", role: "user", account_type: "independent" });
      load();
    } catch (err: any) {
      toast.error(err.message || "Failed to create user");
    }
  };

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <AdminNav />
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">User Management</h1>
          <button
            onClick={() => setCreating(!creating)}
            className="flex items-center gap-1.5 text-sm font-semibold bg-rose-600 hover:bg-rose-700 text-white px-3.5 py-2 rounded-lg transition-colors"
          >
            <PlusCircle size={15} /> Add User
          </button>
        </div>

        {creating && (
          <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
            <h2 className="text-sm font-bold text-gray-800 mb-3">New User</h2>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <input required placeholder="Full name" value={newUser.name} onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input required placeholder="Email" type="email" value={newUser.email} onChange={e => setNewUser({ ...newUser, email: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <input required placeholder="Password" type="password" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm" />
              <select value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {ROLES.map(r => <option key={r}>{r}</option>)}
              </select>
              <select value={newUser.account_type} onChange={e => setNewUser({ ...newUser, account_type: e.target.value })}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm">
                {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 py-2 rounded-lg">Create</button>
              <button type="button" onClick={() => setCreating(false)} className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2">Cancel</button>
            </div>
          </form>
        )}

        <div className="mb-4">
          <input
            type="text" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full max-w-sm border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
          />
        </div>

        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400 text-sm">Loading...</div>
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No users found</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">User</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Type</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase">Joined</th>
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{u.name || "—"}</p>
                      <p className="text-xs text-gray-400">{u.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      {editId === u.id ? (
                        <select value={editData.role} onChange={e => setEditData({ ...editData, role: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 text-xs">
                          {ROLES.map(r => <option key={r}>{r}</option>)}
                        </select>
                      ) : (
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          u.role === "admin" ? "bg-rose-100 text-rose-700" :
                          u.role === "supervisor" ? "bg-purple-100 text-purple-700" :
                          "bg-gray-100 text-gray-600"
                        }`}>{u.role}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === u.id ? (
                        <select value={editData.account_type} onChange={e => setEditData({ ...editData, account_type: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 text-xs">
                          {ACCOUNT_TYPES.map(t => <option key={t}>{t}</option>)}
                        </select>
                      ) : (
                        <span className="text-xs text-gray-600">{u.account_type || "independent"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editId === u.id ? (
                        <select value={editData.status} onChange={e => setEditData({ ...editData, status: e.target.value })}
                          className="border border-gray-300 rounded px-2 py-1 text-xs">
                          {STATUSES.map(s => <option key={s}>{s}</option>)}
                        </select>
                      ) : (
                        <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                          u.status === "suspended" ? "bg-orange-100 text-orange-700" : "bg-green-100 text-green-700"
                        }`}>{u.status || "active"}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(u.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 justify-end">
                        {editId === u.id ? (
                          <>
                            <button onClick={saveEdit} className="p-1.5 text-green-600 hover:bg-green-50 rounded transition-colors"><Check size={14} /></button>
                            <button onClick={() => setEditId(null)} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded transition-colors"><X size={14} /></button>
                          </>
                        ) : (
                          <button onClick={() => startEdit(u)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Edit2 size={14} /></button>
                        )}
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-3">{filtered.length} user{filtered.length !== 1 ? "s" : ""} shown</p>
      </div>
    </div>
  );
}
