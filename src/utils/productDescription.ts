const NEXT_SPEC_LABEL = /\s+(?:marca|brand|talla|tamaño|size|color)\s*[:：]/i;

function trimAvailabilityTail(value: string): string {
  const t = value.trim();
  if (!t) return "";
  const beforeAvail = t.split(/\s+disponibilidad\b/i)[0] ?? t;
  return beforeAvail.replace(/[.;,]+$/g, "").trim();
}

function extractLabeledSegment(text: string, label: RegExp): string {
  const m = text.match(label);
  if (!m || m.index === undefined) return "";
  const start = m.index + m[0].length;
  const rest = text.slice(start);
  const stop = rest.search(NEXT_SPEC_LABEL);
  const raw = (stop === -1 ? rest : rest.slice(0, stop)).trim();
  return raw.replace(/[.;,]+$/g, "").trim();
}

/**
 * Cuando marca/color/talla solo están escritos dentro de la descripción
 * (p. ej. "Marca: CAT Talla: 32... Color: Azul"), los extrae para poder
 * mostrarlos en la ficha sin depender de que la BD tenga esos campos llenos.
 */
export function parseEmbeddedSpecsFromDescription(description: string): { brand: string; color: string; size: string } {
  const text = (description ?? "").trim();
  if (!text) return { brand: "", color: "", size: "" };

  const brandRaw = extractLabeledSegment(text, /\b(?:marca|brand)\s*[:：]\s*/i);
  const sizeRaw = extractLabeledSegment(text, /\b(?:talla|tamaño|size)\s*[:：]\s*/i);
  const colorRaw = extractLabeledSegment(text, /\bcolor\s*[:：]\s*/i);

  return {
    brand: trimAvailabilityTail(brandRaw),
    size: trimAvailabilityTail(sizeRaw),
    color: trimAvailabilityTail(colorRaw),
  };
}

/**
 * Quita de la descripción textos que repiten Marca / Color / Talla
 * cuando esos datos ya van en campos propios (evita duplicar en pantalla).
 */
export function stripRedundantSpecsFromDescription(
  description: string,
  specs: { brand: string; color: string; size: string },
): string {
  let text = (description ?? "").trim();
  if (!text) return "";

  const hasBrand = Boolean(specs.brand?.trim());
  const hasColor = Boolean(specs.color?.trim());
  const hasSize = Boolean(specs.size?.trim());

  if (!hasBrand && !hasColor && !hasSize) return text;

  // 1) Líneas enteras que empiezan por etiquetas de ficha técnica
  const lines = text.split(/\r?\n/);
  const keptLines = lines.filter((raw) => {
    const line = raw.trim();
    if (!line) return true;
    if (hasBrand && /^(marca|brand)\s*[:：.\-]/i.test(line)) return false;
    if (hasColor && /^color\s*[:：.\-]/i.test(line)) return false;
    if (hasSize && /^(talla|tamaño|size)\s*[:：.\-]/i.test(line)) return false;
    return true;
  });
  text = keptLines.join("\n");

  // 2) Fragmentos en la misma línea o párrafo: "Marca: X.", "Color: Y;"
  if (hasBrand) {
    text = text.replace(/\b(marca|brand)\s*[:：]\s*[^.;\n]+(?:[.;]|(?=\s|$))/gi, "");
  }
  if (hasColor) {
    text = text.replace(/\bcolor\s*[:：]\s*[^.;\n]+(?:[.;]|(?=\s|$))/gi, "");
  }
  if (hasSize) {
    text = text.replace(/\b(talla|tamaño|size)\s*[:：]\s*[^.;\n]+(?:[.;]|(?=\s|$))/gi, "");
  }

  return text
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*[.;,\s]+\s*/gm, "")
    .trim();
}
