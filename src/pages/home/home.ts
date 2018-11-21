import { Component, ViewChild } from '@angular/core';
import { NavController, PopoverController, AlertController, Content } from 'ionic-angular';

import { PickerPage } from '../picker/picker';
import { SizeProvider } from '../../providers/size/size';
import { ColorProvider } from '../../providers/color/color';
import { CanvasComponent } from '../../components/canvas/canvas';

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	@ViewChild('canvas')
	public canvas: CanvasComponent;

	@ViewChild('content')
	public content: Content;

	private canUndo: boolean;
	private canRedo: boolean;

	get penStyle(): object {
		let color = this.colorProv.current;
		let size = this.sizeProv.current;

		return {
			display: 'inline-block',
			'border-radius': '50%',
			'border-color': 'black',
			'border-width': '1px',
			'border-style': 'solid',
			'background-color': color.value,
			width: size.value + 'px',
			height: size.value + 'px'
		};
	}

	constructor(
		public navCtrl: NavController,
		public alertCtrl: AlertController,
		public popoverCtrl: PopoverController,
		public colorProv: ColorProvider,
		public sizeProv: SizeProvider
	) {}

	showPopover(event) {
		this.popoverCtrl.create(PickerPage).present({ ev: event });
	}
}
