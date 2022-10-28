package main

import (
	"encoding/json"
	"fmt"
	"image"
	"log"
	"strings"

	"github.com/LdDl/go-darknet"
	goonvif "source.smiproject.co/forks/go-onvif"
)

var n = darknet.YOLONetwork{
	GPUDeviceIndex:           0,
	NetworkConfigurationFile: "yolov7-tiny.cfg",
	WeightsFile:              "yolov7-tiny.weights",
	Threshold:                .25,
}

func startOvif() string {

	log.Println("Test GetStreamURI")
	log.Println(Config.Recording)
	ovfDevice := goonvif.Device{
		XAddr:    Config.Recording.CameraUrl,
		User:     Config.Recording.CameraUsername,
		Password: Config.Recording.CameraPassword,
	}

	caps, err := ovfDevice.GetCapabilities()

	if err != nil {
		fmt.Printf("Get cap error %s\n", err.Error())
	}

	ovfMedia := goonvif.Device{
		XAddr:    caps.Media.XAddr,
		User:     ovfDevice.User,
		Password: ovfDevice.Password,
	}

	profiles, err := ovfMedia.GetProfiles()
	if err != nil {
		log.Println("onvif profiles:", err)
		return ""
	}
	uri, err := ovfMedia.GetStreamURI(profiles[0].Token, "RTSP")
	if err != nil {
		log.Println("onvif getstreamuri:", err)
	}
	var url = strings.Replace(uri.URI, "192.168.1.108", "admin:admin@192.168.1.108", -1)
	Config.Streams.URL = url
	if err := n.Init(); err != nil {
		log.Println("onvif darknet init:", err)
	}
	// defer n.Close()

	return url

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
		log.Println(string(data))
		if err == nil {
			sendMessage(WsMessage{Command: "detect", Data: string(data)})
		}
	}
	// n.Close()
}
