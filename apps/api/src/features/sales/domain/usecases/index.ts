import type { SaleEntity, SaleFilters } from '../entities/sale.entity';
import type { SaleRepository } from '../repositories/sale.repository';

export { CreateSaleUseCase, type CreateSaleInput } from './create-sale.usecase';

export class GetSalesUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  execute(filters: SaleFilters): Promise<SaleEntity[]> {
    return this.saleRepository.findAll(filters);
  }
}

export class GetNextSaleNumberUseCase {
  constructor(private readonly saleRepository: SaleRepository) {}

  execute(): Promise<number> {
    return this.saleRepository.peekNextNumber();
  }
}
