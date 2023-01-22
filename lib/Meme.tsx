function fillTextAndRotate(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  angle: number
): void {
  ctx.save();
  ctx.rotate((angle * Math.PI) / 180);
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

function drawImage(
  ctx: CanvasRenderingContext2D,
  imageData: ImageBitmap | ImageData
): void {
  if (imageData instanceof ImageBitmap) {
    ctx.drawImage(imageData, 0, 0, 500, 500);
  } else {
    ctx.putImageData(imageData, 0, 0);
  }
}

export default class Meme {
  readonly canvas: HTMLCanvasElement;
  readonly url: string;
  readonly captionPositions: [number, number][];
  readonly captionRotations: number[];
  readonly captionWidths: number[];
  readonly initialFontSizes: number[];
  readonly maxNumberOfLines: number[];
  private _imageData: ImageBitmap | ImageData | null;
  private _captions: string[];

  constructor(
    canvas: HTMLCanvasElement | string,
    url: string,
    captionPositions: [number, number][],
    captionRotations: number[],
    captionWidths: number[],
    initialFontSizes: number[],
    maxNumberOfLines: number[]
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
    this.initialFontSizes = initialFontSizes;
    this.maxNumberOfLines = maxNumberOfLines;
    this._imageData = null;
    this._captions = [];
  }

  set captions(captions: string[]) {
    this._captions = captions;
  }

  get captions(): string[] {
    return this._captions;
  }

  async fetchImage(): Promise<boolean> {
    try {
      const response = await fetch(this.url);
      const imageBlob = await response.blob();
      this._imageData = await createImageBitmap(imageBlob);
      return true;
    } catch (err) {
      // TODO: Handle network errors in a better way.
      return false;
    }
  }

  async render(): Promise<void> {
    if (this._imageData === null) {
      const success = await this.fetchImage();
      if (!success) return;
    }
    const ctx = this.canvas.getContext("2d");

    // If fetching succeeds, then image data cannot be null.
    let currentImageData = this._imageData as ImageBitmap | ImageData;

    if (ctx) {
      drawImage(ctx, currentImageData);

      for (let i = 0; i < this.captions.length; i++) {
        currentImageData = ctx.getImageData(0, 0, 500, 500);
        let fontSize = this.initialFontSizes[i];
        ctx.font = `${fontSize}px serif`;
        ctx.textAlign = "center";

        let line = "";
        const lines = [];

        const words = this.captions[i].split(" ");

        let x = this.captionPositions[i][0];
        let y = this.captionPositions[i][1];

        for (let j = 0; j < words.length; j++) {
          const currentLine = line + words[j] + " ";
          const currentWidth = ctx.measureText(currentLine).width;

          if (currentWidth > this.captionWidths[i] && j > 0) {
            if (lines.length + 1 === this.maxNumberOfLines[i]) {
              fontSize /= 1.2;
              ctx.font = `${fontSize}px serif`;
              drawImage(ctx, currentImageData);
              if (fontSize >= 15) {
                y = this.captionPositions[i][1];
                line = "";
                lines.splice(0, lines.length);
                j = -1;
                continue;
              }
              for (let k = 0; k < lines.length; k++) {
                fillTextAndRotate(
                  ctx,
                  lines[k],
                  x,
                  this.captionPositions[i][1] + (k * fontSize) / 1.5,
                  this.captionWidths[i],
                  this.captionRotations[i]
                );
              }
              const rest = line + words.slice(j).join(" ");
              fillTextAndRotate(
                ctx,
                rest,
                x,
                y,
                this.captionWidths[i],
                this.captionRotations[i]
              );
              continue;
            }
            fillTextAndRotate(
              ctx,
              line,
              x,
              y,
              this.captionWidths[i],
              this.captionRotations[i]
            );
            lines.push(line);
            line = words[j] + " ";
            y += fontSize * 1.1;
          } else {
            line = currentLine;
          }
        }
        fillTextAndRotate(
          ctx,
          line,
          x,
          y,
          this.captionWidths[i],
          this.captionRotations[i]
        );
      }
    }
  }
}
