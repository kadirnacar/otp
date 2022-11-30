// import { loadGraphModel } from '@tensorflow/tfjs-converter';
import * as tf from '@tensorflow/tfjs';
import '@tensorflow/tfjs-backend-webgl';
import yolo from 'tfjs-yolo';

tf.setBackend('webgl');
class L2 {
  static className = 'L2';

  constructor(config) {
    return tf.regularizers.l1l2(config);
  }
}
tf.serialization.registerClass(L2 as any);

class lambdaLayer extends tf.layers.Layer {
  constructor(config) {
    super(config);
    if (config.name === undefined) {
      config.name = (+new Date() * Math.random()).toString(36); //random name from timestamp in case name hasn't been set
    }
console.log(config);
    this.name = config.name;
    this.lambdaFunction = config.lambdaFunction;
    this.lambdaOutputShape = config.lambdaOutputShape;
    
  }
  lambdaFunction;
  lambdaOutputShape;
  static className = 'Lambda';

  override call(input) {
    return tf.tidy(() => {
      let result: any = null;
      eval(this.lambdaFunction);
      return result;
    });
  }

  override computeOutputShape(inputShape) {
    if (this.lambdaOutputShape === undefined) {
      //if no outputshape provided, try to set as inputshape
      return inputShape[0];
    } else {
      return this.lambdaOutputShape;
    }
  }

  override getConfig() {
    const config = super.getConfig();
    Object.assign(config, {
      lambdaFunction: this.lambdaFunction,
      lambdaOutputShape: this.lambdaOutputShape,
    });
    return config;
  }

 
}
tf.serialization.registerClass(lambdaLayer);
export class CameraManagement {
  constructor(canvas: HTMLCanvasElement, video: HTMLVideoElement, img: HTMLImageElement) {
    this.canvas = canvas;
    this.video = video;
    this.img = img;
    this.drawVideoToCanvas = this.drawVideoToCanvas.bind(this);
  }

  videoLoaded = false;
  img: HTMLImageElement;
  canvas: HTMLCanvasElement;
  video: HTMLVideoElement;
  onVideoLoaded?: () => void;
  boxes: any[] = [];
  model?: tf.LayersModel;
  // yoloDetect?;

  async init() {
    this.video.addEventListener('loadeddata', this.handleVideoLoadeddata.bind(this));
    this.model = await tf.loadLayersModel('/tfjs/model.json');
    // this.yoloDetect = await yolo.v3('/tfjs/model.json');
    // console.log(this.model);
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
        // if (this.yoloDetect) {
        if (this.model) {
          const frame = tf.browser
            .fromPixels(this.video)
            // .resizeNearestNeighbor([608, 608])
            .toFloat()
            .expandDims();

          // More pre-processing to be added here later

          let predictions = await this.model.predict(frame);

          // const resized = tf.image.resizeBilinear(frame, [608, 608]);
          // const expanded = tf.expandDims(resized, 0);
          // const prediction = this.model.predict(expanded);

          console.log(predictions);

          // this.yoloDetect.predict(this.video, {}).then((boxes) => {
          //   console.log(boxes);
          // });
        }

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
      this.last2 = timeInSecond;
    }
    this.drawAnimate = requestAnimationFrame(this.drawVideoToCanvas);
  }

  async analyseVideo() {
    // const model = await loadGraphModel(
    //   'https://raw.githubusercontent.com/hugozanini/TFJS-object-detection/master/models/kangaroo-detector/model.json'
    // );
  }
}
