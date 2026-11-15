import type { Empresa } from "./score";

// Dados fictícios, só para ver a ferramenta funcionando sem a chave do Google.
const PREFIXOS = ["Studio", "Clínica", "Espaço", "Casa", "Centro", "Ateliê", "Instituto", "Ponto"];
const SUFIXOS = ["Aurora", "Bem Viver", "Litoral", "Central", "Prime", "Essência", "Vida", "do Vale", "Sul", "Mar Azul"];

function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function gerarDemo(nicho: string, cidade: string): Empresa[] {
  let h = 0;
  for (const c of nicho + cidade) h = (h * 31 + c.charCodeAt(0)) >>> 0;
  const r = rng(h || 7);
  const n = 18;
  const out: Empresa[] = [];
  for (let i = 0; i < n; i++) {
    const nome = `${PREFIXOS[Math.floor(r() * PREFIXOS.length)]} ${SUFIXOS[Math.floor(r() * SUFIXOS.length)]} (demo ${i + 1})`;
    const avaliacoes = r() < 0.2 ? 0 : Math.floor(r() ** 2 * 250);
    const mesesAtras = r() * 14;
    out.push({
      id: `demo-${i}`,
      nome,
      categoria: nicho,
      endereco: `Rua Exemplo, ${100 + i * 7}, ${cidade}`,
      telefone: r() < 0.85 ? `(47) 9${8000 + Math.floor(r() * 1999)}-${1000 + Math.floor(r() * 8999)}` : null,
      site: r() < 0.45 ? `https://exemplo-${i}.com.br` : null,
      nota: avaliacoes ? Math.round((3.2 + r() * 1.8) * 10) / 10 : null,
      avaliacoes,
      fotos: Math.floor(r() * 11),
      temHorario: r() < 0.7,
      temDescricao: r() < 0.35,
      ultimaAvaliacao: avaliacoes ? new Date(Date.now() - mesesAtras * 30 * 864e5).toISOString() : null,
      mapsUrl: null,
    });
  }
  return out;
}
