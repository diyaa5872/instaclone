const multer=require('multer');
const  {v4:uuidv4}=require('uuid');//v4 means version 4

const path=require('path');//for extension 

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/images/uploads')
    },
    filename: function (req, file, cb) {
      const unique=uuidv4();//gets a unique name due to this
      cb(null,unique + path.extname(file.originalname));
    }//means after the (unique) extension of file joins
  })
  
  const upload = multer({ storage: storage })//hhelps in uploading images
  module.exports=upload;