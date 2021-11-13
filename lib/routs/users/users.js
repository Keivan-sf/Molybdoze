const { signup_page } = require('../../utils/htmlUtils/htmlUtils.js')

module.exports = (req , res , type) =>{
    switch(type){
        case 'signup' :
            
            new signup_page(res)
            .load();

            break;
    }

}