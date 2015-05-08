package main

import (
	"encoding/json"
	"log"
	"net/http"
)

type Signup struct {
	//Timestamp  time.Time `json:"timestamp"`
	Location   string  `json:"place"`
	Name       string  `json:"name"`
	Phone      string  `json:"phone"`
	Email      string  `json:"email"`
	Request    string  `json:"request"`
	CustomerId string  `json:"customerId"`
	Cost       int     `json:"cost"`
	Children   []Child `json:"children"`
}

type Child struct {
	Name      string    `json:"name"`
	Birthday  string    `json:"birthday"`
	SwimLevel string    `json:"swim_level"`
	Sessions  []Session `json:"sessions"`
}

type Session struct {
	Name  string `json:"name"`
	Price int    `json:"price"`
}

func (signup *Signup) Save() (err error) {
	s := dbSession.Clone()
	defer s.Close()
	log.Println(dbName)
	coll := s.DB(dbName).C("signup")
	err = coll.Insert(signup)
	return
}

type Response struct {
	Success bool `json:"success"`
}

func handleSignup(w http.ResponseWriter, r *http.Request) {
	var err error
	decoder := json.NewDecoder(r.Body)
	signup := &Signup{}
	decoder.Decode(&signup)
	err = signup.Save()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	response := Response{true}
	var js []byte
	js, err = json.Marshal(response)
	w.Header().Set("Content-Type", "application/json")
	w.Write(js)
}
