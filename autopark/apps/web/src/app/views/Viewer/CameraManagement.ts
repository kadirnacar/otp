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
    console.log(boxes);
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
      this.drawAnimate = requestAnimationFrame(this.drawVideoToCanvas);
    }

    if (this.onVideoLoaded) {
      this.onVideoLoaded();
    }
  }

  ctx: CanvasRenderingContext2D | null = null;
  drawAnimate?: any;
  last2 = 0;
  speed2 = 0.05;

  async drawVideoToCanvas(timeStamp) {
    let timeInSecond = timeStamp / 1000;
    if (timeInSecond - this.last2 >= this.speed2) {
      if (this.ctx && this.video) {
        this.ctx.clearRect(0, 0, this.video.videoWidth, this.video.videoHeight);
        this.ctx.drawImage(this.video, 0, 0, this.video.videoWidth, this.video.videoHeight);

        for (let index = 0; index < this.boxes.length; index++) {
          const element = this.boxes[index];
          this.ctx.beginPath();
          this.ctx.lineWidth = 5;
          this.ctx.strokeStyle = 'red';
          this.ctx.font = '30px Arial';
          this.ctx.fillText(
            element.ClassNames[0],
            element.StartPoint.X + 10,
            element.StartPoint.Y + 30
          );
          this.ctx.rect(
            element.StartPoint.X,
            element.StartPoint.Y,
            element.EndPoint.X - element.StartPoint.X,
            element.EndPoint.Y - element.StartPoint.Y
          );
          this.ctx.stroke();
        }
      }
      this.last2 = timeInSecond;
    }
    this.drawAnimate = requestAnimationFrame(this.drawVideoToCanvas);
  }
}
