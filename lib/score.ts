export type Empresa = {
  id: string;
  nome: string;
  categoria: string;
  endereco: string;
  telefone: string | null;
  site: string | null;
  nota: number | null;
  avaliacoes: number;
  fotos: number; // a API devolve no máximo 10
  temHorario: boolean;
  temDescricao: boolean;
  ultimaAvaliacao: string | null; // ISO
  mapsUrl: string | null;
};

export type Problema = { texto: string; peso: number; frase: string };

const pl = (n: number, um: string, varios: string) => `${n} ${n === 1 ? um : varios}`;

export type Analise = Empresa & {
  score: number; // 0 a 100, quanto maior, melhor prospect
  nivel: "quente" | "morno" | "frio";
  problemas: Problema[];
  whatsapp: string | null;
  mensagem: string;
};

function mesesDesde(iso: string | null): number | null {
  if (!iso) return null;
  const d = new Date(iso).getTime();
  if (Number.isNaN(d)) return null;
  return (Date.now() - d) / (1000 * 60 * 60 * 24 * 30);
}

export function analisar(e: Empresa): Analise {
  const p: Problema[] = [];

  if (!e.site) p.push({ texto: "Nenhum site linkado no perfil", peso: 25, frase: "que não tem site linkado" });

  if (e.avaliacoes === 0) p.push({ texto: "Nenhuma avaliação no Google", peso: 20, frase: "que ainda não tem nenhuma avaliação" });
  else if (e.avaliacoes < 10) p.push({ texto: `Só ${pl(e.avaliacoes, "avaliação", "avaliações")}`, peso: 15, frase: `que tem só ${pl(e.avaliacoes, "avaliação", "avaliações")}` });
  else if (e.avaliacoes < 30) p.push({ texto: `Poucas avaliações (${e.avaliacoes})`, peso: 8, frase: `que tem poucas avaliações (${e.avaliacoes})` });

  if (e.nota !== null && e.avaliacoes > 0) {
    if (e.nota < 4.0) p.push({ texto: `Nota baixa (${e.nota.toFixed(1).replace(".", ",")})`, peso: 10, frase: `que a nota está em ${e.nota.toFixed(1).replace(".", ",")}` });
    else if (e.nota < 4.5) p.push({ texto: `Nota abaixo de 4,5 (${e.nota.toFixed(1).replace(".", ",")})`, peso: 4, frase: `que a nota está em ${e.nota.toFixed(1).replace(".", ",")}` });
  }

  if (e.fotos === 0) p.push({ texto: "Nenhuma foto no perfil", peso: 15, frase: "que não tem nenhuma foto" });
  else if (e.fotos < 5) p.push({ texto: `Só ${pl(e.fotos, "foto", "fotos")}`, peso: 10, frase: `que tem só ${pl(e.fotos, "foto", "fotos")}` });
  else if (e.fotos < 10) p.push({ texto: `Poucas fotos (${e.fotos})`, peso: 4, frase: "que tem poucas fotos" });

  if (!e.temHorario) p.push({ texto: "Sem horário de funcionamento", peso: 8, frase: "que está sem horário de funcionamento" });
  if (!e.temDescricao) p.push({ texto: "Sem descrição da empresa", peso: 5, frase: "que está sem descrição da empresa" });
  if (!e.telefone) p.push({ texto: "Sem telefone no perfil", peso: 5, frase: "que está sem telefone" });

  const m = mesesDesde(e.ultimaAvaliacao);
  if (m !== null && m > 6) p.push({ texto: `Última avaliação há ${Math.round(m)} meses`, peso: 7, frase: `que a última avaliação foi há ${Math.round(m)} meses` });

  p.sort((a, b) => b.peso - a.peso);
  const score = Math.min(100, p.reduce((s, x) => s + x.peso, 0));
  const nivel = score >= 50 ? "quente" : score >= 25 ? "morno" : "frio";

  return { ...e, score, nivel, problemas: p, whatsapp: numeroWhatsApp(e.telefone), mensagem: montarMensagem(e, p) };
}

export function numeroWhatsApp(tel: string | null): string | null {
  if (!tel) return null;
  let d = tel.replace(/\D/g, "");
  if (d.startsWith("0")) d = d.replace(/^0+/, "");
  if (d.length === 10 || d.length === 11) d = "55" + d;
  return d.length >= 12 ? d : null;
}

export function montarMensagem(e: Empresa, p: Problema[]): string {
  const top = p.slice(0, 2).map((x) => x.frase);
  const achados = top.length
    ? `Dei uma olhada no perfil de vocês no Google e reparei ${top.length === 2 ? `${top[0]} e ${top[1]}` : top[0]}.`
    : "Dei uma olhada no perfil de vocês no Google.";
  return [
    `Olá, tudo bem? Aqui é o Ricardo, da Braza Labz.`,
    achados,
    `Isso faz vocês perderem clientes pra concorrentes que aparecem melhor no Maps.`,
    `Posso te mandar um diagnóstico rápido, sem compromisso?`,
  ].join(" ");
}
