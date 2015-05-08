package main

import (
	"gopkg.in/mgo.v2"
	"net/http"
	"os"
)

var dbSession *mgo.Session
var dbName string

func main() {

	var err error

	dbName = os.Getenv("DB_NAME")
	dbSession, err = mgo.Dial(os.Getenv("DB_HOST"))
	if err != nil {
		panic(err)
	}

	http.HandleFunc("/signup", handleSignup)

	err = http.ListenAndServe(":8080", nil)
	if err != nil {
		panic(err)
	}
}
