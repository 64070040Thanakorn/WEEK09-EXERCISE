# WEEK09-EXERCISE 

แบบฝึกหัดสัปดาห์ที่ 9 Express / MySql

## Tutorial

#### 0. Promisify
เราจะใช้ Promisify มาช่วยให้การเขียน Query และ Promise ให้สามารถเข้าใจได้ง่ายขึ้น โดยตัว Promisify จะทำให้ ```conn.query()``` เป็น Promise ให้เลย มีขั้นตอนตั้งค่าและใช้งาน ดังนี้
1. ทำการประกาศตัว Promisify ในไฟล์แต่ละ Route ดังนี้
```javascript
const { promisify } = require('util');
```
2. สร้าง Instance ของการ Query ข้อมูล
```javascript
const myQuery = promisify(conn.query).bind(conn)
```
3. เมื่อต้องการจะใช้งาน
```javascript
let result = await myQuery('SELECT * FROM blogs')
res.json(result)
```

#### 1. Update
1. สร้าง Router ```/blogs/update/:id``` ใหม่ในไฟล์ ```/routes/blog.js```

```javascript
router.post('/blogs/update/:id', (req, res, next) => {
  // update blog code here
}
```

2. สร้าง try catch ใน arrow function
3. ใน try ให้เรียกใช้ ```
myQuery()```ให้อยู่ในรูปแบบ asyn await โดยส่ง parameter ไปด้วยดังนี้

```javascript
'UPDATE blogs SET title=?,content=?, status=?, pinned=?, blogs.like=?, create_by_id=? WHERE id=?', [req.body.title, req.body.content, req.body.status, req.body.pinned, 0, null, req.params.id]
```
4. ใน try กำหนด response ออกมา
```javascript
res.json({ 
    message: "Update Blog id " + req.params.id + " Complete" 
})
```

5. ใน catch
```javascript
next(error)
```

##### Final code in Update

```javascript
router.post('/blogs/:id', (req, res, next) => {
    try {
        await myQuery('UPDATE blogs SET title=?,content=?, status=?, pinned=?, blogs.like=?, create_by_id=? WHERE id=?', [req.body.title, req.body.content, req.body.status, req.body.pinned, 0, null, req.params.id])
        res.json({ message: "Update Blog id " + req.params.id + " Complete" })
    } catch (error) {
        next(error)
    }
}
```

----

#### 2. Delete

**เงื่อนไข**:ในการจะลบแต่ละ Blog จะต้องทำการเช็กว่า Blog นั้นมี comment หรือไม่ **หากมี comment** อยู่จะต้องแสดง message ว่า *"Can't Delete. This Blog has a comment"* แต่ถ้า Blog นั้น **ไม่มี Comment** ก็จะลบตามปกติ

1. สร้าง Router `/blog/:id` ใหม่ในไฟล์ `/routes/blog.js`

```javascript
router.delete('/blogs/:id', function (req, res) {
  // delete blog code here
});
```
2. สร้าง try catch ใน arrow function
3. *ในขั้นตอนแรกจะต้องเช็กว่ามี comment หรือไม่* ใน try ให้เรียกใช้ ```myQuery()```ให้อยู่ในรูปแบบ asyn await โดยส่ง parameter ไปด้วยดังนี้
```javascript
// หา comment ที่มี blog_id ตาม id ที่ส่งมาใน request
'SELECT * FROM comments WHERE blog_id=?', [req.params.id]
```
4. สร้างตัวแปรมารับผลลัพท์ที่ได้จากการ Query

```javascript
let comments = await myQuery(...)
```
5. เช็กจำนวนของ comment
```javascript
if (comments.length > 0) {  // up2u condition check
    res.status(400).json({ 
        message: "This Blog has comment!!!"
    })
} else {
    // code in else condition here
}
```
6. *ในกรณีที่ไม่มี comment* ให้เรียกใช้ `myQuery()` ให้อยู่ในรูปแบบ asyn await โดยส่ง parameter ไปด้วยดังนี้
```javascript
'DELETE FROM blogs WHERE id=?', [req.params.id]
```
7. และ response ออกมา
```javascript
res.json({ 
    message: 'Delete Blog id ' + req.params.id + ' complete' 
})
```
8. ใน catch
```javascript
next(error)
```

##### Final code in Delete

```javascript
router.delete('/blogs/:id', function (req, res) {
    try {
        let comments = await myQuery('SELECT * FROM comments WHERE blog_id=?', [req.params.id])
        if (comments.length > 0) {
            res.status(400).json({message: "This Blog has comment!!!" })
        } else {
            await myQuery('DELETE FROM blogs WHERE id=?;', [req.params.id])
            res.json({ message: 'Delete Blog id ' + req.params.id + 'complete' })
        }
    } catch (error) {
        next(error)
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
* **URL :**  /blogs/search/:search
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
            "content": "Hey guy! Welcaome back to webpro",
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
    "comment_date": "2021-12-31",
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


