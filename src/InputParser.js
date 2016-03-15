"use strict";

meta.class("Editor.InputParser", 
{
	parse: function(parent, inputData) 
	{
		var tree = new this.ContentNode(null);
		this.parseContent(tree, parent, inputData);
		return tree;
	},

	parseContent: function(node, parent, content) 
	{
		node.children = {};

		var data, value, strType, type, newParent, contentNode;
		for(var key in content)
		{
			data = content[key];
			strType = typeof(data);

			if(strType === "object") {
				type = data.type;
			}
			else 
			{
				value = data;

				if(strType === "string" && data[0] === "@") {
					type = data.substr(1);
					value = "";
				}
				else {
					type = strType;
				}	

				data = {
					type: type,
					value: value
				};	
			}

			if(!type) {
				throw "InputParseError: Unknown type";
			}

			if(!this.types[type]) {
				throw "InputParserError: No such type found '" + type + "'";
			}			

			newParent = this.types[type](parent, key, data);
			if(!newParent) {
				console.error("(Editor.InputParser.parseContent) Invalid element from type: " + type);
				return;
			}

			contentNode = new this.ContentNode(newParent);
			node.children[key] = contentNode;

			if(data.content) {
				this.parseContent(contentNode, newParent, data.content);
			}
		}
	},

	ContentNode: function(element) {
		this.element = element;
		this.children = null;
	},

	types: 
	{
		number: function(parent, name, data) 
		{
			var prop = new Element.Property(parent, name);
			prop.addTag(name);

			var input = new Element.Number(prop);
			if(data.value) {
				input.value = data.value;
			}
			
			return input;
		},

		boolean: function(parent, name, data) 
		{
			var prop = new Element.Property(parent, name);
			prop.addTag(name);

			var input = new Element.Number(prop);
			if(data.value) {
				input.value = data.value;
			}

			return input;
		},

		string: function(parent, name, data) 
		{
			var prop = new Element.Property(parent, name);
			prop.addTag(name);

			var input = new Element.String(prop);
			if(data.value) {
				input.value = data.value;
			}

			return input;
		},

		h2: function(parent, name, data) 
		{
			var h2 = new Element.H2(parent, name);
			h2.value = name;
			return h2;
		},

		section: function(parent, name, data) 
		{
			var section = new Element.Section(parent, name);
			var h2 = new Element.H2(section);
			h2.value = name;
			return section;
		},

		container: function(parent, name, data) 
		{
			var container = new Element.Container(parent, name);
			return container;
		},	

		containerNamed: function(parent, name, data) 
		{
			var container = new Element.Container(parent, name);
			var h2 = new Element.H2(container);
			h2.value = name;			
			return container;
		},			

		button: function(parent, name, data)
		{
			var button = new Element.Button(parent, name);
			button.value = name;
			return button;
		},

		image: function(parent, name, data)
		{
			var image = new Element.Image(parent, name);
			return image;
		},

		upload: function(parent, name, data)
		{
			var upload = new Element.Upload(parent, name);
			return upload;
		}
	}
});
