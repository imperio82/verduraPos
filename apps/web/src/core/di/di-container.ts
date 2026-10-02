// eslint-disable-next-line @typescript-eslint/no-explicit-any -- constructor genérico del contenedor
type Constructor<T = unknown> = new (...args: any[]) => T;
type Factory<T> = () => T;
type ServiceIdentifier = string | symbol;

interface ServiceDescriptor<T = unknown> {
	singleton: boolean;
	factory: Factory<T>;
	instance?: T;
}

/**
 * Contenedor de inyección de dependencias (mismo patrón que Netvoz POS).
 * Cada feature registra datasource → repository → use cases en su `di/`.
 */
class DIContainer {
	private services = new Map<ServiceIdentifier, ServiceDescriptor>();

	register<T>(identifier: ServiceIdentifier, factory: Factory<T>, singleton = true): void {
		this.services.set(identifier, { factory, singleton });
	}

	registerClass<T>(
		identifier: ServiceIdentifier,
		constructor: Constructor<T>,
		dependencies: ServiceIdentifier[] = [],
		singleton = true,
	): void {
		this.register(identifier, () => new constructor(...dependencies.map((dep) => this.get(dep))), singleton);
	}

	get<T>(identifier: ServiceIdentifier): T {
		const descriptor = this.services.get(identifier) as ServiceDescriptor<T> | undefined;
		if (!descriptor) throw new Error(`Servicio ${String(identifier)} no registrado`);

		if (!descriptor.singleton) return descriptor.factory();
		descriptor.instance ??= descriptor.factory();
		return descriptor.instance;
	}

	has(identifier: ServiceIdentifier): boolean {
		return this.services.has(identifier);
	}
}

export const container = new DIContainer();
