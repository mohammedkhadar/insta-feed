package main

import (
	"log"
	"net/http"

	"bowatt-server/db"
	"bowatt-server/handlers"
)

func main() {
	db.InitDB()
	http.HandleFunc("/", handlers.HandleHome)
	http.HandleFunc("/api/pictures", handlers.HandleListPictures)
	http.Handle("/pictures/", http.StripPrefix("/pictures/", http.FileServer(http.Dir("./data/pictures"))))
	http.HandleFunc("/api/upload", handlers.HandleUploadPhoto)
	http.HandleFunc("/ws", handlers.HandleWS)

	port := ":8080"
	log.Printf("Server starting on http://localhost%s\n", port)
	if err := http.ListenAndServe(port, nil); err != nil {
		log.Fatalf("Server error: %v\n", err)
	}
}
