const CANVAS_WIDTH = 500;
const CANVAS_HEIGHT = 500;

function fillTextAndRotate(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  angle: number
) {
  ctx.save();
  ctx.rotate((angle * Math.PI) / 180);
  ctx.fillText(text, x, y, maxWidth);
  ctx.restore();
}

function drawImage(
  ctx: CanvasRenderingContext2D,
  imageData: ImageBitmap | ImageData
) {
  if (imageData instanceof ImageBitmap) {
    ctx.drawImage(imageData, 0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
  } else {
    ctx.putImageData(imageData, 0, 0);
  }
}

export class CaptionDetails {
  readonly positionX: number;
  readonly positionY: number;
  readonly rotation: number;
  readonly width: number;
  readonly initialFontSize: number;
  readonly maxNumberOfLines: number;

  constructor({
    positionX,
    positionY,
    rotation,
    width,
    initialFontSize,
    maxNumberOfLines,
  }: DCaptionsDetails) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.rotation = rotation;
    this.width = width;
    this.initialFontSize = initialFontSize;
    this.maxNumberOfLines = maxNumberOfLines;
  }
}

export class Meme {
  readonly canvas: HTMLCanvasElement;
  readonly url: string;
  private captionsDetails: CaptionDetails[];
  private _imageData: ImageBitmap | ImageData | null;
  private _captions: string[];

  constructor(
    canvas: HTMLCanvasElement | string,
    { url, captionsDetails }: DMemeWithCaptionDetails
  ) {
    if (typeof canvas === "string") {
      const canvasQuery = document.getElementById(canvas);
      if (canvasQuery === null) throw new Error("Canvas not found.");
      this.canvas = document.getElementById(canvas) as HTMLCanvasElement;
    } else this.canvas = canvas;
    this.url = url;
    this.captionsDetails = captionsDetails.map(
      (captionDetails) => new CaptionDetails(captionDetails)
    );
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

  async render() {
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
        currentImageData = ctx.getImageData(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

        const captionDetails = this.captionsDetails[i];

        let fontSize = captionDetails.initialFontSize;
        ctx.font = `${fontSize}px serif`;
        ctx.textAlign = "center";

        let line = "";
        const lines: string[] = [];

        const words = this.captions[i].split(" ");

        let x = captionDetails.positionX;
        let y = captionDetails.positionY;

        let isThereAnIncompleteLine = true;

        for (let j = 0; j < words.length; j++) {
          const currentLine = line + words[j] + " ";
          const currentWidth = ctx.measureText(currentLine).width;

          if (currentWidth > captionDetails.width && j > 0) {
            if (lines.length + 1 === captionDetails.maxNumberOfLines) {
              fontSize /= 1.2;
              ctx.font = `${fontSize}px serif`;

              drawImage(ctx, currentImageData);

              if (fontSize >= 15) {
                y = captionDetails.positionY;
                line = "";
                lines.splice(0, lines.length);
                j = -1;
                continue;
              }
              fontSize = 15;
              ctx.font = `${fontSize}px serif`;

              for (let k = 0; k < lines.length; k++) {
                fillTextAndRotate(
                  ctx,
                  lines[k],
                  x,
                  captionDetails.positionY + k * fontSize * 1.1,
                  captionDetails.width,
                  captionDetails.rotation
                );
              }
              const rest = line + words.slice(j).join(" ");
              fillTextAndRotate(
                ctx,
                rest,
                x,
                captionDetails.positionY + lines.length * fontSize * 1.1,
                captionDetails.width,
                captionDetails.rotation
              );
              isThereAnIncompleteLine = false;
              break;
            }
            fillTextAndRotate(
              ctx,
              line,
              x,
              y,
              captionDetails.width,
              captionDetails.rotation
            );
            lines.push(line);
            line = words[j] + " ";
            y += fontSize * 1.1;
          } else {
            line = currentLine;
          }
        }
        if (isThereAnIncompleteLine) {
          fillTextAndRotate(
            ctx,
            line,
            x,
            y,
            captionDetails.width,
            captionDetails.rotation
          );
        }
      }
    }
  }
}
