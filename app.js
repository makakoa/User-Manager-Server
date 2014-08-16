var express = require('express');
var app = express();
app.use(express.bodyParser());
var nohm = require('nohm').Nohm;


if (process.env.REDISTOGO_URL) {
  
  var rtg   = require("url").parse(process.env.REDISTOGO_URL);
  var redis = require("redis").createClient(rtg.port, rtg.hostname);

  redis.auth(rtg.auth.split(":")[1]);
} else {
  var redis = require("redis").createClient();
}

nohm.setClient(redis);


var User = nohm.model('User', {
	properties: {
		firstName: {
			type: 'string',
		},
		lastName: {
			type: 'string',
		},
		email: {
			type: 'string',
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
}

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
}

var updateUser = function(req, res) {
	var user = new User();
	user.id = req.params.id;
	user.p(req.body);
	user.save(function(err) {
		res.send(user.allProperties(true));
	});
}

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
	res.header("Content-Type", "application/json");
	next();
});

app.get('/users', listUsers);
app.get('/users/:id', userDetails);
app.post('/users', createUser);
app.put('/users/:id', updateUser);
app.del('/users/:id', deleteUser);


var port = process.env.PORT || 1337;
app.listen(port, function() {
	console.log('ready on port' + port);
});