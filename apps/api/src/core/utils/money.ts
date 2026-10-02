/** Redondea a pesos enteros (COP no maneja centavos en la práctica). */
export const roundMoney = (value: number): number => Math.round(value);

/** Redondea cantidades (kg, und) a 3 decimales. */
export const roundQuantity = (value: number): number => Math.round(value * 1000) / 1000;

/** Precio de venta a partir del costo y el % de ganancia, redondeado a la centena. */
export const salePriceFromCost = (cost: number, profitPercent: number): number =>
  Math.round((cost * (1 + profitPercent / 100)) / 100) * 100;
