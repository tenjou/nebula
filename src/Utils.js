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
