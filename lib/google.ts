import type { Empresa } from "./score";

const CAMPOS = [
  "places.id",
  "places.displayName",
  "places.formattedAddress",
  "places.nationalPhoneNumber",
  "places.internationalPhoneNumber",
  "places.websiteUri",
  "places.rating",
  "places.userRatingCount",
  "places.photos",
  "places.regularOpeningHours",
  "places.businessStatus",
  "places.primaryTypeDisplayName",
  "places.editorialSummary",
  "places.googleMapsUri",
  "places.reviews",
  "nextPageToken",
].join(",");

type Place = {
  id: string;
  displayName?: { text: string };
  formattedAddress?: string;
  nationalPhoneNumber?: string;
  internationalPhoneNumber?: string;
  websiteUri?: string;
  rating?: number;
  userRatingCount?: number;
  photos?: unknown[];
  regularOpeningHours?: unknown;
  businessStatus?: string;
  primaryTypeDisplayName?: { text: string };
  editorialSummary?: { text: string };
  googleMapsUri?: string;
  reviews?: { publishTime?: string }[];
};

function converter(p: Place): Empresa {
  const datas = (p.reviews ?? []).map((r) => r.publishTime).filter(Boolean) as string[];
  datas.sort();
  return {
    id: p.id,
    nome: p.displayName?.text ?? "Sem nome",
    categoria: p.primaryTypeDisplayName?.text ?? "",
    endereco: p.formattedAddress ?? "",
    telefone: p.internationalPhoneNumber ?? p.nationalPhoneNumber ?? null,
    site: p.websiteUri ?? null,
    nota: p.rating ?? null,
    avaliacoes: p.userRatingCount ?? 0,
    fotos: p.photos?.length ?? 0,
    temHorario: Boolean(p.regularOpeningHours),
    temDescricao: Boolean(p.editorialSummary?.text),
    ultimaAvaliacao: datas.length ? datas[datas.length - 1] : null,
    mapsUrl: p.googleMapsUri ?? null,
  };
}

/** Busca até 60 empresas (3 páginas de 20) na Places API (New). */
export async function buscarGoogle(consulta: string, chave: string, maxPaginas = 3): Promise<Empresa[]> {
  const out: Empresa[] = [];
  let pageToken: string | undefined;
  for (let i = 0; i < maxPaginas; i++) {
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Goog-Api-Key": chave, "X-Goog-FieldMask": CAMPOS },
      body: JSON.stringify({ textQuery: consulta, languageCode: "pt-BR", regionCode: "BR", pageSize: 20, pageToken }),
      cache: "no-store",
    });
    if (!res.ok) {
      const txt = await res.text();
      throw new Error(`Google respondeu ${res.status}: ${txt.slice(0, 300)}`);
    }
    const data = (await res.json()) as { places?: Place[]; nextPageToken?: string };
    for (const p of data.places ?? []) {
      if (p.businessStatus && p.businessStatus !== "OPERATIONAL") continue;
      out.push(converter(p));
    }
    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }
  return out;
}
