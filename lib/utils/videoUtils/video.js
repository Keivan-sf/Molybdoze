const { insert , execute} = require('../databaseUtils/sqlutils.js')
const table = 'videos' , standardThumbnails = [1080 , 720 ,  480 , 144];
const fs = require('fs');

class Video{

    #savedData = {}

    constructor(data , user){


        let qualities = data.Qualities.split('-');
        qualities.forEach((element , index) => qualities[index] = +element);


        // Below code is the faster way to get thumbnails but you need to be sure every thumbnail is created successfully in the uploading proccess

        /* let thumbnail = standardThumbnails.reduce((acc , res) => {

            const path = `/images/thumbnails/${data.VideoID}/${res}`;

            if(qualities.some(quality => quality === res)) acc.push(res >= 720 ? `${path}HQ.png` : `${path}LQ.png`);

            return acc;

        } , []) */

        let thumbnail = fs.readdirSync(`resources/thumbnails/${data.VideoID}/`).map(name => `/images/thumbnails/${data.VideoID}/${name}`);

        thumbnail.sort((a , b) => {
            const _1 = Number(a.split('/').slice(-1)[0].split('.png')[0].split('Q')[1]);
            const _2 = Number(b.split('/').slice(-1)[0].split('.png')[0].split('Q')[1]);
            return _1 - _2;
        })

        let tspreviewsFiles = fs.readdirSync(`resources/ts-previews/${data.VideoID}`)

        console.log(tspreviewsFiles)

        const tsPreviewsort = (prev , quality) =>
            prev.filter(name => name.startsWith(`${quality}_`))
            .sort((a , b) => {
                const _num1 = Number(a.replace(`${quality}_` , '').replace('.jpg' , ''));
                const _num2 = Number(b.replace(`${quality}_` , '').replace('.jpg' , ''));
                return _num1 - _num2;
            })
            .map(name => `/tspreviews/${data.VideoID}/${name}`)
        
        

        let tsPreviews = {
            low : tsPreviewsort(tspreviewsFiles , 'low'),
            high : tsPreviewsort(tspreviewsFiles , 'high')
        }

        const resolution = (() => {
            let res = data.Dimensions.split('x');
            return {
                width : +res[0],
                height: +res[1],
            }
        })()

        this.#savedData = {
            id : data.VideoID,
            qualities,
            thumbnail,
            likes: data.Likes,
            disLikes: data.Dislikes,
            title: data.Title,
            description : data.Description,
            date: data.VideoDate,
            views: data.Views,
            userID: data.UserID,
            user,
            tsPreviews,
            resolution,
            duration: data.Duration,
            strDuration : convertToTime(data.Duration),
        }

        console.log(this.#savedData);

    }

    get id(){
        return this.#savedData.id;
    }

    /**
     * used to get the video deminsions
     * @returns {{width: Number , height: Number}}
     */

    get resolution(){
        return this.#savedData.resolution;
    }

    /**
     * used to get video available qualities
     * -  the number provided is the height of the resolution
     * @example 
     * const qualities = video.qualities; // [1080 , 720 , 480 , 360 , 240 , 144]
     * @returns {Number[]}
     */

    get qualities(){
        return this.#savedData.qualities;
    }

    /**
     * @returns {String}
     */
    get title(){
        return this.#savedData.title;
    }

    /**
     * @returns {String}
     */
    get description(){
        return this.#savedData.description;
    }

    get date(){
        return this.#savedData.date;
    }

    /**
     * @returns {Number}
     */
    get likes(){
        return this.#savedData.likes;
    }

    /**
     * @returns {Number}
     */
    get disLikes(){
        return this.#savedData.disLikes;
    }

    /**
     * @returns {Number}
     */
    get views(){
        return this.#savedData.views;
    }

    /**
     * Duration in seconds
     * @returns {Number}
     */
    get duration(){
        return this.#savedData.duration;
    }

