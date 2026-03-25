package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"time"

	db "bowatt-server/db"
)

func HandleUploadPhoto(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	if r.Method != http.MethodPost {
		w.WriteHeader(http.StatusMethodNotAllowed)
		json.NewEncoder(w).Encode(map[string]string{"error": "Method not allowed"})
		return
	}
	if err := r.ParseMultipartForm(10 << 20); err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Invalid form data"})
		return
	}
	file, handler, err := r.FormFile("photo")
	if err != nil {
		w.WriteHeader(http.StatusBadRequest)
		json.NewEncoder(w).Encode(map[string]string{"error": "Photo file is required"})
		return
	}
	defer file.Close()
	title := r.FormValue("title")
	tag := r.FormValue("tag")
	picDir := "./data/pictures"
	if _, err := os.Stat(picDir); os.IsNotExist(err) {
		os.Mkdir(picDir, 0755)
	}
	dst, err := os.Create(fmt.Sprintf("%s/%s", picDir, handler.Filename))
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Could not save file"})
		return
	}
	defer dst.Close()
	if _, err = io.Copy(dst, file); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Could not write file"})
		return
	}
	if err := db.SavePhotoMeta(db.PhotoMeta{
		Filename:   handler.Filename,
		Title:      title,
		Tag:        tag,
		UploadedAt: time.Now(),
	}); err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Could not save metadata"})
		return
	}

	// Broadcast new photo to all WebSocket clients
	event, _ := json.Marshal(map[string]string{
		"type":     "new_photo",
		"url":      fmt.Sprintf("/pictures/%s", handler.Filename),
		"title":    title,
		"tag":      tag,
		"filename": handler.Filename,
	})
	hub.Broadcast(event)

	json.NewEncoder(w).Encode(map[string]string{"message": "Photo uploaded successfully", "filename": handler.Filename})
}
