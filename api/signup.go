package main

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/gamegos/jsend"
)

type Session struct {
	Document `bson:",inline"`
	Name     string `json:"name"`
	Birthday string `json:"birthday"`
	Level    string `json:"level"`
	Sessions []int  `json:"sessions"`
}

type Sessions []*Session

type SignUpForm struct {
	Document `bson:",inline"`
	Name     string    `json:"name" bson:"name"`
	Phone    string    `json:"phone" bson:"phone"`
	Request  string    `json:"request" bson:"request"`
	Token    string    `json:"token" bson:"token"`
	Cost     int       `json:"cost" bson:"cost"`
	Sessions []Session `json:"sessions" bson:"sessions"`
}

type SignUpForms []*SignUpForm

func getAllSignups() SignUpForms {
	sign.All(
}

func (sf *SignupForm) Save() error {
	return nil
}
