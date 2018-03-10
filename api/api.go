// middleware.go
package main

import (
	"log"
	"net/http"
)

func main() {
	http.HandleFunc("/api/config", getWebAppConfig)
	http.HandleFunc("/api/signup", processSignup)
	http.HandleFunc("/api/contact", processContact)
	http.HandleFunc("/api/waitlist", processWaitlist)
	http.HandleFunc("/admin-api/summary", processAdminSummary)
	http.HandleFunc("/admin-api/signups", processAdminSignups)
	http.HandleFunc("/admin-api/remove-session", processAdminRemoveSession)
	http.HandleFunc("/admin-api/add-session", processAdminAddSession)
	http.HandleFunc("/admin-api/update-session", processAdminUpdateSession)
	http.HandleFunc("/admin-api/set", processAdminSet)
	http.HandleFunc("/admin-api/delete", processAdminDelete)

	log.Println("Listening on 1234")
	log.Fatal(http.ListenAndServe(":1234", nil))
}
