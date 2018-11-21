import { Injectable } from '@angular/core';

import { SettingProvider } from '../setting';

@Injectable()
export class SizeProvider extends SettingProvider<number> {
	constructor() {
		super([
			{ label: 'Fine',   value: 12 },
			{ label: 'Small',  value: 16 },
			{ label: 'Medium', value: 24 },
			{ label: 'Large',  value: 32 }
		]);
	}
}
