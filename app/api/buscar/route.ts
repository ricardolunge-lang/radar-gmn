import { NextResponse } from "next/server";
import { buscarGoogle } from "@/lib/google";
import { gerarDemo } from "@/lib/demo";
import { analisar } from "@/lib/score";

export async function POST(req: Request) {
  const { nicho, cidade } = (await req.json()) as { nicho?: string; cidade?: string };
  if (!nicho?.trim() || !cidade?.trim()) {
    return NextResponse.json({ erro: "Informe o nicho e a cidade." }, { status: 400 });
  }
  const chave = process.env.GOOGLE_PLACES_API_KEY;
  if (chave && !process.env.APP_SENHA) {
    return NextResponse.json({ erro: "Por segurança, defina a variável APP_SENHA no Vercel antes de usar a chave do Google." }, { status: 503 });
  }
  try {
    const empresas = chave ? await buscarGoogle(`${nicho} em ${cidade}`, chave) : gerarDemo(nicho, cidade);
    const resultado = empresas.map(analisar).sort((a, b) => b.score - a.score);
    return NextResponse.json({ demo: !chave, resultado });
  } catch (e) {
    return NextResponse.json({ erro: (e as Error).message }, { status: 502 });
  }
}
