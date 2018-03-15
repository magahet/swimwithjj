package main

import (
	"log"
	"net/http"
)

func main() {
	var err error
	if err = dbInit(); err != nil {
		log.Fatal(err)
	}

	router := NewRouter()

	log.Fatal(http.ListenAndServe(":1234", router))
}
