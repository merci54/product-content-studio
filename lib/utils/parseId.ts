export function parseId(id: string) {
  const productId = Number(id);
  return Number.isInteger(productId) && productId > 0 ? productId : null;
}
