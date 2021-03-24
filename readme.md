# WEEK09-EXERCISE 

แบบฝึกหัดสัปดาห์ที่ 9 Express / MySql

## Tutorial

#### 1. Multer ใช้สำรับ Upload รูปภาพ

####วิธีทำ

1. สร้าง Instance สำหรับเรียกใช้ dependencies Multer
```javascript
const multer = require('multer')
```

2. กำหนด config สำหรับ multer
```javascript
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './static/uploads') // path to save file
  },
  filename: function (req, file, callback) {
    // set file name
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
```

3. กำหนดตัวแปรสำหรับเรียกใช้งาน
```javascript
const upload = multer({ storage: storage })
```

##### Final code Multer
```javascript
// Require multer for file upload
const multer = require('multer')
// SET STORAGE
var storage = multer.diskStorage({
  destination: function (req, file, callback) {
    callback(null, './static/uploads')
  },
  filename: function (req, file, callback) {
    callback(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
  }
})
const upload = multer({ storage: storage })
```

___

#### 2. Create Blog

1. สร้าง Router ```/blogs``` ใหม่ในไฟล์ ```/routes/blog.js```

```javascript
router.post('/blogs', async function (req, res, next) {
    // create code here
}
```

2. แทรก `upload.single('myimage')` ไว้ระหว่าง path กับ callback ของ router โดยตั้งชื่อ key ว่า `'myimage'`จะได้โค้ดตามนี้
```javascript
//                    >> insert code here <<
router.post('/blogs', upload.single('myImage'), async function (req, res, next) {
    // create code here
}
```

3. สร้างตัวแปรสำหรับเก็บข้อมูลของ file ที่อาจจะอัปโหลดแนบมาด้วย
```javascript
const file = req.file;
```

4. เช็กว่ามีไฟล์แนบมากับ Request หรือไม่ ถ้าไม่มีรูปให้แสดง Error สถานะ 400 ออกไป
```javascript
if (!file) {
    const error = new Error("Please upload a file");
    error.httpStatusCode = 400;
    return next(error);
}
```
5. สร้างตัวแปรมารับค่าจาก request
```javascript
const title = req.body.title;
const content = req.body.content;
const status = req.body.status;
const pinned = req.body.pinned;
```
6. สร้าง transaction ขึ้นมา

```javascript
const conn = await pool.getConnection()
await conn.beginTransaction();
```

7. สร้าง try catch
8. ใน try เพิ่มข้อมูลตาราง blogs และประกาศตัวแปร results มารับค่า
```javascript
let results = await conn.query(
        "INSERT INTO blogs(title, content, status, pinned, `like`,create_date) VALUES(?, ?, ?, ?, 0,CURRENT_TIMESTAMP);",
        [title, content, status, pinned]
      )
```
9. เอาค่า id ของ blog จาก results
```javascript
const blogId = results[0].insertId;
```
10. เพิ่มข้อมูลในตารางรูปโดยระบุ blog_id (ใช้บอกว่ารูปนี้เป็นของ blog ไหน)
```javascript
await conn.query("INSERT INTO images(blog_id, file_path) VALUES(?, ?);",[blogId, file.path])
```

11. Commit Transaction
```javascript
conn.commit()
```

12. Response
```javascript
res.send("success!");
```

13. หากการ Create เกิด Error ขึ้นมาขั้นตอนใดขั้นตอนหนึ่ง ให้ทำการ Rollback Transaction และ Return error ออกมา
```javascript
await conn.rollback();
return next(error)
```

##### Final code in create
```javascript
router.post('/blogs', upload.single('myImage'), async function (req, res, next) {
  if (req.method == "POST") {
    const file = req.file;
    if (!file) {
      const error = new Error("Please upload a file");
      error.httpStatusCode = 400;
      return next(error);
    }

    const title = req.body.title;
    const content = req.body.content;
    const status = req.body.status;
    const pinned = req.body.pinned;

    const conn = await pool.getConnection()
    // Begin transaction
    await conn.beginTransaction();

    try {
      let results = await conn.query(
        "INSERT INTO blogs(title, content, status, pinned, `like`,create_date) VALUES(?, ?, ?, ?, 0,CURRENT_TIMESTAMP);",
        [title, content, status, pinned]
      )
      const blogId = results[0].insertId;

      await conn.query(
        "INSERT INTO images(blog_id, file_path) VALUES(?, ?);",
        [blogId, file.path])

      await conn.commit()
      res.send("success!");
    } catch (err) {
      await conn.rollback();
      next(err);
    }
  }
});
```

___

#### 3. Update Blog

####วิธีทำ
1. สร้าง Router ```/blogs/:id``` ใหม่ในไฟล์ ```/routes/blog.js```

```javascript
router.put('/blogs/:id', upload.single('myImage'), (req, res, next) => {
  // update blog code here
}
```

2. สร้าง transaction ขึ้นมา

```javascript
const conn = await pool.getConnection()
await conn.beginTransaction();
```

