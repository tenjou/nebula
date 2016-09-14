"use strict";

wabi.element("ruler", 
{
	elements:
	{
		canvas: {
			type: "canvas"
		},
		cursor: {
			type: "slot"
		}
	},

	prepare: function() 
	{
		wabi.on("resize", this.updateResize, this);
		this.on("mousemove", "*", this.updateMouseMove, this);
	},

	cleanup: function() {
		wabi.off("resize", this.updateResize, this);
	},

	set_orientation: function(value) {
		this.attrib("class", value);
	},

	updateResize: function(event)
	{

	},

	updateMouseMove: function(event)
	{
		var bounds = event.element.$domElement.getBoundingClientRect();
		var cursor;

		switch(this.orientation)
		{
			case "horizontal":
				cursor = event.x - bounds.left;
				break;

			case "vertical":
				cursor = event.y - bounds.top;
				break;
		}

		this.updateCursor(cursor);
	},

	updateCursor: function(cursor)
	{
		switch(this.orientation)
		{
			case "horizontal":
				this.$elements.cursor.style("left", cursor + "px");
				break;

			case "vertical":
				this.$elements.cursor.style("top", cursor + "px");
				break;
		}
	},

	redrawRegion: function(from, to)
	{
		var canvas = this.$elements.canvas;
		var canvasElement = canvas.$domElement;

		var ctx = canvas.ctx;
		ctx.clearRect(from, 0, to, canvasElement.height);
		ctx.font = "13px Calibri";
		ctx.fillStyle = "gray";
		ctx.strokeStyle = "gray";
		ctx.textBaseline = "middle";
		ctx.beginPath();

		var step;
		switch(this.orientation) 
		{
			case "horizontal":
				step = 128;
				break;

			case "vertical":
				step = 96;
				break;
		}

		var remainder = this.position  % step;
		var currStep = this.position / step;

		var pos, num;
		if(this.position > 0) 
		{
			currStep = Math.floor(currStep) + 1;
			pos = (this.position % step) + 0.5 - step;
			num = Math.ceil(((to - from) - remainder) / step) + 1;
		}
		else
		{
			currStep = Math.ceil(currStep);
			pos = (this.position % step) + 0.5;
			num = Math.ceil(((to - from) - remainder) / step);
		}

		currStep *= -step;

		switch(this.orientation)
		{
			case "horizontal":
			{
				for(var n = 0; n < num; n++) 
				{
					if(pos > 0.5)
					{
						ctx.moveTo(pos, 0);
						ctx.lineTo(pos, canvasElement.height);
					}

					ctx.fillText(currStep, pos + 2, 11);
					pos += step;
					currStep += step;
				}
			} break;

			case "vertical":
			{
				for(var n = 0; n < num; n++) 
				{
					if(pos > 0.5)
					{					
						ctx.moveTo(0, pos);
						ctx.lineTo(canvasElement.width, pos);
					}

					var offset = canvasElement.width / 2 - 2;
					ctx.save();
					ctx.translate(offset, pos + 3);
					ctx.rotate(Math.PI / 2);
					ctx.translate(-offset, -pos - 3)
					ctx.fillText(currStep, offset, pos + 3);
					ctx.restore();

					pos += step;
					currStep += step;
				}
			} break;
		}

		ctx.stroke();
	},

	updateSize: function() 
	{
		var canvasElement = this.$elements.canvas.$domElement;
		canvasElement.width = this.$domElement.offsetWidth;
		canvasElement.height = this.$domElement.offsetHeight;

		switch(this.orientation) 
		{
			case "horizontal":
				this.redrawRegion(0, canvasElement.width);
				break;

			case "vertical":
				this.redrawRegion(0, canvasElement.height);
				break;
		}
	},

	updatePos: function(position)
	{
		this.position = -position;

		var canvasElement = this.$elements.canvas.$domElement;

		switch(this.orientation) 
		{
			case "horizontal":
				this.redrawRegion(0, canvasElement.width);
				break;

			case "vertical":
				this.redrawRegion(0, canvasElement.height);
				break;
		}
	},

	//
	orientation: "",
	position: 0
});


function drawSomeText(ctx, x, y, text, maxWidth) {
    //metric will receive the measures of the text
    var metric = ctx.measureText(text); 
    console.log("metrics", metric.width);
    
    ctx.save(); // this will "save" the normal canvas to return to
    if(maxWidth != null && metric.width > maxWidth) {
        // These two methods will change EVERYTHING
        // drawn on the canvas from this point forward
        // Since we only want them to apply to this one fillText,
        // we use save and restore before and after
        
        // We want to find the center of the text (or whatever point you want) and rotate about it
        var tx = x + (metric.width/2);
        var ty = y + 5;
        
        // Translate to near the center to rotate about the center
        ctx.translate(tx,ty);
        // Then rotate...
        ctx.rotate(Math.PI / 2);
        // Then translate back to draw in the right place!
        ctx.translate(-tx,-ty);
    }
    ctx.fillText(text, x, y);
    ctx.restore(); // This will un-translate and un-rotate the canvas
}