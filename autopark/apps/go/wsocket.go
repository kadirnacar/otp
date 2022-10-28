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

var conn *websocket.Conn

func sendMessage(msg WsMessage) {
	if conn != nil {
		err := conn.WriteJSON(msg)
		if err != nil {
			log.Println("send message:", err)
		}
	}
}

func startWs(addr string) {
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	u := url.URL{Scheme: "ws", Host: addr, Path: "/ws"}
	log.Printf("connecting to %s", u.String())
	var err error
	conn, _, err = websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		conn = nil
		log.Println("dial:", err)
		// var json = "{ \"server\": {}, \"streams\": { \"sss\": { \"url\": \"rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov\", \"disable_audio\": true, \"on_demand\": false }},\"recording\": {\"duration\": 5,\"path\": \"/Users/kadirnacar/Desktop/temp/deneme/kadir\",\"paths\": [],\"encrypted\": false}}"
		var json = "{ \"server\": {}, \"streams\": { \"disable_audio\": true, \"on_demand\": false },\"recording\": {\"camurl\": \"http://192.168.1.108/onvif/device_service\" ,\"campassword\": \"admin\" ,\"camusername\": \"admin\" ,\"aiduration\": 250, \"saveduration\": 10000,\"path\": \"/Users/kadirnacar/Desktop/temp/deneme/kadir\",\"paths\": [],\"encrypted\": false}}"
		loadConfig2(json)
		startOvif()
		go serveStreams()
		go startRecorder()
		return
	}

	done := make(chan struct{})

	go func() {
		defer close(done)
		defer conn.Close()
		for {
			_, message, err := conn.ReadMessage()
			if err != nil {
				log.Println("Ws Message Read Error:", err)
				continue
			}

			var tmp WsMessage
			errJson := json.Unmarshal([]byte(message), &tmp)
			if errJson != nil {
				log.Println("Ws Message Parse Error:", err)
				continue
			}

			if tmp.Command == "init" {
				loadConfig2(tmp.Data)
				startOvif()
				go serveStreams()
				go startRecorder()
			} else if tmp.Command == "close" {
				os.Exit(0)
			}
			log.Printf("recv: %s", tmp)
		}
	}()

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-done:
			return
		// case t := <-ticker.C:
		// 	err := c.WriteMessage(websocket.TextMessage, []byte(t.String()))
		// 	if err != nil {
		// 		log.Println("write:", err)
		// 		return
		// 	}
		case <-interrupt:
			log.Println("interrupt")

			// Cleanly close the connection by sending a close message and then
			// waiting (with timeout) for the server to close the connection.
			err := conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			if err != nil {
				log.Println("write close:", err)
				return
			}
			select {
			case <-done:
			case <-time.After(time.Second):
			}
			return
		}
	}

	// var json = "{ \"server\": {}, \"streams\": { \"sss\": { \"url\": \"rtsp://wowzaec2demo.streamlock.net/vod/mp4:BigBuckBunny_115k.mov\", \"disable_audio\": true, \"on_demand\": false }},\"recording\": {\"duration\": 5,\"path\": \"/Users/kadirnacar/Desktop/temp/deneme/kadir\",\"paths\": [],\"encrypted\": false}}"
	// var json = "{ \"server\": {}, \"streams\": { \"disable_audio\": true, \"on_demand\": false },\"recording\": {\"camurl\": \"192.168.1.108\" ,\"campassword\": \"admin123\" ,\"camusername\": \"admin\" ,\"aiduration\": 1, \"saveduration\": 10,\"path\": \"/Users/kadirnacar/Desktop/temp/deneme/kadir\",\"paths\": [],\"encrypted\": false}}"
	// loadConfig2(json)
	// uri := startOvif()
	// Config.Streams.URL = uri
	// log.Println("uri:", uri, json)
	// go serveStreams()
	// go startRecorder()
}
