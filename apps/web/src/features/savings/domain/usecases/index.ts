import { AppError } from "@/core/errors/app-error";
import type {
	AddSavingsDepositEntity,
	SaveSavingsGoalEntity,
	SavingsDepositEntity,
	SavingsGoalEntity,
	UpdateSavingsGoalEntity,
} from "../entities/savings.entity";
import type { SavingsRepository } from "../repositories/savings.repository";

export class GetSavingsGoalsUseCase {
	constructor(private readonly savingsRepository: SavingsRepository) {}

	execute(): Promise<SavingsGoalEntity[]> {
		return this.savingsRepository.getGoals();
	}
}

const validateGoal = (goal: SaveSavingsGoalEntity): void => {
	if (goal.nombre.trim().length < 2) throw new AppError("Escribe el nombre de la meta", "VALIDATION_ERROR");
	if (goal.meta <= 0) throw new AppError("La meta debe ser mayor a cero", "VALIDATION_ERROR");
	if (goal.aportePeriodo <= 0) throw new AppError("La cuota debe ser mayor a cero", "VALIDATION_ERROR");
	if (goal.aportePeriodo > goal.meta) throw new AppError("La cuota no puede ser mayor que la meta", "VALIDATION_ERROR");
};

export class UpdateSavingsGoalUseCase {
	constructor(private readonly savingsRepository: SavingsRepository) {}

	execute(id: string, changes: UpdateSavingsGoalEntity): Promise<SavingsGoalEntity> {
		return this.savingsRepository.updateGoal(id, { ...changes, nombre: changes.nombre?.trim() });
	}
}

/** Guardar el formulario de meta: crea o edita, con las mismas validaciones. */
export class SaveSavingsGoalUseCase {
	constructor(private readonly savingsRepository: SavingsRepository) {}

	execute({ id, ...goal }: SaveSavingsGoalEntity & { id?: string }): Promise<SavingsGoalEntity> {
		validateGoal(goal);
		const data = { ...goal, nombre: goal.nombre.trim() };
		return id ? this.savingsRepository.updateGoal(id, data) : this.savingsRepository.createGoal(data);
	}
}

export class AddSavingsDepositUseCase {
	constructor(private readonly savingsRepository: SavingsRepository) {}

	execute(deposit: AddSavingsDepositEntity): Promise<SavingsDepositEntity> {
		if (deposit.monto <= 0) throw new AppError("El monto debe ser mayor a cero", "VALIDATION_ERROR");
		return this.savingsRepository.addDeposit(deposit);
	}
}
