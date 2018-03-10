package main

import (
	"encoding/json"
	"github.com/gamegos/jsend"
	"log"
	"net/http"
)

type WaitlistForm struct {
	Email string `json:email`
}

func (wf *WaitlistForm) Write() error {
	session, err := connect()
	if err != nil {
		return err
	}
	defer session.Close()

	collection := session.DB("swimwithjj").C("waitlist")
	err = collection.Insert(wf)
	if err != nil {
		log.Println(err.Error())
	}
	return err
}

func processWaitlist(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Processing Waitlist Form")

	// Decode json body
	var waitlistForm WaitlistForm
	err := json.NewDecoder(r.Body).Decode(&waitlistForm)
	if err != nil {
		jsend.Wrap(w).
			Status(500).
			Message(err.Error()).
			Send()
		return
	}

	// Save to mongo
	err = waitlistForm.Write()
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
