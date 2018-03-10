package main

import (
	"gopkg.in/mgo.v2"
	"log"
	"gopkg.in/mgo.v2/bson"
)

func connect() (*mgo.Session, error) {
	connectURL := "localhost"
	session, err := mgo.Dial(connectURL)
	if err != nil {
		log.Printf("Can't connect to mongo, go error %v\n", err)
		return nil, err
	}
	session.SetSafe(&mgo.Safe{})
	return session, nil
}

func (sf *Signup) CreateSignup() error {
	sf.Id = bson.NewObjectId()

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

func (id string) RemoveSignup() error {
	session, err := connect()
	if err != nil {
		return err
	}
	defer session.Close()

	// Verify id is ObjectId, otherwise bail
	if !bson.IsObjectIdHex(id) {
		
	}

	// Grab id
	oid := bson.ObjectIdHex(id)

	// Remove user
	if err := uc.session.DB("go_rest_tutorial").C("users").RemoveId(oid); err != nil {
		w.WriteHeader(404)
		return
	}

	collection := session.DB("swimwithjj").C("signups")
	err = collection.Insert(sf)
	if err != nil {
		log.Println(err.Error())
	}
	return err
}
