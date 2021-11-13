const pages = {
    videoStream : require('./VideoStream/videoStream.js'),
    video_page : require('./VideoPage/video_page.js'),
    upload_page : require('./upload/upload_page.js'),
    uploadVideos : require('./upload/uploadVideos.js'),
    users_page : require('./users/users.js'),
    users_auth: require('./users/auth.js')
}

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const multer = require('multer');
const users = [];

module.exports = (express , app) => {

    app.use(fileUpload() , express.json() , bodyParser.urlencoded({extended: false}))

    app.get('/video/:id' , (req , res) => pages.video_page(req , res)) // Video page
    
    app.get('/video_stream/:id' , (req , res) => pages.videoStream(req , res)) // Video streaming chunk

    app.get('/upload/' , (req , res) => pages.upload_page(req , res)) 

    app.get('/users' , (req , res) => {
        res.json(users)
    })

    app.get('/login' , (req , res) => pages.users_page(req , res , 'signin')) 

    app.get('/signup' , (req , res) => pages.users_page(req , res , 'signup')) 

    app.post('/login-auth' , (req , res) => pages.users_auth(req , res , 'signin' , users)) 

    app.post('/signup-auth' , (req , res) => pages.users_auth(req , res , 'signup' , users)) 

    app.post('/upload-videos/' , (req , res) => pages.uploadVideos(req , res)) // Uploading video end point


    /* public */

    app.use('/images/thumbnails' , express.static('./resources/thumbnails/')) // Thumbnails routing

    app.use('/resources' , express.static('./resources/public/')) // Public utilities

    /* public */
}