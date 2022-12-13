package main

import (
	"bufio"
	"crypto/rand"
	"encoding/json"
	"flag"
	"fmt"
	"io/ioutil"
	"log"
	"sync"
	"time"

	"github.com/deepch/vdk/codec/h264parser"
	"github.com/deepch/vdk/codec/h265parser"

	"github.com/deepch/vdk/av"
)

// Config global
var Config = loadConfig()
var empty interface{}

// ConfigST struct
type WsMessage struct {
	Command string `json:"command"`
	Data    string `json:"data"`
	Buffer  *[]byte
}

// ConfigST struct
type ConfigST struct {
	mutex   sync.RWMutex
	screen  bufio.Writer
	Server  ServerST `json:"server"`
	Streams StreamST `json:"streams"`
	// Streams   map[string]StreamST `json:"streams"`
	LastError error
	Recording Recording `json:"recording"`
}

type Recording struct {
	Duration       float32  `json:"duration"`
	SavePath       string   `json:"path"`
	Paths          []string `json:"paths"`
	Encrypted      bool     `json:"encrypted"`
	AiDuration     int64    `json:"aiduration"`
	SaveDuration   int64    `json:"saveduration"`
	CameraUrl      string   `json:"camurl"`
	DeviceUrl      string   `json:"deviceurl"`
	CameraUsername string   `json:"camusername"`
	CameraPassword string   `json:"campassword"`
}

// ServerST struct
type ServerST struct {
	HTTPPort      string   `json:"http_port"`
	ICEServers    []string `json:"ice_servers"`
	ICEUsername   string   `json:"ice_username"`
	ICECredential string   `json:"ice_credential"`
	WebRTCPortMin uint16   `json:"webrtc_port_min"`
	WebRTCPortMax uint16   `json:"webrtc_port_max"`
}

// StreamST struct
type StreamST struct {
	URL          string `json:"url"`
	Status       bool   `json:"status"`
	OnDemand     bool   `json:"on_demand"`
	DisableAudio bool   `json:"disable_audio"`
	Debug        bool   `json:"debug"`
	RunLock      bool   `json:"-"`
	Codecs       []av.CodecData
	Cl           map[string]viewer
}

type viewer struct {
	c chan av.Packet
}

func (element *ConfigST) RunIFNotRun() {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	if element.Streams.OnDemand && !element.Streams.RunLock {
		element.Streams.RunLock = true
		go RTSPWorkerLoop(element.Streams.URL, element.Streams.OnDemand, element.Streams.DisableAudio, element.Streams.Debug)
	}
}

func (element *ConfigST) RunUnlock() {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	if element.Streams.OnDemand && element.Streams.RunLock {
		element.Streams.RunLock = false
	}
}

func (element *ConfigST) HasViewer() bool {
	element.mutex.Lock()
	defer element.mutex.Unlock()

	if len(element.Streams.Cl) > 0 {
		return true
	}
	return false
}

func (element *ConfigST) GetICEServers() []string {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	return element.Server.ICEServers
}

func (element *ConfigST) GetICEUsername() string {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	return element.Server.ICEUsername
}

func (element *ConfigST) GetICECredential() string {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	return element.Server.ICECredential
}

func (element *ConfigST) GetWebRTCPortMin() uint16 {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	return element.Server.WebRTCPortMin
}

func (element *ConfigST) GetWebRTCPortMax() uint16 {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	return element.Server.WebRTCPortMax
}

func loadConfig2(data string) {
	var tmp ConfigST
	err := json.Unmarshal([]byte(data), &tmp)
	if err != nil {
		log.Fatalln(err)
	}
	tmp.Streams.Cl = make(map[string]viewer)
	Config = &tmp
	log.Println("onvif config:", Config.Recording.DeviceUrl)
	go startOvif()

}

func loadConfig() *ConfigST {
	var tmp ConfigST
	data, err := ioutil.ReadFile("config.json")
	if err == nil {
		err = json.Unmarshal(data, &tmp)
		if err != nil {
			log.Fatalln(err)
		}
		tmp.Streams.Cl = make(map[string]viewer)
	} else {
		addr := flag.String("listen", "8083", "HTTP host:port")
		udpMin := flag.Int("udp_min", 0, "WebRTC UDP port min")
		udpMax := flag.Int("udp_max", 0, "WebRTC UDP port max")
		iceServer := flag.String("ice_server", "", "ICE Server")
		flag.Parse()

		tmp.Server.HTTPPort = *addr
		tmp.Server.WebRTCPortMin = uint16(*udpMin)
		tmp.Server.WebRTCPortMax = uint16(*udpMax)
		if len(*iceServer) > 0 {
			tmp.Server.ICEServers = []string{*iceServer}
		}

		tmp.Streams = StreamST{}
	}
	return &tmp
}

func (element *ConfigST) cast(pck av.Packet) {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	for _, v := range element.Streams.Cl {
		if len(v.c) < cap(v.c) {
			v.c <- pck
		}
	}
}

func (element *ConfigST) ext() bool {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	return true
}

func (element *ConfigST) coAd(codecs []av.CodecData) {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	element.Streams.Codecs = codecs
}
func (element *ConfigST) coDe() {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	element.Streams = StreamST{}
}

func (element *ConfigST) coGe() []av.CodecData {
	for i := 0; i < 100; i++ {
		element.mutex.RLock()
		tmp := element.Streams
		element.mutex.RUnlock()
		if tmp.Codecs != nil {
			for _, codec := range tmp.Codecs {
				log.Println("Codec", codec.Type())

				if codec.Type() == av.H264 {
					codecVideo := codec.(h264parser.CodecData)
					if codecVideo.SPS() != nil && codecVideo.PPS() != nil && len(codecVideo.SPS()) > 0 && len(codecVideo.PPS()) > 0 {
					} else {
						log.Println("Bad Video Codec SPS or PPS Wait")
						time.Sleep(50 * time.Millisecond)
						continue
					}
				} else if codec.Type() == av.H265 {
					codecVideo := codec.(h265parser.CodecData)
					if codecVideo.SPS() != nil && codecVideo.PPS() != nil && len(codecVideo.SPS()) > 0 && len(codecVideo.PPS()) > 0 {
					} else {
						log.Println("Bad Video Codec SPS or PPS Wait")
						time.Sleep(50 * time.Millisecond)
						continue
					}
				}
			}
			return tmp.Codecs
		}
		time.Sleep(50 * time.Millisecond)
	}
	return nil
}

func (element *ConfigST) clAd() (string, chan av.Packet) {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	cuuid := pseudoUUID()
	ch := make(chan av.Packet, 100)
	element.Streams.Cl[cuuid] = viewer{c: ch}
	return cuuid, ch
}

//	func (element *ConfigST) list() (string, []string) {
//		element.mutex.Lock()
//		defer element.mutex.Unlock()
//		var res []string
//		var fist string
//		for k := range element.Streams {
//			if fist == "" {
//				fist = k
//			}
//			res = append(res, k)
//		}
//		return fist, res
//	}
func (element *ConfigST) clDe(cuuid string) {
	element.mutex.Lock()
	defer element.mutex.Unlock()
	delete(element.Streams.Cl, cuuid)
}

func pseudoUUID() (uuid string) {
	b := make([]byte, 16)
	_, err := rand.Read(b)
	if err != nil {
		fmt.Println("Error: ", err)
		return
	}
	uuid = fmt.Sprintf("%X-%X-%X-%X-%X", b[0:4], b[4:6], b[6:8], b[8:10], b[10:])
	return
}
