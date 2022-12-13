package main

import (
	"crypto/aes"
	"crypto/cipher"
	"crypto/md5"
	"crypto/rand"
	"encoding/hex"
	"io"
	"log"
	"os"
	"strings"
	"time"

	mp4 "github.com/deepch/vdk/format/mp4f"
)

var (
	isStarted bool = false
)

func createHash(key string) string {
	hasher := md5.New()
	hasher.Write([]byte(key))
	return hex.EncodeToString(hasher.Sum(nil))
}

func encrypt(data []byte, passphrase string) []byte {
	block, _ := aes.NewCipher([]byte(createHash(passphrase)))
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		panic(err.Error())
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		panic(err.Error())
	}
	ciphertext := gcm.Seal(nonce, nonce, data, nil)
	return ciphertext
}

func decrypt(data []byte, passphrase string) []byte {
	key := []byte(createHash(passphrase))
	block, err := aes.NewCipher(key)
	if err != nil {
		panic(err.Error())
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		panic(err.Error())
	}
	nonceSize := gcm.NonceSize()
	nonce, ciphertext := data[:nonceSize], data[nonceSize:]
	plaintext, err := gcm.Open(nil, nonce, ciphertext, nil)
	if err != nil {
		panic(err.Error())
	}
	return plaintext
}

func startRecorder() {
	if isStarted {
		return
	}
	isStarted = true
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

	t := time.Now()
	os.MkdirAll(Config.Recording.SavePath, os.ModePerm)
	pathCam := Config.Recording.SavePath + "/"
	os.MkdirAll(pathCam, os.ModePerm)

	var fullFileName = t.Format("02-01-2006-15-04-05-07") + ".mp4"
	var file, err = os.Create(pathCam + "/" + fullFileName)

	if err != nil {
		log.Println(err)
	}

	if err != nil {
		log.Println("File not created")
		return
	}
	muxerMp4 := mp4.NewMuxer(file)
	muxerMp4.WriteHeader(codecs)
	var _, bufCodec = muxerMp4.GetInit(codecs)

	file.Write(bufCodec)
	file.Sync()

	// var FrameDecoderSingle *ffmpeg.VideoDecoder

	// for _, element := range codecs {
	// 	if element.Type().IsVideo() {
	// 		FrameDecoderSingle, err = ffmpeg.NewVideoDecoder(element.(av.VideoCodecData))
	// 		if err != nil {
	// 			log.Fatalln("FrameDecoderSingle Error", err)
	// 		}
	// 	}

	// }

	snapUrl, _ := ovfDevice.GetSnapshot(profileToken)
	snapUrl = strings.Replace(snapUrl, Config.Recording.DeviceUrl, Config.Recording.CameraUsername+":"+Config.Recording.CameraPassword+"@"+Config.Recording.DeviceUrl, -1)

	log.Println("snapUrl", snapUrl)

	var files = make([]*os.File, len(Config.Recording.Paths))

	for index, element := range Config.Recording.Paths {
		os.MkdirAll(element, os.ModePerm)
		pathCam := element + "/"
		os.MkdirAll(pathCam, os.ModePerm)

		fl, err := os.Create(pathCam + "/" + fullFileName)
		if err != nil {
			log.Println("File not created")
			continue
		} else {
			fl.Write(bufCodec)
			fl.Sync()
			files[index] = fl
		}
	}

	go func() {
		cid, ch := Config.clAd()
		defer Config.clDe(cid)
		defer Config.coDe()
		defer muxerMp4.Finalize()
		defer file.Sync()
		defer file.Close()

		for _, fl := range files {
			defer fl.Close()
		}

		var videoStart bool
		noVideo := time.NewTimer(10 * time.Second)
		var start time.Duration = 0

		// var start2 time.Duration = 0
		for {
			select {
			case <-noVideo.C:

				log.Println("recorder noVideo")
				continue

			case pck := <-ch:
				if pck.IsKeyFrame || AudioOnly {
					noVideo.Reset(10 * time.Second)
					videoStart = true
				}
				if !videoStart && !AudioOnly {
					continue
				}

				if pck.IsKeyFrame {
					// if (pck.Time - start2).Milliseconds() >= Config.Recording.AiDuration {
					// start2 = pck.Time
					// if pic, err := FrameDecoderSingle.DecodeSingle(pck.Data); err == nil && pic != nil {
					// 	analyseImage(pic.Image)
					// }
					// go analyseImage(snapUrl)
				}

				b, buf, err := muxerMp4.WritePacket(pck, false)

				if err == nil && b {
					file.Write(buf)
					for _, fl := range files {
						fl.Write(buf)
					}

					if pck.Time.Milliseconds() == 0 {
						start = pck.Time

					}

					if (pck.Time - start).Milliseconds() >= Config.Recording.SaveDuration {

						start = pck.Time
						file.Sync()
						file.Close()

						for _, fl := range files {
							fl.Sync()
							fl.Close()
						}

						t := time.Now()
						fullFileName = t.Format("02-01-2006-15-04-05-07") + ".mp4"
						file, err = os.Create(pathCam + "/" + fullFileName)

						if err != nil {
							log.Println("File not created")
							return
						}

						muxerMp4 = mp4.NewMuxer(file)
						muxerMp4.WriteHeader(codecs)
						_, bufCodec = muxerMp4.GetInit(codecs)
						file.Write(bufCodec)
						file.Sync()

						for index, element := range Config.Recording.Paths {
							pathCam := element + "/"

							fl, err := os.Create(pathCam + "/" + fullFileName)
							if err != nil {
								log.Println("File not created")
								continue
							} else {
								fl.Write(bufCodec)
								fl.Sync()
								files[index] = fl
							}
						}
					}

				}

			}
		}
	}()
}
