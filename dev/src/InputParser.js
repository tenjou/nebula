"use strict";

meta.class("Editor.InputParser", 
{
	parse: function(parent, inputData) {
		this.parseContent(parent, inputData);
	},

	parseContent: function(parent, content) 
	{
		var data, value, strType, type, newParent;
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
					value = type;
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

			if(data.content) {
				this.parseContent(newParent, data.content);
			}
		}
	},

	types: 
	{
		number: function(parent, name, data) 
		{
			var prop = new Element.Property(parent);
			prop.addTag(name);

			var input = new Element.Number(prop);
			if(data.value) {
				input.value = data.value;
			}
			
			return prop;
		},

		boolean: function(parent, name, data) 
		{
			var prop = new Element.Property(parent);
			prop.addTag(name);

			var input = new Element.Number(prop);
			if(data.value) {
				input.value = data.value;
			}

			return prop;
		},

		string: function(parent, name, data) 
		{
			var prop = new Element.Property(parent);
			prop.addTag(name);

			var input = new Element.String(prop);
			if(data.value) {
				input.value = data.value;
			}

			return prop;
		},

		h2: function(parent, name, data) 
		{
			var h2 = new Element.H2(parent);
			h2.value = name;
			return h2;
		},

		section: function(parent, name, data) 
		{
			var section = new Element.Section(parent);
			var h2 = new Element.H2(section);
			h2.value = name;
			return section;
		},

		container: function(parent, name, data) 
		{
			var container = new Element.Container(parent);
			return container;
		},	

		containerNamed: function(parent, name, data) 
		{
			var container = new Element.Container(parent);
			var h2 = new Element.H2(container);
			h2.value = name;			
			return container;
		},			

		button: function(parent, name, data)
		{
			var button = new Element.Button(parent);
			button.value = name;
			return button;
		}
	}
});
