import { signIn } from "@/lib/auth";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-neo-yellow flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Back link */}
        <Link href="/" className="neo-button neo-button-ghost neo-button-sm mb-8 inline-flex">
          ← Kembali
        </Link>

        {/* Login card */}
        <div className="neo-card p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-neo-black border-4 border-neo-black flex items-center justify-center mx-auto mb-4 shadow-neo-lg">
              <span className="text-neo-yellow font-mono font-bold text-2xl">L</span>
            </div>
            <h1 className="font-mono font-bold text-3xl tracking-tight">
              MASUK KE
            </h1>
            <h2 className="font-mono font-bold text-3xl text-neo-pink">
              LIBRARI AI
            </h2>
            <p className="font-sans text-sm text-gray-600 mt-3 leading-relaxed">
              Gunakan akun Google kamu untuk masuk dan mulai berdialog dengan dokumen-dokumen koleksimu.
            </p>
          </div>

          {/* Sign in form */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/browse" });
            }}
          >
            <button
              type="submit"
              className="neo-button neo-button-black neo-button-lg w-full justify-center"
            >
              <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  style={{ fill: "#4285F4" }}
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  style={{ fill: "#34A853" }}
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  style={{ fill: "#FBBC05" }}
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  style={{ fill: "#EA4335" }}
                />
              </svg>
              Masuk dengan Google
            </button>
          </form>

          <p className="text-center font-mono text-xs text-gray-500 mt-6">
            Dengan masuk, kamu menyetujui penggunaan data akunmu sesuai kebijakan privasi kami.
          </p>
        </div>

        {/* Deco label */}
        <div className="text-center mt-6">
          <span className="neo-badge neo-badge-black">
            POWERED BY GEMINI AI ✦ ZERO HALLUCINATION
          </span>
        </div>
      </div>
    </main>
  );
}
