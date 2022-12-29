package main

import (
	"image"
	"io/fs"
	"log"
	"os"
	"path/filepath"
	"strings"
)

func find(root, ext string) []string {
	var a []string
	filepath.WalkDir(root, func(s string, d fs.DirEntry, e error) error {
		if e != nil {
			return e
		}
		if filepath.Ext(d.Name()) == ext {
			a = append(a, s)
		}
		return nil
	})
	return a
}

func getImageFromFilePath(filePath string) (image.Image, error) {
	f, err := os.Open(filePath)
	if err != nil {
		return nil, err
	}

	defer f.Close()
	img, _, err := image.Decode(f)
	if err == nil {
		return img, err
	} else {
		log.Println(err)
	}
	return nil, err
}
func fileNameWithoutExtension(fileName string) string {
	return strings.TrimSuffix(filepath.Base(fileName), filepath.Ext(fileName))
}
func readImages() {
	initYoloNetwork()

	for _, s := range find("../../../dist/detects", ".jpg") {
		log.Println(s)
		img, err := getImageFromFilePath(s)

		if err == nil && img != nil {
			analyseImage2(img, fileNameWithoutExtension(s))
		}
	}
	// f, _ := os.Create("../../../dist/assets/a.json")
	// f.WriteString(prettyJSON(Result))
}
