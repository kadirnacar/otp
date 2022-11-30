export class CameraManagement {
  constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement) {
    this.canvas = canvas;
    this.video = video;
    this.drawVideoToCanvas = this.drawVideoToCanvas.bind(this);
  }

  videoLoaded = false;
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  onVideoLoaded?: () => void;
  boxes: any[] = [];

  async init() {
    this.video.addEventListener('loadeddata', this.handleVideoLoadeddata.bind(this));
  }

  setBoxes(boxes) {
    this.boxes = boxes;
  }

  stop() {
    if (this.drawAnimate) {
      try {
        cancelAnimationFrame(this.drawAnimate);
      } catch (ex: any) {
        console.warn(`Prevented unhandled exception: ${ex?.message}`);
      }
    }
  }

  handleVideoLoadeddata() {
    if (this.videoLoaded) {
      return;
    }
    this.videoLoaded = true;
    try {
      if (this.canvas && this.video) {
        this.canvas.width = this.video.videoWidth;
        this.canvas.height = this.video.videoHeight;
      }
    } catch {}

    if (this.canvas && this.video) {
      this.ctx = this.canvas.getContext('2d');
      // this.drawAnimate = requestAnimationFrame(this.drawVideoToCanvas);
      this.drawVideoToCanvas();
    }

    if (this.onVideoLoaded) {
      this.onVideoLoaded();
    }
  }

  ctx: CanvasRenderingContext2D | null = null;
  drawAnimate?: any;

  async drawVideoToCanvas() {
    if (this.ctx && this.video) {
      this.ctx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight);
      this.ctx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);

      if (this.boxes)
        for (let index = 0; index < this.boxes.length; index++) {
          const element = this.boxes[index];
          this.ctx.beginPath();
          this.ctx.lineWidth = 5;

          if (element.detects.ClassNames[0]) {
            this.ctx.strokeStyle = 'red';
            this.ctx.font = '20px Arial';
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillText(
              element.text,
              element.detects.StartPoint.X + 10,
              element.detects.StartPoint.Y + 30
            );
            this.ctx.rect(
              element.detects.StartPoint.X,
              element.detects.StartPoint.Y,
              element.detects.EndPoint.X - element.detects.StartPoint.X,
              element.detects.EndPoint.Y - element.detects.StartPoint.Y
            );

            // if (element.chars) {
            //   for (let chIndex = 0; chIndex < element.chars.length; chIndex++) {
            //     const char = element.chars[chIndex];
            //     if (
            //       char.detects &&
            //       char.detects.ClassNames &&
            //       char.detects.ClassNames.includes('1') &&
            //       char.detects.Probabilities.find((c) => c > 90)
            //     ) {
            //       this.ctx.rect(
            //         element.detects.StartPoint.X + char.detects.StartPoint.X,
            //         element.detects.StartPoint.Y + char.detects.StartPoint.Y,
            //         char.detects.EndPoint.X - char.detects.StartPoint.X,
            //         char.detects.EndPoint.Y - char.detects.StartPoint.Y
            //       );
            //     }
            //   }
            // }
          }

          // this.ctx.rect(
          //   element.Min.X,
          //   element.Min.Y,
          //   element.Max.X - element.Min.X,
          //   element.Max.Y - element.Min.Y
          // );
          this.ctx.stroke();
        }
    }
    setTimeout(async () => {
      this.drawVideoToCanvas();
    }, 1000 / 20);
  }
}
