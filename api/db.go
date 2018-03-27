package main

import (
	"errors"

	"github.com/go-bongo/bongo"
)

var db *bongo.Connection

func dbInit(server, db string) error {
	config := &bongo.Config{
		ConnectionString: server,
		Database:         db,
	}
	db, err := bongo.Connect(config)

	return err
}
