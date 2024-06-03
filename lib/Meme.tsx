import { DMemeWithCaptionDetails } from "../dbtypes";

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
  width: number,
  height: number,
  imageData: ImageBitmap | ImageData
) {
  if (imageData instanceof ImageBitmap) {
    ctx.drawImage(imageData, 0, 0, width, height);
  } else {
    ctx.putImageData(imageData, 0, 0);
  }
}

function accomodateCaptionDetailsForScaling(
  captionDetails: {
    positionX: number;
    positionY: number;
    rotation: number;
    width: number;
    initialFontSize: number;
    maxNumberOfLines: number;
    color: string;
  },
  scalingFactor: number
): CaptionDetails {
  return new CaptionDetails({
    positionX: captionDetails.positionX * scalingFactor,
    positionY: captionDetails.positionY * scalingFactor,
    rotation: captionDetails.rotation,
    width: captionDetails.width * scalingFactor,
    initialFontSize: captionDetails.initialFontSize * scalingFactor,
    maxNumberOfLines: captionDetails.maxNumberOfLines,
    color: captionDetails.color,
  });
}

export class CaptionDetails {
  readonly positionX: number;
  readonly positionY: number;
  readonly rotation: number;
  readonly width: number;
  readonly initialFontSize: number;
  readonly maxNumberOfLines: number;
  readonly color: string;

  constructor({
    positionX,
    positionY,
    rotation,
    width,
    initialFontSize,
    maxNumberOfLines,
    color,
  }: {
    positionX: number;
    positionY: number;
    rotation: number;
    width: number;
    initialFontSize: number;
    maxNumberOfLines: number;
    color: string;
  }) {
    this.positionX = positionX;
    this.positionY = positionY;
    this.rotation = rotation;
    this.width = width;
    this.initialFontSize = initialFontSize;
    this.maxNumberOfLines = maxNumberOfLines;
    this.color = color;
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
    { url, captionsDetails }: Omit<DMemeWithCaptionDetails, "id">
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

  getScalingFactor(): number {
    return this.canvas.width / 500;
  }

  set captions(captions: string[]) {
    this._captions = captions;
  }

  get captions(): string[] {
    return this._captions;
  }

  download(filename: string) {
    const a = document.createElement("a");
    a.download = filename;
    a.href = this.canvas.toDataURL("image/png");
    a.click();
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
      drawImage(ctx, this.canvas.width, this.canvas.height, currentImageData);

      for (let i = 0; i < this.captions.length; i++) {
        currentImageData = ctx.getImageData(
          0,
          0,
          this.canvas.width,
          this.canvas.height
        );

        const defaultCaptionDetails = this.captionsDetails[i];
        const captionDetails = accomodateCaptionDetailsForScaling(
          defaultCaptionDetails,
          this.getScalingFactor()
        );

        let fontSize = captionDetails.initialFontSize;
        ctx.fillStyle = captionDetails.color;
        ctx.font = `${fontSize}px Poppins`;
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
              ctx.font = `${fontSize}px Poppins`;

              drawImage(
                ctx,
                this.canvas.width,
                this.canvas.height,
                currentImageData
              );

              if (fontSize >= 15) {
                y = captionDetails.positionY;
                line = "";
                lines.splice(0, lines.length);
                j = -1;
                continue;
              }
              fontSize = 15;
              ctx.font = `${fontSize}px Poppins`;

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
