const { error } = require("console");
const multer= require("multer");
const path=require("path");
const storage =multer.diskStorage({
    destination :(req,file,cb) =>{
        cb(null, path.join(__dirname, "../uploads"));
    },
    filename : (req,file,cb)=>{
        const uniqueName =Date.now() + path.extname(file.originalname);
        cb(null,uniqueName);
    },
});
const upload =multer({
    storage : storage,
    limits : {fileSize : 5*1024*1024},
    fileFilter : function(req,file,cb){
        const allowedTypes =["image/jpeg","image/png","image/jpg"];
        if(allowedTypes.includes(file.mimetype)){
            return cb(null,true);
        }
        else{
            return cb(new error("Only image files are allowed"),false)
        }
    },
});
module.exports=upload;