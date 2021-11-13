const ffmpeg = require('fluent-ffmpeg');

module.exports = class VideoMetadata{

    /**
     * @param {String} path Video Path
     */

    constructor(path){
        if(!path || path == '') throw new Error('Video Path is required');
        this.videoPath = path;
    }

    /**
     * @description loads the path provided in constructor
     * @returns {VideoMetadata} Video Information
     */

    async load(){
        this.videoData = await getVideoData(this.videoPath);
        return this;
    }

    /**
     * @returns {Number} Video duration in seconds
     */

    get duration(){
        validateRequest(this);
        return Math.floor(this.videoData.format.duration);
    }

    /**
     * @returns {Number} Video size in bytes
     */

    get size(){
        validateRequest(this);
        return this.videoData.format.size;
    }

    /**
     * @returns {Object} Video resolution in pixles
     */

    get resolution(){
        validateRequest(this);

        let results;
        
        for(const stream of this.videoData.streams){

            if(stream.codec_type == 'video'){
                results = { 
                    width : stream.width,
                    height : stream.height,
                }
                break;
            }

        }

        return results;
    }

}

const validateRequest = (data) =>{
    if(!data.videoData) throw new Error('You need to use `.load()` to load the video first')
}

const getVideoData = (path) => new Promise((resolve , reject)=>{
    ffmpeg.ffprobe(path , (err , videoData) =>{
        if(err) return reject(err);
        resolve(videoData);
    })
})