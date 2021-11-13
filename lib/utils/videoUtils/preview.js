const ffmpeg = require('fluent-ffmpeg');
const FilePath = require('../strUtils/filePath.js');
const metaData = require('./metadata.js');
const { Qualities } = require('./utils.js')
const fs = require('fs');
const chikidar = require('chokidar')
const sharp = require('sharp');
const { error } = require('console');

/**
 * @description creates thumbnails based on the required resolutions
 * @param {String} mainVideoFile main file path
 * @param {Qualities.videoQualities} videoQualities video qualities object
 * @param {Array} thumbnailQualities required thumbnail qualities
 * @param {Number} screenshotTime screenshot time for thumbnail creation in seconds
 * @returns 
 */

module.exports.createThumbnails = async(videoID , mainVideoFile , videoQualities , thumbnailQualities , screenshotTime) => new Promise(async (resolve , reject)=>{

    let videoRatio = videoQualities.main.width / videoQualities.main.height;

    videoRatio = Math.round(videoRatio * 1000) / 1000;

    const mainPath = `./resources/thumbnails/${videoID}/`;

    const path = new FilePath(mainVideoFile);

    const highLow = (number) => number >= 720 ? 'HQ' : 'LQ';

    const standardRes = (resolution) => {

        if(resolution == videoQualities.main.height) return true;

        for(const standard of videoQualities.standards){
            if(resolution == standard){
                return true;
            }
        }

        return false;

    }

    thumbnailQualities = thumbnailQualities.filter(standardRes)
    thumbnailQualities.sort((a , b) => b - a); // Sort numbers in reverse

    let createdThumbNails = [];

    for(const quality of thumbnailQualities){

        try{

            let foundQuality;

            videoQualities.standards.forEach(standard => {
    
                if(standard == quality) foundQuality = standard;
    
            })
    
            if(foundQuality){
                await screenshot(foundQuality)
            }else{
                await screenshot(videoQualities)
            }

        }catch(err){

            return reject(err);

        }

    }

    resolve(createdThumbNails);

    async function screenshot(outputResolution){

        let videoFile , name;

        let resolutionForShot;

        if(outputResolution.main){

            videoFile = `${path.mainPath}main.${path.format}`;

            name = `${highLow(outputResolution.main.height) + 'default'}.png`;

            resolutionForShot = outputResolution.main.height;

        }else{

            videoFile = `${path.mainPath + outputResolution}p.${path.format}`;

            name = `${highLow(outputResolution) + outputResolution}.png`;

            resolutionForShot = outputResolution;

        }
        
        let screenshot;

        if(createdThumbNails.length > 0){

        await sharp(mainPath + createdThumbNails[createdThumbNails.length - 1])
                .resize(Math.round(videoRatio * resolutionForShot) , resolutionForShot , {fit: 'fill'})
                .toFile(mainPath + name)

        return;
        
        }

        screenshot = await saveThumbnail(videoFile , mainPath , screenshotTime);

        fs.renameSync(mainPath +  screenshot[0] , mainPath + name);

        createdThumbNails.push(name);

    }


})

const saveThumbnail = (input , screenshotPath , time) => new Promise((resolve , reject) => {

    try{
        let screenshot = ffmpeg(input).takeScreenshots(
            {
                count : 1,
                timemarks: [time.toString()]
            },
            screenshotPath
            )
        
        if(!screenshot) reject('Error creating screenshot')

        const screenFile = chikidar.watch(screenshotPath);

        screenFile.on('all' , (event , filename) =>{
            screenFile.removeAllListeners('all');
            sleep(2000).then(() => {resolve(fs.readdirSync(screenshotPath))});
        })

    }catch(err){
        reject(err);
    }

})



/**
 * @param {String} input Video file path
 * @param {String} output Output preview file path
 * @param {metaData} videoMetaData Output preview file path
 * @param {Number} durationInSeconds Preview Duration in seconds
 * @returns {ffmpeg}
 */


 module.exports.createPreview = (input , output, videoMetaData ,  durationInSeconds) => new Promise(async(resolve , reject) => {

    const videoDurationInSeconds = videoMetaData.duration;

    const startPoint = getRandomStartPoint(videoDurationInSeconds , durationInSeconds);

    ffmpeg()
    .input(input)
    .inputOptions([`-ss ${startPoint}`])
    .outputOptions([`-t ${durationInSeconds}`])
    .output(output)
    .noAudio()
    .on('end' , () => resolve(startPoint))
    .on('error' , (err) => reject(err))
    .run();


})


/**
 * 
 * @param {Number} videoDuration Video full duration
 * @param {Number} fragmentDuration Preview Duration
 * @returns {Number} Random number for preview
 */

const getRandomStartPoint = (videoDuration , fragmentDuration) => {

    let limits = {
        start : videoDuration * 0.25,
        end : videoDuration * 0.75
    }
    const fullTime = limits.end - limits.start , safeStartTime = fullTime - fragmentDuration;

    if(fragmentDuration >= fullTime) return 0;

    const randomStartPoint = Math.floor(Math.random() * safeStartTime);

    return parseInt(limits.start + randomStartPoint);

}

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve , ms))