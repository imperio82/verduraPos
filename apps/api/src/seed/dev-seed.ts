import type { INestApplicationContext } from '@nestjs/common';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { COLLECTIONS } from '@/core/constants/collections';
import {
  AddCashIncomeUseCase,
  CreateCashRegisterUseCase,
  OpenCashSessionUseCase,
} from '@/features/cash-registers/domain/usecases';
import { CreateExpenseUseCase } from '@/features/expenses/domain/usecases';
import { RegisterDamageUseCase, RegisterRecountUseCase } from '@/features/inventory/domain/usecases';
import type { ProductEntity } from '@/features/products/domain/entities/product.entity';
import { CreateProductUseCase } from '@/features/products/domain/usecases';
import { CreatePurchaseUseCase, ReceivePurchaseUseCase } from '@/features/purchases/domain/usecases';
import { CreateSaleUseCase } from '@/features/sales/domain/usecases';
import { AddSavingsDepositUseCase, CreateSavingsGoalUseCase } from '@/features/savings/domain/usecases';
import { CreateSupplierUseCase } from '@/features/suppliers/domain/usecases';

type ProductSeed = Parameters<CreateProductUseCase['execute']>[0];

const PRODUCTS: ProductSeed[] = [
  { nombre: 'Tomate chonto', categoria: 'verduras', unidad: 'kg', precioCompra: 3200, porcentajeGanancia: 50, precioVenta: 4800, stock: 8, stockMinimo: 5, color: '#E0442B' },
  { nombre: 'Cebolla cabezona', categoria: 'verduras', unidad: 'kg', precioCompra: 2000, porcentajeGanancia: 60, precioVenta: 3200, stock: 7, stockMinimo: 5, color: '#B5577A' },
  { nombre: 'Zanahoria', categoria: 'verduras', unidad: 'kg', precioCompra: 1600, porcentajeGanancia: 50, precioVenta: 2400, stock: 15, stockMinimo: 4, color: '#F07F1D' },
  { nombre: 'Papa pastusa', categoria: 'raices', unidad: 'kg', precioCompra: 1700, porcentajeGanancia: 50, precioVenta: 2600, stock: 10, stockMinimo: 10, color: '#C9A26B' },
  { nombre: 'Yuca', categoria: 'raices', unidad: 'kg', precioCompra: 1450, porcentajeGanancia: 50, precioVenta: 2200, stock: 12, stockMinimo: 4, color: '#D9C08E' },
  { nombre: 'Plátano hartón', categoria: 'raices', unidad: 'und', precioCompra: 800, porcentajeGanancia: 50, precioVenta: 1200, stock: 60, stockMinimo: 15, color: '#D8B21F' },
  { nombre: 'Banano', categoria: 'frutas', unidad: 'kg', precioCompra: 2000, porcentajeGanancia: 50, precioVenta: 3000, stock: 2, stockMinimo: 4, color: '#F5D33B' },
  { nombre: 'Aguacate Hass', categoria: 'frutas', unidad: 'und', precioCompra: 1000, porcentajeGanancia: 50, precioVenta: 1500, stock: 5, stockMinimo: 10, color: '#4F7A28' },
  { nombre: 'Mango Tommy', categoria: 'frutas', unidad: 'kg', precioCompra: 3700, porcentajeGanancia: 50, precioVenta: 5500, stock: 9, stockMinimo: 3, color: '#F6A623' },
  { nombre: 'Limón Tahití', categoria: 'frutas', unidad: 'kg', precioCompra: 2700, porcentajeGanancia: 50, precioVenta: 4000, stock: 11, stockMinimo: 3, color: '#8BC34A' },
  { nombre: 'Fresa', categoria: 'frutas', unidad: 'kg', precioCompra: 6000, porcentajeGanancia: 50, precioVenta: 9000, stock: 9, stockMinimo: 3, color: '#D93A4A' },
  { nombre: 'Cilantro', categoria: 'hierbas', unidad: 'manojo', precioCompra: 600, porcentajeGanancia: 70, precioVenta: 1000, stock: 5, stockMinimo: 5, color: '#3E9B3E' },
];

/** Compra habitual al proveedor principal (precios de la última compra). */
const USUAL_PURCHASE: [string, number, number][] = [
  ['Tomate chonto', 20, 3200],
  ['Cebolla cabezona', 25, 2000],
  ['Papa pastusa', 50, 1700],
  ['Aguacate Hass', 40, 1000],
  ['Banano', 15, 2000],
  ['Fresa', 5, 6000],
  ['Cilantro', 20, 600],
];

