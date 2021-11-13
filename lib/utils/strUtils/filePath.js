module.exports = class FilePath{

    /**
     * @param {String} path File path
     */

    constructor(path){
        this.path = path;
        this.savedArgs = {};
    }
    
    /**
     * @returns {String} File Format like (mp4 , jpg , ...)
     */


    get format(){
        if(this.savedArgs.format) return this.savedArgs.format;
        this.savedArgs.format = this.path.split('.').pop();
        return this.savedArgs.format;
    }

    /**
     * @returns {String} File main directory 
     */

    get mainPath(){
        if(this.savedArgs.mainPath) return this.savedArgs.mainPath;
        this.savedArgs.mainPath = this.path.split('/');
        this.savedArgs.mainPath.pop();
        this.savedArgs.mainPath = this.savedArgs.mainPath.join('/') + '/';
        return this.savedArgs.mainPath;
    }

    makeNewPathes(names){
        
    }
    
}
