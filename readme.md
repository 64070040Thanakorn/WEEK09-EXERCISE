# WEEK09-TUTORIAL

เรามาลองทำโจทย์ 2 ข้อนี้กันดูนะครับ
เป็นตัวอย่างเพิ่มเติมจากใน Youtube Playlist: [Express + MySQL Part 1](https://youtube.com/playlist?list=PLBKsi1O7E5MwJUDp2-JmjidwkgRL20cty)

## Tutorial 1
สร้าง Route สำหรับการเพิ่ม like โดยจะ**เพิ่มขึ้นทีละ 1** เมื่อถูกยิง Request โดยจะส่ง `blogId` ของ Blog ไปเพื่อบอกว่าจะเพิ่ม like ให้ Blog ไหน
* **Method :** PUT
* **URL :**  /blogs/addlike/:blogId
* **Response :** 
```javascript
{
    blogId: 2,
    likeNum: 12 // 12 คือจำนวน like ของ blog ที่มี id = 2 หลังจาก +1 like แล้ว
}
```

> hint : ให้ไปดึงจำนวน like ปัจจุบันออกมาก่อน นำมา+1 แล้ว Update ค่าแทนค่าเดิม

### Step 1:
- เปิดไฟล์ routes/blog.js
- เราจะมาแก้ไข route ในส่วนนี้กัน

```javascript
router.post("/blogs/addlike/:blogId", async function (req, res, next) {
  // Your code here
});
```
### Step 2:
- เพิ่ม code สำหรับดึงข้อมูลจำนวน like และ update จำนวน like กลับเข้า DB

```javascript
router.post("/blogs/addlike/:blogId", async function (req, res, next) {
-  // Your code here
+  //ทำการ select ข้อมูล blog ที่มี id = req.params.blogId
+  try{
+    const [rows, fields] = await pool.query("SELECT * FROM blogs WHERE id=?", [
+      req.params.blogId,
+    ]);
+    //ข้อมูล blog ที่เลือกจะอยู่ในตัวแปร rows
+    console.log('Selected blogs =', rows)
+    //สร้างตัวแปรมาเก็บจำนวน like ณ ปัจจุบันของ blog ที่ select มา
+    let likeNum = rows[0].like
+   console.log('Like num =', likeNum) // console.log() จำนวน Like ออกมาดู
+    //เพิ่มจำนวน like ไปอีก 1 ครั้ง
+    likeNum += 1
+
+    //Update จำนวน Like กลับเข้าไปใน DB
+    const [rows2, fields2] = await pool.query("UPDATE blogs SET blogs.like=? WHERE blogs.id=?", [
+      likeNum, req.params.blogId,
+    ]);
+
+    // return json response
+    return res.json({
+      blogId: Number(req.params.blogId),
+      likeNum: likeNum
+    })
+  } catch (err) {
+    return next(err);
+  }
});
```
### Step 3:
- เรามาลองทำเพิ่มนิดหน่อยกัน ... ให้เมื่อกด ![image](https://user-images.githubusercontent.com/77012730/159155828-1b5f9a91-91a3-46da-9eab-6fd7c3a52b54.png) จากในหน้า `index.ejs` แล้วไปทำส่ง POST request ไปที่ route '/blogs/addlike/:blogId' เพื่อ update จำนวน like และนำจำนวน like ที่ได้รับ response มาแสดง
- เปิดไฟล์ views/index.ejs เพื่อแก้ไขให้ปุ่ม Like เมื่อกดจะทำการ post ไปที่ route '/blogs/addlike/:blogId'

```ejs
<footer class="card-footer">
    <a class="card-footer-item" href="<%= `/blogs/${blog.id}/` %>">Read more...</a>
    <a class="card-footer-item">
+     <form method="POST" action="<%= `/blogs/addlike/${blog.id}` %>" id="form<%= blog.id %>">
+       <span class="icon-text" onclick="document.getElementById('form<%= blog.id %>').submit();">
          <span class="icon">
            <i class="far fa-heart"></i>
          </span>
+         <span>Like (<%= blog.like %>)</span> <!-- ปรับเพิ่มให่้แสดงจำนวน like ในวงเล็บ -->
        </span>
+     </form>
    </a>
</footer>
```
- กลับไปที่ไฟล์ routes/blog.js แล้วไปแก้ไขในส่วนที่เราทำการ return response ปรับเป็นทำการ redirect ไปที่หน้า index แทน

```javascript
router.post("/blogs/addlike/:blogId", async function (req, res, next) {
  //ทำการ select ข้อมูล blog ที่มี id = req.params.blogId
  try{
    const [rows, fields] = await pool.query("SELECT * FROM blogs WHERE id=?", [
      req.params.blogId,
    ]);
    //ข้อมูล blog ที่เลือกจะอยู่ในตัวแปร rows
    console.log('Selected blogs =', rows)
    //สร้างตัวแปรมาเก็บจำนวน like ณ ปัจจุบันของ blog ที่ select มา
    let likeNum = rows[0].like
    console.log('Like num =', likeNum) // console.log() จำนวน Like ออกมาดู
    //เพิ่มจำนวน like ไปอีก 1 ครั้ง
    likeNum += 1

    //Update จำนวน Like กลับเข้าไปใน DB
    const [rows2, fields2] = await pool.query("UPDATE blogs SET blogs.like=? WHERE blogs.id=?", [
      likeNum, req.params.blogId,
    ]);
+    //Redirect ไปที่หน้า index เพื่อแสดงข้อมูล
+    res.redirect('/');
  } catch (err) {
    return next(err);
  }
});
```
____
## Tutorial 2
สร้าง Route สำหรับการค้าหาชื่อ Blog ที่มีอยู่ใน Database โดยผลลัพท์จากการ Search จะมีแค่ Blog ที่มีข้อความจาก params `search` โดยในตัวอย่างจะเป็นการ Search ด้วยคำว่า web จะสังเกตว่า Blog ที่ออกมาทุกอันจะมีคำว่า web อยู่ใน Title ด้วย (Response ยังไม่ต้องดึงข้อมูลรูปออกมา เอาแค่ข้อมูลที่อยู่ในตาราง blog)
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

# WEEK09-EXERCISE 

แบบฝึกหัดสัปดาห์ที่ 9 Express / MySql

1. สร้าง Route สำหรับเพิ่มข้อมูล comment (`blogId` คือ id ของ Blog ที่ต้องการเพิ่ม Comment)
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
2. สร้าง Route สำหรับแก้ไขข้อมูลของ Comment โดย `commentId` คือ id ***ของ comment ที่ต้องการแก้ไข***
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
3. สร้าง Route สำหรับลบ comment โดย `commentId` คือ id ***ของ comment ที่ต้องการลบ***
* **Method :** DELETE
* **URL :**  /comments/:commentId
* **Response**
```javascript
{
    "message": "Delete Comment id 1 Comlete"
}
```

4. สร้าง Route สำหรับเพิ่มยอด like ให้กับ comment **เพิ่มขึ้นทีละ 1** เมื่อถูกยิง Request โดย `commentId` คือ id ***ของ comment ที่ต้องการเพิ่มยอดไลค์***
* **Method :** PUT
* **URL :**  /comments/addlike/:commentId
* **Response**
```javascript
{
    "message":"Add like in Comment id 2, Current Like is 12" // 12 is a number of like after add like
}
```


