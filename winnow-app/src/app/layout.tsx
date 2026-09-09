// File: src/app/layout.tsx — [CRITIQUE E-1] no hardcoded count, no full-corpus grading claim
import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({ src: "./fonts/GeistVF.woff", variable: "--font-geist-sans", weight: "100 900" });
const geistMono = localFont({ src: "./fonts/GeistMonoVF.woff", variable: "--font-geist-mono", weight: "100 900" });

export const metadata: Metadata = {
  title: "Winnow: the trust-graded agent marketplace for BSC",
  description: "The trust-graded agent marketplace for BSC. Live probes, recomputable grades, spend-capped hiring.",
};

const NAV = [
  ["/c/rebalancing", "Rebalancing"],
  ["/c/grid-trading", "Grid"],
  ["/c/yield", "Yield"],
  ["/c/health-factor", "Health Factor"],
] as const;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-950 text-zinc-100 min-h-screen font-[family-name:var(--font-geist-sans)]`}>
        {/* CF-3 glass recipe: backdrop-blur + inset edge highlight in the same shadow stack */}
        <nav className="sticky top-0 z-10 border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur shadow-[inset_0_-1px_0_0_rgba(255,255,255,0.04)] px-6 py-3 flex gap-5 items-center">
          <a href="/" className="font-bold text-lg tracking-tight hover:text-emerald-400">Winnow</a>
          {NAV.map(([href, label]) => (
            <a key={href} href={href} className="text-sm text-zinc-400 hover:text-white hidden sm:inline">{label}</a>
          ))}
          <a href="/proof" className="ml-auto text-sm text-emerald-400 hover:text-emerald-300">Proof</a>
        </nav>
        {children}
        <footer className="border-t border-zinc-800/80 mt-16 px-6 py-6 text-xs text-zinc-600">
          Every grade recomputes from live probes and onchain data. Derivations on <a href="/proof" className="text-zinc-500 hover:text-emerald-400 underline underline-offset-2">/proof</a> · <a href="/proof#method" className="text-zinc-500 hover:text-emerald-400 underline underline-offset-2">method note</a> (feedback heuristic + category auto-tagging).
        </footer>
      </body>
    </html>
  );
}
