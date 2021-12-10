const express = require('express');
const app = express();
const PORT = 3500;
const { loadFiles } = require('./lib/utils/htmlUtils/htmlUtils.js');
const { runSqlPool , createTables } = require('./lib/utils/databaseUtils/sqlutils.js');
let modifyTables = true;

loadFiles();
runSqlPool();

require('./lib/routs/routing.js')(express , app);

app.listen(PORT , ()=>{
    console.log(`Started on port ${PORT}`);
})

//modify();

async function modify(){
    if(!modifyTables) return;
    await createTables();
    console.log('here');
}
