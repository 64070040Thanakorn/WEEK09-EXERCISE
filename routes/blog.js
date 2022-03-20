const express = require("express");
const path = require("path")
const pool = require("../config");

router = express.Router();

// For tutorial 1
router.post("/blogs/addlike/:blogId", async function (req, res, next) {
  // Your code here
});

// For tutorial 2
router.get("/blogs/search", async function (req, res, next) {
  // Your code here
});

// For inserting new blog
router.post("/create", async function (req, res, next) {
  // Your code here
});

// For blog detail page
router.get("/detail/:blogId", function (req, res, next) {
  // Your code here
});

// For updating blog
router.put("/update/:blogId", function (req, res) {
  // Your code here
});

// For deleting blog
router.delete("/delete/:id", function (req, res) {
  // Your code here
});

exports.router = router;