3. สร้าง try catch
4. ใน try ให้สร้างตัวแปรสำหรับเก็บข้อมูลของ file ที่อาจจะอัปโหลดแนบมาด้วย
```javascript
const file = req.file;
```
5. ในกรณีที่มีไฟล์รูปภาพอัปโหลดขึ้นมาด้วย แสดงว่าจะต้องอัปเดทรูปภาพด้วย โดยให้สร้าง if มาดักไว้ และทำการ Update Path ของรูปที่อยู่ในตาราง images
```javascript
if (file) {
    await conn.query("UPDATE images SET file_path=? WHERE id=?",[file.path, req.params.id])
}
```

6. ต่อมาก็ทำการอัปเดทข้อมูลอื่นในตาราง blogs
```javascript
await conn.query('UPDATE blogs SET title=?,content=?, pinned=?, blogs.like=?, create_by_id=? WHERE id=?', [req.body.title, req.body.content, req.body.pinned, req.body.like, null, req.params.id])
```

7. Commit Transaction
```javascript
conn.commit()
```

8. ถ้า Update สำเร็จให้ Response ออกมา
```javascript
res.json({ message: "Update Blog id " + req.params.id + " Complete" })
```

9. หากการ Update เกิด Error ขึ้นมาขั้นตอนใดขั้นตอนหนึ่ง ให้ทำการ Rollback Transaction และ Return error ออกมา
```javascript
await conn.rollback();
return next(error)
```

##### Final code in Update

```javascript
router.put('/blogs/:id', upload.single('myImage'), async (req, res, next) => {

  const conn = await pool.getConnection()
  await conn.beginTransaction();

  try {
    const file = req.file;

    if (file) {
      await conn.query(
        "UPDATE images SET file_path=? WHERE id=?",
        [file.path, req.params.id])
    }

    await conn.query('UPDATE blogs SET title=?,content=?, pinned=?, blogs.like=?, create_by_id=? WHERE id=?', [req.body.title, req.body.content, req.body.pinned, req.body.like, null, req.params.id])
    conn.commit()
    res.json({ message: "Update Blog id " + req.params.id + " Complete" })
  } catch (error) {
    await conn.rollback();
    return next(error)
  }
});
```

----

#### 4. Delete

**เงื่อนไข**:ในการจะลบแต่ละ Blog จะต้องทำการเช็กว่า Blog นั้นมี comment หรือไม่ **หากมี comment** อยู่จะต้องแสดง message ว่า *"Can't Delete. This Blog has a comment"* แต่ถ้า Blog นั้น **ไม่มี Comment** ก็จะลบข้อมูลออกจากตาราง blogs และ**ลบข้อมูลรูปภาพออกจากตาราง images** ด้วย

1. สร้าง Router `/blog/:id` ใหม่ในไฟล์ `/routes/blog.js`

```javascript
router.delete('/blogs/:id', function (req, res) {
  // delete blog code here
});
```
2. สร้าง Transaction ขึ้นมา
```javascript
const conn = await pool.getConnection()
await conn.beginTransaction();
```
3. สร้าง try catch
4. ใน try ให้เลือก Comment ที่มี `blog_id` เท่ากับ `params` ที่รับเข้ามา และเก็บผลลัพท์อยู่ในตัวแปรที่ชื่อว่า `comments`
```javascript
let comments = await conn.query('SELECT * FROM comments WHERE blog_id=?', [req.params.id])
```
5. เช็กว่าถ้าเกิด `comments` ที่ได้ ถ้ามีมากกว่า 0 แสดงว่า blog นั้นมี comment อยู่ ให้ Response เป็นสถานะ 409 และมีข้อความว่า *"Can't Delete because this blog has comment!!!"*

```javascript
if (comments[0].length > 0) {
    res.status(409).json({ message: "Can't Delete because this blog has comment!!!" })
} else { 
    // continue delete ...
}
```
6. ถ้า post นั้นไม่มี comment ก็ให้ลบข้อมูลที่อยู่ในตาราง blogs และ images
```javascript
await conn.query('DELETE FROM blogs WHERE id=?;', [req.params.id]) // delete blog
await conn.query('DELETE FROM images WHERE blog_id=?;', [req.params.id]) // delete image
```

7. Commit Transaction
```javascript
conn.commit()
```

8. ถ้า Delete สำเร็จให้ Response ออกมา
```javascript
res.json({ message: 'Delete Blog id ' + req.params.id + ' complete' })
```

9. หากการ Delete เกิด Error ขึ้นมาขั้นตอนใดขั้นตอนหนึ่ง ให้ทำการ Rollback Transaction และ Return error ออกมา
```javascript
await conn.rollback();
return next(error)
```


##### Final code in Delete

