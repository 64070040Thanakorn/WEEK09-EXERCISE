const express = require("express");
const { connect } = require("http2");
const pool = require("../config");

const router = express.Router();

// Get comment
router.get('/:blogId/comments', function(req, res, next){
});

// Create new comment
router.post('/:blogId/comments', async function(req, res, next){

    const blog_id = req.params.blogId

    const  {
        comment, like, comment_by_id
    } = req.body

    const [rows, fields] = await pool.query(
        'INSERT INTO comments (blog_id ,comment, comments.like, comment_by_id) VALUES(? ,?, ?, ?);',
        [blog_id ,comment, like, comment_by_id]
    )

    return res.json({
        "message":`A new comment is added (ID: ${rows.insertId})`
    })
});

// Update comment
router.put('/comments/:commentId', async function(req, res, next){
    const {
        comment, like, comment_date, comment_by_id, blog_id
    } = req.body

    const [rows, fields] = await pool.query(
        `UPDATE comments SET comment = ?, comments.like = ?, comment_date = ?, comment_by_id = ?, blog_id = ? WHERE id = ${req.params.commentId}`,
        [comment, like, comment_date, comment_by_id, blog_id]
    )

    const [rows1, fields1] = await pool.query(`SELECT comment, comments.like, comment_date, comment_by_id, blog_id FROM comments WHERE id = ${req.params.commentId}`)

    return res.json({
        "message": `Comment ID ${req.params.commentId} is updated.`,
        "comment": {
            "comment": rows1[0].comment,
            "like": rows1[0].like,
            "comment_date": rows1[0].comment_date,
            "comment_by_id": rows1[0].comment_by_id,
            "blog_id": rows1[0].blog_id,
        } //ดึงข้อมูล comment ที่เพิ่งถูก update ออกมา และ return ใน response กลับไปด้วย
    })
});

// Delete comment
router.delete('/comments/:commentId', async function(req, res, next){
    const [rows, fields] = await pool.query(
        `DELETE FROM comments WHERE id = ?`,
        [req.params.commentId]
    )
    return res.json({
        "message": `Comment ID ${req.params.commentId} is deleted.`
    })
});

// Add like to comment
router.put('/comments/addlike/:commentId', async function(req, res, next){
    const [rows1, fields1] = await pool.query(`SELECT comments.like FROM comments WHERE id = ${req.params.commentId}`)

    const [rows2, fields2] = await pool.query(
        `UPDATE comments SET comments.like = ? WHERE id = ${req.params.commentId}`,
        [rows1[0].like + 1]
    )

    const [rows3, fields3] = await pool.query(`SELECT id, blog_id, comments.like FROM comments WHERE id = ${req.params.commentId}`)

    return res.json({
        "blogId": rows3[0].blog_id,
        "commentId": rows3[0].id,
        "likeNum":  rows3[0].like//5 คือจำนวน like ของ comment ที่มี id = 20 หลังจาก +1 like แล้ว
    })
});


exports.router = router