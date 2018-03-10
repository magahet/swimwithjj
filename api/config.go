package main

import (
	"github.com/gamegos/jsend"
	"github.com/ghodss/yaml"
	"io/ioutil"
	"log"
	"net/http"
)

// yaml library uses json tags
type ServerConfig struct {
	StripeSecretKey     string `json:"stripeSecretKey"`
	DbName              string `json:"dbName"`
	EmailSenderAddress  string `json:"emailSenderAddress"`
	EmailSenderPassword string `json:"emailSenderPassword"`
	EmailSenderName     string `json:"emailSenderName"`
	AdminAddress        string `json:"adminAddress"`
}

func (config *ServerConfig) load(path string) error {
	body, err := readConfig(path)
	if err != nil {
		return err
	}

	err = yaml.Unmarshal(body, &config)
	return err
}

func readConfig(path string) ([]byte, error) {
	yamlFile, err := ioutil.ReadFile(path)
	if err != nil {
		log.Printf("yamlFile.Get err   #%v ", err)
		return nil, err
	}

	return []byte(yamlFile), nil
}

func getWebAppConfig(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	log.Println("Getting webapp config")
	body, err := readConfig("webapp.yaml")
	if err != nil {
		jsend.Wrap(w).
			Status(500).
			Message(err.Error()).
			Send()
		return
	}

	var json interface{}
	err = yaml.Unmarshal(body, &json)
	if err != nil {
		jsend.Wrap(w).
			Status(500).
			Message(err.Error()).
			Send()
		return
	}

	jsend.Wrap(w).
		Status(200).
		Data(json).
		Send()
}
