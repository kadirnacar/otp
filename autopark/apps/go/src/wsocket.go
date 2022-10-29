package main

import (
	"encoding/json"
	"log"
	"net/url"
	"os"
	"os/signal"
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

func connectApi(addr string) *websocket.Conn {
	u := url.URL{Scheme: "ws", Host: addr, Path: "/ws", RawQuery: "recorder"}
	log.Printf("connecting to %s", u.String())

	for {
		log.Println("reconnecting")
		var err error
		conn, _, err = websocket.DefaultDialer.Dial(u.String(), nil)
		if err != nil {
			log.Println("dial: ", err)
			time.Sleep(1 * time.Second)
			continue
		}

		log.Println("API connected")
		break
	}

	return conn
}

func startWs(addr string) {
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	// Connect to API
	conn = connectApi(addr)
	defer conn.Close()

	done := make(chan struct{})
	go func() {
		defer conn.Close()
		defer close(done)
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Println("read: ", err)
				conn = connectApi(addr)
				// return
			} else {
				var tmp WsMessage
				errJson := json.Unmarshal([]byte(message), &tmp)
				if errJson != nil {
					log.Println("Ws Message Parse Error:", err)
					continue
				}

				if tmp.Command == "init" {
					loadConfig2(tmp.Data)
					// var json = "{ \"server\": {}, \"streams\": { \"disable_audio\": true, \"on_demand\": false },\"recording\": {\"camurl\": \"http://192.168.1.108/onvif/device_service\" ,\"campassword\": \"admin\" ,\"camusername\": \"admin\" ,\"aiduration\": 250, \"saveduration\": 10000,\"path\": \"./records\",\"paths\": [],\"encrypted\": false}}"
					// loadConfig2(json)
					startOvif()
					go serveStreams()
					// go startRecorder()
				} else if tmp.Command == "close" {
					os.Exit(0)
				}
				log.Printf("recv: %s", tmp)

				log.Printf("recv: %s", message)
			}
		}
	}()
}
