// Neil_20150603: Modify origin to naturalWidth and naturalHeight, and add fadeIn()
// Neil_20121129: Fit, scale, and crop image into a DIV.
function fitImageEvent(event) {
	var img = (event.currentTarget) ? event.currentTarget : event.srcElement;
	fitImage(img);
}
function fitImage(img) {
	if (!img || typeof($(img).attr('src'))=='undefined')
		return;

	var wParent = $(img).parent().width();
	var hParent = $(img).parent().height();
	var ratioParent = wParent / hParent;

	var w = $(img)[0].naturalWidth;
	var h = $(img)[0].naturalHeight;
	var ratio = w / h;

	var wResult, hResult;
	if (ratio > ratioParent) {
		wResult = Math.floor(ratio * hParent);
		hResult = hParent;			
	}
	else {
		wResult = wParent;
		hResult = Math.floor(wParent / ratio);
	}

	// var top = 0;
	var top = Math.floor((hParent - hResult) / 2);
	var left = Math.floor((wParent - wResult) / 2);

	$(img)
	.css({
		'position':'relative',
		'width': wResult+'px',
		'height': hResult+'px',
		'left': left+'px',
		'top': top+'px'
	})
	.fadeIn()
	;
}
