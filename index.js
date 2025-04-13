import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const app = express();
const port = 3000;

const db = new pg.Client({
    user: "postgres",
    host: "localhost",
    database: "tour",
    password: "postgresql123",
    port: 5432,
  });
db.connect();
  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname,"public")));


app.get("/",(req,res)=>{
    res.render("index.ejs");
});
app.get("/register",(req,res)=>{
    res.render("register.ejs");
});
app.post("/register",async (req,res)=>{
    const em2 = req.body.email2;
    if(em2){
        const result = await db.query("SELECT * FROM users");
        const pass = req.body.pswd2;
        let row = result.rows.find(row => em2 === row.email);
if (row) {
    if (pass === row.password) {
        res.render("register.ejs");
    } else {
        res.redirect("/?error=Wrong password entered");
    }
} else {
    res.redirect("/?error=Email not found");
}}
else{   
        const em = req.body.email1;
    const pswd = req.body.pswd1;
    try{
        await db.query("INSERT INTO users(email,password) VALUES($1,$2)",[em,pswd]);
        res.render("register.ejs");
    }
    catch(err){
        console.error(err);
        res.status(500).send("an error occurred");
    }
}
});
async function getCurrentUser(mail) {
    const result = await db.query("SELECT * FROM users");
    const users = result.rows;
    const e_mail = users.find((user) => user.email == mail);
    if (!e_mail) {
        throw new Error("User not found");
    }
    return e_mail.id;
  }
app.post("/shimla", async (req, res) => {
    const fname = req.body.f_name;
    const lname = req.body.l_name;
    const mode = req.body.mode;
    const no = req.body.number;
    const mail = req.body.email;
    try {
        const id = await getCurrentUser(mail);
        await db.query(
            "INSERT INTO contact(id,first_name,last_name,mode,number) VALUES($1,$2,$3,$4,$5)",
            [id, fname, lname, mode, no]
        );
        res.sendFile(path.join(__dirname, 'public', 'Shimla.html'));
    } catch (err) {
        console.error(err);
        res.status(500).send("An error occurred");
    }
});
app.post("/reviews",async (req,res)=>{
    const email = req.body.e_mail;
    const id = await getCurrentUser(email);
    const re = req.body.feedback;
    const result = await db.query("SELECT * FROM contact");
    try{
        await db.query("UPDATE contact SET review = $1 WHERE id = $2",[re,id]);
        res.render("reviews.ejs",{
            data : result.rows,
        });
    }
    catch(err){
        res.status(500).send("An error occurred");
    }
});
app.get("/feedback",(req,res)=>{
    res.render("feedback.ejs");
});
app.get("/reviews",async (req,res)=>{
    const result = await db.query("SELECT * FROM contact")
    res.render("reviews.ejs",{
        data : result.rows,
    });
});
const routes = [
    "Manali", "Chamba", "Dharamshala", "Kullu", "Lahaul", 
    "Shimla", "Solan", "Spiti", "guide", "contact"
];
routes.forEach(route => {
    app.get(`/${route.toLowerCase()}`, (req, res) => {
        res.sendFile(path.join(__dirname, "public", `${route}.html`));
    });
});
app.listen(port,()=>{
    console.log(`Server running on http://localhost:${port}`);
});
