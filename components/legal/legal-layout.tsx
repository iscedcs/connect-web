import { Navbar } from "@/components/landing/navbar";
import { Footer } from "@/components/landing/footer";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import { verifyToken } from "@/lib/verify-jwt";

export default async function LegalLayout({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated?: string;
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("accessToken")?.value;
  let isLoggedIn = false;
  if (accessToken) {
    const { valid } = await verifyToken(accessToken);
    if (valid) {
      isLoggedIn = true;
    }
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col relative selection:bg-[#7B93FF]/30 selection:text-white">
      {/* Top landing navbar matching main site exactly */}
      <Navbar isLoggedIn={isLoggedIn} alwaysSolid={true} />

      {/* Main Content Area */}
      <main className="relative flex-1 w-full pt-28 pb-16 md:pt-36 md:pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Multi-layer ambient aurora background matching landing hero */}
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] md:w-[900px] md:h-[600px] rounded-full bg-[#7B93FF]/[0.05] blur-[140px]" />
          <div className="absolute top-10 left-10 w-[400px] h-[400px] rounded-full bg-[#C77DFF]/[0.03] blur-[120px]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#7B93FF]/[0.02] blur-[100px]" />
        </div>

        {/* Grid pattern matching landing page */}
        <div
          className="absolute inset-0 pointer-events-none"
          aria-hidden="true"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 80% 60% at 50% 30%, black 30%, transparent 100%)",
          }}
        />

        <div className="relative z-10 max-w-[850px] mx-auto">
          {/* Breadcrumb / Back button */}
          <div className="mb-6 flex items-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03] text-zinc-400 hover:text-white hover:bg-white/[0.07] hover:border-white/20 transition-all text-xs font-medium cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>
            <span className="text-zinc-600">/</span>
            <span className="text-xs text-zinc-400">{title}</span>
          </div>

          {/* Legal Card Container */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-10 md:p-12 backdrop-blur-sm shadow-2xl">
            <header className="border-b border-white/10 pb-6 mb-8">
              <h1
                className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white"
                style={{ fontFamily: "var(--font-syne), sans-serif" }}
              >
                {title}
              </h1>
              {lastUpdated && (
                <p className="text-xs text-zinc-400 mt-3 flex items-center gap-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#7B93FF]" />
                  Last updated: {lastUpdated}
                </p>
              )}
            </header>

            <section className="prose prose-invert prose-zinc max-w-none prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-h2:text-xl prose-h2:mt-8 prose-h2:mb-3 prose-p:text-zinc-300 prose-p:leading-relaxed prose-li:text-zinc-300 prose-strong:text-white">
              {children}
            </section>
          </div>
        </div>
      </main>

      {/* Main landing footer */}
      <Footer />
    </div>
  );
}
