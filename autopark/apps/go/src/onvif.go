package main

import (
	"bytes"
	"encoding/json"
	"image"
	"image/jpeg"
	"log"
	"path/filepath"
	"strings"
	"time"

	leptonica "gopkg.in/GeertJohan/go.leptonica.v1"

	tesseract "github.com/GeertJohan/go.tesseract"
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
	n = darknet.YOLONetwork{
		GPUDeviceIndex:           0,
		NetworkConfigurationFile: "assets/work3/yolov4.cfg",
		WeightsFile:              "assets/work3/yolov4.weights",
		Threshold:                .50,
	}

	// iyi araba ve plaka
	// n = darknet.YOLONetwork{
	// 	GPUDeviceIndex:           0,
	// 	NetworkConfigurationFile: "assets/work1/obj.cfg",
	// 	WeightsFile:              "assets/work1/obj_60000.weights",
	// 	Threshold:                .50,
	// }

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

// var (
// 	cascade       = gocv.NewCascadeClassifier()
// 	isLoaded bool = false
// )

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
		// log.Println(profiles[1])
		profileToken = profiles[0].Token
		uri, err := ovfDevice.GetStreamURI(profiles[0].Token, "RTSP")
		if err != nil {
			log.Println("onvif getstreamuri:", err)
			time.Sleep(1 * time.Second)
			continue
		}
		rtspUrl = strings.Replace(uri.URI, Config.Recording.DeviceUrl, Config.Recording.CameraUsername+":"+Config.Recording.CameraPassword+"@"+Config.Recording.DeviceUrl, -1)
		// rtspUrl = strings.Replace(uri.URI, "192.168.1.108", "admin:admin@192.168.1.108", -1)
		Config.Streams.URL = rtspUrl

		log.Println("Onvif connected")
		// netw, err = engine.NewYOLONetwork("assets/data/license_plates_inference.cfg", "assets/data/license_plates_100000.weights", "assets/data/ocr_plates_inference.cfg", "assets/data/ocr_plates_140000.weights")

		// if err != nil {
		// 	log.Println("yolo err:", err)
		// }

		if err := n.Init(); err != nil {
			log.Println("onvif darknet init:", err)
			time.Sleep(1 * time.Second)
			continue
		}
		// if err := nocr.Init(); err != nil {
		// 	log.Println("onvif ocr init:", err)
		// 	time.Sleep(1 * time.Second)
		// 	continue
		// }
		// netw.LicensePlates.Threshold = 0.45
		// netw.OCR.Threshold = 0.25
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

// func analyseImage0(image image.YCbCr) {
// 	img := image.SubImage(image.Rect)
// 	imgDarknet, err := darknet.Image2Float32(img)
// 	if err != nil {
// 		// panic(err.Error())
// 		log.Println(err)
// 		return
// 	}
// 	defer imgDarknet.Close()

// 	dr, err := netw.LicensePlates.Detect(imgDarknet)
// 	if err != nil {
// 		log.Println(err)
// 		return
// 	}

// 	log.Println(dr.Detections)

// 	var detects []*darknet.Detection
// 	for _, d := range dr.Detections {

// 		// if len(d.ClassIDs) > 0 {
// 		detects = append(detects, d)
// 		// }
// 		// for i := range d.ClassIDs {
// 		// 	// bBox := d.BoundingBox
// 		// 	// fmt.Printf("%s (%d): %.4f%% | start point: (%d,%d) | end point: (%d, %d)\n",
// 		// 	// 	d.ClassNames[i], d.ClassIDs[i],
// 		// 	// 	d.Probabilities[i],
// 		// 	// 	bBox.StartPoint.X, bBox.StartPoint.Y,
// 		// 	// 	bBox.EndPoint.X, bBox.EndPoint.Y,
// 		// 	// )

// 		// 	// Uncomment code below if you want save cropped objects to files
// 		// 	// minX, minY := float64(bBox.StartPoint.X), float64(bBox.StartPoint.Y)
// 		// 	// maxX, maxY := float64(bBox.EndPoint.X), float64(bBox.EndPoint.Y)
// 		// 	// rect := image.Rect(round(minX), round(minY), round(maxX), round(maxY))
// 		// 	// err := saveToFile(src, rect, fmt.Sprintf("crop_%d.jpeg", i))
// 		// 	// if err != nil {
// 		// 	// 	fmt.Println(err)
// 		// 	// 	return
// 		// 	// }
// 		// }

// 	}
// 	data, err := json.Marshal(detects)
// 	// log.Println(string(data))
// 	if err == nil {
// 		sendMessage(WsMessage{Command: "detect", Data: string(data)})
// 	}
// 	// resp, err := netw.ReadLicensePlates(img, true)

// 	// if err != nil {
// 	// 	log.Println("yolo detect err:", err)

// 	// }
// 	// log.Println(resp)
// }

func analyseImage(img image.YCbCr) {

	imgDarknet, err := darknet.Image2Float32(img.SubImage(img.Rect))
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

	var detectmsg []DetextMsg
	var detects []*darknet.Detection
	for _, d := range dr.Detections {

		// if len(d.ClassIDs) > 0 {
		detects = append(detects, d)
		// if len(d.ClassNames) > 0 {
		imgDarknet2 := img.SubImage(image.Rect(d.StartPoint.X, d.StartPoint.Y, d.EndPoint.X, d.EndPoint.Y))
		buf := new(bytes.Buffer)
		jpeg.Encode(buf, imgDarknet2, nil)
		send_s3 := buf.Bytes()
		t, err := tesseract.NewTess(filepath.Join("/opt/homebrew/Cellar/tesseract/5.2.0/share", "tessdata"), "eng")
		if err != nil {
			log.Fatalf("Error while initializing Tess: %s\n", err)
		}
		defer t.Close()

		pix, err := leptonica.NewPixReadMem(&send_s3)
		if err != nil {
			log.Fatalf("Error while getting pix from file: %s\n", err)
		}
		defer pix.Close() // remember to cleanup

		t.SetPageSegMode(tesseract.PSM_AUTO_OSD)

		// setup a whitelist of all basic ascii
		err = t.SetVariable("tessedit_char_whitelist", ` !"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\]^_abcdefghijklmnopqrstuvwxyz{|}~`+"`")
		if err != nil {
			log.Fatalf("Failed to SetVariable: %s\n", err)
		}

		// set the image to the tesseract instance
		t.SetImagePix(pix)

		// retrieve text from the tesseract instance
		a := DetextMsg{Text: t.Text(), Detects: d}
		detectmsg = append(detectmsg, a)
		// }
		// }
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
	// if len(detects) > 0 {
	data, err := json.Marshal(detectmsg)
	// log.Println(string(data))
	if err == nil {
		sendMessage(WsMessage{Command: "detect", Data: string(data)})
	}
	// }
	// n.Close()
}

// func analyseImage2(image image.YCbCr) {
// 	img := image.SubImage(image.Rect)
// 	var b bytes.Buffer
// 	w := bufio.NewWriter(&b)

// 	err := jpeg.Encode(w, img, &jpeg.Options{Quality: 80})

// 	if err != nil {
// 		log.Println("image decode error:", err)
// 		return
// 	}

// 	log.Println("image len:", b.Len())

// 	// byts := b.Bytes()

// 	if !isLoaded {
// 		isLoaded = cascade.Load("./assets/haarcascade_licence_plate_rus_16stages.xml")
// 	}
// 	// defer cascade.Close()

// 	imgMat, err := gocv.ImageToMatRGBA(img)
// 	if err != nil {
// 		log.Println("image to opencv error:", err)
// 		return
// 	}
// 	defer imgMat.Close()

// 	imgRects := cascade.DetectMultiScale(imgMat)

// 	// for _, imgRect := range imgRects {
// 	// 	// log.Println(imgRect)
// 	// }

// 	log.Println("imgRects", imgRects)
// 	j, _ := json.Marshal(imgRects)
// 	sendMessage(WsMessage{Command: "detect", Data: string(j)})
// 	// sendMessage(WsMessage{Command: "image", Buffer: &byts})
// 	// log.Println("image len:", b.Len())
// 	// res, err := http.Get(url)
// 	// if err != nil || res.StatusCode != 200 {
// 	// 	log.Println("analyse error read url:", err, res.StatusCode, url)
// 	// 	return
// 	// }
// 	// defer res.Body.Close()
// 	// m, _, err := image.Decode(res.Body)
// 	// if err != nil {
// 	// 	log.Println("analyse error decode image:", err)
// 	// 	return
// 	// 	// handle error
// 	// }
// 	// log.Println(m.Bounds())
// }
