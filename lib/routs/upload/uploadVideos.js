const { video_upload_req } = require('../../Validators/validator.js');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const { Fragments , MetaData , Qualities} = require('../../utils/videoUtils/utils.js');
const { nanoid } = require('nanoid')
const { Videos } = require('../../utils/videoUtils/video.js');


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

            let thumbnails = await Fragments.createThumbnails(videoID , mainFile , qualitiesFinished , [1080 , 720 , 480 , 144] , previewStartPoint);

            let timestampPrev =  await Fragments.createTsPreview(videoID , mainFile , videoMetaData , qualitiesFinished);

            let qualities = [];
            qualities.push(...qualitiesFinished.standards);
            if(qualitiesFinished.match) qualities.push(qualitiesFinished.match);
            if(!qualitiesFinished.match && qualitiesFinished.main.height < 1080) qualities.push(qualitiesFinished.main.height);
            qualities.sort((a , b) => b - a);

            await Videos.insertVideo(
                {

                    VideoID : videoID , 
                    UserID : 'someID' , 
                    Title : videoID , 
                    Description: 'some Des here' , 
                    Likes: 0 , 
                    Dislikes : 0 ,
                    Views: 0 ,
                    Qualities: qualities.join('-'),
                    Duration : videoMetaData.duration,
                    Dimensions : `${videoMetaData.resolution.width}x${videoMetaData.resolution.height}` // fix performance

                }, 'VideoDate')

            res.status(200).send(`Your video has been uploaded succcessfully\n<a href="/video/${videoID}" title="Your Video">Your Video</a>`);


        }catch(err){
            res.status(500).send('Internal error');
            console.log(err)
        }


    })

}

function createVideoID(){
    let createdID = nanoid(12);

    fs.mkdirSync(`./resources/videos/${createdID}`);
    fs.mkdirSync(`./resources/thumbnails/${createdID}`);

    return createdID;
}