"use strict";

var canvas = null;
var gl = null;
var shader = null;
var adding = true;
var texture = null;
var texture2 = null;
var ready = false;
var verticeBuffer = null;

var camera = new Float32Array(2);
var viewportSize = new Float32Array(2);
var scaledViewportSize = new Float32Array(2);

var inverseTextureSize = new Float32Array(2);
var tileSize = 32;
var inverseTileSize = 1 / tileSize;

function Shader(gl, program) 
{
	var count, i, attrib, uniform, name;

	this.gl = gl;
	this.program = program;

	this.attrib = {};
	this.uniform = {};

	count = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
	for(i = 0; i < count; i++) {
		attrib = gl.getActiveAttrib(program, i);
		this.attrib[attrib.name] = gl.getAttribLocation(program, attrib.name);
	}

	count = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
	for(i = 0; i < count; i++) {
		uniform = gl.getActiveUniform(program, i);
		name = uniform.name.replace("[0]", "");
		this.uniform[uniform.name] = gl.getUniformLocation(program, name);
	}	
}

function createShader(gl, vertexShaderSrc, fragmentShaderSrc)
{
	var vertexShader = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vertexShader, vertexShaderSrc);
	gl.compileShader(vertexShader);

	var fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fragmentShader, fragmentShaderSrc);
	gl.compileShader(fragmentShader);

	var program = gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	gl.useProgram(program);

	var failed = false;

	if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(vertexShader));
		failed = true;
	}
	else if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
		console.error(gl.getShaderInfoLog(fragmentShader));
		failed = true;
	}
	else if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		console.error(gl.getProgramInfoLog(program));
		failed = true;
	}	

	if(failed) {
		gl.deleteProgram(program);
		gl.deleteShader(vertexShader);
		gl.deleteShader(fragmentShader);
		return null;		
	}

	var shader = new Shader(gl, program);
	return shader;
}

function loadImg()
{
	texture = gl.createTexture();

	var img = new Image();
	img.onload = function() { prepareTexture(img); }
	img.src = "assets/tilemap.png";
}

function loadImg2()
{
	texture2 = gl.createTexture();

	var img = new Image();
	img.onload = function() { prepareTexture2(img); }
	img.src = "assets/spelunky0.png";
}

function prepareTexture(img, repeat)
{
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	if(repeat) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);		
	}
	else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);		
	}

	inverseTextureSize[0] = 1 / img.width;
	inverseTextureSize[1] = 1 / img.height;

	loadImg2();
}

function prepareTexture2(img, repeat)
{
	gl.bindTexture(gl.TEXTURE_2D, texture2);
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

	if(repeat) {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);		
	}
	else {
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);		
	}

	ready = true;
}

function init()
{
	window.addEventListener("resize", onResize, false);

	canvas = document.getElementById("canvas");
	gl = canvas.getContext("experimental-webgl");
	if(!gl) {
		console.error("no webgl");
		return false;
	}

	canvas.addEventListener("mousedown", onMouseDown, false);
	canvas.addEventListener("mouseup", onMouseUp, false);
	canvas.addEventListener("mousemove", onMouseMove, false);

	var vertexShaderSrc = 
		"precision mediump float; \
		attribute vec2 position; \
		attribute vec2 uv; \
		uniform vec2 viewportSize; \
		uniform vec2 camera; \
		uniform vec2 inverseTextureSize; \
		varying vec2 texCoord; \
		varying vec2 pixelCoord; \
		void main() { \
			gl_Position = vec4(position, 0.0, 1.0); \
			pixelCoord = (uv * viewportSize) + camera; \
			texCoord = pixelCoord * inverseTextureSize * vec2(1.0 / 32.0, 1.0 / 32.0); \
		}";

	var fragmentShaderSrc = 
		"precision mediump float; \
		varying vec2 texCoord; \
		varying vec2 pixelCoord; \
		uniform sampler2D atlasTexture; \
		uniform sampler2D dataTexture; \
		uniform vec2 inverseTextureSize; \
		void main() { \
			vec4 tile = texture2D(dataTexture, texCoord); \
			if(tile.x == 1.0 && tile.y == 1.0) { discard; } \
			float tileSize = 32.0;\
			vec2 spriteOffset = floor(tile.xy * 256.0) * tileSize; \
			vec2 spriteCoord = mod(pixelCoord, tileSize); \
			gl_FragColor = texture2D(atlasTexture, (spriteOffset * spriteCoord) * vec2(0.023809523809523808, 0.029411764705882353)); \
		}";

	shader = createShader(gl, vertexShaderSrc, fragmentShaderSrc);

	loadImg();

	var vertices = [
		-1, -1, 0, 1,
		1, -1, 1, 1,
		1, 1, 1, 0,
		-1, -1, 0, 1,
		1, 1, 1, 0,
		-1, 1, 0, 0
	];	

	verticeBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);	

	gl.clearColor(0.9, 0.9, 0.9, 1);
	gl.clearDepth(1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
	gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);	
	gl.enable(gl.BLEND);

	onResize();

	return true;
}

function update() 
{
	if(!ready) { return; }

	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	gl.useProgram(shader.program);
	gl.bindBuffer(gl.ARRAY_BUFFER, verticeBuffer);
	gl.enableVertexAttribArray(shader.attrib.position);
	gl.enableVertexAttribArray(shader.attrib.uv);	
	gl.vertexAttribPointer(shader.attrib.position, 2, gl.FLOAT, false, 16, 0);
	gl.vertexAttribPointer(shader.attrib.uv, 2, gl.FLOAT, false, 16, 8);

	gl.uniform2fv(shader.uniform.viewportSize, viewportSize);
	// gl.uniform2fv(shader.uniform.inverseViewportSize, inverseViewportSize);
	// gl.uniform1f(shader.uniform.tileSize, tileSize);
	// gl.uniform1f(shader.uniform.inverseTileSize, inverseTileSize);

	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture);
	gl.uniform1i(shader.uniform.atlasTexture, 0);

	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture2);
	gl.uniform1i(shader.uniform.dataTexture, 1);

	gl.uniform2fv(shader.uniform.camera, camera);
	gl.uniform2fv(shader.uniform.inverseTextureSize, inverseTextureSize);

	gl.drawArrays(gl.TRIANGLES, 0, 6);	
}

function onResize()
{
	canvas.width = canvas.parentElement.clientWidth;
	canvas.height = canvas.parentElement.clientHeight;

	gl.viewport(0, 0, canvas.width, canvas.height);

	viewportSize[0] = canvas.width;
	viewportSize[1] = canvas.height;
}

var isMouseDown = false;

function onMouseDown(event) {
	isMouseDown = true;
}

function onMouseUp(event) {
	isMouseDown = false;
}

function onMouseMove(event)
{
	if(isMouseDown) {
		camera[0] -= event.movementX;
		camera[1] -= event.movementY;
	}
}

