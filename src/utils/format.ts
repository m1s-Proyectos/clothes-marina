export function formatCurrency(value: number | string | null): string {
  const numericValue = value === null ? 0 : Number(value);
  if (Number.isNaN(numericValue)) return "$0.00";

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(numericValue);
}
