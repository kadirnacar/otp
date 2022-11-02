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

  async init() {
    this.video.addEventListener('loadeddata', this.handleVideoLoadeddata.bind(this));
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
      }

      this.last2 = timeInSecond;
    }
    this.drawAnimate = requestAnimationFrame(this.drawVideoToCanvas);
  }
}
