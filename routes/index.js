
/*
 * GET home page.
 */

exports.index = function(req, res){
	res.render('index', {
		ctrl_title: 'Cloudeep Project Template'
	});
};
