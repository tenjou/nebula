"use strict";

meta.class("Element.ListItem_Asset", "Element.ListItem",
{
	handleItemMove: function()
	{
		var db = this.preDragParent.db;
		var index = db.indexOf(this.info);
		if(index > -1) {
			db[index] = db[db.length - 1];
			db.pop();
		}

		this.parent.db.push(this.info);

		var fileName = this.info.name;
		if(this.info.ext) {
			fileName += "." + this.info.ext;
		}

		this.info.path = this.parent.path;

		if(this._folder)
		{
			editor.fileSystem.moveToDir(
				this.preDragParent.path + fileName, 
				this.parent.path + fileName, 
				function(data) {
					console.log(data);
				});
		}
		else
		{
			editor.fileSystem.moveTo(
				this.preDragParent.path + fileName, 
				this.parent.path + fileName, 
				function(data) {
					console.log(data);
				});
		}

		this.parent.sort();
		editor.saveCfg();
	},

	set tag(name) 
	{
		if(!name) { return; }

		if(!this._tag) {
			this._tag = new Element.Tag(this._inner);
		}
		this._tag.value = name;
	},

	get tag() {
		return this._tag;
	},	

	//
	_tag: null,
	info: null
});
