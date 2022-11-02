package main

import (
	"log"
	"time"

	webrtc "github.com/deepch/vdk/format/webrtcv3"
)

type JCodec struct {
	Type string
}

func HTTPAPIServerStreamWebRTC(data string) {
	if !Config.ext() {
		log.Println("Stream Not Found")
		return
	}
	Config.RunIFNotRun()
	codecs := Config.coGe()
	if codecs == nil {
		log.Println("Stream Codec Not Found")
		return
	}
	var AudioOnly bool
	if len(codecs) == 1 && codecs[0].Type().IsAudio() {
		AudioOnly = true
	}

	muxerWebRTC := webrtc.NewMuxer(webrtc.Options{ICEServers: Config.GetICEServers(), ICEUsername: Config.GetICEUsername(), ICECredential: Config.GetICECredential(), PortMin: Config.GetWebRTCPortMin(), PortMax: Config.GetWebRTCPortMax()})
	answer, err := muxerWebRTC.WriteHeader(codecs, data)
	if err != nil {
		log.Println("WriteHeader", err)
		return
	}
	// defer muxerWebRTC.Close()

	sendMessage(WsMessage{Command: "answer", Data: answer})
	if err != nil {
		log.Println("Write", err)
		return
	}
	go func() {
		_, ch := Config.clAd()
		// defer Config.clDe(cid)
		// defer Config.coDe()
		// defer muxerWebRTC.Close()
		var videoStart bool
		noVideo := time.NewTimer(10 * time.Second)
		for {
			select {
			case <-noVideo.C:

				log.Println("noVideo")
				continue

			case pck := <-ch:
				if pck.IsKeyFrame || AudioOnly {
					noVideo.Reset(10 * time.Second)
					videoStart = true
				}
				if !videoStart && !AudioOnly {
					continue
				}

				err = muxerWebRTC.WritePacket(pck)
				if err != nil {
					// mapErr := map[string]string{"error": err.Error()}
					// mapErrJ, _ := json.Marshal(mapErr)
					// fmt.Println(string(mapErrJ))
					// os.Exit(3)
					// return
					return
				}
			}
		}
	}()
}

type Response struct {
	Tracks []string `json:"tracks"`
	Sdp64  string   `json:"sdp64"`
}

type ResponseError struct {
	Error string `json:"error"`
}
