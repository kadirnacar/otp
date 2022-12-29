package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"image"
	"image/jpeg"
	"log"
	"net"
	"net/url"
	"os"
	"strconv"
	"time"

	"github.com/LdDl/go-darknet"

	tesseract "github.com/GeertJohan/go.tesseract"

	"github.com/deluan/lookup"
	goonvif "source.smiproject.co/forks/go-onvif"
)

var (

	// en iyi
	n = darknet.YOLONetwork{
		GPUDeviceIndex:           1,
		NetworkConfigurationFile: "assets/work1/yolov4.cfg",
		WeightsFile:              "assets/work1/yolov4.weights",
		Threshold:                .5,
	}

	// iyi araba ve plaka
	// n = darknet.YOLONetwork{
	// 	GPUDeviceIndex:           0,
	// 	NetworkConfigurationFile: "assets/work2/obj.cfg",
	// 	WeightsFile:              "assets/work2/obj_60000.weights",
	// 	Threshold:                .2,
	// }

	// plaka tanımada zirve bu
	// n = darknet.YOLONetwork{
	// 	GPUDeviceIndex:           0,
	// 	NetworkConfigurationFile: "../../../dist/assets/work4/yolov4-tiny-obj.cfg",
	// 	WeightsFile:              "../../../dist/assets/work4/tiny-car.weights",
	// 	Threshold:                .5,
	// }

	// netw         *engine.YOLONetwork
	rtspUrl      string
	ovfDevice    goonvif.Device
	profileToken string
	client       *tesseract.Tess
	// client       *gosseract.Client
)
var Result []DetextMsg
var ocr *lookup.OCR

type DetextMsg struct {
	// Text     []string           `json:"text"`
	Detects *darknet.Detection `json:"detects"`
	Image   []byte             `json:"image"`
	// ImageOrj []byte             `json:"imageorj"`

	// TextOrj       string `json:"textOrj"`
	// TextGray      string `json:"textGray"`
	// TextRotate    string `json:"textRotate"`
	// TextScale     string `json:"textScale"`
	// TextThreshold string `json:"textThreshold"`
	// TextGaus      string `json:"textGaus"`
}

func initYoloNetwork() error {
	if err := n.Init(); err != nil {
		log.Println("onvif darknet init:", err)
		time.Sleep(1 * time.Second)
		return err
	}

	// client, _ = tesseract.NewTess("../../../dist/assets/tessdata", "eng")
	// // client.SetPageSegMode(tesseract.PSM_SINGLE_CHAR)
	// client.SetVariable("tessedit_char_whitelist", " ABCDEFGHIJKLMNOPRSTUVYZ0123456789")
	// log.Println("langs:", client.AvailableLanguages())
	// ocr = lookup.NewOCR(0.1)
	// ocr.LoadFont("../../../dist/assets/testdata/font_1")
	// client = gosseract.NewClient()
	// client.SetWhitelist(" ABCDEFGHIJKLMNOPRSTUVYZ0123456789")
	// client.SetLanguage("eng")
	// client.SetPageSegMode(gosseract.PSM_RAW_LINE)
	return nil
}

func prettyJSON(src interface{}) string {
	result, _ := json.MarshalIndent(&src, "", "    ")
	return string(result)
}

