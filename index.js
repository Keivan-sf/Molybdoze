const express = require('express');
const app = express();
const PORT = 3500;
const { loadFiles } = require('./lib/utils/htmlUtils/htmlUtils.js');
loadFiles();

// app.use(express.json)

require('./lib/routs/routing.js')(express , app);

app.listen(PORT , ()=>{
    console.log(`Started on port ${PORT}`)
})