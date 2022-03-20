const express = require("express");
const path = require("path")
const pool = require("../config");

router = express.Router();

router.get("/blogs/search", async function (req, res, next) {
  // Your code here
});

router.post("/blogs/addlike/:blogId", async function (req, res, next) {
  // Your code here
});

// For inserting new blog
router.post("/create", async function (req, res, next) {
  // Your code here
});


router.get("/blogs/:blogId", function (req, res, next) {
  const promise1 = pool.query("SELECT * FROM blogs WHERE id=?", [
    req.params.id,
  ]);
  const promise2 = pool.query("SELECT * FROM comments WHERE blog_id=?", [
    req.params.id,
  ]);

  Promise.all([promise1, promise2])
    .then((results) => {
      const blogs = results[0];
      const comments = results[1];
      res.render("blogs/detail", {
        blog: blogs[0][0],
        comments: comments[0],
        error: null,
      });
    })
    .catch((err) => {
      return next(err);
    });
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
