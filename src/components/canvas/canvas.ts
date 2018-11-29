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
	stroke: Line2D[];
	color: string;
	size: number;
}

@Component({
	selector: 'app-canvas',
	template: '<canvas #canvas></canvas>'
})
export class CanvasComponent implements AfterViewInit {
	private _color: string = '#000';
	private _size: number = 16;
	private _width: number = 360;
	private _height: number = 640;

	private context: CanvasRenderingContext2D;

	@ViewChild('canvas')
	private canvas: ElementRef;

	private undoStack: DrawEvent[] = [];
	private redoStack: DrawEvent[] = [];

	private stroke: Line2D[] = [];

	@Output() canUndo = new EventEmitter<boolean>();
	@Output() canRedo = new EventEmitter<boolean>();

	get color(): string { return this._color; }
	get size(): number { return this._size; }
	get width(): number { return this._width; }
	get height(): number { return this._height; }

	@Input() set color(color: string) {
		this._color = color;

		if (this.context)
			this.context.strokeStyle = color;

		this.colorChange.emit(color);
	}

	@Input() set size(size: number) {
		this._size = size;

		if (this.context)
			this.context.lineWidth = size;

		this.sizeChange.emit(size);
	}

	@Input() set width(width: number) {
		this._width = width;

		if (this.context)
			this.initContext(this.canvas.nativeElement);

		this.widthChange.emit(width);
	}

	@Input() set height(height: number) {
		this._height = height;

		if (this.context)
			this.initContext(this.canvas.nativeElement);

		this.heightChange.emit(height);
	}

	@Output() colorChange = new EventEmitter<string>();
	@Output() sizeChange = new EventEmitter<number>();
	@Output() widthChange = new EventEmitter<number>();
	@Output() heightChange = new EventEmitter<number>();

	@Output('draw')
	private drawEvent = new EventEmitter<DrawEvent>();

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
			const line = {
				start: {
					x: value[0].clientX - rect.left,
					y: value[0].clientY - rect.top
				},
				end: {
					x: value[1].clientX - rect.left,
					y: value[1].clientY - rect.top
				}
			};

			this.draw(line.start, line.end);
			this.stroke.push(line);
		});

		Observable.fromEvent<MouseEvent>(canvas, 'mousedown')
		.subscribe((event: MouseEvent) => this.onStartDraw());

		Observable.fromEvent<MouseEvent>(canvas, 'mouseup')
		.subscribe((event: MouseEvent) => this.onEndDraw());

		Observable.fromEvent<MouseEvent>(canvas, 'mouseleave')
		.subscribe((event: MouseEvent) => this.onEndDraw());
	}

	private draw(origin: Point2D, destination?: Point2D) {
		if (!this.context) return;

		this.context.beginPath();
		this.context.moveTo(origin.x, origin.y);
		this.context.lineTo(destination.x, destination.y);
		this.context.stroke();
	}

	private onStartDraw() {
		this.stroke = [];
	}

	private onEndDraw() {
		if (this.stroke.length) {
			let event = {
				stroke : this.stroke,
				color : this.color,
				size  : this.size
			};

			this.redoStack = [];
			this.undoStack.push(event);
			this.drawEvent.emit(event);

			this.stroke = [];

			this.canUndo.emit(true);
			this.canRedo.emit(false);
		}
	}

	private clear() {
		if (this.context)
			this.context.clearRect(0, 0, this.width, this.height);
	}

	public undo()  {
		if (this.undoStack.length) {
			this.redoStack.push(this.undoStack.pop());

			this.replay();

			this.canUndo.emit(this.undoStack.length > 0);
			this.canRedo.emit(true);
		}
	}

	public redo() {
		if (this.redoStack.length) {
			this.undoStack.push(this.redoStack.pop());

			this.replay();

			this.canUndo.emit(true);
			this.canRedo.emit(this.redoStack.length > 0);
		}
	}

	public reset() {
		this.undoStack = [];
		this.redoStack = [];

		this.clear();

		this.canUndo.emit(false);
		this.canRedo.emit(false);
	}

	public replay(fps?: number, index?: number): Promise<any> {
		const self = this;
		const delay = fps == undefined || fps <= 0 ? 0 : 1000 / fps;

		index = index == undefined ? 0 : index;

		return new Promise<any>((resolve, reject) => {
			if (!this.context)
				reject('Drawing context has not been initialized.');

			if (index == 0) self.clear();
			if (index < this.undoStack.length) {
				let event = this.undoStack[index];

				self.replayEvent(event, delay).then(() => {
					return self.replay(fps, index + 1);
				}).then(resolve);
			} else {
				resolve();
			}
		});
	}

	private replayEvent(event: DrawEvent, delay: number): Promise<any> {
		const self = this;

		return new Promise((resolve, reject) => {
			if (event.color != undefined)
				self.color = event.color;

			if (event.size != undefined)
				self.size = event.size;

			if (event.stroke != undefined) {
				if (delay > 0) {
					let index = 0;
					let interval = setInterval(() => {
						if (index < event.stroke.length) {
							let line = event.stroke[index++];
							self.draw(line.start, line.end);
						} else {
							clearInterval(interval);
							resolve();
						}
					}, delay);
				} else {
					for (let line of event.stroke) {
						self.draw(line.start, line.end);
					}

					resolve();
				}
			} else {
				resolve();
			}
		});
	}
}
