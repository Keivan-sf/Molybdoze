const bcrypt = require('bcrypt');

/**
 * @description User system auths
 * @param {Express.Request} req 
 * @param {Express.Response} res 
 * @param {String} type 'signup' || 'signin' || ...
 * @param {Function} sqlExecuter
 */

module.exports = async(req , res , type , sqlExecuter) =>{
    switch(type){

        case 'signup':
            await signup(req , res , sqlExecuter);
            break;

        case 'signin':
            await signin(req , res , sqlExecuter);
            break;

    }
    
}

async function signin(req , res , sqlExecuter){
    try{
        const inputs = req.body;
        
        const correctInputs = await sqlExecuter.checkLoginInputs(['email' , inputs.email] , ['password' , inputs.password]);

        if(correctInputs){
            res.status(200).send(`Welcome ${correctInputs.fullname}!`);
        }else{
            res.status(400).send('Wrong E-mail or password\n<a href="#">Forgot password?</a>')
        }
    }catch(err){
        console.log(err)
        res.status(500).send('Internal error')
    }
}

async function signup(req , res , sqlExecuter){

    try{

        const password = req.body['password'];
        const hashedPw = await bcrypt.hash(password , 10)
        const username = req.body['email'].split('@')[0];
        let mysqlResponse;
        try{
            mysqlResponse = await sqlExecuter.addUser({email: req.body['email'] , password : hashedPw , username , fullname : req.body['full-name']}); 
        }catch(err){
            throw new Error(err);
        }
        console.log(mysqlResponse)
        res.status(201).send('Successfully created')

    }catch(err){
        console.log(err);
        res.status(500).send('Internal error')
    }


}