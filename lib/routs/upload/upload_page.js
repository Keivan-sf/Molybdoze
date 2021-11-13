const { upload_page } = require('../../utils/htmlUtils/htmlUtils.js')
module.exports = (req , res) =>{
    
    new upload_page(res)
    .load();

}