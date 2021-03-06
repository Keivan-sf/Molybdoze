const pages = {
    videoStream : require('./VideoStream/videoStream.js'),
    video_page : require('./VideoPage/video_page.js'),
    upload_page : require('./upload/upload_page.js'),
    uploadVideos : require('./upload/uploadVideos.js'),
}

const fileUpload = require('express-fileupload');
const bodyParser = require('body-parser')
const multer = require('multer');
const { USER_AUTH } = require('./users/users.js');

module.exports = (express , app) => {

    app.use(fileUpload() , express.json() , bodyParser.urlencoded({extended: false}))

    app.get('/video/:id' , (req , res) => pages.video_page(req , res)) // Video page
    
    app.get('/video_stream/:id' , (req , res) => pages.videoStream(req , res)) // Video streaming chunk

    app.get('/upload/' , (req , res) => pages.upload_page(req , res)) 

    app.get('/users' , (req , res) => {
        res.json(users) //testing purpose
    })

    app.post('/upload-videos/' , (req , res) => pages.uploadVideos(req , res)) // Uploading video end point


    /* Users System */

    app.get('/login' , (req , res) => USER_AUTH.signin(req , res)) 

    app.get('/signup' , (req , res) => USER_AUTH.signup(req , res)) 

    app.post('/login-auth' , (req , res) => USER_AUTH.signin_auth(req , res)) 

    app.post('/signup-auth' , (req , res) => USER_AUTH.signup_auth(req , res)) 

    /* Users System */


    /* public */

    app.use('/images/thumbnails' , express.static('./resources/thumbnails/')) // Thumbnails routing

    app.use('/tspreviews' , express.static(`./resources/ts-previews/`)) // Timestamp previews

    app.use('/resources' , express.static('./resources/public/')) // Public utilities

    /* public */

}