import { Component, ViewChild } from '@angular/core';
import { NavController, AlertController, Content } from 'ionic-angular';

import { CanvasComponent } from '../../app/canvas.component';

interface Setting<T> { label: string, value: T }

@Component({
	selector: 'page-home',
	templateUrl: 'home.html'
})
export class HomePage {
	private colors: Setting<string>[] = [
		{ label: 'Black',   value: 'black'  },
		{ label: 'Red',     value: 'red'    },
		{ label: 'Blue',    value: 'blue'   },
		{ label: 'Yellow',  value: 'yellow' },
		{ label: 'Green',   value: 'green'  },
		{ label: 'Orange',  value: 'orange' },
		{ label: 'Purple',  value: 'purple' }
	];

	private sizes: Setting<number>[] = [
		{ label: 'Fine',   value: 12 },
		{ label: 'Small',  value: 16 },
		{ label: 'Medium', value: 24 },
		{ label: 'Large',  value: 32 }
	];

	private color = this.colors[0];
	private size = this.sizes[0];

	@ViewChild('canvas')
	public canvas: CanvasComponent;

	@ViewChild('content')
	public content: Content;

	constructor(
		public navCtrl: NavController,
		public alertCtrl: AlertController
	) {}

	showColorAlert() {
		let alert = this.alertCtrl.create();

		alert.setTitle('Select Color');

		for (let color of this.colors) {
			alert.addInput({
				type    : 'radio',
				label   : color.label,
				value   : color.value,
				checked : color == this.color
			});
		}

		alert.addButton('Cancel');
		alert.addButton({
			text: 'Ok',
			handler: (data) => {
				this.color = this.colors.find(color => color.value == data );
			}
		});

		alert.present();
	}

	showSizeAlert() {
		let alert = this.alertCtrl.create();

		alert.setTitle('Select Size');

		for (let size of this.sizes) {
			alert.addInput({
				type    : 'radio',
				label   : size.label,
				value   : size.value + '',
				checked : size == this.size
			});
		}

		alert.addButton('Cancel');
		alert.addButton({
			text: 'Ok',
			handler: (data) => {
				this.size = this.sizes.find(size => size.value == data );
			}
		});

		alert.present();
	}

	reset() {
		this.canvas.reset();
	}
}
