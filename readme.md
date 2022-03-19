# WEEK09-EXERCISE 

แบบฝึกหัดสัปดาห์ที่ 9 Express / MySql

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
* **URL :**  /comments/:commentId
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


