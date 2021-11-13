let logging = require('./logging.js');
let auth = require('./auth.js');

class Users{

    /**
     * @description Load user system
     * @param {Function} sqlExecuter Sql query executer function
     * @param {String} dataBase database name
     */

    constructor(sqlExecuter , dataBase){
        this.sqlExecuter = new USERS_SQL_UTILS(sqlExecuter , dataBase)
    }

    signin(req , res){
        logging(req , res , 'signin');
    }

    signout(req , res){
        logging(req , res , 'signout' , this.sqlExecuter);
    }

    signup(req , res){
        logging(req , res , 'signup');
    }

    signin_auth(req , res){
        auth(req , res , 'signin' , this.sqlExecuter)
    }

    signout_auth(req , res){

    }

    signup_auth(req , res){
        auth(req , res , 'signup' , this.sqlExecuter)
    }

}

class USERS_SQL_UTILS{

    /**
     * @param {Function} executer An sql executer
     * @param {String} dbname Users database name
     */

    constructor(executer , dbname){
        this.executer = executer;
        this.dbname = dbname;
    }

    /**
     * 
     * @param {Object} data key and values for sql
     * @param {String} creationDateKey Column name of the creation date in sql table (leave empty if it doesn't have any)
     * @returns sql response
     */

    async addUser(data = {email , password , username} , creationDateKey){
        let columns = [] , values = [];

        for(const key in data){
            columns.push(key);
            values.push(`\"${data[key]}\"`);
        }

        columns.join(', ');
        values.join(', ');

        console.log(`INSERT INTO ${this.dbname} (${columns}) VALUES(${values})`)

        try{
            const response = await this.executer(`INSERT INTO ${this.dbname} (${columns}) VALUES(${values})`);
            if(!response) throw new Error('Internal sql error #0)');
            return response;
        }catch(err){
            throw new Error(err)
        }

    }
}

module.exports = { Users }