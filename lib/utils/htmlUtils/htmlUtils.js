let htmlFiles = {};
const fs = require('fs');

/**
 * @description laods the html files in server
 */

function loadFiles(){
    
    htmlFiles = {

        video_page : {
            index : fs.readFileSync(__dirname + '/Video/index.html').toString('utf8'),
        },

        upload_page : {
            header : fs.readFileSync(__dirname + '/Upload/header.html').toString('utf8'),
            body : fs.readFileSync(__dirname + '/Upload/body.html').toString('utf8'),
            footer : fs.readFileSync(__dirname + '/Upload/footer.html').toString('utf8'),
        },

        signup_page : {
            index: fs.readFileSync(__dirname + '/Users/signup.html').toString('utf8'),
        },

        signin_page : {
            index: fs.readFileSync(__dirname + '/Users/signin.html').toString('utf8')
        }

    }

}

class htmlUtils {
    
    /**
     * 
     * @param {String} page Page_name
     * @param {Express.Response} res response object
     * @param {Array} keys Page sections
     */

    constructor(page , res , keys = ['header' , 'body' , 'footer']){
        this.keys = keys;
        this.res = res;
        let page_source = htmlFiles[page];
        this.htmlPage = {};
        for(const key of keys) this.htmlPage[key] = page_source[key];
    }

    /**
     * @param {String} title Page title
     * @returns {htmlUtils}
     */

    setTitle(title){
        if(this.htmlPage.header){
            if(this.htmlPage.header.includes('[--TITLE]')) this.htmlPage.header = this.htmlPage.header.replace('[--TITLE]' , title);
        }
        return this;
    }

    /**
     *  @description laods the page in front-end (user-side)
     */

    load(){
        let fullContent = '';
        for(const key of this.keys) fullContent+= this.htmlPage[key];
        this.res.send(fullContent);
    }

}

class video_page extends htmlUtils{

    constructor(res){
        super('video_page' , res , ['index']);
    }

    /**
     * @param {String} id set the video ID
     * @returns {video_page}
     */

    setID(id){
        this.htmlPage.index = this.htmlPage.index.replace('[--VIDEO_ID]' , id)
        return this;
    }

    /**
     * @param {String} URL set the video poster
     * @returns {video_page}
     */

    setPoster(URL){
        this.htmlPage.index = this.htmlPage.index.replace('[--VIDEO_POSTER]' , URL);
        return this;
    }

    setMetadata(data = {id , quality , tsPreview}){
        return this;
    }

}

class upload_page extends htmlUtils{

    constructor(res){
        super('upload_page' , res);
    }

}

class signup_page extends htmlUtils{
    constructor(res){
        super('signup_page' , res , ['index'])
    }
}

class signin_page extends htmlUtils{
    constructor(res){
        super('signin_page' , res , ['index'])
    }
}

module.exports = {

     htmlUtils ,
     video_page ,
     upload_page ,
     signup_page ,
     signin_page ,
     loadFiles ,

};