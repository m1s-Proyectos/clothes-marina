import assert from "node:assert/strict";
import test from "node:test";
import {
  sanitizePlainText,
  validateContactPayload,
  validateProductId,
  validateWhatsAppLeadPayload,
} from "../../src/utils/inputValidation.ts";

test("contact payload validation enforces bounds", () => {
  assert.equal(
    validateContactPayload({ name: "A", phone: "1234567", message: "Hola mundo" }).ok,
    false,
  );
  assert.equal(
    validateContactPayload({ name: "Marina", phone: "50379128469", message: "Quiero informacion" }).ok,
    true,
  );
});

test("whatsapp lead validation requires UUID product id", () => {
  assert.equal(
    validateWhatsAppLeadPayload({ productId: "not-a-uuid", productName: "Camiseta" }).ok,
    false,
  );
  assert.equal(
    validateWhatsAppLeadPayload({
      productId: "550e8400-e29b-41d4-a716-446655440000",
      productName: "Camiseta",
    }).ok,
    true,
  );
});

test("sanitizePlainText strips control characters", () => {
  assert.equal(sanitizePlainText("Hola\u0000mundo", 20), "Holamundo");
});

test("validateProductId accepts RFC4122 ids", () => {
  assert.equal(validateProductId("550e8400-e29b-41d4-a716-446655440000"), true);
  assert.equal(validateProductId("123"), false);
});
