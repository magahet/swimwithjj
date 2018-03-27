package main

type Success struct {
	status string
	data   interface{}
}

type Fail struct {
	status string
	data   interface{}
}

type Error struct {
	status  string
	message string
}
