const metaData = require('./metadata.js');
const ffmpeg = require('fluent-ffmpeg');

/**
 * @description builds different qualities of the video
 * @param {String} mainPath video file path
 * @param {metaData} metaData video metadata
 * @returns {Object}  {standards : [created qualities] , main : main resolution , match : standard resolution matching with main resolution}
 */

const createQualities = async (mainPath , metaData) => {

    const mainResolution = metaData.resolution;
    let videoQualities = fetchVideoQualities(mainResolution);
    let folder = mainPath.split('/');
    folder.splice(-1 , 1)
    folder = folder.join('/');
    let format = mainPath.split('.');
    format = format[format.length - 1];

    return await saveQualities({mainPath , folder , format} , videoQualities)
    

}

const saveQualities = async(path = {mainPath , folder , format} , videoQualities) =>{

    let ratio = Math.round(videoQualities.main.width / videoQualities.main.height * 1000) / 1000;
    let loadPath = path.mainPath;

  //  await saveUniqeQualityFile(loadPath , (path.folder + 'main.mp4'));

    for(const height of videoQualities.standards){
        let newPath = `${path.folder}/${height}p.mp4`;
        await saveUniqeQualityFile(loadPath, newPath, `${Math.round(ratio * height)}x${height}`);
        loadPath = newPath;
    }
    
    return videoQualities;

}


const saveUniqeQualityFile = (input , output , size) => new Promise((resolve , reject)=>{

    ffmpeg()
    .input(input)
    .output(output)
    .videoCodec('libx264')
    .size(size)
    .on('error' , err => reject(err))
    .on('progress' , progress => console.log(`Frames : ${progress.frames}`))
    .on('end' , () => resolve(`Finished ${size}`))
    .run();

})

const fetchVideoQualities = (res) =>{

    let qualitiesNeeded = [];

    let standardResolutions = [
        1080 , 720 , 480 , 360 , 240 , 144
    ]

    let videoMainQuality = res.height , standardMatch;

    for(const resolution of standardResolutions){

        if(resolution == videoMainQuality){

            qualitiesNeeded = [] , standardMatch = resolution;
            
            for(const quality of standardResolutions) if(quality < videoMainQuality) qualitiesNeeded.push(quality);

            break;

        }else if(resolution < videoMainQuality){
            qualitiesNeeded.push(resolution);
        }

    }

    let obj = {
        standards : qualitiesNeeded , 
        main : res , 
        match : standardMatch
    }

    const results = new videoQualities(obj);

    return results;
}

class videoQualities{

    /**
     * @description Creates a object containing video qualities info
     * @param {Object} obj 
     */

    constructor(obj){
        this.obj = obj;
    }

    /**
     * @returns {Int32Array} created standard qualities in numbers
     * @example [480 , 360 , 240 , 144]
     */

    get standards() {
        return this.obj.standards;
    }

    /**
     * @returns {Object} main resolution
     * @example {width : 1920 , height : 1080}
     */

    get main() {
        return this.obj.main;
    }

    /**
     * @returns {Number} matched resolution
     */

    get match() {
        return this.obj.match;
    }
}

module.exports = {videoQualities , createQualities}