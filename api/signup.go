package main

import (
	"encoding/json"
	"github.com/gamegos/jsend"
	"log"
	"net/http"
	"go/ast"
	"gopkg.in/mgo.v2/bson"
)



func processSignup(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Processing Form")

	// Decode json body
	var signupForm Signup
	err := json.NewDecoder(r.Body).Decode(&signupForm)
	if err != nil {
		jsend.Wrap(w).
			Status(500).
			Message(err.Error()).
			Send()
		return
	}

	// Save to mongo
	err = signupForm.Write()
	if err != nil {
		jsend.Wrap(w).
			Status(500).
			Message(err.Error()).
			Send()
		return
	}

	jsend.Wrap(w).
		Status(200).
		Send()
}
