
/*
 * GET home page.
 */

// var express = require('express');
// var router = express.Router();

exports.index = function(req, res){
	res.render('index', {
		ctrl_title: 'Cloudeep Project Template'
	});
};

exports.login = function(req, res){
	res.render('login', {
		ctrl_title: 'login page'
	});
};

// router.get('/login', function(req, res, next) {
//   res.render('login', { ctrl_title: 'login page' });
// });
