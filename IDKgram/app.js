const express = require('express');
const userModel = require("./models/user");
const postModel = require("./models/post");
const app = express();
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const user = require('./models/user');
const crypto = require('crypto');
const path = require('path');
const upload = require('./config/multerconfig');

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());



app.get('/', (req, res)=> {
    res.render("index");
});

app.get('/login', (req, res) => {
    res.render("login");
});

app.get('/profile/upload', (req, res)=> {
    res.render("profileupload");
});


app.post('/upload',isLoggedIn, upload.single("image") , async(req, res)=> {
   let user = await userModel.findOne({email: req.user.email});
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
});

app.get('/profile', isLoggedIn, async (req, res)=> { //protected route
    // console.log(req.user);
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    console.log(user);
    
    res.render("profile", {user});
});

app.get('/like/:id', isLoggedIn, async (req, res)=> { //protected route
    // console.log(req.user);
    let post = await postModel.findOne({_id: req.params.id}).populate("user");

    if(post.likes.indexOf(req.user.userid) === -1){post.likes.push(req.user.userid);
    }
    else{ //removes the like
        post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }
    await post.save();
    res.redirect("/profile");
});

app.get('/edit/:id', isLoggedIn, async (req, res)=> { //protected route
    // console.log(req.user);
    let post = await postModel.findOne({_id: req.params.id}).populate("user");

    res.render("edit", {post}); 
});

app.post('/update/:id', isLoggedIn, async (req, res)=> { //protected route
    let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content: req.body.content});

    res.redirect("/profile"); 
});

app.post('/post', isLoggedIn, async (req, res)=> {
    let user = await userModel.findOne({email: req.user.email});
    let {content} = req.body;
    let posts = await postModel.create({userid: user._id, content});
    
    user.posts.push(posts._id);
    await user.save();
    res.redirect("/profile");
});

app.post('/register', async (req, res)=> {

    let {username, name, age, email, password} = req.body;

    let user = await userModel.findOne({email});

    if(user){
        return res.status(500).send("User already registered");
    }

    bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash)=>{

            let user = await userModel.create({
                username,
                name,
                age,
                email,
                password: hash
            });

            let token = jwt.sign({email: user.email, userid: user._id}, "secret");

            res.cookie("token", token);
            res.send("User registered successfully");
        });
    });
});

app.post('/login',async (req, res)=> {

    const { email, password } = req.body;
    let user = await userModel.findOne({email});

    if(!user){
        return res.status(500).send("Something went wrong");
    }

    bcrypt.compare(password, user.password, function(err, result){

        if(result){
            let token = jwt.sign({email: user.email, userid: user._id}, "secret");
            res.cookie("token", token);
            //res.status(200).send("Login successful");
            res.status(200).redirect("/profile");

           // console.log("Login successful");
        } 
        else{
            res.redirect("/login");
          //  console.log("Login not successful");
        }
    });
});

app.get('/logout', (req, res)=> {
    res.cookie("token", "");
    res.redirect("/login");
});

function isLoggedIn(req, res, next){
    // console.log(req.cookies)
    if(req.cookies.token === ""){
        //res.send("You must be logged in");
        return res.redirect("/login");
    }
    else{
        let data = jwt.verify(req.cookies.token, "secret");
        req.user = data;
    }
    next();
}

app.listen(3000);