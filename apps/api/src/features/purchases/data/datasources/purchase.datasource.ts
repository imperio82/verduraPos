import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model, Types, type FilterQuery, type SortOrder } from 'mongoose';
import { SequenceService } from '@/core/database/sequence.service';
import type { NewPurchase, ReceivedPurchaseData } from '../../domain/entities/purchase.entity';
import type { PurchaseFilters } from '../../domain/repositories/purchase.repository';
import { PURCHASE_MODEL, type PurchaseDocument, type PurchaseRecord } from '../models/purchase.models';

const PURCHASE_SEQUENCE = 'compras';

export interface PurchaseDataSource {
  create(purchase: NewPurchase): Promise<PurchaseDocument>;
  find(filters: PurchaseFilters): Promise<PurchaseDocument[]>;
  findById(id: string): Promise<PurchaseDocument | null>;
  findLastBySupplier(supplierId: string): Promise<PurchaseDocument | null>;
  markReceived(id: string, data: ReceivedPurchaseData): Promise<PurchaseDocument | null>;
  cancel(id: string): Promise<PurchaseDocument | null>;
}

@Injectable()
export class MongoPurchaseDataSource implements PurchaseDataSource {
  constructor(
    @InjectModel(PURCHASE_MODEL) private readonly model: Model<PurchaseRecord>,
    private readonly sequences: SequenceService,
  ) {}

  async create({ supplierId, items, ...purchase }: NewPurchase): Promise<PurchaseDocument> {
    const seq = await this.sequences.next(PURCHASE_SEQUENCE);
    return this.model.create({
      ...purchase,
      codigo: `C-${String(seq).padStart(3, '0')}`,
      estado: 'por_llegar',
      supplierId: new Types.ObjectId(supplierId),
      items: items.map((item) => ({ ...item, productId: new Types.ObjectId(item.productId) })),
    });
  }

  find({ supplierId, estado, from, to }: PurchaseFilters): Promise<PurchaseDocument[]> {
    const query: FilterQuery<PurchaseRecord> = {};
    if (supplierId && isValidObjectId(supplierId)) query.supplierId = new Types.ObjectId(supplierId);
    if (estado) query.estado = estado;
    if (from || to) query.createdAt = { ...(from && { $gte: from }), ...(to && { $lte: to }) };
    // Lo que está por llegar se ordena por fecha de entrega; el histórico, de la más nueva a la más vieja.
    const sort: Record<string, SortOrder> = estado === 'por_llegar' ? { fechaEntrega: 1 } : { createdAt: -1 };
    return this.model.find(query).sort(sort).limit(200).exec();
  }

  findById(id: string): Promise<PurchaseDocument | null> {
    if (!isValidObjectId(id)) return Promise.resolve(null);
    return this.model.findById(id).exec();
  }

  findLastBySupplier(supplierId: string): Promise<PurchaseDocument | null> {
    if (!isValidObjectId(supplierId)) return Promise.resolve(null);
    return this.model
      .findOne({ supplierId: new Types.ObjectId(supplierId), estado: { $ne: 'cancelada' } })
      .sort({ createdAt: -1 })
      .exec();
  }

  markReceived(id: string, { items, ...data }: ReceivedPurchaseData): Promise<PurchaseDocument | null> {
    if (!isValidObjectId(id)) return Promise.resolve(null);
    return this.model
      .findOneAndUpdate(
        { _id: id, estado: 'por_llegar' },
        {
          $set: {
            ...data,
            estado: 'recibida',
            recibidaEn: new Date(),
            items: items.map((item) => ({ ...item, productId: new Types.ObjectId(item.productId) })),
          },
        },
        { new: true },
      )
      .exec();
  }

  cancel(id: string): Promise<PurchaseDocument | null> {
    if (!isValidObjectId(id)) return Promise.resolve(null);
    return this.model
      .findOneAndUpdate({ _id: id, estado: 'por_llegar' }, { $set: { estado: 'cancelada' } }, { new: true })
      .exec();
  }
}
