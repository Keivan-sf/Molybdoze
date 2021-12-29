const { video_page } = require('../../utils/htmlUtils/htmlUtils.js');
const { video_page_req } = require('../../Validators/validator.js');
const { Videos } = require('../../utils/videoUtils/video.js');
const fs = require('fs');
const standards = [1080 , 720 , 480 , 360 , 240 , 144]

module.exports = async(req , res) =>{

    try{

        let values = video_page_req(req , res)
        if(!values.valid) return;
    
        const video = await Videos.fetch(values.id);

        let Qualities = {};

        Qualities = video.qualities.reduce((prev , current , index) =>{

            if(current > 1080) return;

            if(index === 0){

                prev[current + 'p'] = `/video_stream/${video.id}?quality=default`;
 
                return prev;
            }

            prev[current + 'p'] = `/video_stream/${video.id}?quality=${current}p`;
            return prev;

        }, {})

        new video_page(res)
        .setTitle(values.id)
        .setID(values.id)
        .setPoster(video.thumbnail.slice(-1)[0])
        .setDuration(video.strDuration)
        .setMetadata({
            id: video.id,
            qualities: Qualities,
            tsPreview : video.tsPreviews,
            resolution : video.resolution,
            subtitle : [],
            numbers: [],
            duration: video.duration,
        })
        .load();

    }catch(error){
        console.log(error)
        res.status(500).send(error)

    }
    
}
