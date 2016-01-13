"use strict";

meta.class("Editor.InputParser", 
{
	parse: function(inputData, content)
	{
		var section;
		for(var key in inputData)
		{
			section = content.createSection(key);

			this.parseInputs(inputData[key], section);
		}
	},

	parseInputs: function(inputData, section)
	{
		for(var key in inputData)
		{
			section.addProperty(key);
		}
	}
});
