package handler

import (
	"github.com/gin-gonic/gin"
	"net/http"
	"strconv"
)

// Invoice contains information about a single Invoice
type Invoice struct {
	ID    int    `json:"id" binding:"required"`
	Likes int    `json:"likes"`
	Desc  string `json:"desc" binding:"required"`
}

// We'll create a list of invoices
var invoices = []Invoice{
	Invoice{201811001, 0, "Did you hear about the restaurant on the moon? Great food, no atmosphere."},
	Invoice{201811002, 0, "What do you call a fake noodle? An Impasta."},
	Invoice{201811003, 0, "How many apples grow on a tree? All of them."},
	Invoice{201811004, 0, "Want to hear a joke about paper? Nevermind it's tearable."},
	Invoice{201811005, 0, "I just watched a program about beavers. It was the best dam program I've ever seen."},
	Invoice{201811006, 0, "Why did the coffee file a police report? It got mugged."},
	Invoice{201811007, 0, "How does a penguin build it's house? Igloos it together."},
}

// InvoiceHandler retrieves a list of available invoices
func InvoiceHandler(c *gin.Context) {
	c.Header("Content-Type", "application/json")
	c.JSON(http.StatusOK, invoices)
}

// LikeInvoice increments the likes of a particular invoice Item
func LikeInvoice(c *gin.Context) {
	// confirm Invoice ID sent is valid
	// remember to import the `strconv` package
	if invoiceID, err := strconv.Atoi(c.Param("invoiceID")); err == nil {
		// find invoice, and increment likes
		for i := 0; i < len(invoices); i++ {
			if invoices[i].ID == invoiceID {
				invoices[i].Likes += 1
			}
		}

		// return a pointer to the updated jokes list
		c.JSON(http.StatusOK, &invoices)
	} else {
		// Joke ID is invalid
		c.AbortWithStatus(http.StatusNotFound)
	}
}
