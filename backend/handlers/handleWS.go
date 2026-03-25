package handlers

import (
	"net/http"

	"github.com/gorilla/websocket"
)

var upgrader = websocket.Upgrader{
	CheckOrigin: func(r *http.Request) bool { return true },
}

func HandleWS(w http.ResponseWriter, r *http.Request) {
	conn, err := upgrader.Upgrade(w, r, nil)
	if err != nil {
		return
	}
	hub.register(conn)
	// Keep reading to detect disconnects
	for {
		if _, _, err := conn.ReadMessage(); err != nil {
			hub.unregister(conn)
			break
		}
	}
}
