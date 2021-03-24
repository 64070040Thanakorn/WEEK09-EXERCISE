const express = require("express");
const path = require("path")
const pool = require("../config");

router = express.Router();

router.post("/blogs/search", async function (req, res, next) {
  // Your code here
});

router.post("/blogs/addlike/:blogId", async function (req, res, next) {
  // Your code here
});

router.post("/blogs", async function (req, res, next) {
  // Your code here
});

router.get("/blogs/:id", function (req, res, next) {
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

router.put("/blogs/:id", function (req, res) {
  // Your code here
  return;
});

router.delete("/blogs/:id", function (req, res) {
  // Your code here
  return;
});

exports.router = router;
