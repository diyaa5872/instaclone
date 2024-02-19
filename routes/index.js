var express = require('express');
var router = express.Router();
const userModel=require("./users");//imported here
const passport=require("passport");
const localStrategy=require("passport-local");//its use is,that we can login using username and password
const upload=require("./multer")
const postModel=require("./post");

//(1)
passport.use(new localStrategy(userModel.authenticate()));//here we are logged in

router.get('/', function(req, res) {
  res.render('index', {footer: false});
});

router.get('/login', function(req, res) {
  res.render('login', {footer: false});
});

router.get('/feed',isLoggedIn,async function(req, res) {
  const user=await userModel.findOne({username: req.session.passport.user}).populate("posts");
  const posts=await postModel.find().populate("user");//helps in loading all in "/feed"
  res.render('feed', {footer: true,posts,user});
});

router.get('/profile',isLoggedIn,async function(req, res) {
  const user=await userModel.findOne({username:req.session.passport.user}).populate("posts");
  res.render('profile', {footer: true,user});
});

router.get('/search',isLoggedIn, function(req, res) {
  res.render('search', {footer: true});
});

router.get('/edit',isLoggedIn,async function(req, res) {
  const user=await userModel.findOne({username: req.session.passport.user});//find the logged in user so that can already get a detail in edit option
  res.render('edit', {footer: true,user});//and then user is passed here
});

router.get('/upload',isLoggedIn, function(req, res) {
  res.render('upload', {footer: true});
});

//create an account(1)
router.post("/register",function(req,res,next){//here writing the real data
  const userData=new userModel({//copy everything from userschema except password
    // username: String,need to give its values here
    // name:String,
    // email:String,//need only three things here username,name ,email
    username: req.body.username,
    name:req.body.name,
    email:req.body.email
  });
  userModel.register(userData,req.body.password)//returns a promise
  .then(function(){//white .then ...is empty ,till  then account is created but not logged in ,so to logg in need to write inside .then()
    passport.authenticate("local")(req,res,function(){
      res.redirect("/profile");//processing to logg in
    });
  })
});

//for using log in
router.post("/login",passport.authenticate("local",{
successRedirect:"/profile",
failureRedirect:"/login"
}),function(req,res){
});

router.get('/logout', function(req, res,next){
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/');
  });
});


router.post("/update",upload.single("image"),async function(req,res){//need  to set up multer here
  const user=await userModel.findOneAndUpdate(
    {username: req.session.passport.user},
    {username: req.body.username, name:req.body.name, bio:req.body.bio},//write things(in user) which wanted to be updated
    {new:true}
  );//we found user jo use edit karne ki try kar rha h

  if(req.file){
  user.profileImage=req.file.filename;//profile gets updated
  }
  await user.save();//saving 
  res.redirect("/profile");
});

//for posting photos
router.post("/upload",isLoggedIn,upload.single("image"),async function(req,res){//is a route where we are submitting our form of upload.ejs file
  const user=await userModel.findOne(
    {username:req.session.passport.user})//checking for logged in banda
    const post=await postModel.create({
      picture: req.file.filename,//got our file for picture
      user: user._id,//id of logged in banda
      caption: req.body.caption
      //date is by default so no need to provide it
      //leave likes too
    })
    //till now server knows that who is user but user donot know that he made the post  
    //do to save post (as given in users.js schema)
    user.posts.push(post._id);
    await user.save();//await as user.save is async
    res.redirect("/feed");
});

router.get("/username/:username",isLoggedIn,async function(req,res){//from this can search everything
  const regex=new RegExp(`^${req.params.username}`,'i');
  const users=await userModel.findOne({username: regex});
  res.json(users);//as neeed to send thode users back
});

router.get("/like/post:id",isLoggedIn,async function(req,res){
  const user=await userModel.findOne({username: req.session.passport.user});//found user
  const post=await userModel.findOne({_id:req.params.id });//as accepting id's

  //check if already likes,then remove like..otherwise like it
  if(post.likes.indexOf(user._id)===-1)//in likes array of post,if got _id
  {
    post.likes.push(user._id);
  }
  else{
    post.likes.splice(post.likes.indexOf(user._id),1);
  }
  await post.save();
  res.redirect("/feed");
})

//whereever we apply isLoggedIn becomes protected and not  to appply this on login and /
function isLoggedIn(req,res,next){
  if(req.isAuthenticated())//means if not logged in then directly went to login page
  {
    return next();
  }
  res.redirect("/login");
};

module.exports = router;
