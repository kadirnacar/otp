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
	conn   *websocket.Conn
	isInit bool = false
)

func sendMessage(msg WsMessage) {
	if conn != nil {
		err := conn.WriteJSON(msg)
		if err != nil {
			log.Println("send message:", err)
		}
	}
}

func sendBuffer(buffer []byte) {
	if conn != nil {
		err := conn.WriteMessage(websocket.BinaryMessage, buffer)
		if err != nil {
			log.Println("send message:", err)
		}
	}
}

func startWs(addr string, camId string) {
	interrupt := make(chan os.Signal, 1)
	signal.Notify(interrupt, os.Interrupt)

	u := url.URL{Scheme: "ws", Host: addr, Path: "/ws", RawQuery: camId}
	log.Printf("connecting to %s", u.String())

	var err error

	conn, _, err = websocket.DefaultDialer.Dial(u.String(), nil)
	if err != nil {
		log.Fatal("dial:", err)
	}
	defer func() {
		conn.Close()
		startWs(addr, camId)
	}()

	done := make(chan struct{})

	go func() {
		defer conn.Close()
		defer close(done)
		defer func() {
			conn.Close()
		}()
		for {
			mType, message, err := conn.ReadMessage()
			if err != nil {
				log.Println("read:", err)
				return
			}
			if mType == -1 {
				return
			}
			var tmp WsMessage
			errJson := json.Unmarshal([]byte(message), &tmp)
			if errJson != nil {
				log.Println("Ws Message Parse Error:", err)
				continue
			}

			switch command := tmp.Command; command {
			case "init":
				if !isInit {
					isInit = true
					go loadConfig2(tmp.Data)
				}
			case "rtsp":
				go startStreamWebsocket()
			case "close":
				return
			case "snapshot":
				go func() {
					snapUrl, _ := ovfDevice.GetSnapshot(profileToken)
					sendMessage(WsMessage{Command: "snapshot", Data: snapUrl})
				}()
			}
			log.Printf("recv: %s", message)
		}
	}()

	ticker := time.NewTicker(time.Second)
	defer ticker.Stop()

	for {
		defer func() {
			conn.Close()
		}()
		select {
		case <-ticker.C:
			err := conn.WriteControl(websocket.PingMessage, nil, time.Now().Add(2*time.Second))
			if err != nil {
				log.Println("write:", err)
				return
			}
		case <-interrupt:
			log.Println("interrupt")
			// To cleanly close a connection, a client should send a close
			// frame and wait for the server to close the connection.
			err := conn.WriteMessage(websocket.CloseMessage, websocket.FormatCloseMessage(websocket.CloseNormalClosure, ""))
			if err != nil {
				log.Println("write close:", err)
				return
			}
			select {
			case <-done:
			case <-time.After(time.Second):
			}
			conn.Close()
			return
		}
	}
}
