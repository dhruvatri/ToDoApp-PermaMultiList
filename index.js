import express from "express";
import bodyParser from "body-parser";
import pg from "pg";

const db = new pg.Client({
  user : "postgres",
  password : "postgres",
  host : "localhost",
  port : 5432,
  database : "permalist"
});
db.connect();

const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

let items = [];
let currentList=0;

app.get("/", async(req, res) => {
  try{
    const listData = await db.query("select * from lists");
    const lists=listData.rows;
    if (typeof(lists)==undefined || lists.length==0)
    {
      res.render("insertData.ejs");
    }
    else{
      if (currentList==0) currentList= lists[0].id;
      const data = await db.query("select * from items where listId=$1 order by id asc",[currentList]);
      items = data.rows;

      const currentListElement = lists.find((list) => list.id == currentList);
      console.log(lists);
      console.log(currentListElement);
      res.render("index.ejs", {
        lists : lists,
        listTitle: currentListElement.listtitle,
        listItems: items,
      });
  }
  }catch(err)
  {
    console.log(err);
  }
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  try{
    await db.query("insert into items (title,listId) values ($1,$2)",[item,currentList]);
    res.redirect("/");
  }catch(err)
  {
    console.log(err);
  }
});

app.post("/edit", async (req, res) => {
  const item = req.body.updatedItemTitle;
  const id = req.body.updatedItemId;

  try {
    await db.query("UPDATE items SET title = ($1) WHERE id = $2", [item, id]);
    res.redirect("/");
  } catch (err) {
    console.log(err);
  }
});

app.post("/delete", async (req, res) => {
  try {
    const id = req.body.deleteItemId;
    await db.query("DELETE FROM items WHERE id = $1", [id]);
    res.redirect("/");
  }catch(err)
  {
    console.log(err);
  }
});

app.post("/newList",async(req,res)=>{
  const title = req.body.add;
  console.log(title);
  try
  {
    const user = await db.query("insert into lists (listTitle) values ($1) RETURNING *",[title]);
    currentList=user.rows[0].id;
    res.redirect("/");
  }
  catch(err) 
  {
    console.log(err);
  }
});


app.post("/list",async(req,res)=>{
  try{
    currentList=req.body.listItem;
    res.redirect("/");
  }
  catch(err)
  {
    console.log(err);
  }
});

app.post("/deletelist",async(req,res)=>{

  const id = req.body.listItem;
  try{
    await db.query("delete from items where listId=$1",[id]);
    await db.query("delete from lists where id=$1",[id]);
    currentList=0;
    res.redirect("/");
  }
  catch(err)
  {
    console.log(err);
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