func startOvif() {

	log.Println("GetStreamURI")

	ovfDevice = goonvif.Device{
		XAddr:    Config.Recording.CameraUrl,
		User:     Config.Recording.CameraUsername,
		Password: Config.Recording.CameraPassword,
	}

	for {
		log.Println("Connect Onvif")
		var err error

		profiles, err := ovfDevice.GetProfiles()
		if err != nil {
			log.Println("onvif profiles:", err)
			time.Sleep(1 * time.Second)
			return
		}

		profileToken = profiles[0].Token
		uri, err := ovfDevice.GetStreamURI(profiles[0].Token, "RTSP")

		if err != nil {
			log.Println("onvif getstreamuri:", err)
			time.Sleep(1 * time.Second)
			continue
		}
		ovfDevice.ContinuousMove(profiles[0].Token, goonvif.PTZVector{Zoom: goonvif.Vector1D{X: 1}})
		configs, _ := ovfDevice.GetVideoEncoderConfigurations()
		// for _, d := range configs {
		// 	log.Println(prettyJSON(d))
		// 	options, err3 := ovfDevice.GetVideoEncoderConfigurationOptions(d.Token, profileToken)
		// 	if err3 == nil {
		// 		log.Println(prettyJSON(options))
		// 	}
		// }
		currentConfigIndex, _ := strconv.Atoi(Config.Recording.StreamSource)
		config := configs[currentConfigIndex]
		config.Resolution.Width = 1920
		config.Resolution.Height = 1080
		config.Quality = 6
		config.RateControl.FrameRateLimit = 25
		config.RateControl.BitrateLimit = 4096
		config.H264.GovLength = 25
		err2 := ovfDevice.SetVideoEncoderConfiguration(config)
		if err2 != nil {
			log.Println(err2)
		}
		u, _ := url.Parse(uri.URI)
		u2, _ := url.Parse(Config.Recording.CameraUrl)

		_, port, _ := net.SplitHostPort(u.Host)
		host2, _, _ := net.SplitHostPort(u2.Host)

		u.Host = host2 + ":" + port

		u.User = url.UserPassword(Config.Recording.CameraUsername, Config.Recording.CameraPassword)
		values := u.Query()
		values.Set("subtype", Config.Recording.StreamSource)
		u.RawQuery = values.Encode()
		rtspUrl = u.String()
		Config.Streams.URL = rtspUrl
		log.Println("Onvif connected")
		log.Println(uri.URI, u)

		initYoloNetwork()
		break
	}

	go serveStreams()
	go startRecorder()

}
func GetFilenameDate() string {
	const layout = "02-01-2006-15-04-05.000000"
	t := time.Now()
	return Config.Recording.DetectSavePath + "/file-" + t.Format(layout) + ".jpeg"
}

func cropImage(img image.Image, crop image.Rectangle) (image.Image, error) {
	type subImager interface {
		SubImage(r image.Rectangle) image.Image
	}

	simg, ok := img.(subImager)
	if !ok {
		return nil, fmt.Errorf("image does not support cropping")
	}

	return simg.SubImage(crop), nil
}
func rgbaToGray(img image.Image) *image.Gray {
	var (
		bounds = img.Bounds()
		gray   = image.NewGray(bounds)
	)
	for x := 0; x < bounds.Max.X; x++ {
		for y := 0; y < bounds.Max.Y; y++ {
			var rgba = img.At(x, y)
			gray.Set(x, y, rgba)
		}
	}
	return gray
}
func analyseImage2(img image.Image, fname string) {
	imgDarknet, err := darknet.Image2Float32(img)
	var detectmsg []DetextMsg

	if err != nil {
		log.Println(err)
		return
	}
	// log.Println("Analyse: ", time.Now().Format("02-01-2006-15-04-05.000000"))

	defer imgDarknet.Close()

	dr, err := n.Detect(imgDarknet)
	if err != nil {
		log.Println(err)
		return
	}

	for _, d := range dr.Detections {

		if len(d.Probabilities) == 0 {
			continue
		}

		// f, err := os.Create(GetFilenameDate())
		// if err != nil {
		// 	panic(err)
		// }
		// defer f.Close()
		// if err = jpeg.Encode(f, img, &jpeg.Options{Quality: 100}); err != nil {
		// 	log.Printf("failed to encode: %v", err)
		// }

		imgDarknet2, _ := cropImage(img, image.Rect(d.StartPoint.X, d.StartPoint.Y, d.EndPoint.X, d.EndPoint.Y))
		bufdd := new(bytes.Buffer)
		jpeg.Encode(bufdd, imgDarknet2, &jpeg.Options{Quality: 100})
		send_s3 := bufdd.Bytes()
		a := DetextMsg{Detects: d, Image: send_s3}
		detectmsg = append(detectmsg, a)
		// Result = append(Result, a)
		// gimage, _ := jpeg.Decode(bufdd)

		// grayScale := grayscale.Convert(gimage, grayscale.ToGrayValue)
		// scaleValue := math.Floor(float64(300*100/grayScale.Bounds().Max.Y) / 100)
		// grayScale, _ = resize.ResizeGray(grayScale, scaleValue+1, scaleValue, resize.InterLinear)
		// grayscale.Threshold(grayScale, grayscale.Otsu(grayScale), 50, 155)
		// grayScale, _ = blur.GaussianBlurGray(grayScale, 1, 1, padding.BorderConstant)
		// grayScale, _ = transform.RotateGray(grayScale, -5, image.Point{X: 0, Y: 0}, true)
		// // jpeg.Encode(f, grayScale, &jpeg.Options{Quality: 100})

		// buf := new(bytes.Buffer)
		// jpeg.Encode(buf, grayScale, &jpeg.Options{Quality: 100})
		// send_s3 := buf.Bytes()
		// client.SetLanguage("eng")
		// client.SetPageSegMode(gosseract.PSM_RAW_LINE)
		// client.SetImageFromBytes(send_s3)

		// text, _ := client.Text()
		// log.Println("plaka: ", text)
		// var plates []string
		// plates = append(plates, text)
		// a := DetextMsg{Text: plates, Detects: d, Image: send_s3}
		// detectmsg = append(detectmsg, a)
		// data, err := json.Marshal(a)
		if err == nil {
			sendMessage(WsMessage{Command: "detect", DataObj: a})
		}
	}
}

