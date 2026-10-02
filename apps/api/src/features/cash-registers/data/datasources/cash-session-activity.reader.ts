import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Types } from 'mongoose';
import { COLLECTIONS, type PaymentMethod } from '@/core/constants/collections';
import {
  emptyTotals,
  type CashActivityItem,
  type CashSessionTotals,
} from '../../domain/entities/cash-register.entity';
import type { CashSessionActivityReader } from '../../domain/repositories/cash-register.repository';

interface SumRow {
  _id: Types.ObjectId;
  count: number;
  total: number;
}

interface ExpenseRow extends SumRow {
  efectivo: number;
}

interface SalesRow {
  _id: { session: Types.ObjectId; metodo: PaymentMethod };
  count: number;
  total: number;
}

/**
 * Read-model de caja: agrega ventas, gastos, aportes a ahorro e ingresos por
 * sesión directamente sobre sus colecciones. No depende de los módulos de esas
 * features, así se evita una dependencia circular (ellas sí dependen de caja).
 */
@Injectable()
export class MongoCashSessionActivityReader implements CashSessionActivityReader {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  async getTotals(sessionIds: string[]): Promise<Map<string, CashSessionTotals>> {
    const ids = sessionIds.map((id) => new Types.ObjectId(id));
    const result = new Map<string, CashSessionTotals>(sessionIds.map((id) => [id, emptyTotals()]));
    if (ids.length === 0) return result;

    const [sales, incomes, expenses, savings, damages] = await Promise.all([
      this.collection(COLLECTIONS.sales)
        .aggregate<SalesRow>([
          { $match: { cashSessionId: { $in: ids } } },
          {
            $group: {
              _id: { session: '$cashSessionId', metodo: '$metodoPago' },
              count: { $sum: 1 },
              total: { $sum: '$total' },
            },
          },
        ])
        .toArray(),
      this.sumBySession(COLLECTIONS.cashMovements, 'sessionId', 'monto', ids),
      this.collection(COLLECTIONS.expenses)
        .aggregate<ExpenseRow>([
          { $match: { cashSessionId: { $in: ids } } },
          {
            $group: {
              _id: '$cashSessionId',
              count: { $sum: 1 },
              total: { $sum: '$monto' },
              // Los gastos sin método son anteriores al campo: se pagaban en efectivo.
              efectivo: { $sum: { $cond: [{ $eq: ['$metodoPago', 'transferencia'] }, 0, '$monto'] } },
            },
          },
        ])
        .toArray(),
      this.sumBySession(COLLECTIONS.savingsDeposits, 'cashSessionId', 'monto', ids),
      this.sumBySession(COLLECTIONS.damages, 'cashSessionId', 'costo', ids),
    ]);

    for (const row of sales) {
      const totals = result.get(row._id.session.toString());
      if (!totals) continue;
      totals.ventasCount += row.count;
      totals.ventasTotal += row.total;
      totals.ventasPorMetodo[row._id.metodo] += row.total;
    }
    for (const row of incomes) {
      const totals = result.get(row._id.toString());
      if (totals) Object.assign(totals, { ingresosCount: row.count, ingresosTotal: row.total });
    }
    for (const row of expenses) {
      const totals = result.get(row._id.toString());
      if (totals) Object.assign(totals, { gastosCount: row.count, gastosTotal: row.total, gastosEfectivo: row.efectivo });
    }
    for (const row of savings) {
      const totals = result.get(row._id.toString());
      if (totals) totals.ahorroTotal = row.total;
    }
    for (const row of damages) {
      const totals = result.get(row._id.toString());
      if (totals) Object.assign(totals, { danadosCount: row.count, danadosCosto: row.total });
    }
    return result;
  }

  async getActivity(sessionId: string): Promise<CashActivityItem[]> {
    const id = new Types.ObjectId(sessionId);

    const [salesByHour, incomes, expenses, savings, damages, recounts] = await Promise.all([
      // Las ventas se agrupan por hora para no inundar la lista.
      this.collection(COLLECTIONS.sales)
        .aggregate<{ _id: Date; count: number; total: number; ultima: Date }>([
          { $match: { cashSessionId: id } },
          {
            $group: {
              _id: { $dateTrunc: { date: '$createdAt', unit: 'hour', timezone: process.env.TZ ?? 'America/Bogota' } },
              count: { $sum: 1 },
              total: { $sum: '$total' },
              ultima: { $max: '$createdAt' },
            },
          },
        ])
        .toArray(),
      this.collection(COLLECTIONS.cashMovements).find({ sessionId: id }).toArray(),
      this.collection(COLLECTIONS.expenses).find({ cashSessionId: id }).toArray(),
      this.collection(COLLECTIONS.savingsDeposits).find({ cashSessionId: id }).toArray(),
      this.collection(COLLECTIONS.damages).find({ cashSessionId: id }).toArray(),
      this.collection(COLLECTIONS.recounts).find({ cashSessionId: id }).toArray(),
    ]);

    const items: CashActivityItem[] = [
      ...salesByHour.map((row) => ({
        fecha: row.ultima,
        tipo: 'venta' as const,
        detalle: `${row.count} ${row.count === 1 ? 'venta' : 'ventas'} (${formatHour(row._id)})`,
        monto: row.total,
      })),
      ...incomes.map((m) => ({ fecha: m.createdAt, tipo: 'ingreso' as const, detalle: m.concepto, monto: m.monto })),
      ...expenses.map((g) => ({
        fecha: g.createdAt,
        tipo: 'gasto' as const,
        detalle: g.concepto,
        monto: g.monto,
        afectaEfectivo: g.metodoPago !== 'transferencia',
      })),
      ...savings.map((a) => ({
        fecha: a.createdAt,
        tipo: 'ahorro' as const,
        detalle: `Meta: ${a.goalNombre ?? 'ahorro'}`,
        monto: a.monto,
      })),
      ...damages.map((d) => ({
        fecha: d.createdAt,
        tipo: 'danado' as const,
        detalle: `${d.nombre}: ${d.cantidad} ${d.unidad}${d.motivo ? ` · ${d.motivo}` : ''}`,
        monto: d.costo,
        afectaEfectivo: false,
      })),
      ...recounts.map((r) => ({
        fecha: r.createdAt,
        tipo: 'reconteo' as const,
        detalle: `Reconteo de ${r.items.length} ${r.items.length === 1 ? 'producto' : 'productos'}`,
        monto: 0,
        afectaEfectivo: false,
      })),
    ];

    return items.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
  }

  private collection(name: string) {
    return this.connection.collection(name);
  }

  private sumBySession(collection: string, field: string, amountField: string, ids: Types.ObjectId[]) {
    return this.collection(collection)
      .aggregate<SumRow>([
        { $match: { [field]: { $in: ids } } },
        { $group: { _id: `$${field}`, count: { $sum: 1 }, total: { $sum: `$${amountField}` } } },
      ])
      .toArray();
  }
}

const formatHour = (date: Date): string => {
  const start = new Date(date);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const hh = (d: Date) => `${d.getHours()}:00`;
  return `${hh(start)}–${hh(end)}`;
};