const get = <T>(app: INestApplicationContext, token: new (...args: never[]) => T): T =>
  app.get(token, { strict: false });

/**
 * Datos de ejemplo para desarrollo. Todo lo de "hoy" pasa por los casos de uso
 * reales (así se validan las reglas); el histórico de días anteriores se inserta
 * directo porque los casos de uso siempre fechan con la hora actual.
 */
export async function seedDevData(app: INestApplicationContext): Promise<void> {
  const connection = app.get<Connection>(getConnectionToken());
  if ((await connection.collection(COLLECTIONS.products).countDocuments()) > 0) return;

  // ---- Catálogo ----
  const products = new Map<string, ProductEntity>();
  for (const seed of PRODUCTS) {
    const product = await get(app, CreateProductUseCase).execute(seed);
    products.set(product.nombre, product);
  }
  const id = (nombre: string) => products.get(nombre)!.id;

  const [mayorista, valle] = [
    await get(app, CreateSupplierUseCase).execute({ nombre: 'Central Mayorista Don Ramiro', telefono: '310 555 0101', diasEntrega: 'Lunes, miércoles y viernes' }),
    await get(app, CreateSupplierUseCase).execute({ nombre: 'Frutas del Valle', telefono: '315 555 0202', diasEntrega: 'Jueves' }),
  ];

  const createRegister = get(app, CreateCashRegisterUseCase);
  const [caja1, caja2] = [await createRegister.execute('Caja 1'), await createRegister.execute('Caja 2')];
  await createRegister.execute('Caja 3');

  const createGoal = get(app, CreateSavingsGoalUseCase);
  const goal = await createGoal.execute({ nombre: 'Nevera exhibidora', meta: 5_000_000, periodo: 'mensual', aportePeriodo: 400_000 });
  const emergencyGoal = await createGoal.execute({ nombre: 'Fondo de emergencia', meta: 2_000_000, periodo: 'semanal', aportePeriodo: 100_000 });
  // Meta atrasada a propósito, para ver la alerta de cumplimiento.
  const motoGoal = await createGoal.execute({ nombre: 'Moto para domicilios', meta: 6_000_000, periodo: 'mensual', aportePeriodo: 500_000 });
  // Diaria sin aporte ayer: sale con alerta.
  await createGoal.execute({ nombre: 'Caja menor', meta: 500_000, periodo: 'diario', aportePeriodo: 20_000 });
  // Las metas de ejemplo llevan tiempo creadas: así su periodo actual ya se evalúa (y se ve la alerta).
  await connection
    .collection(COLLECTIONS.savingsGoals)
    .updateMany({}, { $set: { createdAt: new Date(Date.now() - 60 * 86_400_000) } });

  // ---- Histórico (últimos 6 días) ----
  await seedHistory(connection, { cajaId: caja1.id, goalId: goal.id, goalNombre: goal.nombre, products: [...products.values()] });

  // ---- Compras: la de hoy ya llegó y se revisó (suma stock y fija precios) ----
  const today = new Date();
  const createPurchase = get(app, CreatePurchaseUseCase);
  const usualItems = USUAL_PURCHASE.map(([nombre, cantidad, precioCompra]) => ({
    productId: id(nombre),
    cantidad,
    precioCompra,
    porcentajeGanancia: products.get(nombre)!.porcentajeGanancia,
  }));
  const todayPurchase = await createPurchase.execute({
    supplierId: mayorista.id,
    numeroFactura: 'FV-2290',
    fechaFactura: today,
    porcentajeGananciaGeneral: 50,
    items: usualItems,
    nota: 'Compra habitual',
  });
  await get(app, ReceivePurchaseUseCase).execute(todayPurchase.id, {
    items: usualItems.map((item) => ({ productId: item.productId, estado: 'bien' as const, cantidadRecibida: item.cantidad })),
  });

  // ---- Compras por llegar ----
  await createPurchase.execute({
    supplierId: mayorista.id,
    fechaEntrega: today,
    porcentajeGananciaGeneral: 50,
    nota: 'Pedido habitual',
    items: USUAL_PURCHASE.map(([nombre, cantidad]) => ({ productId: id(nombre), cantidad })),
  });
  const thursday = new Date(today);
  thursday.setDate(today.getDate() + ((4 - today.getDay() + 7) % 7 || 7));
  await createPurchase.execute({
    supplierId: valle.id,
    fechaEntrega: thursday,
    porcentajeGananciaGeneral: 50,
    items: [
      { productId: id('Mango Tommy'), cantidad: 10 },
      { productId: id('Limón Tahití'), cantidad: 8 },
      { productId: id('Fresa'), cantidad: 4 },
    ],
  });

  // ---- Cajas abiertas y movimientos de hoy ----
  const openSession = get(app, OpenCashSessionUseCase);
  const s1 = await openSession.execute({ cashRegisterId: caja1.id, cajero: 'Marta', base: 200_000, notaApertura: 'Base igual al cierre de ayer.' });
  const s2 = await openSession.execute({ cashRegisterId: caja2.id, cajero: 'Julián', base: 100_000 });

  const expense = get(app, CreateExpenseUseCase);
  // Pagos por transferencia: quedan en el cierre de la caja pero no salen de su efectivo.
  await expense.execute({ concepto: 'Compra a Central Mayorista', destino: 'proveedor', monto: 280_000, metodoPago: 'transferencia', cashSessionId: s1.id });
  await expense.execute({ concepto: 'Flete desde la central', destino: 'transporte', monto: 45_000, cashSessionId: s1.id });
  await expense.execute({ concepto: 'Bolsas y empaques', destino: 'insumos', monto: 32_000, cashSessionId: s1.id });
  await expense.execute({ concepto: 'Almuerzo empleados', destino: 'personal', monto: 30_000, cashSessionId: s1.id });
  await expense.execute({ concepto: 'Recibo de energía', destino: 'servicios', monto: 25_000, metodoPago: 'transferencia', cashSessionId: s1.id });

  await get(app, AddCashIncomeUseCase).execute(s1.id, 'Sencillo traído del banco', 50_000);

  const sale = get(app, CreateSaleUseCase);
  const line = (nombre: string, cantidad: number) => ({ productId: id(nombre), cantidad });
  await sale.execute({ cashSessionId: s1.id, tipo: 'productos', metodoPago: 'efectivo', items: [line('Tomate chonto', 1.25), line('Aguacate Hass', 3), line('Banano', 0.8), line('Cilantro', 1)] });
  await sale.execute({ cashSessionId: s1.id, tipo: 'productos', metodoPago: 'transferencia', items: [line('Papa pastusa', 5), line('Cebolla cabezona', 2)] });
  await sale.execute({ cashSessionId: s1.id, tipo: 'productos', metodoPago: 'efectivo', items: [line('Plátano hartón', 6), line('Yuca', 2)] });
  await sale.execute({ cashSessionId: s1.id, tipo: 'total', metodoPago: 'efectivo', total: 38_500, nota: 'Venta rápida' });
  await sale.execute({ cashSessionId: s1.id, tipo: 'productos', metodoPago: 'tarjeta', items: [line('Fresa', 1), line('Mango Tommy', 2)] });
  // Movimiento normal de la mañana en Caja 1
  const names = [...products.keys()];
  const methods = ['efectivo', 'efectivo', 'transferencia', 'efectivo', 'tarjeta'] as const;
  for (let i = 0; i < 36; i++) {
    const items = [0, 1].slice(0, 1 + (i % 2)).map((k) => {
      const nombre = names[(i * 5 + k * 3) % names.length];
      return line(nombre, products.get(nombre)!.unidad === 'kg' ? 0.5 + (i % 3) * 0.5 : 1 + (i % 3));
    });
    await sale.execute({ cashSessionId: s1.id, tipo: 'productos', metodoPago: methods[i % methods.length], items });
  }
  await sale.execute({ cashSessionId: s2.id, tipo: 'productos', metodoPago: 'efectivo', items: [line('Limón Tahití', 1.5), line('Zanahoria', 2)] });

  const deposit = get(app, AddSavingsDepositUseCase);
  await deposit.execute({ goalId: goal.id, monto: 100_000, cashSessionId: s1.id });
  // Aporte por fuera de caja (p. ej. consignación): la meta no depende de una caja.
  await deposit.execute({ goalId: emergencyGoal.id, monto: 450_000 });
  await deposit.execute({ goalId: motoGoal.id, monto: 80_000 });

  // ---- Inventario ----
  await get(app, RegisterDamageUseCase).execute({ productId: id('Fresa'), cantidad: 1.5, motivo: 'Llegó golpeada', cashSessionId: s1.id });
  await get(app, RegisterDamageUseCase).execute({ productId: id('Tomate chonto'), cantidad: 2, motivo: 'Muy maduro', cashSessionId: s1.id });
  await get(app, RegisterRecountUseCase).execute({
    items: [
      { productId: id('Mango Tommy'), contado: 6.5 },
      { productId: id('Limón Tahití'), contado: 9 },
    ],
    nota: 'Reconteo de cierre',
    cashSessionId: s1.id,
  });
}

