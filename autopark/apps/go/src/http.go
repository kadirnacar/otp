package main

import (
	"bytes"
	"image/jpeg"
	"log"
	"time"

	"github.com/deepch/vdk/av"
	"github.com/deepch/vdk/cgo/ffmpeg"
	mp4 "github.com/deepch/vdk/format/mp4f"
	webrtc "github.com/deepch/vdk/format/webrtcv3"
	"github.com/gorilla/websocket"
)

type JCodec struct {
	Type string
}

var (
	muxerWebRTC *webrtc.Muxer
	isClose     chan bool = make(chan bool, 1)
	controlExit chan bool
)

func startStreamWebRTC(data string) {
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

	log.Println("create webrtcmuxer")
	muxerWebRTC = webrtc.NewMuxer(webrtc.Options{ICEServers: Config.GetICEServers()})
	answer, err := muxerWebRTC.WriteHeader(codecs, data)
	if err != nil {
		log.Println("WriteHeader", err)
		return
	}
	// defer muxerWebRTC.Close()
	log.Println("answer", answer)
	sendMessage(WsMessage{Command: "answer", Data: answer})
	if err != nil {
		log.Println("Write", err)
		return
	}

	go func() {
		_, ch := Config.clAd()
		// defer Config.clDe(cid)
		// defer Config.coDe()
		defer muxerWebRTC.Close()
		var videoStart bool
		noVideo := time.NewTimer(10 * time.Second)
		for {
			select {
			case <-isClose:
				log.Println("isClose", isClose)
				return
			case <-noVideo.C:

				log.Println("socket noVideo")
				continue

			case pck := <-ch:
				// log.Println("packet")
				if pck.IsKeyFrame || AudioOnly {
					noVideo.Reset(10 * time.Second)
					videoStart = true
				}
				if !videoStart && !AudioOnly {
					continue
				}

				err = muxerWebRTC.WritePacket(pck)
				if err != nil {
					log.Println("webrtc err:", err)
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

func startStreamWebsocket() {
	if !Config.ext() {
		log.Println("Stream Not Found22")
		return
	}

	Config.RunIFNotRun()
	codecs := Config.coGe()
	if codecs == nil {
		log.Println("Stream Codec Not Found")
		return
	}

	muxerMSE := mp4.NewMuxer(nil)
	muxerMSE.WriteHeader(codecs)
	meta, init := muxerMSE.GetInit(codecs)

	sendBuffer(append([]byte{9}, meta...))
	sendBuffer(init)
	controlExit = make(chan bool, 10)

	cid, ch := Config.clAd()
	defer Config.clDe(cid)
	defer muxerMSE.Finalize()

	var videoStart bool
	noVideo := time.NewTimer(10 * time.Second)
	pingTicker := time.NewTicker(500 * time.Millisecond)

	var FrameDecoderSingle *ffmpeg.VideoDecoder
	for _, element := range codecs {
		if element.Type().IsVideo() {
			var err error
			FrameDecoderSingle, err = ffmpeg.NewVideoDecoder(element.(av.VideoCodecData))
			if err != nil {
				log.Fatalln("FrameDecoderSingle Error", err)
			}
		}

	}
	defer pingTicker.Stop()
	defer log.Println("client exit")
	for {
		select {
		case <-pingTicker.C:
			err := conn.SetWriteDeadline(time.Now().Add(3 * time.Second))
			if err != nil {
				return
			}
			err = conn.WriteMessage(websocket.PingMessage, nil)
			if err != nil {
				return
			}
		case <-controlExit:

			return
		case <-noVideo.C:
			continue
		case pck := <-ch:
			if pck.IsKeyFrame {
				noVideo.Reset(10 * time.Second)
				videoStart = true
			}
			if !videoStart {
				continue
			}
			if pck.IsKeyFrame {
				if pic, err := FrameDecoderSingle.DecodeSingle(pck.Data); err == nil && pic != nil {
					buf := new(bytes.Buffer)
					err2 := jpeg.Encode(buf, &pic.Image, &jpeg.Options{Quality: 100})
					if err2 == nil {
						sendBuffer(buf.Bytes())
					}

				}
			}

		}
	}

}

type Response struct {
	Tracks []string `json:"tracks"`
	Sdp64  string   `json:"sdp64"`
}

type ResponseError struct {
	Error string `json:"error"`
}
