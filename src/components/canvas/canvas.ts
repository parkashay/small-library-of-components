export class Canvas {
  ctx: CanvasRenderingContext2D | null = null;

  constructor(container: HTMLDivElement, canvasElement: HTMLCanvasElement) {
    const { height, width } = container.getBoundingClientRect();
    canvasElement.height = height;
    canvasElement.width = width;
    this.ctx = canvasElement.getContext("2d");
  }

  public drawRect(
    x: number = 0,
    y: number = 0,
    width: number = 100,
    height: number = 100,
    strokeColor: string = "blue"
  ) {
    if (!this.ctx) return;
    this.ctx.beginPath();
    this.ctx.roundRect(x, y, width, height, 10);
    this.ctx.strokeStyle = strokeColor;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  public drawCircle(
    x: number = 200,
    y: number = 200,
    radius: number = 100,
    strokeColor: string = "yellow"
  ) {
    if (!this.ctx) return;

    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    this.ctx.strokeStyle = strokeColor;
    this.ctx.stroke();
    this.ctx.closePath();
  }

  public drawLine(strokeColor: string = "green") {
    if (!this.ctx) return;
    const c = this.ctx;
    c.beginPath();
    c.moveTo(0, 0);
    c.lineTo(100, 100);
    c.lineTo(500, 50);
    c.strokeStyle = strokeColor;
    c.stroke();
    c.closePath();
  }

  public clear() {
    if (this.ctx) {
      this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
    }
  }
}
