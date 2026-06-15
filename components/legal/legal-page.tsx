import Link from "next/link";
import { ArrowLeft } from "lucide-react";

type LegalSection = {
  title: string;
  body: string[];
};

type LegalPageProps = {
  label: string;
  title: string;
  description: string;
  lastUpdated: string;
  sections: LegalSection[];
};

export function LegalPage({
  label,
  title,
  description,
  lastUpdated,
  sections,
}: LegalPageProps) {
  return (
    <main className="min-h-[100dvh] bg-[#111426] px-5 py-8 text-white sm:px-8 lg:px-12 xl:px-16">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_14%_0%,rgba(106,92,255,0.22),transparent_30rem),radial-gradient(circle_at_88%_16%,rgba(255,93,184,0.12),transparent_25rem),linear-gradient(180deg,#111426_0%,#171b34_100%)]" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,#fff_1px,transparent_1px),linear-gradient(to_bottom,#fff_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      <div className="relative mx-auto max-w-4xl">
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-semibold text-white/68 transition hover:border-primary/35 hover:bg-white/[0.08] hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับหน้าแรก
        </Link>

        <header className="pt-12 sm:pt-16">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary/90">
            {label}
          </p>
          <h1 className="mt-5 text-3xl font-bold leading-tight tracking-normal text-white sm:text-5xl">
            {title}
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/62 sm:text-lg">
            {description}
          </p>
          <p className="mt-5 text-sm text-white/42">อัปเดตล่าสุด: {lastUpdated}</p>
        </header>

        <article className="mt-10 overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.045] shadow-[0_30px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl">
          <div className="divide-y divide-white/10">
            {sections.map((section) => (
              <section key={section.title} className="p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-white sm:text-2xl">
                  {section.title}
                </h2>
                <div className="mt-4 space-y-4 text-sm leading-7 text-white/64 sm:text-base sm:leading-8">
                  {section.body.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              </section>
            ))}
          </div>
        </article>

        <footer className="flex flex-col gap-4 py-10 text-sm text-white/42 sm:flex-row sm:items-center sm:justify-between">
          <p>Music Bar legal information</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/disclaimer" className="transition hover:text-white">
              Disclaimer
            </Link>
            <Link href="/privacy-policy" className="transition hover:text-white">
              Privacy Policy
            </Link>
            <Link
              href="/terms-and-conditions"
              className="transition hover:text-white"
            >
              Terms & Conditions
            </Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
