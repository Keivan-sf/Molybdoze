const bcrypt = require('bcrypt');
const users = require('./users');

module.exports = async(req , res , type , users) =>{
    await signup(req , res , users);
}

async function signup(req , res , users){

    try{

        const password = req.body['password'];
        const salt = await bcrypt.genSalt();
        const hashedPw = await bcrypt.hash(password , salt)
        console.log(salt);
        console.log(hashedPw);
        users.push({
            email : req.body['email'],
            password : hashedPw,
            fullname : req.body['full-name'],
        }) 
        console.log(users)
        res.status(150).send('Created but not safe')
        console.log(res)

    }catch(err){

        res.status(500).send('internal err')

    }


}