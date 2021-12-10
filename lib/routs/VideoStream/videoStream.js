const validator = require('../../Validators/validator.js')
const fs = require('fs');

module.exports = (req , res) =>{
    const video_stream_req = validator.video_stream_req(req , res); // Request Validator
    if(!video_stream_req.valid) return;
    const range = video_stream_req.range , id = video_stream_req.id , format = video_stream_req.format , quality = video_stream_req.quality;

    let videoFileName = quality == 'default' ? 'main.mp4' : (quality + '.mp4');

    console.log(range);

  //  const start = Number(range.replace(/\D/g , ''));

    const start = Number(range.split('=')[1].split('-')[0]) // fixx this with REEGEX  TO  ---- |  VERIFY   | ----- RANGE INPUT
    console.log('start' , start)
    const videoPath = `resources/videos/${id}/${videoFileName}`;
    const videoLength = fs.statSync(videoPath).size;
    const CHUNK_SIZE = 10 ** 6;
    const end = Math.min(start + CHUNK_SIZE , videoLength - 1);
    const contentLength = end - start + 1;
    const VIDEO_STREAM = fs.createReadStream(videoPath , {start , end});

    const headers = {
        "Content-Range" : `bytes ${start}-${end}/${videoLength}`,
        "Accept-Ranges" : "bytes",
        "Content-Type" : `video/${format}`,
        "Content-Length" : contentLength
    }

    res.writeHead(206 , headers);
    VIDEO_STREAM.pipe(res);
}