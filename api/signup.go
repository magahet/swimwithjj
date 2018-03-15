package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gamegos/jsend"
)

const signupCollecton = "signups"

func signupGetAll(w http.ResponseWriter, r *http.Request) {
	var signupForms []Signup
	err := connection.Collection(signupCollecton).Save(myPerson)
	if err != nil {
		jsend.Wrap(w).
			Status(500).
			Message(err.Error()).
			Send()
		return
	}

	jsend.Wrap(w).
		Status(200).
		Data(signupForms).
		Send()
}

func signupSave(w http.ResponseWriter, r *http.Request) {
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
	err := connection.Collection(signupCollecton).Save(myPerson)
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
