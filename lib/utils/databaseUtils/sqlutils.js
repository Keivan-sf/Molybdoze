const sql = require("mysql");

let sqlPool;

function runSqlPool(
  config = {
    connectionLimit: 10,
    host: "localhost",
    user: "root",
    password: "",
    database: "molybdoze-db",
  }
) {
  sqlPool = sql.createPool(config);
}

async function createTables() {
  // await execute(`CREATE TABLE videos(VideoID VARCHAR(12), UserID VARCHAR(40), Title VARCHAR(255), Description TEXT, Likes BIGINT, Dislikes BIGINT, Views BIGINT, Dimensions VARCHAR(10), Qualities VARCHAR(55), VideoDate DATE)`)
  // await execute(`CREATE TABLE Users(UserID VARCHAR(30), Username VARCHAR(40), Email VARCHAR(254), Password VARCHAR(60), Fullname varchar(100), JoinDate DATE)`)
}
/**
 * @description Executes a query in your sql database
 * @param {String} query sql query
 * @returns Sql response
 */

function execute(query) {
  if (!sqlPool) {
    runSqlPool();
    if (!sqlPool)
      throw new Error(
        "Can't setup sql with the defualt config, please use 'runSqlPool(config)' before the 'execute()' function"
      );
  }

  return new Promise(async (resolve, reject) => {
    sqlPool.getConnection((err, connection) => {
      if (err) {
        try {
          connection.release();
        } catch (e) {
          console.error(e);
        }
        return reject(err);
      }

      connection.query(query, (error, results) => {
        try {
          connection.release();
        } catch (e) {
          console.error(e);
        }
        if (error) return reject(error);
        resolve(results);
      });
    });
  });
}

/**
 * Used to get keys and values in a row for the sql query
 * @example
 * const query = queryCreator({email : "keyvan0082@gmail.com" , number : 98000000});
 * console.log(query) // sql query to insert
 * @param {Object} data data in json, note that __a value cannot contain a object itself__ as sql works with rows & columns
 * @returns {{keys: String , values: String}}
 */

function queryCreator(data) {
  let keys = [],
    values = [];

  for (const key in data) {
    keys.push(key);

    if ("string" != typeof data[key]) {
      values.push(`${data[key]}`);
      continue;
    }

    values.push(`\"${data[key]}\"`);
  }

  const joinedKeys = keys.join(", ");
  const joinedValues = values.join(", ");

  return { keys: joinedKeys, values: joinedValues };
}

/**
 * Used to insert json data into sql tables
 * @param {String} table table name
 * @param {Object} data data in json, note that __a value cannot contain a object itself__ as sql works with rows & columns
 * @param {String} [dateName] date column name. if included, Todays date will be inserted in this column
 * @returns Sql response / error
 */

async function insert(table, data, dateName) {
  if (dateName) {
    data[dateName] = new Date().toISOString().split("T")[0];
  }

  let keyValues = queryCreator(data);

  console.log(
    `INSERT INTO ${table} (${keyValues.keys}) VALUES(${keyValues.values})`
  );

  try {
    const response = await execute(
      `INSERT INTO ${table} (${keyValues.keys}) VALUES(${keyValues.values})`
    );
    if (!response) throw new Error("Internal sql error #S0)");
    return response;
  } catch (err) {
    throw new Error(err);
  }
}

module.exports = { runSqlPool, execute, insert, queryCreator, createTables };
