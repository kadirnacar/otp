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
	n = darknet.YOLONetwork{
		GPUDeviceIndex:           0,
		NetworkConfigurationFile: "assets/yolov7-tiny.cfg",
		WeightsFile:              "assets/yolov7-tiny.weights",
		Threshold:                .25,
	}
	rtspUrl     string
	ovfDevice   goonvif.Device
	profileToke string
)

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

		// caps, err := ovfDevice.GetCapabilities()

		// if err != nil {
		// 	fmt.Printf("Get cap error %s\n", err.Error())

		// 	time.Sleep(1 * time.Second)
		// 	continue
		// }

		// ovfMedia := goonvif.Device{
		// 	XAddr:    caps.Media.XAddr,
		// 	User:     ovfDevice.User,
		// 	Password: ovfDevice.Password,
		// }

		profiles, err := ovfDevice.GetProfiles()
		if err != nil {
			log.Println("onvif profiles:", err)
			time.Sleep(1 * time.Second)
			continue
		}
		profileToke = profiles[0].Token
		uri, err := ovfDevice.GetStreamURI(profiles[0].Token, "RTSP")
		if err != nil {
			log.Println("onvif getstreamuri:", err)
			time.Sleep(1 * time.Second)
			continue
		}
		rtspUrl = strings.Replace(uri.URI, "192.168.1.108", "admin:admin@192.168.1.108", -1)
		Config.Streams.URL = rtspUrl
		if err := n.Init(); err != nil {
			log.Println("onvif darknet init:", err)
			time.Sleep(1 * time.Second)
			continue
		}
		log.Println("Onvif connected")
		break
	}

	// defer n.Close()
	go serveStreams()
	go startRecorder()

}

func setOnvifConfig(val int) {
	log.Println("set config:", val)
	configs, err := ovfDevice.GetVideoEncoderConfigurations()
	if err != nil {
		log.Println("onvif get encode:", err)
	} else {
		for _, d := range configs {
			nd := d
			nd.H264.GovLength = val
			err2, resp := ovfDevice.SetVideoEncoderConfiguration(nd)

			// var drf = ovfDevice.SetVideoEncoderConfiguration(goonvif.VideoEncoderConfig{Token: d.Token, H264: goonvif.H264Configuration{GovLength: val}})
			xm, _ := resp.Xml()
			log.Printf("Get cap error %s\n", xm)
			if err2 != nil {
				log.Println("onvif set encode:", err2)
			}
		}
	}
}

func analysisImage(image image.YCbCr) {

	imgDarknet, err := darknet.Image2Float32(image.SubImage(image.Rect))
	if err != nil {
		// panic(err.Error())
		log.Println(err)
		return
	}
	defer imgDarknet.Close()

	dr, err := n.Detect(imgDarknet)
	if err != nil {
		log.Println(err)
		return
	}
	var detects []*darknet.Detection
	for _, d := range dr.Detections {

		if len(d.ClassIDs) > 0 {
			detects = append(detects, d)
		}
		// for i := range d.ClassIDs {
		// 	// bBox := d.BoundingBox
		// 	// fmt.Printf("%s (%d): %.4f%% | start point: (%d,%d) | end point: (%d, %d)\n",
		// 	// 	d.ClassNames[i], d.ClassIDs[i],
		// 	// 	d.Probabilities[i],
		// 	// 	bBox.StartPoint.X, bBox.StartPoint.Y,
		// 	// 	bBox.EndPoint.X, bBox.EndPoint.Y,
		// 	// )

		// 	// Uncomment code below if you want save cropped objects to files
		// 	// minX, minY := float64(bBox.StartPoint.X), float64(bBox.StartPoint.Y)
		// 	// maxX, maxY := float64(bBox.EndPoint.X), float64(bBox.EndPoint.Y)
		// 	// rect := image.Rect(round(minX), round(minY), round(maxX), round(maxY))
		// 	// err := saveToFile(src, rect, fmt.Sprintf("crop_%d.jpeg", i))
		// 	// if err != nil {
		// 	// 	fmt.Println(err)
		// 	// 	return
		// 	// }
		// }

	}
	if len(detects) > 0 {
		data, err := json.Marshal(detects)
		// log.Println(string(data))
		if err == nil {
			sendMessage(WsMessage{Command: "detect", Data: string(data)})
		}
	}
	// n.Close()
}
