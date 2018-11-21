import { Component } from '@angular/core';
import { ViewController } from 'ionic-angular';

import { ColorProvider } from '../../providers/color/color';
import { SizeProvider } from '../../providers/size/size';

@Component({
	selector: 'page-picker',
	templateUrl: 'picker.html',
})
export class PickerPage {
	constructor(
		public viewCtrl: ViewController,
		public colorProv: ColorProvider,
		public sizeProv: SizeProvider
	) {}

	close() {
		this.viewCtrl.dismiss();
	}

	setColor(color: string) {
		this.colorProv.setCurrentByValue(color);
	}

	setSize(size: number) {
		this.sizeProv.setCurrentByValue(size);
	}
}
