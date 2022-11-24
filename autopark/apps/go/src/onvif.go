package main

import (
	"encoding/json"
	"image"
	"log"
	"strings"
	"time"

	"github.com/LdDl/go-darknet"

	goonvif "source.smiproject.co/forks/go-onvif"
)

var (

	// //ocr
	// nocr = darknet.YOLONetwork{
	// 	GPUDeviceIndex:           0,
	// 	NetworkConfigurationFile: "assets/work6/ocr-net.cfg",
	// 	WeightsFile:              "assets/work6/ocr-net.weights",
	// 	Threshold:                .50,
	// }

	// en iyi
	// n = darknet.YOLONetwork{
	// 	GPUDeviceIndex:           0,
	// 	NetworkConfigurationFile: "assets/work3/yolov4.cfg",
	// 	WeightsFile:              "assets/work3/yolov4.weights",
	// 	Threshold:                .2,
	// }

	// iyi araba ve plaka
	n = darknet.YOLONetwork{
		GPUDeviceIndex:           0,
		NetworkConfigurationFile: "assets/work1/obj.cfg",
		WeightsFile:              "assets/work1/obj_60000.weights",
		Threshold:                .2,
	}

	// buluyo ama karışık biraz
	// n = darknet.YOLONetwork{
	// 	GPUDeviceIndex:           0,
	// 	NetworkConfigurationFile: "assets/work5/lpr.cfg",
	// 	WeightsFile:              "assets/work5/yolov4-tiny-custom_60000.weights",
	// 	Threshold:                .50,
	// }

	// harfli buluyor ama iyi değil
	// n = darknet.YOLONetwork{
	// 	GPUDeviceIndex:           0,
	// 	NetworkConfigurationFile: "assets/work4/DarkPlate.cfg",
	// 	WeightsFile:              "assets/work4/DarkPlate_best.weights",
	// 	Threshold:                .50,
	// }

	// netw         *engine.YOLONetwork
	rtspUrl      string
	ovfDevice    goonvif.Device
	profileToken string
)

type DetextMsg struct {
	Text    string             `json:"text"`
	Detects *darknet.Detection `json:"detects"`
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
			continue
		}

		profileToken = profiles[0].Token
		uri, err := ovfDevice.GetStreamURI(profiles[0].Token, "RTSP")

		if err != nil {
			log.Println("onvif getstreamuri:", err)
			time.Sleep(1 * time.Second)
			continue
		}

		rtspUrl = strings.Replace(uri.URI, Config.Recording.DeviceUrl, Config.Recording.CameraUsername+":"+Config.Recording.CameraPassword+"@"+Config.Recording.DeviceUrl, -1)
		Config.Streams.URL = rtspUrl

		log.Println("Onvif connected")

		if err := n.Init(); err != nil {
			log.Println("onvif darknet init:", err)
			time.Sleep(1 * time.Second)
			continue
		}
		break
	}

	go serveStreams()
	go startRecorder()

}

func analyseImage(img image.YCbCr) {

	imgDarknet, err := darknet.Image2Float32(img.SubImage(img.Rect))
	if err != nil {
		log.Println(err)
		return
	}
	defer imgDarknet.Close()

	dr, err := n.Detect(imgDarknet)
	if err != nil {
		log.Println(err)
		return
	}

	var detectmsg []DetextMsg
	var detects []*darknet.Detection
	for _, d := range dr.Detections {

		detects = append(detects, d)
		// imgDarknet2 := img.SubImage(image.Rect(d.StartPoint.X, d.StartPoint.Y, d.EndPoint.X, d.EndPoint.Y))
		// buf := new(bytes.Buffer)
		// jpeg.Encode(buf, imgDarknet2, nil)
		// send_s3 := buf.Bytes()
		// t, err := tesseract.NewTess(filepath.Join("/opt/homebrew/Cellar/tesseract/5.2.0/share", "tessdata"), "eng")
		// if err != nil {
		// 	log.Fatalf("Error while initializing Tess: %s\n", err)
		// }
		// defer t.Close()

		// pix, err := leptonica.NewPixReadMem(&send_s3)
		// if err != nil {
		// 	log.Fatalf("Error while getting pix from file: %s\n", err)
		// }
		// defer pix.Close()

		// t.SetPageSegMode(tesseract.PSM_AUTO_OSD)

		// err = t.SetVariable("tessedit_char_whitelist", ` 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz`+"`")
		// if err != nil {
		// 	log.Fatalf("Failed to SetVariable: %s\n", err)
		// }

		// t.SetImagePix(pix)

		a := DetextMsg{Text: "", Detects: d}
		detectmsg = append(detectmsg, a)
	}
	data, err := json.Marshal(detectmsg)
	if err == nil {
		sendMessage(WsMessage{Command: "detect", Data: string(data)})
	}
}
