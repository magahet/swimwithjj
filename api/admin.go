package main


import (
	"encoding/json"
	"github.com/gamegos/jsend"
	"log"
	"net/http"
)



func (sf *SignupForm) Write() error {
	session, err := connect()
	if err != nil {
		return err
	}
	defer session.Close()

	collection := session.DB("swimwithjj").C("signups")
	err = collection.Insert(sf)
	if err != nil {
		log.Println(err.Error())
	}
	return err
}

func getSignups() []*Signups {

}

func processAdminSummary(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Processing Form")

	// Decode json body
	var signupForm SignupForm
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
func processAdminSignups(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Processing Form")

	// Decode json body
	var signupForm SignupForm
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
func processAdminRemoveSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Processing Form")

	// Decode json body
	var signupForm SignupForm
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
func processAdminAddSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Processing Form")

	// Decode json body
	var signupForm SignupForm
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
func processAdminUpdateSession(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Processing Form")

	// Decode json body
	var signupForm SignupForm
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
func processAdminSet(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Processing Form")

	// Decode json body
	var signupForm SignupForm
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
func processAdminDelete(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Processing Form")

	// Decode json body
	var signupForm SignupForm
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
