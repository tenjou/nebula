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

meta.mergeObjects = function(a, b)
{
	var output = {};

	for(var key in a) {
		output[key] = a[key];
	}

	meta.mergeAppend(output, b);

	return output;
};

meta.appendObject = function(target, src)
{
	var value, targetValue;
	for(var key in src)
	{
		if(src.hasOwnProperty(key))
		{
			value = src[key];
			if(typeof(value) === "object")
			{
				targetValue = target[key];

				if(!targetValue)
				{
					if(value instanceof Array) {
						targetValue = [].concat(value);
					}
					else {
						targetValue = {};
						meta.appendObject(targetValue, value);
					}

					target[key] = targetValue;
				}
				else if(typeof(targetValue) === "object")
				{
					if(value instanceof Array)
					{
						if(targetValue instanceof Array) {
							target[key] = targetValue.concat(value);
						}
						else {
							console.warn("(meta.mergeAppend) Incompatible types for '" + key + "' key");
						}
					}
					else
					{
						if(targetValue instanceof Array) {
							console.warn("(meta.mergeAppend) Incompatible types for '" + key + "' key");
						}
						else {
							meta.appendObject(targetValue, value);
						}
					}
				}
				else {
					console.warn("(meta.mergeAppend) Incompatible types for '" + key + "' key");
				}
			}
			else {
				target[key] = src[key];
			}
		}
	}
};
