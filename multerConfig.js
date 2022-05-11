//multer is used for uploading images
//This file is used for defining the strategy of multer, so that it doesn't fill to much space in other files
const express = require('express')
const app = express()


const multer = require("multer");
app.use(express.static(__dirname + 'public'));


const storage = multer.diskStorage({
    destination: function(request, file, cb) {
        cb(null, './public')
    },
    filename: function(req, file, cb) {
    
        cb(null, file.originalname)
    }
})//this defines where the image will be stored

const imageFilter = (req, file, cb) => {
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
    cb(null, true);
    } else {
    cb(null, false);
    }
};//this code means that uploading will only work if the image is a the file type JPEG or PNG


const upload = multer({
    storage: storage, 
    limits: imageFilter})

module.exports = {storage, imageFilter, upload}