func analyseImage(imgOrj image.YCbCr) {
	img := imgOrj.SubImage(imgOrj.Rect)
	imgDarknet, err := darknet.Image2Float32(img)
	var detectmsg []DetextMsg

	if err != nil {
		log.Println(err)
		return
	}
	// log.Println("Analyse: ", time.Now().Format("02-01-2006-15-04-05.000000"))

	defer imgDarknet.Close()

	dr, err := n.Detect(imgDarknet)
	if err != nil {
		log.Println(err)
		return
	}

	for _, d := range dr.Detections {

		if len(d.Probabilities) == 0 {
			continue
		}

		f, err := os.Create(GetFilenameDate())
		if err != nil {
			panic(err)
		}
		defer f.Close()
		if err = jpeg.Encode(f, img, &jpeg.Options{Quality: 100}); err != nil {
			log.Printf("failed to encode: %v", err)
		}

		imgDarknet2, _ := cropImage(img, image.Rect(d.StartPoint.X, d.StartPoint.Y, d.EndPoint.X, d.EndPoint.Y))
		bufdd := new(bytes.Buffer)
		jpeg.Encode(bufdd, imgDarknet2, &jpeg.Options{Quality: 100})
		send_s3 := bufdd.Bytes()
		a := DetextMsg{Detects: d, Image: send_s3}
		detectmsg = append(detectmsg, a)
		// Result = append(Result, a)
		// gimage, _ := jpeg.Decode(bufdd)

		// grayScale := grayscale.Convert(gimage, grayscale.ToGrayValue)
		// scaleValue := math.Floor(float64(300*100/grayScale.Bounds().Max.Y) / 100)
		// grayScale, _ = resize.ResizeGray(grayScale, scaleValue+1, scaleValue, resize.InterLinear)
		// grayscale.Threshold(grayScale, grayscale.Otsu(grayScale), 50, 155)
		// grayScale, _ = blur.GaussianBlurGray(grayScale, 1, 1, padding.BorderConstant)
		// grayScale, _ = transform.RotateGray(grayScale, -5, image.Point{X: 0, Y: 0}, true)
		// // jpeg.Encode(f, grayScale, &jpeg.Options{Quality: 100})

		// buf := new(bytes.Buffer)
		// jpeg.Encode(buf, grayScale, &jpeg.Options{Quality: 100})
		// send_s3 := buf.Bytes()
		// client.SetLanguage("eng")
		// client.SetPageSegMode(gosseract.PSM_RAW_LINE)
		// client.SetImageFromBytes(send_s3)

		// text, _ := client.Text()
		// log.Println("plaka: ", text)
		// var plates []string
		// plates = append(plates, text)
		// a := DetextMsg{Text: plates, Detects: d, Image: send_s3}
		// detectmsg = append(detectmsg, a)
		data, err := json.Marshal(a)
		if err == nil {
			sendMessage(WsMessage{Command: "detect", Data: string(data)})
		}
	}

}
