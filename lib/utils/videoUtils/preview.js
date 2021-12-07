const ffmpeg = require('fluent-ffmpeg');
const FilePath = require('../strUtils/filePath.js');
const metaData = require('./metadata.js');
const { Qualities } = require('./utils.js')
const fs = require('fs');
const chikidar = require('chokidar')
const sharp = require('sharp');
const { createCanvas, loadImage } = require('canvas');
const gm = require('gm').subClass({imageMagick: true});;
const { METHODS } = require('http');
const { BitDepth } = require('image-js');


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



module.exports.createTsPreview = (videoID , mainFile , metaData , qualities) => new Promise(async(resolve , reject)=>{

    const qualitesReversed = qualities.standards.sort((a , b) => a - b);
    const lowestQuality = qualitesReversed[0] === qualities.main ? 'main' : qualitesReversed[0];
    const main = new FilePath(mainFile);
    const videoFile = `${main.mainPath + lowestQuality}p.${main.format}`;
    const screenPath = `./resources/tsPreviews/${videoID}`;
    fs.mkdirSync(screenPath);

    const duration = metaData.duration;
    let screenshotPoints = [];
    const tr = duration < 2000 ? (duration > 200 ? Math.floor(duration/200) : 1) : 10;
    
    for(let progress = 0; progress < duration;){
        screenshotPoints.push(progress.toString())
        progress += tr;
    }


    let shotsTaken = await takeShots(videoFile , screenPath , screenshotPoints);
  //  console.log('Status: ' + shotsTaken) // need betted

    let compined = await combineTsShots(screenPath , screenshotPoints.length , metaData.resolution);

    resolve({lowAddress : [] , highAddresses: []});

})

/**
 * Used to combine taken screen shots of the video for timestamo preview
 * @param {String} path screenshots path
 * @param {Number} frameCounts Number of the screenshots
 * @param {{width:Number , height:Number}} resolution 
 * @returns {{low:String[] , High:String[]}} A list of high and low resolution combined frames file names
 */

const combineTsShots = (path , frameCounts , resolution) => new Promise(async(resolve , reject) => {

    let res = {};

    res['low'] = await generateTs(45 , 10 , 'low');

    res['high'] = await generateTs(90 , 5 , 'high');

    resolve(res);

    async function generateTs(h , rows , name){

        const ratio = resolution.width / resolution.height;
        let lowPictureCount = 1;
    
        const lowFrame = {
            width : Math.round(h * ratio),
            height : h
        }
    
        const lowPreview = {
    
            width: lowFrame.width * rows,
    
            height : (function(){
    
                const devided = frameCounts / rows;
                let height = 0;
    
                if(devided === Math.floor(devided)){
    
                    height = devided * h;
    
                }else{ 
    
                    height = (Math.floor(devided) + 1) * h;
    
                }
    
                if(height > h * rows){
    
                    const hDevided = height / (h * rows);
    
                    if(hDevided === Math.floor(hDevided)){
    
                        lowPictureCount = hDevided;
    
                    }else{
    
                        lowPictureCount = Math.floor(height / (h * rows)) + 1;
    
                    }
                    return h * rows;
    
                }else{
    
                    return height;
    
                }
               
            })(),
    
        }
    
    
    
        const allFrames = fs.readdirSync(path);
    
        let lowCanvases = [];
    
        for(let i=0; i < lowPictureCount; i++){
            lowCanvases.push(
                (function(){
                    let lqCanvas = createCanvas(lowPreview.width , lowPreview.height);
                    let lqctx = lqCanvas.getContext('2d');
                    lqctx.fillStyle = '#000';
                    lqctx.fillRect(0,0, lowPreview.width , lowPreview.height)
                    return { 
                        canvas : lqCanvas ,
                        ctx : lqctx
                    }
                })()
            );
        }
    
    
        const lowQuality = createCanvas(lowPreview.width , lowPreview.height);
        const lowctx = lowQuality.getContext('2d');
        
        lowctx.fillStyle = '#000';
        lowctx.fillRect(0,0, lowPreview.width , lowPreview.height)
    
        let bufferedOutput = 0;
    
        for(let i=1; i<= frameCounts; i++){
    
            if(!allFrames.some( frame => frame === `tn_${i}.png` )) return;

            let leftOffset = (i-1)%rows * lowFrame.width;
            
            let topOffset = parseInt((i-1) / rows) * lowFrame.height;
    
            const framePic = await loadImage(path + `/tn_${i}.png`);
    
            let targetCanvas = lowCanvases[0];
    

            if(i >= rows*rows){
                
                if(i%(rows*rows) === 0){
                    
                    const targetNumber = (i / (rows*rows)) -1;
                    
                    topOffset = topOffset - (targetNumber * h * rows);
    
                    targetCanvas = lowCanvases[targetNumber];
    
                    targetCanvas.ctx.drawImage(framePic , leftOffset , topOffset, lowFrame.width , lowFrame.height);
                    const lowFinalBuffer = targetCanvas.canvas.toBuffer();
    
                    bufferedOutput++;
    
                    sharp(lowFinalBuffer)
                    .toFile(path + `/${name}_${targetNumber}.jpg` , (err , info)=>{
                        if(!err) return resolve(info);
                        reject(err);
                    })
    
                }else{
                    const targetNumber = Math.floor(i / (rows*rows));
    
                    topOffset = topOffset - (targetNumber * h * rows);
    
                    targetCanvas = lowCanvases[targetNumber];
                    targetCanvas.ctx.drawImage(framePic , leftOffset , topOffset, lowFrame.width , lowFrame.height);
                }
    
            }else{
                targetCanvas.ctx.drawImage(framePic , leftOffset , topOffset, lowFrame.width , lowFrame.height);
            }
            
            console.log(lowCanvases)
        }
    
        if(bufferedOutput < lowCanvases.length){
            
            const targetNumber = lowCanvases.length - 1;
            console.log(`Lowcanvas-last-key : ${ lowCanvases.length - 1} , TargetNumber : ${targetNumber}`)
            const lowFinalBuffer = lowCanvases[targetNumber].canvas.toBuffer();
    
            await new Promise((resolve , reject)=>{
    
                sharp(lowFinalBuffer)
                .toFile(path + `/${name}_${targetNumber}.jpg` , (err , info)=>{
                    if(!err) return resolve(info);
                    reject(err);
                })
        
            })
    
        }

        resolve({low : [] , high: []})
    }

    
})


/**
 * @description used to take multiple screen shots in different points of time of a video file
 * @example
 * takeShots('./video.mp4' , './screenshots/' , ['1' , '3' , '4'])
 * .then(status => {
 *      console.log(status)
 * })
 * .catch(err => {
 *      console.log(err)
 * })
 * @param {String} videoFile video file address
 * @param {String} screenPath screenshots target folder
 * @param {String[]} screenshotPoints an array of points of time in seconds to take screenshots of
 * @returns A promise to be resolved when all screen shots are taken or to be rejected if there's any error
 */

const takeShots = (videoFile , screenPath , screenshotPoints) => new Promise((resolve , reject)=> {

    const screenshotsCount = screenshotPoints.length;

    ffmpeg(videoFile).takeScreenshots(
        {
            count : 1,
            timemarks: screenshotPoints
        },
        screenPath
    )


    const screenFiles = chikidar.watch(screenPath);

    screenFiles.on('all' , (event , path) =>{
        let files = fs.readdirSync(screenPath);

        if(files.length === screenshotsCount){
            console.log(true , files)
            screenFiles.removeAllListeners('all');
            return resolve('Done');
        }

    })

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

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve , ms))