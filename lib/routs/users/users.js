const bcrypt = require('bcrypt');
let logging = require('./logging.js');
let auth = require('./auth.js');
const tableName = 'users';
const { execute  , queryCreator} = require('../../utils/databaseUtils/sqlutils.js')


class USERS_SQL_UTILS{

    /**
     * @param {String} table Users table name
     */

    constructor(table){
        this.executer = execute;
        this.table = table;
    }

    /**
     * @description inserts a user into sql users table
     * @example {email : "keivan0082@gmail.com", number : 98111111}
     * @param {Object} data key and values for sql
     * @param {String} creationDateKey Column name of the creation date in sql table (leave null if it doesn't have any)
     * @returns sql response
     */

    async addUser(data = {} , creationDateKey = 'JoinDate'){

        if(creationDateKey) {
            data[creationDateKey] = new Date().toISOString().split('T')[0];
        }

        let keyValues = queryCreator(data);

        console.log(`INSERT INTO ${this.table} (${keyValues.keys}) VALUES(${keyValues.values})`)

        try{
            const response = await this.executer(`INSERT INTO ${this.table} (${keyValues.keys}) VALUES(${keyValues.values})`);
            if(!response) throw new Error('Internal sql error #S0)');
            return response;
        }catch(err){
            throw new Error(err)
        }

    }

    
    /**
     * @example 
     * const { USERS_SQL_UTILS } = require('users.js');
     * const userSql = new USERS_SQL_UTILS('users_table');
     * const username = 'userTest';
     * const password = 'non-crypted-Password';
     * const user = await userSql.checkLoginInputs(['USER' , username] , ['password' , password]);
     * if(user){
     *    console.log('Welcome' +  user.fullname + '!');
     * }else{
     *    console.log('Wrong username or password!')
     * }
     * @param {Array} userIdentifier An array of two args => 0 : SQL user or email column name , 1: username or email to be checked
     * @param {*} password An array of two args => 0 : SQL password column name , 1: password to be ckecked
     * @returns null or the user object from sql
     */

    async checkLoginInputs(userIdentifier = ['username' , 'ke1vans'] , password = ['pw' , 'non-crypted-Password']){
        try{
            const userExists = await this.findUser(userIdentifier[0] , userIdentifier[1]);
            if(userExists){
                if(await bcrypt.compare(password[1] , userExists[password[0]])){
                    return userExists;
                }else{
                    return null;
                }
            }else{
                return null;
            }

        }catch(err){
            throw new Error(err);
        }
    }

    /**
     * @description finds a user from sql db
     * @param {String} key sql column name
     * @param {*} value input value to be checked
     * @returns null or user object from sql
     */

    async findUser(key , value){

        if('string' == typeof value) value = `"${value}"`;

        try{
            const response = await this.executer(`SELECT * FROM ${this.table} WHERE ${key} = ${value}`);
            if(response.length > 1) throw new Error('Multiple users found! S1');
            if(response.length < 1) return null;
            return response[0];
        }catch(err){
            throw new Error(err);
        }

    }

}

const USER_AUTH = {

    sqlExecuter : new USERS_SQL_UTILS(tableName),
    
    signin(req , res){
        logging(req , res , 'signin');
    },

    signup(req , res){
        logging(req , res , 'signup');
    },

    signin_auth(req , res){
        auth(req , res , 'signin' , this.sqlExecuter)
    },

    signup_auth(req , res){
        auth(req , res , 'signup' , this.sqlExecuter)
    },

}

// single user calss
class User{

    constructor(userID){

    }

}

module.exports = { USERS_SQL_UTILS , USER_AUTH }