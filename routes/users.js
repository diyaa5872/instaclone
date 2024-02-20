const mongoose=require('mongoose');
const plm=require("passport-local-mongoose");

mongoose.connect("mongodb://127.0.0.1:27017/instaegram");

const userSchema=mongoose.Schema({
  username: String,
  name:String,
  email:String,
  password:String,
  bio: String,
  profileImage: String,
  posts: [{ type: mongoose.Schema.Types.ObjectId ,ref:"post"}],
});

userSchema.plugin(plm);//due to this we are providing serializeUser and deserializeUser

module.exports=mongoose.model("user",userSchema);//due to this,we  can create,update and delete,in the file where we import it 

