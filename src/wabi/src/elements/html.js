"use strict";

wabi.element("html", 
{
	set_value: function(value)
	{
		// TODO: parse by tokens
		this.domElement.innerHTML = value;

		var iter = document.createNodeIterator(this.domElement, NodeFilter.SHOW_TEXT);
		var currNode, text, name, firstIndex, lastIndex;
		while(currNode = iter.nextNode()) 
		{
			text = currNode.nodeValue; 

			firstIndex = text.indexOf("{");
			if(firstIndex === -1) { continue; }

			lastIndex = text.indexOf("}");
			if(lastIndex === -1) { continue; }

			name = text.slice(firstIndex + 1, lastIndex);
			this.genStateFuncs(name);
		}
	},

	// genStateFuncs_HTML: function(name, element) 
	// {
	// 	var self = this;

	// 	if(this._stateValues[name]) {
	// 		element.innerHTML = this._stateValues[name];
	// 	}
	// 	else {
	// 		element.innerHTML = "";
	// 	}

	// 	Object.defineProperty(this._state, name, {
	// 		set: function(value) 
	// 		{
	// 			if(self._stateValues[name] === value) { return; }
	// 			self._stateValues[name] = value;

	// 			if(self._data && self._bind && self._bind[name]) {
	// 				self._data
	// 			}

	// 			element.innerHTML = value;
	// 		},
	// 		get: function() {
	// 			return self._stateValues[name];
	// 		},
	// 		enumerable: true,
	// 		configurable: true
	// 	});		
	// },		
});
