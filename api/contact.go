// middleware.go
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"

	"github.com/gamegos/jsend"
)

type ContactForm struct {
	Name    string `json:name`
	Email   string `json:email`
	Phone   string `json:phone`
	Message string `json:message`
}

func processContact(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Processing Contact Form")

	// Decode json body
	var contactForm ContactForm
	err := json.NewDecoder(r.Body).Decode(&contactForm)
	if err != nil {
		jsend.Wrap(w).
			Status(500).
			Message(err.Error()).
			Send()
		return
	}

	// Get config
	config := ServerConfig{}
	if err := config.load("server.yaml"); err != nil {
		jsend.Wrap(w).
			Status(500).
			Message(err.Error()).
			Send()
		return
	}

	log.Printf("%+v", config)
	log.Println([]string{contactForm.Email})

	// Weird string literal
	message := fmt.Sprintf(`From: %s <%s>
Phone: %s

%s`, contactForm.Name, contactForm.Email, contactForm.Phone, contactForm.Message)

	// Send message
	err = sendEmail(
		config.EmailSenderAddress,
		config.EmailSenderPassword,
		[]string{config.AdminAddress},
		fmt.Sprintf("Message from: %s", contactForm.Name),
		message,
		config.EmailSenderName,
	)

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
