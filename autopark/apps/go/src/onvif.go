package main

import (
	"log"
	"strings"
	"time"

	goonvif "source.smiproject.co/forks/go-onvif"
)

var (
	rtspUrl      string
	ovfDevice    goonvif.Device
	profileToken string
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
