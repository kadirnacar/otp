package main

import (
	"log"
	"os"
	"os/signal"
	"syscall"
)

func main() {
	serverAddr := os.Args[1]
	camId := os.Args[2]

	// serverAddr := "localhost:3333"
	// camId := "1"
	go startWs(serverAddr, camId)

	// readImages()
	// return

	sigs := make(chan os.Signal, 1)
	done := make(chan bool, 1)
	signal.Notify(sigs, syscall.SIGINT, syscall.SIGTERM)
	go func() {
		sig := <-sigs
		log.Println(sig)
		done <- true
	}()
	log.Println("Server Start Awaiting Signal")
	<-done
	log.Println("Exiting")
}
