const sql = require('mysql')

let sqlPool;

function runSqlPool(config = {connectionLimit: 10, host: 'localhost', user: 'root', password: '', database: 'molybdoze-db'}){

    sqlPool = sql.createPool(config);
    
}

function execute(query){

    if(!sqlPool){
        runSqlPool();
        if(!sqlPool) throw new Error("Can't setup sql with the defualt config, please use 'runSqlPool(config)' before the 'execute()' function");
    }

    return new Promise(async(resolve , reject)=>{

        sqlPool.getConnection((err , connection)=>{

            if(err) return reject(err);

            connection.query(query , (error , results) =>{
                if(err) return reject(error);
                resolve(results);
            })
            
        })

    })

}


module.exports = { runSqlPool , execute };