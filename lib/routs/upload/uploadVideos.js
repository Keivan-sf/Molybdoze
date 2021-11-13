const { video_upload_req } = require('../../Validators/validator.js');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { Fragments , MetaData , Qualities} = require('../../utils/videoUtils/utils.js');
const { nanoid } = require('nanoid')


module.exports = (req , res) =>{

    let values = video_upload_req(req , res);
    if(!values.valid) return;

    const videoID = createVideoID();
    const mainFile = `./resources/videos/${videoID}/main.mp4`;
    
    values.videoFile.mv(mainFile , async(err)=>{

        if(err){
            res.status(500).send('Uploading problem');
            console.log(err);
            return;
        }

        try{

            let videoMetaData = await new MetaData(mainFile).load();

            let qualitiesFinished = await Qualities.createQualities(mainFile , videoMetaData);

            let previewStartPoint = await Fragments.createPreview(mainFile , `./resources/videos/${videoID}/preview.mp4` , videoMetaData , 2);

            console.log(previewStartPoint)

            let thumbnails = await Fragments.createThumbnails(videoID , mainFile , qualitiesFinished , [1080 , 720 , 480 , 144] , previewStartPoint);

            res.status(200).send(`Your video has been uploaded succcessfully\n<a href="/video/${videoID}" title="Your Video">Your Video</a>`);


        }catch(err){
            res.status(500).send('Internal error');
            console.log(err)
        } 


    })

}

function createVideoID(){
    let createdID;
    
    do{
        createdID = nanoid(12);
    }while(fs.existsSync(`./resources/videos/${createdID}`) || fs.existsSync(`./resources/thumbnails/${createdID}`))

    fs.mkdirSync(`./resources/videos/${createdID}`);
    fs.mkdirSync(`./resources/thumbnails/${createdID}`);

    return createdID;
}