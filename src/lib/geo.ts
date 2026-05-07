// Utilitários de geolocalização para a página de lojas

export type Coords = { lat: number; lng: number };

/**
 * Tenta extrair lat/lng de uma URL do Google Maps.
 * Suporta formatos comuns:
 *  - https://maps.google.com/?q=-16.6869,-49.2648
 *  - https://www.google.com/maps/@-16.6869,-49.2648,15z
 *  - https://www.google.com/maps/place/Foo/@-16.6869,-49.2648,17z
 *  - https://goo.gl/maps/... (encurtado — não dá pra extrair sem fetch)
 */
export function parseCoordsFromMapsUrl(url: string | null | undefined): Coords | null {
  if (!url) return null;
  try {
    // Padrão @lat,lng
    const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) };
    // Padrão q=lat,lng ou query=lat,lng
    const q = url.match(/[?&](?:q|query|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (q) return { lat: parseFloat(q[1]), lng: parseFloat(q[2]) };
    // Padrão !3d...!4d... (links longos do Google)
    const d3d4 = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (d3d4) return { lat: parseFloat(d3d4[1]), lng: parseFloat(d3d4[2]) };
  } catch {
    // ignore
  }
  return null;
}

/** Distância Haversine em km entre 2 coordenadas. */
export function haversineKm(a: Coords, b: Coords): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const lat1 = (a.lat * Math.PI) / 180;
  const lat2 = (b.lat * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  if (km < 10) return `${km.toFixed(1)} km`;
  return `${Math.round(km)} km`;
}

/** Pede a posição atual com timeout. */
export function getCurrentPosition(timeoutMs = 8000): Promise<Coords> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocalização indisponível"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: false, timeout: timeoutMs, maximumAge: 5 * 60 * 1000 },
    );
  });
}

/** Normaliza string para busca acent-insensitive. */
export function normalize(s: string | null | undefined): string {
  return (s ?? "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}
