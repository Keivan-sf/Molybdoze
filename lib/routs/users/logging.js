const { signup_page  , signin_page} = require('../../utils/htmlUtils/htmlUtils.js')

/**
 * @description
 * @param {*} req 
 * @param {*} res 
 * @param {*} type 
 */

module.exports = (req , res , type) =>{
    switch(type){

        case 'signup':
            
            new signup_page(res)
            .load();

            break;
        
        case 'signin':

            new signin_page(res)
            .load();

            break;

    }

}