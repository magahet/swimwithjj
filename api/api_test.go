package main

import (
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

var (
	server *httptest.Server
	reader io.Reader
	url    string
)

func TestGetWebAppConfig(t *testing.T) {
	req, err := http.NewRequest("GET", "/api/config", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(getWebAppConfig)
	handler.ServeHTTP(rr, req)

	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Check the response body is what we expect.
	expected := `{"status": true}`
	if rr.Body.String() != expected {
		t.Errorf("handler returned unexpected body: got %v want %v",
			rr.Body.String(), expected)
	}
}

func TestProcessSignup(t *testing.T) {
	signupJSON := `{
		"id": "signup",
		"name":"John Doe",
		"phone":"123-456-7890",
		"request":"blah",
		"token":"tok_visa",
		"cost":57000,
		"sessions": [
			{
				"name":"jane",
				"birthday":"2011-11-11",
				"level":"comfortable putting his or her face in the water",
				"sessions": [1,2]
			},
			{
				"name": "josh",
				"birthday": "2002-02-22",
				"level": "comfortable putting his or her face in the water",
				"sessions": [1]
			}
		]
	}`

	reader = strings.NewReader(signupJSON)
	req, err := http.NewRequest("POST", "/api/signup", reader)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(processSignup)
	handler.ServeHTTP(rr, req)

	// Check the status code is what we expect.
	if status := rr.Code; status != http.StatusOK {
		t.Errorf("handler returned wrong status code: got %v want %v",
			status, http.StatusOK)
	}

	// Check the response body is what we expect.
	expected := `{"alive": true}`
	if rr.Body.String() != expected {
		t.Errorf("handler returned unexpected body: got %v want %v",
			rr.Body.String(), expected)
	}
}
