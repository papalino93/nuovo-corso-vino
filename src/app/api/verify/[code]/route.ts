import { NextResponse } from "next/server";
import { verifyCertificate } from "@/lib/certificate";

/**
 * Verifica pubblica di un attestato: nessun accesso richiesto, apposta —
 * è pensata per chi riceve una pergamena da un'altra persona e vuole
 * controllare che sia autentica, non per il corsista che l'ha ottenuta.
 * Il codice è l'id dell'iscrizione: un'iscrizione inesistente e una non
 * ancora certificata rispondono allo stesso modo, per non confermare a un
 * estraneo che una certa iscrizione esiste ma è ancora in corso.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> },
) {
  const { code } = await params;
  const origin = new URL(request.url).origin;

  const data = await verifyCertificate(code, origin);
  if (!data) {
    return NextResponse.json({ error: "codice non valido" }, { status: 404 });
  }
  return NextResponse.json({ data });
}
