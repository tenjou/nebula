"use strict";

editor.server.offline =
{
	emit: function(data)
	{
		var editorData = editor.data.get(data.id);
		if(editorData.id === "projects") {
			this.processProjects(editorData, data);
		}
	},

	get: function(id, func, owner, privateData)
	{
		privateData = privateData || false;

		var data = editor.data.get(id);
		if(!data)
		{
			var index = id.lastIndexOf(".");
			var idLastPart = id.slice(index + 1);

			data = new wabi.data(null, idLastPart);
			if(func) {
				data.watch(func, owner);
			}

			data.sync();

			editor.data.performSetKey(id, data);

			this.emit({
				id: id,
				type: "data",
				action: "get"
			});
		}
		else
		{
			if(func) {
				data.watch(func, owner);
			}
		}

		return data;
	},

	processProjects: function(editorData, data)
	{
		switch(data.action)
		{
			case "get":
			{
				this.readProjects();
			} break;
		}
	},

	readProjects: function()
	{
		
	}
};
