package main

import "gopkg.in/mgo.v2/bson"

type Session struct {
	Name     string `json:"name"`
	Birthday string `json:"birthday"`
	Level    string `json:"level"`
	Sessions []int  `json:"sessions"`
}

type Signup struct {
	Id 		 bson.ObjectId `json:"id" bson:"_id"`
	Name     string    `json:"name" bson:"name"`
	Phone    string    `json:"phone" bson:"phone"`
	Request  string    `json:"request" bson: "request"`
	Token    string    `json:"token" bson: "token"`
	Cost     int       `json:"cost" bson: "cost"`
	Sessions []Session `json:"sessions" bson: "sessions"`
}