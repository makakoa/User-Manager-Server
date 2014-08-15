// app.js

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var nohm = require('nohm').Nohm;

var app = express();

//app.set('view engine', 'ejs');
//app.set('views', path.join(__dirname, 'views'));
app.use(bodyParser());

// path set to bower components
//app.use(express.static(path.join(__dirname, 'bower_components/')));

/*
var userList = [
	{id: 1, firstName: 'Cam', lastName: 'Yee', email: 'makakoa57@gmail.com'}	
];

app.get('/', function(req, res) {
	// load db data here
	res.render('index', {
		title: 'User Manager',
		users: userList
	});
});

app.post('/add', function(req, res) {
	var newUser = req.body.newUser;
	var userLast = req.body.userLastName;
	var userEmail = req.body.userEmail;
	userList.push({
		id: userList.length + 1,
		firstName: newUser,
		lastName: userLast,
		email: userEmail
	});
	
	res.redirect('/');
})
*/




// redis url: redis://redistogo:24fbdf461f5cbfb355a43a2360a2a394@hoki.redistogo.com:10124 or process.env.RESDISTOGO_URL
// for use: https://devcenter.heroku.com/articles/redistogo
if ('process.env.RESDISTOGO_URL') {
  
  var rtg   = require("url").parse('process.env.RESDISTOGO_URL');
  var redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

nohm.setClient(redis);


//backbone code starts here
// comment out backbone for TS - no change

var User = nohm.model('User', {
	properties: {
		firstName: {
			type: 'string',
		},
		lastName: {
			type: 'string',
		},
		email: {
			type: 'string'
		}
	}
});

var listUsers = function(req,res) {
	User.find(function (err, ids) {
		var users= [];
		var length = ids.length;
		var count = 0;
		console.log(ids, 'ids');
		if(length === 0) {
			res.send([]);
		} else {
			ids.forEach(function(id) {
				var user = new User();
				user.load(id, function(err, props) {
					users.push({id: this.id, firstName: props.firstName, lastName: props.lastName, email: props.email});
					if(++count === length) {
						res.send(users);
					}
				});
			});
		}
	});
};

var userDetails = function(req, res) {
	User.load(req.params.id, function(err, properties) {
		if(err) {
			res.send(404);
		} else {
			res.send(properties);
		}
	});
};


var createUser = function(req, res) {
	var user = new User();
	user.p(req.body);
	user.save(function(err) {
		res.send(user.allProperties(true));
	});
};

var updateUser = function(req, res) {
	var user = new User();
	user.id = req.params.id;
	user.p(req.body);
	user.save(function(err) {
		res.send(user.allProperties(true));
	});
};

var deleteUser = function(req, res) {
	var user = new User();
	user.id = req.params.id;
	user.remove(function(err) {
		res.send(204);
	});
}


app.all('*', function(req, res, next) {
	res.header("Access-Control-Allow-Origin", "*");
	res.header("Access-Control-Allow-Headers", "X-Requested-With");
	res.header("Access-Control-Allow-Headers", "Content-Type");
	res.header("Content-Type", "application/json");
	next();
});

app.get('/users', listUsers);
app.get('/users/:id', userDetails);
app.post('/users', createUser);
app.put('/users/:id', updateUser);
app.delete('/users/:id', deleteUser);

//and ends here */



var port = process.env.PORT || 1337;
app.listen(port, function() {
	console.log('ready on port' + port);
});