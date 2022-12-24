package main

import (
	"errors"
	"log"
	"time"

	"github.com/deepch/vdk/format/rtspv2"
)

var (
	ErrorStreamExitNoVideoOnStream = errors.New("Stream Exit No Video On Stream")
	ErrorStreamExitRtspDisconnect  = errors.New("Stream Exit Rtsp Disconnect")
	ErrorStreamExitNoViewer        = errors.New("Stream Exit On Demand No Viewer")
)

func serveStreams() {
	if !Config.Streams.OnDemand {
		go RTSPWorkerLoop(Config.Streams.URL, Config.Streams.OnDemand, Config.Streams.DisableAudio, Config.Streams.Debug)
	}
}
func RTSPWorkerLoop(url string, OnDemand, DisableAudio, Debug bool) {
	defer Config.coDe()
	defer Config.RunUnlock()
	for {
		err := RTSPWorker(url, OnDemand, DisableAudio, Debug)
		if err != nil {
			Config.LastError = err
			// Config.coDe(name)
			// Config.RunUnlock(name)
			// go RTSPWorkerLoop(name, url, OnDemand, DisableAudio, Debug)
			// return err
		}
		if OnDemand && !Config.HasViewer() {
			log.Println(ErrorStreamExitNoViewer)
			// return
		}
		time.Sleep(1 * time.Second)
	}
}
func RTSPWorker(url string, OnDemand, DisableAudio, Debug bool) error {
	keyTest := time.NewTimer(20 * time.Second)
	clientTest := time.NewTimer(20 * time.Second)
	log.Println("RTSPClient url: ", url)

	RTSPClient, err := rtspv2.Dial(rtspv2.RTSPClientOptions{URL: url, DisableAudio: DisableAudio, DialTimeout: 13 * time.Second, ReadWriteTimeout: 13 * time.Second, Debug: false})
	if err != nil {
		log.Println("RTSPClient : ", err, url)
		return err
	}

	defer RTSPClient.Close()
	log.Println("RTSPClient codec : ", RTSPClient.CodecData)

	if RTSPClient.CodecData != nil {
		Config.coAd(RTSPClient.CodecData)
	}

	var AudioOnly bool
	if len(RTSPClient.CodecData) == 1 && RTSPClient.CodecData[0].Type().IsAudio() {
		AudioOnly = true
	}
	for {
		select {
		case <-clientTest.C:
			if OnDemand {
				if !Config.HasViewer() {
					// return ErrorStreamExitNoViewer
				} else {
					clientTest.Reset(20 * time.Second)
				}
			}
		case <-keyTest.C:
			return ErrorStreamExitNoVideoOnStream
		case signals := <-RTSPClient.Signals:
			switch signals {
			case rtspv2.SignalCodecUpdate:
				Config.coAd(RTSPClient.CodecData)
			case rtspv2.SignalStreamRTPStop:
				return ErrorStreamExitRtspDisconnect
			}
		case packetAV := <-RTSPClient.OutgoingPacketQueue:
			if AudioOnly || packetAV.IsKeyFrame {
				keyTest.Reset(20 * time.Second)
			}
			Config.cast(*packetAV)
		}
	}
}
