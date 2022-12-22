package main

import (
	"bytes"
	"encoding/json"
	"image"
	"image/jpeg"
	"log"
	"net"
	"net/url"
	"time"

	"github.com/LdDl/go-darknet"
	"github.com/otiai10/gosseract/v2"

	goonvif "source.smiproject.co/forks/go-onvif"
)

var (

	// en iyi
	n = darknet.YOLONetwork{
		GPUDeviceIndex:           0,
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
	// 	NetworkConfigurationFile: "assets/work4/yolov4-tiny-obj.cfg",
	// 	WeightsFile:              "assets/work4/tiny-car.weights",
	// 	Threshold:                .2,
	// }

	// netw         *engine.YOLONetwork
	rtspUrl      string
	ovfDevice    goonvif.Device
	profileToken string
	client       *gosseract.Client
)

type DetextMsg struct {
	Text    string             `json:"text"`
	Detects *darknet.Detection `json:"detects"`
	Image   []byte             `json:"image"`
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
		u, _ := url.Parse(uri.URI)
		u2, _ := url.Parse(Config.Recording.CameraUrl)

		_, port, _ := net.SplitHostPort(u.Host)
		host2, _, _ := net.SplitHostPort(u2.Host)

		u.Host = host2 + ":" + port

		u.User = url.UserPassword(Config.Recording.CameraUsername, Config.Recording.CameraPassword)

		// rtspUrl = strings.Replace(uri.URI, Config.Recording.DeviceUrl, Config.Recording.CameraUsername+":"+Config.Recording.CameraPassword+"@"+Config.Recording.DeviceUrl, -1)
		rtspUrl = u.String()
		Config.Streams.URL = rtspUrl

		log.Println("Onvif connected")
		log.Println(uri.URI, u)

		if err := n.Init(); err != nil {
			log.Println("onvif darknet init:", err)
			time.Sleep(1 * time.Second)
			continue
		}

		client = gosseract.NewClient()
		client.SetWhitelist("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz")

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
		imgDarknet2 := img.SubImage(image.Rect(d.StartPoint.X, d.StartPoint.Y, d.EndPoint.X, d.EndPoint.Y))
		// imgPol := polish.PolishImage(polish.ModelTypeDeep, imgDarknet2)

		buf := new(bytes.Buffer)
		jpeg.Encode(buf, imgDarknet2, nil)
		send_s3 := buf.Bytes()
		client.SetImageFromBytes(send_s3)
		text, _ := client.Text()
		log.Println("plaka", text)

		// defer imgDarknet3.Close()

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

		a := DetextMsg{Text: text, Detects: d, Image: send_s3}
		detectmsg = append(detectmsg, a)
	}
	data, err := json.Marshal(detectmsg)
	if err == nil {
		sendMessage(WsMessage{Command: "detect", Data: string(data)})
	}
}
