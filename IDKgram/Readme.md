### Part 1 

## Setup

1. npm init -y

2. npm i express

3. create file app.js

4. npm i mongoose 

5. npm i bcrypt jsonwebtoken cookie-parser (as we are creating an app with user login)

6. create models folder with user.js file

7. create views folder with index.ejs file

8. npm i ejs (as we are using ejs)

'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

## basic boilerplate code

1. in app.js
```
const express = require('express');
const app = express();

app.get('/', (req, res)=> {
    console.log("heyyyyyy");
});

app.listen(3000);
```
2. run with 

`npx nodemon app.js`

''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

* Todo of project *
`user post can write post`
`login and register`
`logout`
`post creation`
`post like`
`post delete option for owner`

'''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''

## create models

1. `models/user.js`
```
const mongoose = require('mongoose');
mongoose.connect("mongodb://127.0.0.1:27017/miniproject");

const userSchema = mongoose.Schema({
    username: String,
    name: String,
    age: Number,
    email: String,
    password: String
});

module.exports = mongoose.model('user', userSchema);

```
2. require this model in app.js

```
const userModel = require("./models/user");
```
## Before Creating views and routes , doo add these lines to setup in app.js

```
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.get('/', (req, res)=> {
    res.render("index");
});

```
## set view

1. add boiler plate code in index.ejs

2. add tailwind using CDN link in ejs file

3. add form for index.ejs in views floder
```
<div class="w-full bg-zinc-900 min-h-screen text-white p-10"> 
        <h3 class="text-3xl mb-5">Create Account</h3>
        <form action="/register" method="post" class="flex flex-col gap-5 w-full md:w-1/2">
            <input class='px-3 py-2 rounded-md outline-none bg-transparent border-2 border-zinc-600' type="text" placeholder="name" name="name">
            <input class='px-3 py-2 rounded-md outline-none bg-transparent border-2 border-zinc-600' type="text" placeholder="username" name="username">
            <input class='px-3 py-2 rounded-md outline-none bg-transparent border-2 border-zinc-600' type="number" placeholder="age" name="age">
            <input class='px-3 py-2 rounded-md outline-none bg-transparent border-2 border-zinc-600' type="text" placeholder="email" name="email">
            <input class='px-3 py-2 rounded-md outline-none bg-transparent border-2 border-zinc-600' type="password" placeholder="password" name="password">
            <input class='px-5 py-2 rounded-md outline-none border-2 border-zinc-600 bg-blue-700' type="submit" value="Create Account">
        </form>
    </div>
```

## create route for the visuals

1. create a post route in app.js
```
app.post('/register', async (req, res)=> {
    let {username, name, age, email, password} = req.body;
    let user = await userModel.findOne({email})

    if(user){
        res.status(500).send("User already exists");
    } 
});
```

2. require bcrypt and jsonwebtoken in app.js
```
bcrypt.genSalt(10, (err, salt)=>{
        bcrypt.hash(password, salt, async (err, hash)=>{
            //hash is the encrypted password that we will store in the database
            let user = await userModel.create({
                username: username,
                name: name,
                age: age,
                email: email,
                password: hash
        });
    })
```

## post model

1. give ref of post model in models/user.js
```
posts: [{ type: mongoose.Schema.Types.ObjectId, ref: "post" }]
```
2. create post.js in models folder 
```
const mongoose = require('mongoose');

const postSchema = mongoose.Schema({
    
    user: { type: mongoose.Schema.Types.ObjectId, ref: "user" },
    date: {type: Date, default: Date.now},
    content: String,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
});

module.exports = mongoose.model('post', postSchema);

```
3. require it in app.js
```
const postModel = require("./models/post");
```

## Send login token using jwt

1. require jwt in app.js

2. add these lines in app.js
```
let token = jwt.sign({email: user.email, id: user._id}, "secret")
            res.cookie("token", token);
            res.send("User registered successfully");
```
3. check wheather it is generating the cookies or not

## Login setup

1. create login route in app.js
```
app.get('/login', (req, res)=> {
    res.render("login");
});
```
2. create login.ejs in views folder
```
<div class="w-full bg-zinc-900 min-h-screen text-white p-10"> 
        <h3 class="text-3xl mb-5">Login Account</h3>
        <form action="/login" method="post" class="flex flex-col gap-5 w-full md:w-1/2">
            <input class='px-3 py-2 rounded-md outline-none bg-transparent border-2 border-zinc-600' type="text" placeholder="email" name="email">
            <input class='px-3 py-2 rounded-md outline-none bg-transparent border-2 border-zinc-600' type="password" placeholder="password" name="password">
            <input class='w-50  px-5 py-2 rounded-md outline-none border-2 border-zinc-600 bg-blue-700' type="submit" value="Login">
        </form>
    </div>
```
3. Login Route logic for checking if there is such user with email
```
let {email, password} = req.body;
    let user = await userModel.findOne({email})

    if(!user){
        res.status(500).send("Something went wrong");
    } 
```

4. Check if the password matches or not with bcrypt
```
app.post('/login', async (req, res)=> {

    const { email, password } = req.body;

    let user = await userModel.findOne({email});

    if(!user){
        return res.status(500).send("Something went wrong");
    }

    bcrypt.compare(password, user.password, function(err, result){

        if(result){
            res.status(200).send("Login successful");
           // console.log("Login successful");
        } 
        else{
            res.redirect("/login");
          //  console.log("Login not successful");
        }
    });
});
```

## logout route

1. create logout route in app.js
```
app.get('/logout', (req, res)=> {
    res.cookie("token", "");
    res.redirect("/login");
});
```

2. in login route add this for token generation
```
if(result){
            let token = jwt.sign({email: user.email, id: user._id}, "secret");
            res.cookie("token", token);
            res.status(200).send("Login successful");

           // console.log("Login successful");
        } 
```

## check user's token to stay logged in
1. create isLogged in function in app.js (this acts as a middleware to protect our route and create a protected route with this)
```
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
```

2. create /profile route and use this function there
```
app.get('/profile', isLoggedIn, async (req, res)=> {
    console.log(req.user);
    res.render("login")
});

```


## =============================================================================

### Part 2

## build profile
1. render profile.ejs

2. create profile.ejs in views folder
```
dummy code
```

3. redirect from login to profile 
```
res.status(200).redirect("/profile");
```

4. check if it can find the user with email
```
app.get('/profile', isLoggedIn, async (req, res)=> { //protected route
    // console.log(req.user);
    let user = await userModel.findOne({email: req.user.email});
    console.log(user);
    
    res.render("profile", {user});
});
```

5. in profile.ejs use the user obj
```
<div class="w-full bg-zinc-900 min-h-screen text-white p-10"> 
        <div class="w-full flex justify-end">
            <a class="p-3 mb-5 bg-red-400 rounded-md mb-5 inline-block " href="/logout">Logout</a>
        </div>
        <h3 class="text-3xl">Hello, <%= user.name %> 🙋🏻‍♀️</h3>
        <h5 class="text-zinc-500 mb-2">you can create a new post.</h5>

        <form action="/post" method="post">
            <textarea class="p-3 w-1/3 resize-none bg-transparent border-2 border-zinc-800 rounded-md" placeholder="what's in your mind?" name="content"></textarea>
            <input class= "p-3 mb-5 bg-cyan-700 rounded-md block mt-2" type="submit" value="Create New Post" >
        </form>

        <div class="posts mt-20 ">
            <h3 class="text-zinc-400">Your Posts. </h3>
            <div class="postcontainer">
                <div class="post mb-3 w-1/3 p-5 bg-zinc-800 rounded-md mt-5 border-1 border-zinc-700">
                    <h4 class="text-xl text-blue-500 mb-2">@someusername</h4>
                    <p class="tracking-tighter">Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.</p>
                    <div class="btns flex mt-5 gap-5">
                        <a class="text-blue-500" href="">Like</a>
                        <a class="text-red-500" href="">Edit</a>
                    </div>
                </div>

            </div>
        </div>
    </div>
```

6. Create post route in app.js
```
app.get('/posts', isLoggedIn, async (req, res)=> {
    let user = await userModel.findOne({email: req.user.email});
    let {content} = req.query;
    let posts = await postModel.create({userid: user._id, content: content});
    
    user.posts.push(posts._id);
    await user.save();
    res.redirect("/profile");
});
```

7. Show post using post id and populate it using forEach in profile.ejs
```
<div class="posts mt-20 ">
            <h3 class="text-zinc-400">Your Posts. </h3>
            <div class="postcontainer">
                <% user.posts.forEach((post)=> { %>
                    
                    <div class="post mb-3 w-1/3 p-5 bg-zinc-800 rounded-md mt-5 border-1 border-zinc-700">
                    <h4 class="text-xl text-blue-500 mb-2">@someusername</h4>
                    <p class="tracking-tighter">Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptas, voluptate.</p>
                    <div class="btns flex mt-5 gap-5">
                        <a class="text-blue-500" href="">Like</a>
                        <a class="text-red-500" href="">Edit</a>
                    </div>
                </div>

                <% }) %>

            </div>
        </div>
```

8. Now get it with real user and data 
in app.js fisrt populate posts
```
app.get('/profile', isLoggedIn, async (req, res)=> { //protected route
    // console.log(req.user);
    let user = await userModel.findOne({email: req.user.email}).populate("posts");
    console.log(user);
    
    res.render("profile", {user});
});
```

9. Get latest post on top in profile.ejs change for each loop as given below
```
<% user.posts.reverse().forEach((post)=> { %>
```


### Part 3

## Like feature
1. add /like/<%= post._id %> route in profile.ejs href tag

2. add /like/:id in app.js
```
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

```

3. Change profile.ejs code for like feature
```
<small class="mt-2 inline-block"> <%= post.likes.length %> likes</small>
                    <div class="btns flex mt-5 gap-5">
                        <a class="text-blue-500" href="/like/<%= post._id %>">
                            <% if(post.likes.includes(user._id)) { %>
                                Unlike
                            <% } else { %>
                                Like
                            <% } %>
                        </a>
                        <a class="text-red-500" href="">Edit</a>
                    </div>
```

## Work for edit feature

1. add /edit route in profile.ejs in href tag
```
<a class="text-red-500" href="/edit/<%= post._id%>">Edit</a>
```

2. Now go to app.js and add this route
```
app.get('/edit/:id', isLoggedIn, async (req, res)=> { //protected route
    // console.log(req.user);
    let post = await postModel.findOne({_id: req.params.id}).populate("user");

    res.render("edit", {post}); 
});
```

3. Create edit.ejs file in views and add this code
```
<div class="w-full bg-zinc-900 min-h-screen text-white p-10"> 
        <div class="w-full flex justify-end">
            <a class="p-3 mb-5 bg-red-400 rounded-md mb-5 inline-block " href="/logout">Logout</a>
        </div>
        <h5 class="text-zinc-500 mb-2">you can edit post.</h5>

        <form action="/update/<% post._id%>" method="post">
            <textarea class="p-3 w-1/3 resize-none bg-transparent border-2 border-zinc-800 rounded-md" placeholder="what's in your mind?" name="content">
                <%= post.content %>
            </textarea>
            <input class= "p-3 mb-5 bg-yellow-700 text-black rounded-md block mt-2" type="submit" value="Update Post">
        </form>
    </div>
```

4. create update route
```
app.post('/update/:id', isLoggedIn, async (req, res)=> { //protected route
    let post = await postModel.findOneAndUpdate({_id: req.params.id}, {content: req.body.content});

    res.redirect("/profile"); 
});
```








### Part 3

## Multer

1. Search multer on npm website
`https://www.npmjs.com/package/multer`

2. It can manage any type of file, we can use multer for handling txt, jpg, pdf etc files. Multer is a node.js middleware for handling multipart/form-data, which is primarily used for uploading files

3. Create /test route and create test.ejs (dummy)
```
app.get('/test', (req, res)=> {
    res.render("test");
});
```

4. enctype="multipart/form-data" this should be in form 
```
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <script src="https://cdn.jsdelivr.net/npm/@tailwindcss/browser@4"></script>
    <title>Document</title>
</head>
<body>
    <div class="w-full bg-zinc-900 min-h-screen text-white p-10"> 
        <h3 class="text-3xl mb-5">Upload Files</h3>
        <form autocomplete="off" action="/upload" method="post" enctype="multipart/form-data">
            <input type="file" name="image">
            <input class='px-5 py-2 rounded-md outline-none border-2 border-zinc-600 bg-blue-700' type="submit" value="Upload File">
        </form>
    </div>
    
</body>
</html>
```

5. create upload route 
    * ```npm i multer```
    * Create a public folder, in that create stylesheets, javascripts and images folder in that, also create uploads folder in images.
    * require crypto, multer and path package
    ```
    const crypto = require('crypto');
    const path = require('path');
    const multer = require('multer');
    ```
    * We need disk storage first so add this code from npm website into app.js after cookie parser anywhere
    ```
 <img width="849" height="366" alt="image" src="https://github.com/user-attachments/assets/ce69b8ae-e808-4241-a2af-e0fea8aafa30" />

    ```
    
    * add this upload route in app.js
    ```
    app.post('/upload', upload.single('image'), (req, res)=> {
    console.log(req.file); //it adds file or files object to the request, file obj contains the file uploaded by the user
    });
    ```

