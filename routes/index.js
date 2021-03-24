const express = require("express");
const pool = require("../config");

router = express.Router();

router.get("/", async function (req, res, next) {
  try {
    const [rows, fields] = await pool.query("SELECT * FROM blogs");
    return res.render("blogs/index", { blogs: rows });
  } catch (err) {
    return next(err)
  }

  // TODO Query images
});

exports.router = router;
