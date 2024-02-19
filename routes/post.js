const mongoose=require('mongoose');

const postSchema=mongoose.Schema({
    picture:String,
    user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"user"
    },
    caption:String,
    date:{
        type:Date,
        default:Date.now
    },
    likes:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"user",
        }
    ],
    posts: [{ type: mongoose.Schema.Types.ObjectId ,ref:"post"}],
});

module.exports=mongoose.model("post",postSchema);//due to this,we  can create,update and delete,in the file where we import it 
