const bcrypt = require('bcrypt');
const { signin_page } = require('../../utils/htmlUtils/htmlUtils');
const users = require('./users');

module.exports = async(req , res , type , users) =>{
    switch(type){

        case 'signup':
            await signup(req , res , users);
            break;

        case 'signin':
            await signin(req , res , users);
            break;

    }
    
}

async function signin(req , res , users){
    try{
        const inputs = req.body;
        const user = users.find(user => user.email === inputs.email);
        if(user == null) return res.status(400).send('User nor found , please chech your inputs again')
        if(await bcrypt.compare(inputs.password , user.password)){
            res.status(200).send(`Welcome ${user.fullname}!`);
        }else{
            res.status(400).send('Wrong E-mail or password\n<a href="#">Forgot password?</a>')
        }
    }catch(err){

        res.status(500).send('Internal error')

    }
}

async function signup(req , res , users){

    try{

        const password = req.body['password'];
        const hashedPw = await bcrypt.hash(password , 10)
        users.push({
            email : req.body['email'],
            password : hashedPw,
            fullname : req.body['full-name'],
        }) 
        console.log(users)
        res.status(201).send('Successfully created')

    }catch(err){

        res.status(500).send('Internal error')

    }


}