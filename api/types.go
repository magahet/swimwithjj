package main

import "gopkg.in/mgo.v2/bson"

type Document struct {
	Id         bson.ObjectId `json:"id" bson:"_id"`
	InsertedAt time.Time     `json:"inserted_at" bson:"inserted_at"`
	LastUpdate time.Time     `json:"last_update" bson:"last_update"`
}

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
