package main

import (
	"encoding/json"
	"log"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"time"

	"github.com/gorilla/websocket"
)

var (
	conn *websocket.Conn
)

func sendMessage(msg WsMessage) {
	if conn != nil {
		err := conn.WriteJSON(msg)
		if err != nil {
			log.Println("send message:", err)
		}
	}
}

func connectApi(addr string, camId string) *websocket.Conn {
	u := url.URL{Scheme: "ws", Host: addr, Path: "/ws", RawQuery: camId}
	log.Printf("connecting to %s", u.String())

	log.Println("reconnecting")
	var err error
	conn, _, err = websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Println("dial: ", err)
		time.Sleep(1 * time.Second)
	}

	log.Println("API connected")

	return conn
}

func startWs(addr string, camId string) {
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	// Connect to API
	conn = connectApi(addr, camId)
	// defer conn.Close()

	// done := make(chan struct{})
	go func() {
		// defer conn.Close()
		// defer close(done)
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Println("read: ", err)
				time.Sleep(2 * time.Second)
				conn = connectApi(addr, camId)
				return
			} else {
				var tmp WsMessage
				errJson := json.Unmarshal([]byte(message), &tmp)
				if errJson != nil {
					log.Println("Ws Message Parse Error:", err)
					continue
				}

				if tmp.Command == "init" {
					go loadConfig2(tmp.Data)
					// var json = "{ \"server\": {}, \"streams\": { \"disable_audio\": true, \"on_demand\": false },\"recording\": {\"camurl\": \"http://192.168.1.108/onvif/device_service\" ,\"campassword\": \"admin\" ,\"camusername\": \"admin\" ,\"aiduration\": 250, \"saveduration\": 10000,\"path\": \"./records\",\"paths\": [],\"encrypted\": false}}"
					// loadConfig2(json)
					// go startOvif()
					// go serveStreams()
					// go startRecorder()
				} else if tmp.Command == "rtsp" {
					go HTTPAPIServerStreamWebRTC(tmp.Data)
				} else if tmp.Command == "close" {
					os.Exit(0)
				} else if tmp.Command == "config" {
					val, err := strconv.Atoi(tmp.Data)
					if err == nil {
						go setOnvifConfig(val)
					}
				}
			}
		}
	}()
}
