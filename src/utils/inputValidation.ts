export interface ValidationResult {
  ok: boolean;
  message?: string;
}

function hasControlChars(value: string): boolean {
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code <= 0x1f || code === 0x7f) return true;
  }
  return false;
}

function stripControlChars(value: string): string {
  let result = "";
  for (let index = 0; index < value.length; index += 1) {
    const code = value.charCodeAt(index);
    if (code > 0x1f && code !== 0x7f) {
      result += value[index];
    }
  }
  return result;
}
export function validateContactPayload(payload: {
  name: string;
  phone: string;
  message: string;
}): ValidationResult {
  const name = payload.name.trim();
  const phone = payload.phone.trim();
  const message = payload.message.trim();

  if (name.length < 2 || name.length > 120) {
    return { ok: false, message: "El nombre debe tener entre 2 y 120 caracteres." };
  }

  if (phone.length < 7 || phone.length > 30) {
    return { ok: false, message: "El telefono debe tener entre 7 y 30 caracteres." };
  }

  if (!/^[\d+\s().-]+$/.test(phone)) {
    return { ok: false, message: "El telefono contiene caracteres no permitidos." };
  }

  if (message.length < 5 || message.length > 2000) {
    return { ok: false, message: "El mensaje debe tener entre 5 y 2000 caracteres." };
  }

  if ([name, phone, message].some(hasControlChars)) {
    return { ok: false, message: "Se detectaron caracteres no permitidos." };
  }

  return { ok: true };
}

export function validateProductId(productId: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(productId);
}

export function validateWhatsAppLeadPayload(payload: {
  productId: string;
  productName: string;
}): ValidationResult {
  if (!validateProductId(payload.productId)) {
    return { ok: false, message: "Producto invalido." };
  }

  const productName = payload.productName.trim();
  if (productName.length < 1 || productName.length > 200) {
    return { ok: false, message: "Nombre de producto invalido." };
  }

  if (hasControlChars(productName)) {
    return { ok: false, message: "Se detectaron caracteres no permitidos." };
  }

  return { ok: true };
}

export function sanitizePlainText(value: string, maxLength: number): string {
  return stripControlChars(value).trim().slice(0, maxLength);
}