    /**
     * Duration in `HH:MM:SS` format
     * 
     * the value will include at least __5__ characters  e.g. `00:01`
     * @returns {String}
     */

    get strDuration(){
        return this.#savedData.strDuration;
    }

    get user(){
        return this.#savedData.userID; // user Class
    }

    /**
     * @returns {String[]} thumnails server path
     */

    get thumbnail(){
        return this.#savedData.thumbnail;
    }

    get tsPreviews(){
        return this.#savedData.tsPreviews;
    }
    
    /**
     * Used to modify the likes with the amount provided
     * @param {1} amount 
     * @returns The number of the likes after being modified
     */

    async modifyLikes(amount = 1){
        if(amount + this.#savedData.likes < 0) return;
        const exec = await execute(`UPDATE videos SET Likes = ${this.#savedData.likes + amount} WHERE VideoID = "${this.#savedData.id}"`);
        if(exec && exec.affectedRows === 1) this.#savedData.likes = this.#savedData.likes + amount;
        return this.#savedData.likes;
    }

    /**
     * Used to modify the dislikes with the amount provided
     * @param {1} amount 
     * @returns The number of the dislikes after being modified
     */

    async modifyDislikes(amount = 1){
        if(amount + this.#savedData.disLikes < 0) return;
        const exec = await execute(`UPDATE videos SET Dislikes = ${this.#savedData.disLikes + amount} WHERE VideoID = "${this.#savedData.id}"`);
        if(exec && exec.affectedRows === 1) this.#savedData.disLikes = this.#savedData.disLikes + amount;
        return this.#savedData.disLikes;
    }

    /**
     * Used to modify the views with the amount provided
     * @param {1} amount
     * @returns The number of the views after being modified
     */

    async modifyViews(amount = 1){
        if(amount + this.#savedData.views < 0) return;
        const exec = await execute(`UPDATE videos SET Views = ${this.#savedData.views + amount} WHERE VideoID = "${this.#savedData.id}"`);
        if(exec && exec.affectedRows === 1) this.#savedData.views = this.#savedData.views + amount;
        return this.#savedData.views;
    }

    /**
     * Used to edit the video title and description
     * @param {{title: String , description: String}} data 
     */

    async editInfo(data = {title , description}){
        // include editing modification
    }

}

const Videos = {

    async insertVideo(data={} , creationDate){
        try{
            const results = await insert(table , data , creationDate);
            return results;
        }catch(err){
            console.log(typeof err)
            throw new Error(`#S1 , Internal SQL error made while adding a new video , SQL response: ${err}`);
        }
    },

    async fetch(VideoID){
        console.log(`SELECT * FROM ${table} WHERE VideoID = "${VideoID}"`)
        const videoDb = await execute(`SELECT * FROM ${table} WHERE VideoID = "${VideoID}"`);
        if(videoDb.length < 1) throw new Error('No video found #V01');
        return new Video(videoDb[0]);
    }

}

/**
* converts seconds to `HH:MM:SS` format
* 
* the returned string will include at least __5__ characters  e.g. `00:01`
* 
* the senonds parameter must be less than `86,400` *(24 hours)*
* @param {Number} seconds 
* @returns {String} HH:MM:SS
*/

const convertToTime = seconds => {

    if(seconds >= 86400) throw new Error("the senonds parameter must be less than 86,400 (24 hours)")

    let date = new Date(null);
    date.setSeconds(seconds);
    let dateValue = date.toISOString().substr(11 , 8);

    dateValue = dateValue.split('');

    while(dateValue[0] == '0' || dateValue[0] == ':') dateValue.shift();

    dateValue = dateValue.join('');

    if(dateValue.length < 1) dateValue = "0";

    if(dateValue.length < 2) dateValue = "0" + dateValue;

    if(dateValue.length < 3){
        dateValue = "00:" + dateValue;
    }

    return dateValue;
}

module.exports = { Videos  , convertToTime}