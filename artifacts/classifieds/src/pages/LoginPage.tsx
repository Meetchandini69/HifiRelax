import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import { Eye, EyeOff, Heart } from "lucide-react";

export default function LoginPage() {
  const { login } = useAuth();
  const [, nav] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Logged in successfully");
      nav("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-3">
              <Heart size={22} className="text-rose-600 fill-rose-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
            <p className="text-gray-500 text-sm mt-1">Sign in to manage your listings</p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email" required value={email} onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"} required value={password} onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
              <button
                type="submit" disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              No account?{" "}
              <Link href="/register" className="text-rose-600 font-semibold hover:text-rose-700">Register free</Link>
            </div>
          </div>

          <p className="text-center hidden text-xs text-gray-400 mt-6">
            Admin login? Use admin@eliteescorts.in / Admin@1234
          </p>
        </div>
      </div>
    </div>
  );
}
