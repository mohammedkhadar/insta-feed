package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sort"

	db "bowatt-server/db"
)

type Picture struct {
	URL   string `json:"url"`
	Title string `json:"title"`
	Tag   string `json:"tag"`
}

func getHostURL(r *http.Request) string {
	proto := "http"
	if r.TLS != nil || r.Header.Get("X-Forwarded-Proto") == "https" {
		proto = "https"
	}
	return fmt.Sprintf("%s://%s", proto, r.Host)
}

func HandleListPictures(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	tag := r.URL.Query().Get("tag")

	metas, err := db.GetAllPhotoMeta()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Could not read photo metadata"})
		return
	}

	sort.Slice(metas, func(i, j int) bool {
		return metas[i].UploadedAt.After(metas[j].UploadedAt)
	})

	host := getHostURL(r)
	pictures := make([]Picture, 0, len(metas))
	for _, m := range metas {
		if tag != "" && m.Tag != tag {
			continue
		}
		pictures = append(pictures, Picture{
			URL:   fmt.Sprintf("%s/pictures/%s", host, m.Filename),
			Title: m.Title,
			Tag:   m.Tag,
		})
	}

	json.NewEncoder(w).Encode(map[string]interface{}{
		"pictures": pictures,
	})
}
