package db

import (
	"encoding/json"
	"log"
	"time"

	"go.etcd.io/bbolt"
)

var db *bbolt.DB

func InitDB() {
	var err error
	db, err = bbolt.Open("photos.db", 0666, &bbolt.Options{Timeout: 1 * time.Second})
	if err != nil {
		log.Fatalf("failed to open BoltDB: %v", err)
	}
	// Ensure bucket exists
	db.Update(func(tx *bbolt.Tx) error {
		_, err := tx.CreateBucketIfNotExists([]byte("photos"))
		return err
	})
}

type PhotoMeta struct {
	Filename   string    `json:"filename"`
	Title      string    `json:"title"`
	Tag        string    `json:"tag"`
	UploadedAt time.Time `json:"uploaded_at"`
}

func SavePhotoMeta(meta PhotoMeta) error {
	return db.Update(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("photos"))
		data, _ := json.Marshal(meta)
		return b.Put([]byte(meta.Filename), data)
	})
}

func GetAllPhotoMeta() ([]PhotoMeta, error) {
	var result []PhotoMeta
	err := db.View(func(tx *bbolt.Tx) error {
		b := tx.Bucket([]byte("photos"))
		return b.ForEach(func(k, v []byte) error {
			var m PhotoMeta
			if err := json.Unmarshal(v, &m); err == nil {
				result = append(result, m)
			}
			return nil
		})
	})
	return result, err
}
