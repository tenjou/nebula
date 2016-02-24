"use strict";

var editor = null;

meta.onCreate = function()
{
	editor = new Editor();
	editor.loadLayout();	
	// meta.engine.container = editor.inner.roomToolbar.tabs.tabs[0].content.element;

	// var assetsBrowser = new AssetsBrowser();
	// assetsBrowser.load();

	// var hierarchy = new Hierarchy();
	// hierarchy.load();	
};

meta.onLoad = function()
{
	document.querySelector("canvas").style.display = "none";
	meta.renderer.bgColor = "#aaa";
}

// var scene = null;
// var camera = null;
// var renderer = null;
// var cube = null;

// function main()
// {


// 	var holder = editor.inner.roomToolbar.tabs.tabs[0].content.canvas;
// 	var width = holder.offsetWidth;
// 	var height = holder.offsetHeight;

// 	renderer = new THREE.WebGLRenderer({ canvas: holder });

// 	scene = new THREE.Scene();
// 	camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);

// 	renderer.setSize(width, height);

// 	var geometry = new THREE.BoxGeometry(1, 1, 1);
// 	var material = new THREE.MeshBasicMaterial({ color: 0x4a4c4e });
// 	cube = new THREE.Mesh(geometry, material);
// 	scene.add(cube);

// 	camera.position.z = 5;	

// 	renderer.setClearColor( 0x6f6f6f, 1 );

// 	render();
// };

// function render()
// {
// 	cube.rotation.x += 0.1;
// 	cube.rotation.y += 0.1;

// 	requestAnimationFrame(render);
// 	renderer.render(scene, camera);
// };