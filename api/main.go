package main

import (
	"net/http"

	"github.com/gin-gonic/gin"
)

func main() {
	// Creates a gin router with default middleware:
	// logger and recovery (crash-free) middleware
	router := gin.Default()

	// Web App api
	router.GET("/api/config", getConfig)
	router.GET("/api/signup", saveSignup)
	router.GET("/api/message", sendMessage)
	router.GET("/api/waitlist", addToWaitList)

	// Admin api
	router.POST("/admin/api/signup", getSignups)
	router.PUT("/admin/api/signup", updateSignup)

	// By default it serves on :8080 unless a
	// PORT environment variable was defined.
	router.Run()
	// router.Run(":3000") for a hard coded port
}

func writeSuccess(c *gin.Context, data interface{}) {
	c.JSON(http.StatusOK,
		gin.H{"status": "success", "data": data})
}

func writeFail(c *gin.Context, data interface{}) {
	c.JSON(http.StatusBadRequest,
		gin.H{"status": "fail", "data": data})
}

func writeError(c *gin.Context, err error) {
	c.JSON(http.StatusInternalServerError,
		gin.H{"status": "error", "message": err.Error()})
}

func getConfig(c *gin.Context) {
	config, err := readConfig("webapp.yaml")
	if err == nil {
		writeSuccess(config)
	} else {
		writeError(c, err)
	}
}

func saveSignup(c *gin.Context) {
	var sf SignupForm
	if err := c.ShouldBindJSON(&sf); err != nil {
		writeError(c, err)
		return
	}

	if err := sf.save(); err == nil {
		writeSuccess(c, nil)
	} else {
		writeError(c, err)
	}
}

func sendMessage(c *gin.Context) {
	var msg Message
	if err := c.ShouldBindJSON(&msg); err != nil {
		writeFail(c, err.Error())
		return
	}

	if err := msg.send(); err != nil {
		writeError(c, err)
		return
	}

	writeSuccess(c, nil)
}

func addToWaitList(c *gin.Context) {
	var wl WaitList
	if err := c.ShouldBindJSON(&wl); err != nil {
		writeFail(c, err.Error())
		return
	}

	if err := wl.save(); err != nil {
		writeError(c, err)
		return
	}

	writeSuccess(c, nil)
}

func getSignups(c *gin.Context) {
	sfs, err := getAllSignups()
	if err != nil {
		writeError(c, err)
		return
	}

	writeSuccess(c, sfs)
}

func updateSignup(c *gin.Context) {
	var signupForm SignupForm
	if err := c.ShouldBindJSON(&signup); err != nil {
		writeFail(c, err.Error())
		return
	}

	if err := signupForm.update(); err != nil {
		writeError(c, err)
		return
	}

	writeSuccess(c, nil)
}
