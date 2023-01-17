export default class Meme {
  readonly canvas: HTMLCanvasElement;
  readonly url: string;
  readonly captionPositions: number[][];
  readonly captionRotations: number[];
  readonly captionWidths: number[];
  private _captions: string[];

  constructor(
    canvas: HTMLCanvasElement | string,
    url: string,
    captionPositions: number[][],
    captionRotations: number[],
    captionWidths: number[]
  ) {
    if (typeof canvas === "string") {
      const canvasQuery = document.getElementById(canvas);
      if (canvasQuery === null) throw new Error("Canvas not found.");
      this.canvas = document.getElementById(canvas) as HTMLCanvasElement;
    } else this.canvas = canvas;
    this.url = url;
    this.captionPositions = captionPositions;
    this.captionRotations = captionRotations;
    this.captionWidths = captionWidths;
    this._captions = [];
  }

  set captions(captions: string[]) {
    this._captions = captions;
  }

  get captions(): string[] {
    return this._captions;
  }

  async render(): Promise<void> {
    const image = await fetch(this.url);
    const imageBlob = await image.blob();

    const imageBitMap = await createImageBitmap(imageBlob);
    const ctx = this.canvas.getContext("2d");

    let fontSize = 45;

    if (ctx) {
      ctx.drawImage(imageBitMap, 0, 0, 500, 500);
      for (let i = 0; i < this.captions.length; i++) {
        ctx.save();
        ctx.font = `${fontSize}px serif`;
        ctx.textAlign = "center";
        let width = ctx.measureText(this.captions[i]).width;
        while (width >= 0.9 * this.captionWidths[i] && fontSize > 15) {
          fontSize /= 1.1;
          ctx.font = `${fontSize}px serif`;
          width = ctx.measureText(this.captions[i]).width;
        }
        ctx.rotate((this.captionRotations[i] * Math.PI) / 180);
        ctx.fillText(
          this.captions[i],
          this.captionPositions[i][0],
          this.captionPositions[i][1],
          this.captionWidths[i]
        );
        ctx.restore();
      }
    }
  }
}
