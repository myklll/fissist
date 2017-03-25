
require('dotenv').load();

var express = require('express');
var path  = require('path');

var bodyParser = require('body-parser');
var verify = require('./security'); //Facebook Security -- Ensuring messages came form facebook

var index = require('./routes/index'); //Help for mapping index page and views
var conversation = require('./routes/conversation'); //Helps for mapping conversations with our bot


var app = express();

//Setting up the view Engine
app.set("views", path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

app.use(express.static(path.join(__dirname, 'public'))); //HTML files are loaded in the public directory
app.use(bodyParser.json({
  verify: verify
}));
app.use(bodyParser.urlencoded({extended : false })); //Encode url -- strict


app.use('/', index);
app.use('/api/conversation/', conversation); //Set API endpoint for conversation


var port = process.env.PORT || process.env.VCAP_APP_PORT || 5000;
app.set('port', port);

require('./app')(app);

// Listen on the specified port
app.listen(port, function() {
  console.log('Application Started on port %d', port);
});
