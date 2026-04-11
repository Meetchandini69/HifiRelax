import { Link } from "wouter";
import Navbar from "@/components/Navbar";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex items-center justify-center py-24 px-4 text-center">
        <div>
          <div className="text-7xl font-bold text-rose-200 mb-4">404</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Page not found</h1>
          <p className="text-gray-500 text-sm mb-6">The page you're looking for doesn't exist.</p>
          <Link href="/" className="bg-rose-600 hover:bg-rose-700 text-white font-semibold px-6 py-2.5 rounded-lg text-sm inline-block transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
