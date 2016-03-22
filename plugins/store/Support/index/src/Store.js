"use strict";

meta.class("Store", 
{
	init: function()
	{
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.scene = new THREE.Scene();
		this.currScene = this.scene;

		this.camera = new THREE.PerspectiveCamera(45, this.width / this.height, 0.1, 1000);
		this.camera.position.set(-1.6340495811802662, 2.26686641999524, 8.522511242814623);
		this.camera.rotation.set(-0.07850751671562871, -0.11365188430531124, -0.008921430725470695);

		var ambient = new THREE.AmbientLight(0xcccccc);
		this.scene.add(ambient);

		var directionalLight = new THREE.DirectionalLight(0xffeedd);
		directionalLight.position.set(0, 0.5, 0.5);
		this.scene.add(directionalLight);	
		
		var cfg = {
			antialias: true
		};

		this.renderer = new THREE.WebGLRenderer(cfg);
		this.renderer.setClearColor(0xbbbbbb);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.sortObjects = false;
		document.body.appendChild(this.renderer.domElement);	

		this.stats = new Stats();
		this.stats.setMode(0);
		this.stats.domElement.style.position = "absolute";
		this.stats.domElement.style.left = "0px";
		this.stats.domElement.style.top = "0px";
		document.body.appendChild(this.stats.domElement);			

		var self = this;
		this.renderFunc = function() {
			self.render();
		};	

		window.addEventListener("resize", function(domEvent) { self.handleScreenResize(domEvent); }, false);	
	},

	render: function()
	{
		var time = performance.now();
		var tDelta = (time - this.prevTime) / 1000;

		this.renderer.autoClear = false;
		this.renderer.clear();
		this.renderer.render(this.currScene, this.camera);

		this.stats.update();
		this.prevTime = time;

		requestAnimationFrame(this.renderFunc);	
	},	

	handleScreenResize: function(domEvent)
	{
		this.width = window.innerWidth;
		this.height = window.innerHeight;

		this.camera.aspect = this.width / this.height;
		this.camera.updateProjectionMatrix();

		this.renderer.setSize(this.width, this.height);
	},

	//
	renderer: null, 
	renderFunc: null,

	scene: null,
	currScene: null,

	camera: null,

	stats: null,

	width: 0, 
	height: 0,
	prevTime: null
});