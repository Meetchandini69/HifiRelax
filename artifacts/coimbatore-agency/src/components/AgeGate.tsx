interface AgeGateProps { onEnter: () => void; }

export default function AgeGate({ onEnter }: AgeGateProps) {
  return (
    <div className="fixed inset-0 z-[999] bg-[#0B0B0B] flex items-center justify-center px-4">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage: "radial-gradient(circle at 50% 50%, #180522 0%, transparent 70%)",
        }}
      />
      <div className="relative z-10 max-w-md w-full text-center">
        <div className="border border-[rgba(255,46,136,0.25)] rounded-2xl bg-[#120818] p-10 pink-glow">
          <div className="inline-flex items-center gap-2 border border-[rgba(255,46,136,0.3)] text-[#FF2E88] text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
            ✦ Adults Only 18+
          </div>
          <h2 className="font-serif text-3xl text-white mb-3">Age Verification</h2>
          <p className="text-gray-400 text-sm mb-6 leading-relaxed">
            This platform contains exclusive premium adult profiles intended strictly for verified adults.
          </p>
          <p className="text-gray-300 text-sm mb-5">By entering you confirm:</p>
          <ul className="text-left text-sm text-gray-400 space-y-2 mb-8 max-w-xs mx-auto">
            <li className="flex items-center gap-2"><span className="text-pink">✦</span> You are 18+ years old</li>
            <li className="flex items-center gap-2"><span className="text-pink">✦</span> Content is legal in your region</li>
            <li className="flex items-center gap-2"><span className="text-pink">✦</span> You accept Terms & Privacy</li>
          </ul>
          <div className="flex gap-3">
            <button
              onClick={onEnter}
              className="btn-green flex-1 py-3 text-sm font-bold"
            >
              ENTER SITE
            </button>
            <a
              href="https://www.google.com"
              className="btn-dark flex-1 py-3 text-sm font-bold text-center"
            >
              LEAVE
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
