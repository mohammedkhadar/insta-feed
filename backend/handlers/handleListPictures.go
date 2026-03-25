package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

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
	page, perPage := 1, 10
	if p := r.URL.Query().Get("page"); p != "" {
		fmt.Sscanf(p, "%d", &page)
		if page < 1 {
			page = 1
		}
	}
	if pp := r.URL.Query().Get("per_page"); pp != "" {
		fmt.Sscanf(pp, "%d", &perPage)
		if perPage < 1 {
			perPage = 10
		}
	}

	tag := r.URL.Query().Get("tag")

	metas, err := db.GetAllPhotoMeta()
	if err != nil {
		w.WriteHeader(http.StatusInternalServerError)
		json.NewEncoder(w).Encode(map[string]string{"error": "Could not read photo metadata"})
		return
	}

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
	total := len(pictures)
	start := (page - 1) * perPage
	end := start + perPage
	if start > total {
		start = total
	}
	if end > total {
		end = total
	}
	pagedPictures := pictures[start:end]

	json.NewEncoder(w).Encode(map[string]interface{}{
		"pictures": pagedPictures,
		"page": page,
		"per_page": perPage,
		"total": total,
	})
}
