export interface Setting<T> { label: string, value: T }

export class SettingProvider<T> {
	private options: Setting<T>[];
	public current: Setting<T>;

	constructor(options: Setting<T>[]) {
		this.options = options;
		this.current = options[0];
	}

	getAll(): Setting<T>[] {
		return this.options;
	}

	getByLabel(label: string): Setting<T> {
		return this.options.find(option => option.label == label);
	}

	getByValue(value: T): Setting<T> {
		return this.options.find(option => option.value == value);
	}

	setCurrentByLabel(label: string): Setting<T> {
		return this.current = this.getByLabel(label);
	}

	setCurrentByValue(value: T): Setting<T> {
		return this.current = this.getByValue(value);
	}

	each(fn: (color: Setting<T>) => void) {
		this.options.forEach(fn);
	}
}
