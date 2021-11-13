const { video_page } = require('../../utils/htmlUtils/htmlUtils.js');
const { video_page_req } = require('../../Validators/validator.js')
const fs = require('fs');
module.exports = (req , res) =>{

    let values = video_page_req(req , res)
    if(!values.valid) return;
    


    let qualities = fs.readdirSync(`resources/videos/${values.id}/`);
    let thumbnails = fs.readdirSync(`resources/thumbnails/${values.id}/`);

    new video_page(res)
    .setTitle(values.id)
    .setID(values.id)
    .setPoster(`/images/thumbnails/${values.id}/${thumbnails[0]}`)
    .load();
}
