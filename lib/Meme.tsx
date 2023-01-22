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

export default class Meme {
  readonly canvas: HTMLCanvasElement;
  readonly url: string;
  readonly captionPositions: [number, number][];
  readonly captionRotations: number[];
  readonly captionWidths: number[];
  readonly initialFontSizes: number[];
  readonly maxNumberOfLines: number[];
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

    let currentImageBitMap = imageBitMap;

    if (ctx) {
      ctx.drawImage(currentImageBitMap, 0, 0, 500, 500);

      for (let i = 0; i < this.captions.length; i++) {
        currentImageBitMap = await createImageBitmap(
          ctx.getImageData(0, 0, 500, 500)
        );
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
              ctx.drawImage(currentImageBitMap, 0, 0, 500, 500);
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
