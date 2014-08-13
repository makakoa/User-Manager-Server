// app.js

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');

var app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser());

app.use(express.static(path.join(__dirname, 'bower_components/')));

var userList = [
	{id: 1, name: 'billy'},	
	{id: 2, name: 'joe'},	
	{id: 3, name: 'bob'},	
];

app.get('/', function(req, res) {
	// load db data here
	res.render('index', {
		title: 'User app',
		users: userList
	});
});

app.post('/add', function(req, res) {
	var newUser = req.body.newUser;
	userList.push({
		id: userList.length + 1,
		name: newUser
	});
	
	res.redirect('/');
})

var port = process.env.PORT || 1337;
app.listen(port, function() {
	console.log('ready on port' + port);
});