interface HistoryContext {
  cajaId: string;
  goalId: string;
  goalNombre: string;
  products: ProductEntity[];
}

async function seedHistory(connection: Connection, ctx: HistoryContext): Promise<void> {
  const sessions = connection.collection(COLLECTIONS.cashSessions);
  const sales = connection.collection(COLLECTIONS.sales);
  const expenses = connection.collection(COLLECTIONS.expenses);
  const deposits = connection.collection(COLLECTIONS.savingsDeposits);
  const counters = connection.collection(COLLECTIONS.counters);

  let numero = 0;
  const methods = ['efectivo', 'efectivo', 'transferencia', 'efectivo', 'tarjeta'] as const;

  for (let daysAgo = 6; daysAgo >= 1; daysAgo--) {
    const day = new Date();
    day.setDate(day.getDate() - daysAgo);
    const at = (h: number, m = 0) => new Date(day.getFullYear(), day.getMonth(), day.getDate(), h, m);

    const sessionId = new Types.ObjectId();
    const saleDocs = Array.from({ length: 70 + daysAgo * 4 }, (_, i) => {
      const items = [0, 1, 2].slice(0, 1 + ((i + daysAgo) % 3)).map((k) => {
        const product = ctx.products[(i * 5 + k * 7 + daysAgo) % ctx.products.length];
        const cantidad = product.unidad === 'kg' ? 1 + ((i + k + daysAgo) % 4) * 0.5 : 2 + ((i + k) % 4);
        const precioUnitario = product.precioVenta;
        return { productId: new Types.ObjectId(product.id), nombre: product.nombre, unidad: product.unidad, cantidad, precioUnitario, total: Math.round(cantidad * precioUnitario) };
      });
      const total = items.reduce((sum, item) => sum + item.total, 0);
      return {
        numero: ++numero,
        cashSessionId: sessionId,
        cajaNombre: 'Caja 1',
        cajero: 'Marta',
        tipo: 'productos',
        items,
        subtotal: total,
        descuento: 0,
        total,
        metodoPago: methods[i % methods.length],
        createdAt: at(6 + (i % 14), (i * 7) % 60),
      };
    });
    await sales.insertMany(saleDocs);

    const gastos = [
      { concepto: 'Compra a Central Mayorista', destino: 'proveedor', monto: 180_000 + daysAgo * 15_000 },
      { concepto: 'Flete desde la central', destino: 'transporte', monto: 45_000 },
      { concepto: 'Almuerzo empleados', destino: 'personal', monto: 28_000 },
    ].map((g, i) => ({ ...g, metodoPago: 'efectivo', cashSessionId: sessionId, createdAt: at(6 + i * 3, 10) }));
    await expenses.insertMany(gastos);

    const efectivo = saleDocs.filter((s) => s.metodoPago === 'efectivo').reduce((sum, s) => sum + s.total, 0);
    const deposit = daysAgo % 2 === 0 ? 150_000 : 0;
    if (deposit) {
      await deposits.insertOne({ goalId: new Types.ObjectId(ctx.goalId), goalNombre: ctx.goalNombre, monto: deposit, cashSessionId: sessionId, createdAt: at(14) });
    }
    const esperado = 200_000 + efectivo - gastos.reduce((sum, g) => sum + g.monto, 0) - deposit;
    const diferencia = [0, 3_000, -5_000, 0, -2_000, 0][daysAgo - 1];

    await sessions.insertOne({
      _id: sessionId,
      cashRegisterId: new Types.ObjectId(ctx.cajaId),
      cajaNombre: 'Caja 1',
      cajero: 'Marta',
      base: 200_000,
      estado: 'cerrada',
      abiertaEn: at(6),
      cerradaEn: at(20),
      cierre: { conteo: [], monedas: esperado + diferencia, contado: esperado + diferencia, esperado, diferencia },
    });
  }

  // Aportes anteriores a la semana para que la meta tenga historia.
  await deposits.insertOne({ goalId: new Types.ObjectId(ctx.goalId), goalNombre: ctx.goalNombre, monto: 2_600_000, createdAt: new Date(Date.now() - 30 * 86_400_000) });
  await counters.updateOne({ _id: 'ventas' as never }, { $set: { seq: numero } }, { upsert: true });
}
