"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import type { CertificateData } from "@/components/Certificate";
import { LanguageToggle, useLanguage } from "@/components/LanguageProvider";
import { CheckIcon, CrossIcon, Seal } from "@/components/icons";

/**
 * Verifica pubblica di un attestato (§ Feature: link di verifica).
 *
 * Non richiede accesso: chi riceve una pergamena da un'altra persona può
 * controllare che sia autentica aprendo semplicemente questo indirizzo.
 * Mostra solo ciò che l'attestato stesso mostra già — niente email, niente
 * punteggio grezzo — mai qualcosa in più di quanto la pergamena riveli.
 */
export default function VerifyPage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = use(params);
  const { lang } = useLanguage();
  const [data, setData] = useState<CertificateData | null | "not_found">(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await api<{ data: CertificateData }>(
        `/api/verify/${code}`,
      );
      if (cancelled) return;
      setData(result.ok ? result.data.data : "not_found");
    })();
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center px-6 pt-16 pb-24 text-center">
      <div className="mb-8 self-end">
        <LanguageToggle />
      </div>

      <Seal size={80} />

      {data === null && (
        <p className="mt-8 text-sm text-cream/50">
          {lang === "en" ? "Checking…" : "Un momento…"}
        </p>
      )}

      {data === "not_found" && (
        <div className="mt-8 flex flex-col items-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-red-400/12 text-red-300">
            <CrossIcon className="h-6 w-6" />
          </div>
          <p className="mt-5 font-serif text-2xl text-cream">
            {lang === "en" ? "Not found" : "Codice non valido"}
          </p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed text-cream/60">
            {lang === "en"
              ? "This verification code doesn't match any certificate."
              : "Questo codice non corrisponde a nessun attestato conseguito."}
          </p>
        </div>
      )}

      {data && data !== "not_found" && (
        <div className="mt-8 flex flex-col items-center">
          <div className="grid h-14 w-14 place-items-center rounded-full bg-gold/15 text-gold">
            <CheckIcon className="h-6 w-6" />
          </div>
          <p className="mt-5 font-serif text-2xl text-cream">
            {lang === "en" ? "Certificate verified" : "Attestato verificato"}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-cream/70">
            {lang === "en" ? (
              <>
                <span className="font-serif text-lg italic text-cream">
                  {data.name}
                </span>{" "}
                took part in <em>{data.courseTitle}</em>, earning the title of{" "}
                <strong className="text-gold">{data.meritTitle}</strong>.
              </>
            ) : (
              <>
                <span className="font-serif text-lg italic text-cream">
                  {data.name}
                </span>{" "}
                ha partecipato al corso <em>{data.courseTitle}</em>,
                meritandosi il titolo di{" "}
                <strong className="text-gold">{data.meritTitle}</strong>.
              </>
            )}
          </p>
          <p className="mt-3 text-xs text-cream/45">{data.date}</p>
        </div>
      )}

      <Link
        href="/"
        className="press mt-10 text-sm text-gold underline underline-offset-4"
      >
        {lang === "en" ? "Go to the course" : "Vai al corso"}
      </Link>
    </main>
  );
}
