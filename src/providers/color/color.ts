import { Injectable } from '@angular/core';

import { SettingProvider } from '../setting';

@Injectable()
export class ColorProvider extends SettingProvider<string> {
	constructor() {
		super([
			{ label: 'Black',   value: '#000000' },
			{ label: 'Red',     value: '#FF0000' },
			{ label: 'Blue',    value: '#007FFF' },
			{ label: 'Yellow',  value: '#FFCF00' },
			{ label: 'White',   value: '#FFFFFF' },
			{ label: 'Green',   value: '#007F00' },
			{ label: 'Orange',  value: '#FF7F3F' },
			{ label: 'Purple',  value: '#7F007F' }
		]);
	}
}
