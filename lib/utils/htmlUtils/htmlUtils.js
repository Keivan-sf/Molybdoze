let htmlFiles = {};
const fs = require('fs');

function loadFiles(){
    
    htmlFiles = {

        video_page : {
            header : fs.readFileSync(__dirname + '/Video/header.html').toString('utf8'),
            body : fs.readFileSync(__dirname + '/Video/body.html').toString('utf8'),
            footer : fs.readFileSync(__dirname + '/Video/footer.html').toString('utf8'),
        },

        upload_page : {
            header : fs.readFileSync(__dirname + '/Upload/header.html').toString('utf8'),
            body : fs.readFileSync(__dirname + '/Upload/body.html').toString('utf8'),
            footer : fs.readFileSync(__dirname + '/Upload/footer.html').toString('utf8'),
        },

        signup_page : {
            index: fs.readFileSync(__dirname + '/Users/signup.html').toString('utf8'),
        },

    }

}

class htmlUtils {
    
    constructor(page , res , keys = ['header' , 'body' , 'footer']){
        this.keys = keys;
        this.res = res;
        let page_source = htmlFiles[page];
        this.htmlPage = {};
        for(const key of keys) this.htmlPage[key] = page_source[key];
    }

    setTitle(title){
        this.htmlPage.header = this.htmlPage.header.replace('[--TITLE]' , title)
        return this;
    }

    load(){
        let fullContent = '';
        for(const key of this.keys) fullContent+= this.htmlPage[key];
        this.res.send(fullContent);
    }

}

class video_page extends htmlUtils{

    constructor(res){
        super('video_page' , res);
    }

    setID(id){
        this.htmlPage.body = this.htmlPage.body.replace('[--VIDEO_ID]' , id)
        return this;
    }

    setPoster(URL){
        this.htmlPage.body = this.htmlPage.body.replace('[--VIDEO_POSTER]' , URL);
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

module.exports = { htmlUtils , signup_page , video_page , upload_page , loadFiles };