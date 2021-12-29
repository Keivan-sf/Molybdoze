const fs = require('fs');

const files = [
    './resources/videos' ,
    './resources/ts-previews' ,
    './resources/thumbnails' ,
]
    
/**
 * Used to validate files
 */

module.exports = () =>{

    for(const path of files){

        console.log(path)

        if(!fs.existsSync(path)){
            fs.mkdirSync(path)
        }

    }
    
}
