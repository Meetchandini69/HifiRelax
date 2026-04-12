import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Eye, EyeOff, Heart, User, Users, CheckCircle } from "lucide-react";

function makeCaptcha() {
  const a = Math.floor(Math.random() * 9) + 1;
  const b = Math.floor(Math.random() * 9) + 1;
  return { a, b, answer: a + b };
}

export default function RegisterPage() {
  const { register } = useAuth();
  const [, nav] = useLocation();
  const [accountType, setAccountType] = useState<"independent" | "agent">("independent");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [captcha, setCaptcha] = useState(makeCaptcha);
  const [captchaInput, setCaptchaInput] = useState("");

  useEffect(() => { setCaptcha(makeCaptcha()); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    if (parseInt(captchaInput) !== captcha.answer) {
      toast.error("Incorrect answer to the verification question");
      setCaptcha(makeCaptcha());
      setCaptchaInput("");
      return;
    }
    setLoading(true);
    try {
      await register(form.email, form.password, form.name, accountType);
      toast.success("Account created!");
      nav("/dashboard");
    } catch (err: any) {
      toast.error(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-rose-100 rounded-full mb-3">
              <Heart size={22} className="text-rose-600 fill-rose-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Post your escort profile listing for free</p>
          </div>

          {/* Account Type Selection */}
          <div className="mb-4">
            <p className="text-sm font-semibold text-gray-700 mb-2">I am posting as:</p>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setAccountType("independent")}
                className={`relative border-2 rounded-xl p-4 text-left transition-all ${
                  accountType === "independent"
                    ? "border-rose-500 bg-rose-50"
                    : "border-gray-200 bg-white hover:border-rose-300"
                }`}
              >
                {accountType === "independent" && (
                  <CheckCircle size={15} className="absolute top-2 right-2 text-rose-500" />
                )}
                <User size={20} className={`mb-2 ${accountType === "independent" ? "text-rose-600" : "text-gray-400"}`} />
                <p className="font-semibold text-sm text-gray-900">Independent</p>
                <p className="text-xs text-gray-500 mt-0.5">1 profile listing, 1 photo</p>
              </button>
              <button
                type="button"
                onClick={() => setAccountType("agent")}
                className={`relative border-2 rounded-xl p-4 text-left transition-all ${
                  accountType === "agent"
                    ? "border-rose-500 bg-rose-50"
                    : "border-gray-200 bg-white hover:border-rose-300"
                }`}
              >
                {accountType === "agent" && (
                  <CheckCircle size={15} className="absolute top-2 right-2 text-rose-500" />
                )}
                <Users size={20} className={`mb-2 ${accountType === "agent" ? "text-rose-600" : "text-gray-400"}`} />
                <p className="font-semibold text-sm text-gray-900">Agent</p>
                <p className="text-xs text-gray-500 mt-0.5">Up to 3 profiles, 3 photos each</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                <input
                  type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Your full name"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
                <input
                  type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="you@example.com"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={show ? "text" : "password"} required value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    placeholder="Min 6 characters"
                    className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                  />
                  <button type="button" onClick={() => setShow(!show)} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {/* Math Captcha */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3">
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Verification: What is {captcha.a} + {captcha.b}?
                </label>
                <input
                  type="number" required value={captchaInput} onChange={e => setCaptchaInput(e.target.value)}
                  placeholder="Enter the answer"
                  className="w-full border border-gray-300 rounded-lg px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <button
                type="submit" disabled={loading}
                className="w-full bg-rose-600 hover:bg-rose-700 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors"
              >
                {loading ? "Creating account..." : "Create Account"}
              </button>
            </form>

            <p className="text-xs text-gray-400 mt-4 text-center">
              By registering you confirm you are 18+ and agree to our terms.
            </p>
            <div className="mt-3 text-center text-sm text-gray-500">
              Already registered?{" "}
              <Link href="/login" className="text-rose-600 font-semibold hover:text-rose-700">Sign in</Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
