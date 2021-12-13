module.exports.video_stream_req = (req , res) => {

    const range = req.headers.range , id = req.params.id;
    let quality = req.query.quality

    if(!id){
        res.status(400).send("404!");
        return {valid : false};
    }
    if(!req.headers){
        res.status(400).send("No header had been found!");
        return {valid : false};
    }
    if(!range){
        res.status(400).send("Missing 'range' in headers");
        return {valid : false};
    }
    if(!quality) quality = 'default';

    return {id , range , quality , valid : true};

}

module.exports.video_page_req = (req , res) =>{
    const id = req.params.id;
    if(!id){
        res.send('Main Page Videos')
        return;
    }
    return {id , valid : true};
}

module.exports.video_upload_req = (req , res) =>{
    if(!req.files){
        res.status(400).send('No File')
        return {valid : false};
    }

    const videoFile = req.files.video;
    const name = videoFile.name;

    return {videoFile , name , valid : true}
}


