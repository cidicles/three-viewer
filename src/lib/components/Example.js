import React, { Component } from 'react';
//
import _ from 'lodash';
import {TweenMax, Linear} from 'gsap';
import shadesModel from './shades.obj';

var THREE = require('three');
var OBJLoader = require('three-obj-loader');
OBJLoader(THREE);
console.log(typeof THREE.OBJLoader);

var OrbitControls = require('three-orbit-controls')(THREE);

class Particles extends Component {
  constructor(props){
    super(props);
    this.clock = new THREE.Clock();
    this.state = {
      x: 0,
      y: 0
    };
    this.getCoords = this.getCoords.bind(this);
  }
  componentDidMount() {
    console.log('will mount');
    this.createScene();
  }
  componentWillUnmount() {
    console.log('will unmount');
  }
  createScene() {
		this.scene = new THREE.Scene();

    // Ray Caster (unused atm)
    this.rayCaster = new THREE.Raycaster();

		// Camera
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
		this.camera.position.z = 20;
    this.controls = new OrbitControls(this.camera)

		// Renderer
		this.renderer = new THREE.WebGLRenderer({ alpha: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);
		this.renderer.gammaInput = true;
		this.renderer.gammaOutput = true;
		this.threestage.appendChild(this.renderer.domElement);

		// Lights
		this.ambientLight = new THREE.AmbientLight(0x000000);
		this.scene.add(this.ambientLight);

		this.lights = [];
		this.lights[1] = new THREE.PointLight(0xffffff, 1, 0);
		this.lights[0] = new THREE.PointLight(0xffffff, 1, 0);
		this.lights[2] = new THREE.PointLight(0xffffff, 1, 0);

		this.lights[0].position.set(0, 200, 0);
		this.lights[1].position.set(100, 200, 100);
		this.lights[2].position.set(-100, - 200, -100);

		this.scene.add(this.lights[0]);
		this.scene.add(this.lights[1]);
		this.scene.add(this.lights[2]);


    // Models / Loader
    this.loader = new THREE.OBJLoader();
    this.loader.load(
    	// resource URL
    	shadesModel,
    	// called when resource is loaded
      function ( object ) {
        this.scene.add(object);
      }.bind(this),
    	// called when loading is in progresses
    	function ( xhr ) {
    		console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
    	},
    	// called when loading has errors
    	function ( error ) {
    		console.log( 'An error happened' );
    	}
    );









		// Resize Events
		window.addEventListener('resize', this.onWindowResize.bind(this), false);

    // Create Objects

    for(let i = 0; i < 100; i++){

      let dim = _.random(5, 10);

      // Create Objects
      this.createSquareObjects({
    		width: dim,
    		height: dim,
    		x: _.random(window.innerWidth / 2 * -1, window.innerWidth / 2),
    		y: window.innerHeight / 2,
    		z: _.random(-300, -600),
        rotSpeed: _.random(1, 3),
        massSpeed: _.random(10, 15),
        delay: _.random(0, 5),
        color: '0x'+Math.floor(Math.random()*16777215).toString(16)
    	});

    }


		// Init
		this.renderThree();
	}
  modelLoaded(object){
    console.log(object)
    this.scene.add( object );
  }
  createSquareObjects(params) {

    // Material
		this.material = new THREE.MeshStandardMaterial( {color: parseInt(params.color, 16), side: THREE.DoubleSide, roughness: 0 } );

		// Make the Geometry
		this.geometry = new THREE.PlaneGeometry(params.width, params.height);
		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.mesh.position.set(params.x, params.y, params.z);
    this.scene.add(this.mesh);

    // Animation
    TweenMax.to(this.mesh.rotation, params.rotSpeed, { x: 3.1, y: 3.1, z: 0, repeat:-1, ease:Linear.easeNone }).delay(params.delay);
    TweenMax.to(this.mesh.position, params.massSpeed, { x: params.x, y: -600, z: params.z, repeat:-1, ease:Linear.easeNone }).delay(params.delay);

  }
  onWindowResize(event) {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}
  getCoords(evt) {
    console.log(evt)
  }
  renderThree() {
		requestAnimationFrame(() => {
			this.renderThree();
		});
		this.renderer.render(this.scene, this.camera);
	}
  render(){
    return (
      <div ref={el => this.threestage = el} id='threestage' onClick={this.getCoords}></div>
    );
  }
}

export default Particles;
