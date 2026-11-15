"use client";

import { useMemo, useState } from "react";
import type { Analise } from "@/lib/score";

type Filtro = "todos" | "quente" | "morno" | "frio" | "semsite";

function csv(linhas: Analise[]): string {
  const cab = ["Score", "Nível", "Empresa", "Categoria", "Telefone", "WhatsApp", "Site", "Nota", "Avaliações", "Fotos", "Problemas", "Endereço", "Google Maps", "Mensagem"];
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const rows = linhas.map((a) =>
    [a.score, a.nivel, a.nome, a.categoria, a.telefone, a.whatsapp ? `https://wa.me/${a.whatsapp}` : "", a.site, a.nota ?? "", a.avaliacoes, a.fotos,
      a.problemas.map((p) => p.texto).join("; "), a.endereco, a.mapsUrl, a.mensagem].map(esc).join(";"),
  );
  return "﻿" + [cab.map(esc).join(";"), ...rows].join("\n");
}

export default function Home() {
  const [nicho, setNicho] = useState("");
  const [cidade, setCidade] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [demo, setDemo] = useState(false);
  const [dados, setDados] = useState<Analise[] | null>(null);
  const [filtro, setFiltro] = useState<Filtro>("todos");

  async function buscar(ev: React.FormEvent) {
    ev.preventDefault();
    setCarregando(true);
    setErro(null);
    try {
      const r = await fetch("/api/buscar", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ nicho, cidade }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.erro || "Falha na busca");
      setDados(j.resultado);
      setDemo(j.demo);
      setFiltro("todos");
    } catch (e) {
      setErro((e as Error).message);
    } finally {
      setCarregando(false);
    }
  }

  const visiveis = useMemo(() => {
    if (!dados) return [];
    if (filtro === "todos") return dados;
    if (filtro === "semsite") return dados.filter((d) => !d.site);
    return dados.filter((d) => d.nivel === filtro);
  }, [dados, filtro]);

  function exportar() {
    const blob = new Blob([csv(visiveis)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `prospects-${nicho}-${cidade}.csv`.replace(/\s+/g, "-").toLowerCase();
    a.click();
  }

  const n = (f: (a: Analise) => boolean) => (dados ?? []).filter(f).length;

  return (
    <main className="wrap">
      <header>
        <div className="logo">Radar <span>GMN</span></div>
        <div className="tag">Quanto pior o perfil no Google, melhor o prospect.</div>
      </header>

      <form onSubmit={buscar}>
        <div>
          <label htmlFor="nicho">Nicho</label>
          <input id="nicho" placeholder="ex: clínica de estética" value={nicho} onChange={(e) => setNicho(e.target.value)} required />
        </div>
        <div>
          <label htmlFor="cidade">Cidade</label>
          <input id="cidade" placeholder="ex: Balneário Camboriú" value={cidade} onChange={(e) => setCidade(e.target.value)} required />
        </div>
        <button disabled={carregando}>{carregando ? "Buscando…" : "Buscar prospects"}</button>
      </form>

      {demo && <p className="aviso">Modo demonstração: os dados abaixo são fictícios. Coloque a chave do Google pra buscar empresas reais.</p>}
      {erro && <p className="aviso erro">{erro}</p>}

      {dados && (
        <>
          <section className="resumo">
            <div className="kpi"><b>{dados.length}</b><small>empresas analisadas</small></div>
            <div className="kpi"><b style={{ color: "var(--hot)" }}>{n((a) => a.nivel === "quente")}</b><small>prospects quentes</small></div>
            <div className="kpi"><b>{n((a) => !a.site)}</b><small>sem site linkado</small></div>
            <div className="kpi"><b>{n((a) => a.avaliacoes < 10)}</b><small>com menos de 10 avaliações</small></div>
          </section>

          <div className="barra">
            <div className="filtros">
              {([["todos", "Todos"], ["quente", "Quentes"], ["morno", "Mornos"], ["frio", "Frios"], ["semsite", "Sem site"]] as [Filtro, string][]).map(([k, t]) => (
                <button key={k} type="button" className={`chip ${filtro === k ? "on" : ""}`} onClick={() => setFiltro(k)}>{t}</button>
              ))}
            </div>
            <button type="button" className="btn ghost sm" onClick={exportar}>Exportar planilha ({visiveis.length})</button>
          </div>

          <div className="lista">
            {visiveis.map((a) => (
              <article key={a.id} className="card">
                <div className={`score ${a.nivel}`}>{a.score}<small>{a.nivel}</small></div>
                <div>
                  <h3>{a.nome}</h3>
                  <div className="meta">
                    {a.categoria && <span>{a.categoria}</span>}
                    <span>{a.nota ? `★ ${a.nota.toFixed(1).replace(".", ",")}` : "sem nota"} · {a.avaliacoes} {a.avaliacoes === 1 ? "avaliação" : "avaliações"}</span>
                    <span>{a.fotos >= 10 ? "10+ fotos" : `${a.fotos} ${a.fotos === 1 ? "foto" : "fotos"}`}</span>
                    <span>{a.site ? <a href={a.site} target="_blank" rel="noreferrer">site</a> : "sem site"}</span>
                    {a.telefone && <span>{a.telefone}</span>}
                  </div>
                  <ul className="probs">
                    {a.problemas.length ? a.problemas.map((p) => <li key={p.texto}>{p.texto}</li>) : <li>Perfil bem cuidado</li>}
                  </ul>
                  <details>
                    <summary>Mensagem de abordagem</summary>
                    <textarea defaultValue={a.mensagem} id={`msg-${a.id}`} />
                  </details>
                </div>
                <div className="acoes">
                  {a.whatsapp && (
                    <a className="btn wa sm" target="_blank" rel="noreferrer"
                      href={`https://wa.me/${a.whatsapp}?text=${encodeURIComponent(a.mensagem)}`}
                      onClick={(e) => {
                        const t = (document.getElementById(`msg-${a.id}`) as HTMLTextAreaElement | null)?.value;
                        if (t) (e.currentTarget as HTMLAnchorElement).href = `https://wa.me/${a.whatsapp}?text=${encodeURIComponent(t)}`;
                      }}>WhatsApp</a>
                  )}
                  {a.mapsUrl && <a className="btn ghost sm" href={a.mapsUrl} target="_blank" rel="noreferrer">Ver no Maps</a>}
                </div>
              </article>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
