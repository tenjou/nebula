"use strict";

function dataURItoBlob(dataURI, type) 
{
	var binary = atob(dataURI.split(",")[1]);
	var length = binary.length;
	var array = new Uint8Array(length);

	for(var n = 0; n < length; n++) {
	    array[n] = binary.charCodeAt(n);
	}

	return new Blob([ array ], { type: type });
}

meta.selectElementContents = function(element) 
{
	var range = document.createRange();
	range.selectNodeContents(element);

	var selection = window.getSelection();
	selection.removeAllRanges();
	selection.addRange(range);
};