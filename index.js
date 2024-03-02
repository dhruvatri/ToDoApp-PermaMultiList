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

app.get("/", async(req, res) => {
  try{
    const data = await db.query("select * from items order by id asc");
    items = data.rows;
    res.render("index.ejs", {
      listTitle: "To-Do List",
      listItems: items,
    });
  }catch(err)
  {
    console.log(err);
  }
});

app.post("/add", async(req, res) => {
  const item = req.body.newItem;
  try{
    await db.query("insert into items (title) values ($1)",[item]);
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

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
