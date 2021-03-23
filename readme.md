# WEEK09-EXERCISE 

แบบฝึกหัดสัปดาห์ที่ 9 Express / MySql

## Tutorial

#### 1. Update Blog

####วิธีทำ
1. สร้าง Router ```/blogs/update/:id``` ใหม่ในไฟล์ ```/routes/blog.js```

```javascript
router.post('/blogs/update/:id', (req, res, next) => {
  // update blog code here
}
```

2. สร้าง transection ขึ้นมา

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

7. Commit Transection
```javascript
conn.commit()
```

8. ถ้า Update สำเร็จให้ Response ออกมา
```javascript
res.json({ message: "Update Blog id " + req.params.id + " Complete" })
```

9. หากการ Update เกิด Error ขึ้นมาขั้นตอนใดขั้นตอนหนึ่ง ให้ทำการ Rollback Transection และ Return error ออกมา
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

#### 2. Delete

**เงื่อนไข**:ในการจะลบแต่ละ Blog จะต้องทำการเช็กว่า Blog นั้นมี comment หรือไม่ **หากมี comment** อยู่จะต้องแสดง message ว่า *"Can't Delete. This Blog has a comment"* แต่ถ้า Blog นั้น **ไม่มี Comment** ก็จะลบข้อมูลออกจากตาราง blogs และ**ลบข้อมูลรูปภาพออกจากตาราง images** ด้วย

1. สร้าง Router `/blog/:id` ใหม่ในไฟล์ `/routes/blog.js`

```javascript
router.delete('/blogs/:id', function (req, res) {
  // delete blog code here
});
```
2. สร้าง Transection ขึ้นมา
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

7. Commit Transection
```javascript
conn.commit()
```

8. ถ้า Delete สำเร็จให้ Response ออกมา
```javascript
res.json({ message: 'Delete Blog id ' + req.params.id + ' complete' })
```

9. หากการ Delete เกิด Error ขึ้นมาขั้นตอนใดขั้นตอนหนึ่ง ให้ทำการ Rollback Transection และ Return error ออกมา
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
## Exercise

1. สร้าง Route สำหรับการเพิ่ม like โดยจะ**เพิ่มขึ้นทีละ 1** เมื่อถูกยิง Request โดยจะส่ง `id` ของ Blog ไปเพื่อบอกว่าจะเพิ่ม like ให้ Blog ไหน
* **Method :** PUT
* **URL :**  /blog/addlike/:id
* **Response :** 
```javascript
{
    message:"Add like in Blog 2, Current Like is 12" // 12 is a number of like after add like
}
```

> hint : ให้ไปดึงจำนวน like ปัจจุบันออกมาก่อน นำมา+1 แล้ว Update ค่าแทนค่าเดิม
____
2. สร้าง Route สำหรับการค้าหาชื่อ Blog ที่มีอยู่ใน Database โดยผลลัพท์จากการ Search จะมีแค่ Blog ที่มีข้อความจาก params `search` โดยในตัวอย่างจะเป็นการ Search ด้วยคำว่า web จะสังเกตว่า Blog ที่ออกมาทุกอันจะมีคำว่า web อยู่ใน Title ด้วย
* **Method :** GET
* **URL :**  /blog-search
* **Example :** blog-search?title=web
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
3. สร้าง Route สำหรับเพิ่มข้อมูล comment
* **Method :** POST
* **URL :**  /comments
* **Body**
```javascript
{
    "comment": "new comment",
    "like": 0,
    "comment_by_id": null,
    "blog_id": 1 // blog id
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
4. สร้าง Route สำหรับแก้ไขข้อมูลของ Comment โดย `id` คือ id ***ของ comment ที่ต้องการแก้ไข***
* **Method :** PUT
* **URL :**  /comments/:id
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
5. สร้าง Route สำหรับลบ comment โดย `id` คือ id ***ของ comment ที่ต้องการลบ***
* **Method :** DELETE
* **URL :**  /comments/:id
* **Response**
```javascript
{
    "message": "Delete Comment id 1 Comlete"
}
```

6. สร้าง Route สำหรับเพิ่มยอด like ให้กับ comment **เพิ่มขึ้นทีละ 1** เมื่อถูกยิง Request โดย `id` คือ id ***ของ comment ที่ต้องการเพิ่มยอดไลค์***
* **Method :** PUT
* **URL :**  /comments/addlike/:id
* **Response**
```javascript
{
    "message":"Add like in Comment id 2, Current Like is 12" // 12 is a number of like after add like
}
```


