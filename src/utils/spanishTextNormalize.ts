import type { Product } from "@/types";

/**
 * Palabras frecuentes guardadas sin tildes en BD. Clave = forma sin acentos (minúsculas).
 * Valor = forma correcta en minúsculas. El algoritmo conserva mayúsculas / título al aplicar.
 */
const SPANISH_ACCENT_BY_DEBASED_KEY: Record<string, string> = {
  // fibras / tejidos
  algodon: "algodón",
  poliester: "poliéster",
  poliesters: "poliésteres",
  saten: "satén",
  popelin: "popelín",
  crepe: "crepé",
  // prendas / calzado (terminaciones -ón / -ín)
  pantalon: "pantalón",
  camison: "camisón",
  cinturon: "cinturón",
  corset: "corsé",
  // adjetivos comunes en fichas
  basico: "básico",
  basica: "básica",
  basicos: "básicos",
  basicas: "básicas",
  clasico: "clásico",
  clasica: "clásica",
  clasicos: "clásicos",
  clasicas: "clásicas",
  elastico: "elástico",
  elastica: "elástica",
  elasticos: "elásticos",
  elasticas: "elásticas",
  plastico: "plástico",
  plasticos: "plásticos",
  metalico: "metálico",
  metalica: "metálica",
  metalicos: "metálicos",
  metalicas: "metálicas",
  economico: "económico",
  economica: "económica",
  economicos: "económicos",
  economicas: "económicas",
  automatico: "automático",
  automatica: "automática",
  electronicos: "electrónicos",
  electronicas: "electrónicas",
  publico: "público",
  publica: "pública",
  publicos: "públicos",
  publicas: "públicas",
  unico: "único",
  unica: "única",
  unicos: "únicos",
  unicas: "únicas",
  ultimo: "último",
  ultima: "última",
  ultimos: "últimos",
  ultimas: "últimas",
  rapido: "rápido",
  rapida: "rápida",
  rapidos: "rápidos",
  rapidas: "rápidas",
  facil: "fácil",
  faciles: "fáciles",
  dificil: "difícil",
  dificiles: "difíciles",
  // sustantivos -ción / -sión
  coleccion: "colección",
  promocion: "promoción",
  promociones: "promociones",
  liquidacion: "liquidación",
  liquidaciones: "liquidaciones",
  edicion: "edición",
  ediciones: "ediciones",
  informacion: "información",
  descripcion: "descripción",
  situacion: "situación",
  condicion: "condición",
  aplicacion: "aplicación",
  version: "versión",
  versiones: "versiones",
  television: "televisión",
  decision: "decisión",
  precision: "precisión",
  // personas / edad
  nino: "niño",
  nina: "niña",
  ninos: "niños",
  ninas: "niñas",
  bebe: "bebé",
  bebes: "bebés",
  // números / medidas
  numero: "número",
  numeros: "números",
  // estaciones
  otono: "otoño",
  // otros retail
  bisuteria: "bisutería",
  joyeria: "joyería",
  perfumeria: "perfumería",
  cosmeticos: "cosméticos",
  cosmeticas: "cosméticas",
  rimel: "rímel",
};

function debasedLower(word: string): string {
  return word
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ß/g, "ss")
    .toLowerCase();
}

function applyOriginalCase(original: string, fixedLower: string): string {
  if (!original.length) return fixedLower;
  const es = "es";
  const upperFixed = fixedLower.toLocaleUpperCase(es);

  const isAllUpper =
    original === original.toLocaleUpperCase(es) && /[A-ZÁÉÍÓÚÜÑ]/.test(original.normalize("NFD").replace(/[\u0300-\u036f]/g, ""));
  if (isAllUpper && original.length > 1) {
    return upperFixed;
  }

  const restIsLower =
    original.slice(1) === original.slice(1).toLocaleLowerCase(es);
  if (original.charAt(0) === original.charAt(0).toLocaleUpperCase(es) && restIsLower) {
    return fixedLower.charAt(0).toLocaleUpperCase(es) + fixedLower.slice(1);
  }

  if (original.charAt(0) === original.charAt(0).toLocaleUpperCase(es)) {
    return fixedLower.charAt(0).toLocaleUpperCase(es) + fixedLower.slice(1);
  }

  return fixedLower;
}

function fixWordToken(word: string): string {
  const key = debasedLower(word);
  const mapped = SPANISH_ACCENT_BY_DEBASED_KEY[key];
  if (!mapped) return word;
  return applyOriginalCase(word, mapped);
}

/**
 * Mejora tildes y grafías típicas en textos de catálogo (productos desde BD sin acentuar).
 * Conserva espacios, números y signos; solo ajusta palabras reconocidas.
 */
export function improveSpanishText(text: string): string {
  if (!text) return text;
  return text.replace(/[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g, fixWordToken);
}

export function normalizeProductText(product: Product): Product {
  return {
    ...product,
    name: improveSpanishText(product.name),
    description: improveSpanishText(product.description ?? ""),
    brand: improveSpanishText(product.brand ?? ""),
    color: improveSpanishText(product.color ?? ""),
    size: improveSpanishText(product.size ?? ""),
    categories: product.categories
      ? { ...product.categories, name: improveSpanishText(product.categories.name) }
      : product.categories,
  };
}
