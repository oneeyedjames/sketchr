import { Component, Input, Output, EventEmitter,
	ElementRef, AfterViewInit, ViewChild } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import 'rxjs/add/observable/fromEvent';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/pairwise';
import 'rxjs/add/operator/switchMap';

export interface Point2D { x: number, y: number }

export interface Line2D { start: Point2D; end: Point2D; }

export interface DrawEvent {
	line?: Line2D;
	color?: string;
	size?: number;
}

@Component({
	selector: 'app-canvas',
	template: '<canvas #canvas></canvas>',
	styles: ['canvas { border: none }']
})
export class CanvasComponent implements AfterViewInit {
	private _color: string = '#000';
	private _size: number = 16;
	private _width: number = 360;
	private _height: number = 640;

	private context: CanvasRenderingContext2D;

	@ViewChild('canvas')
	public canvas: ElementRef;

	get color(): string { return this._color; }
	get size(): number { return this._size; }
	get width(): number { return this._width; }
	get height(): number { return this._height; }

	@Input() set color(color: string) {
		this._color = color;

		if (this.context)
			this.context.strokeStyle = color;

		this.draw.emit({ color: color });
	}

	@Input() set size(size: number) {
		this._size = size;

		if (this.context)
			this.context.lineWidth = size;

		this.draw.emit({ size: size });
	}

	@Input() set width(width: number) {
		this._width = width;

		if (this.context)
			this.initContext(this.canvas.nativeElement);
	}

	@Input() set height(height: number) {
		this._height = height;

		if (this.context)
			this.initContext(this.canvas.nativeElement);
	}

	@Output() draw = new EventEmitter<DrawEvent>();

	public ngAfterViewInit() {
		this.initContext(this.canvas.nativeElement);
		this.initObserver(this.canvas.nativeElement);
	}

	private initContext(canvas: HTMLCanvasElement) {
		canvas.width = this._width;
		canvas.height = this._height;

		this.context = canvas.getContext('2d');
		this.context.strokeStyle = this.color;
		this.context.lineWidth = this.size;
		this.context.lineCap = 'round';
	}

	private initObserver(canvas: HTMLCanvasElement) {
		Observable.fromEvent<MouseEvent>(canvas, 'mousedown')
		.switchMap((e: MouseEvent) => {
			return Observable.fromEvent<MouseEvent>(canvas, 'mousemove')
			.takeUntil(Observable.fromEvent<MouseEvent>(canvas, 'mouseup'))
			.takeUntil(Observable.fromEvent<MouseEvent>(canvas, 'mouseleave'))
			.pairwise();
		})
		.subscribe((value: [MouseEvent, MouseEvent]) => {
			const rect = canvas.getBoundingClientRect();
			const event = {
				line: {
					start: {
						x: value[0].clientX - rect.left,
						y: value[0].clientY - rect.top
					},
					end: {
						x: value[1].clientX - rect.left,
						y: value[1].clientY - rect.top
					}
				}
			};

			this.doDraw(event.line.start, event.line.end);
			this.draw.emit(event);
		});
	}

	private doDraw(origin: Point2D, destination?: Point2D) {
		if (!this.context) return;

		this.context.beginPath();
		this.context.moveTo(origin.x, origin.y);
		this.context.lineTo(destination.x, destination.y);
		this.context.stroke();
	}

	public reset() {
		if (this.context)
			this.context.clearRect(0, 0, this.width, this.height);
	}

	public play(frames: DrawEvent[]): Promise<any> {
		const self = this;

		return new Promise((resolve, reject) => {
			self.reset();

			let index = 0;
			let interval = setInterval(() => {
				if (index < frames.length) {
					let frame = frames[index++];
					if (frame.color != undefined) self.color = frame.color;
					if (frame.size != undefined) self.size = frame.size;
					if (frame.line != undefined) self.doDraw(frame.line.start, frame.line.end);
				} else {
					clearInterval(interval);
					resolve();
				}
			}, 50);
		});
	}
}