```javascript
router.delete('/blogs/:id', async (req, res, next) => {

  const conn = await pool.getConnection()
  await conn.beginTransaction();

  try {
    // check blog has comment?
    let comments = await conn.query('SELECT * FROM comments WHERE blog_id=?', [req.params.id])

    if (comments[0].length > 0) {
      res.status(409).json({ message: "Can't Delete because this blog has comment!!!" })
    } else {
      await conn.query('DELETE FROM blogs WHERE id=?;', [req.params.id]) // delete blog
      await conn.query('DELETE FROM images WHERE blog_id=?;', [req.params.id]) // delete image
      await conn.commit()
      res.json({ message: 'Delete Blog id ' + req.params.id + ' complete' })
    }
  } catch (error) {
    await conn.rollback();
    next(error);
  } finally {
    console.log('finally')
    conn.release();
  }
});
```
----
## !!!Exercise!!!

1. สร้าง Route สำหรับการเพิ่ม like โดยจะ**เพิ่มขึ้นทีละ 1** เมื่อถูกยิง Request โดยจะส่ง `blogId` ของ Blog ไปเพื่อบอกว่าจะเพิ่ม like ให้ Blog ไหน
* **Method :** PUT
* **URL :**  /blogs/addlike/:blogId
* **Response :** 
```javascript
{
    message:"Add like in Blog 2, Current Like is 12" // 12 is a number of like after add like
}
```

> hint : ให้ไปดึงจำนวน like ปัจจุบันออกมาก่อน นำมา+1 แล้ว Update ค่าแทนค่าเดิม
____
2. สร้าง Route สำหรับการค้าหาชื่อ Blog ที่มีอยู่ใน Database โดยผลลัพท์จากการ Search จะมีแค่ Blog ที่มีข้อความจาก params `search` โดยในตัวอย่างจะเป็นการ Search ด้วยคำว่า web จะสังเกตว่า Blog ที่ออกมาทุกอันจะมีคำว่า web อยู่ใน Title ด้วย (Response ยังไม่ต้องดึงข้อมูลรูปออกมา เอาแค่ข้อมูลที่อยู่ในตาราง blog)
* **Method :** GET
* **URL :**  /blogs/search
* **Example :** blogs/search?search=web
* **Response :** 
```javascript
{
    "blog":[
        {
            "id": 4,
            "title": "Web Pro",
            "content": "Web Pro is easy",
            "pinned": 0,
            "like": 0,
            "create_date": "2021-03-14T17:00:00.000Z",
            "create_by_id": null,
            "status": null
        },
        {
            "id": 8,
            "title": "webprograming",
            "content": "i like a webprograming",
            "pinned": 0,
            "like": 0,
            "create_date": "2021-03-14T17:00:00.000Z",
            "create_by_id": null,
            "status": null
        },
        {
            "id": 10,
            "title": "Make Website from node js",
            "content": "Hey guy! Welcome back to webpro",
            "pinned": 0,
            "like": 0,
            "create_date": "2021-03-14T17:00:00.000Z",
            "create_by_id": null,
            "status": "0"
        }
    ]
}
```
> hint : ตอนที่ Query SQL ให้ใช้ LIKE ดูการใช้ได้[ที่นี่](https://www.w3schools.com/sql/sql_like.asp)
___
3. สร้าง Route สำหรับเพิ่มข้อมูล comment (`blogId` คือ id ของ Blog ที่ต้องการเพิ่ม Comment)
* **Method :** POST
* **URL :**  /:blogId/comments
* **Body**
```javascript
{
    "comment": "new comment",
    "like": 0,
    "comment_by_id": null
}
```
* **Response**

```javascript
{
    "message":"Add Comment at Blog id 1"
}
```

> hint : ใน sql สามารถใช้ CURRENT_TIMESTAMP เพื่อให้บันทึกเวลาปัจจุบันได้เลย
___
4. สร้าง Route สำหรับแก้ไขข้อมูลของ Comment โดย `commentId` คือ id ***ของ comment ที่ต้องการแก้ไข***
* **Method :** PUT
* **URL :**  /comments/:commentId
* **Body**
```javascript
{
    "comment": "edit comment",
    "like": 0,
    "comment_date": "2021-12-31",
    "comment_by_id": null,
    "blog_id": 1 // blog id
}
```
* **Response**

```javascript
{
    "message": "Edit Comment at id 1"
}
```
___
5. สร้าง Route สำหรับลบ comment โดย `commentId` คือ id ***ของ comment ที่ต้องการลบ***
* **Method :** DELETE
* **URL :**  /comments/:id
* **Response**
```javascript
{
    "message": "Delete Comment id 1 Comlete"
}
```

6. สร้าง Route สำหรับเพิ่มยอด like ให้กับ comment **เพิ่มขึ้นทีละ 1** เมื่อถูกยิง Request โดย `commentId` คือ id ***ของ comment ที่ต้องการเพิ่มยอดไลค์***
* **Method :** PUT
* **URL :**  /comments/addlike/:commentId
* **Response**
```javascript
{
    "message":"Add like in Comment id 2, Current Like is 12" // 12 is a number of like after add like
}
```


