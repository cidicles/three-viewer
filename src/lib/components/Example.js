import React, { Component } from 'react';
import _ from 'lodash';
import {TweenMax, TimelineLite, Linear, Elastic, Back, Bounce} from 'gsap';
import boxerModel from './boxer.obj';
import mapBump from './bump.png';
import { materials } from './materials';
import { animations } from './animations';
import hexToBinary from 'hex-to-binary';

// Three
const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);

// Three Loaders
const OBJLoader = require('three-obj-loader');
OBJLoader(THREE);
const MTLLoader = require('three-mtl-loader');

class Viewer extends Component {
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

    // TODO: Debug Only
    //var axesHelper = new THREE.AxesHelper( 5 );
    //this.scene.add( axesHelper );

    // Ray Caster (unused atm)
    this.rayCaster = new THREE.Raycaster();

		// Camera
		this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 1, 2000);
		this.camera.position.z = 10;
    this.camera.position.y = 1;
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
    this.lights[0] = new THREE.PointLight(0xffffff, 1, 0);
		this.lights[1] = new THREE.PointLight(0xffffff, 1, 0);
		this.lights[2] = new THREE.PointLight(0xffffff, 1, 0);

		this.lights[0].position.set(0, 0, 200);
	  this.lights[1].position.set(100, 200, 100);
		this.lights[2].position.set(-100, - 200, -100);

		this.scene.add(this.lights[0]);
		this.scene.add(this.lights[1]);
		this.scene.add(this.lights[2]);

    // Models / Loader
    this.mainModel = null;
    this.leds = [];
    this.loader = new THREE.OBJLoader();
    this.loader.load(
    	// resource URL
    	boxerModel,
    	// called when resource is loaded
      function (object) {
        this.scene.add(object);
        this.mainModel = object;

        // Update World Space
        this.scene.updateMatrixWorld(true);

        // Create the LED Group <-- not sure how to access groups in OBJ?
        this.mainModel.traverse( function ( child ) {
          if(child.name.includes('faceled_')){
            this.leds.push(child);
          }
        }.bind(this));

        // Reverse LED Order
        this.leds.reverse();

        // Add Lights to all LEDs
        for (var i = 0; i < this.leds.length; i++) {
          let position = this.getWorldCoords(this.leds[i]);
          let light = new THREE.PointLight( 0x66ca00, 0, 0.3, 1 ); // Default 'ON' intensity is 20
          light.position.set(
            position.x,
            position.y,
            position.z + 0.1
          );
          this.leds[i].add(light);
          if(i === this.leds.length - 1){
            console.log('all lights added')
          }
        }
        console.log()

        // Texture the Model
        this.textureModel(materials.mat_darkShell, materials.mat_darkShinyShell);

        // Turn it on
        this.assignLeds(animations.default, 0);

        // Spin Wheels
        //this.spinWheels();

      }.bind(this),
    	// called when loading is in progresses
    	function (xhr) {
    		console.log(( xhr.loaded / xhr.total * 100 ) + '% loaded');
    	},
    	// called when loading has errors
    	function (error) {
        console.log('An error happened');
    	}
    );

		// Resize Events
		window.addEventListener('resize', this.onWindowResize.bind(this), false);

    // Create Objects
    /*
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
    */

		// Init
		this.renderThree();
	}
  getPattern(animation, frame){
    let pattern = [];
    for (var j = 0; j < animation[frame].length; j++) {
      let bin = hexToBinary(animation[frame][j]);
      let splits = bin.split('');
      splits.splice(0, 2);
      pattern = pattern.concat(splits);
    }
    return pattern;
  }
  getWorldCoords(object){
    object.geometry.computeBoundingBox();
    let boundingBox = object.geometry.boundingBox;
    let position = new THREE.Vector3();
    position.subVectors( boundingBox.max, boundingBox.min );
    position.multiplyScalar( 0.5 );
    position.add( boundingBox.min );
    position.applyMatrix4( object.matrixWorld );
    return position;
  }
  setTexture = (baseMat, wheelMat) => e => {
    this.textureModel(baseMat, wheelMat);
  }
  runAnimation = (animation) => e => {
    console.log(animation)
    switch (animation) {
      case 'zoomIn':
        TweenMax.set(this.mainModel.position, {
          z:-300
        });
        TweenMax.to(this.mainModel.position, 1, {
          z: 0,
          ease: Elastic.easeOut.config(0.2, 0.3)
        });
        break;
      case 'drop':
        TweenMax.set(this.mainModel.position, {
          y:100
        });
        TweenMax.to(this.mainModel.position, 0.7, {
          y: 0,
          ease: Elastic.easeOut.config(0.1, 0.5)
        });
        break;
      case 'driveInLeft':
        TweenMax.set(this.mainModel.position, {
          x:100
        });
        TweenMax.set(this.mainModel.rotation, {
          y: THREE.Math.degToRad(-90)
        });
        /*eslint-disable */
        let driveInLeft = new TimelineLite()
          .to(this.mainModel.position, 1.2, {x:0})
          .to(this.mainModel.rotation, 0.4, {y:THREE.Math.degToRad(0), ease: Elastic.easeOut.config(0.2, 0.3)}, '-=.1')
        /*eslint-enable */
        break;
      case 'driveInRight':
        TweenMax.set(this.mainModel.position, {
          x:-100
        });
        TweenMax.set(this.mainModel.rotation, {
          y: THREE.Math.degToRad(90)
        });
        /*eslint-disable */
        let driveInRight = new TimelineLite()
          .to(this.mainModel.position, 1.2, {x:0})
          .to(this.mainModel.rotation, 0.4, {y:THREE.Math.degToRad(0), ease: Elastic.easeOut.config(0.2, 0.3)}, '-=.1')
        /*eslint-enable */
        break;
      case 'spin':
        TweenMax.set(this.mainModel.rotation, {
          y: THREE.Math.degToRad(0)
        });
        TweenMax.to(this.mainModel.rotation, 1, {
          y: THREE.Math.degToRad(360),
          ease: Elastic.easeOut.config(0.2, 0.3)
        });
        break;
      case 'wiggle':
        TweenMax.set(this.mainModel.rotation, {
          y: THREE.Math.degToRad(0)
        });
        /*eslint-disable */
        let wiggle = new TimelineLite()
          .to(this.mainModel.rotation, 0.2, {y:THREE.Math.degToRad(0), ease: Elastic.easeOut.config(0.2, 0.3)})
          .to(this.mainModel.rotation, 0.2, {y:THREE.Math.degToRad(10), ease: Elastic.easeOut.config(0.2, 0.3)})
          .to(this.mainModel.rotation, 0.2, {y:THREE.Math.degToRad(-10), ease: Elastic.easeOut.config(0.2, 0.3)})
          .to(this.mainModel.rotation, 0.2, {y:THREE.Math.degToRad(10), ease: Elastic.easeOut.config(0.2, 0.3)})
          .to(this.mainModel.rotation, 0.2, {y:THREE.Math.degToRad(-10), ease: Elastic.easeOut.config(0.2, 0.3)})
          .to(this.mainModel.rotation, 0.2, {y:THREE.Math.degToRad(0), ease: Elastic.easeOut.config(0.2, 0.3)})
        /*eslint-enable */
        break;
      case 'nod':
        TweenMax.set(this.mainModel.rotation, {
          z: THREE.Math.degToRad(0)
        });
        /*eslint-disable */
        let nod = new TimelineLite()
          .to(this.mainModel.rotation, 0.2, {x:THREE.Math.degToRad(0), ease: Elastic.easeOut.config(0.2, 0.3)})
          .to(this.mainModel.rotation, 0.2, {x:THREE.Math.degToRad(10), ease: Elastic.easeOut.config(0.2, 0.3)})
          .to(this.mainModel.rotation, 0.2, {x:THREE.Math.degToRad(-10), ease: Elastic.easeOut.config(0.2, 0.3)})
          .to(this.mainModel.rotation, 0.2, {x:THREE.Math.degToRad(10), ease: Elastic.easeOut.config(0.2, 0.3)})
          .to(this.mainModel.rotation, 0.2, {x:THREE.Math.degToRad(-10), ease: Elastic.easeOut.config(0.2, 0.3)})
          .to(this.mainModel.rotation, 0.2, {x:THREE.Math.degToRad(0), ease: Elastic.easeOut.config(0.2, 0.3)})
        /*eslint-enable */
        break;
      default:
        console.error('You must specify a named animation.');
    }
  }
  textureModel(baseMat, wheelMat){
    this.mainModel.traverse( function ( child ) {
      // Map Materials by Name
      if (child instanceof THREE.Mesh) {
        switch (child.name) {
          case 'body_bottom':
          case 'body_top':
          case 'backplate':
            child.material = baseMat;
            break;
          case 'IR':
            child.material = materials.mat_IR;
            break;
          case 'IR_Black':
            child.material = materials.mat_IRBlack;
            break;
          case 'faceplate':
            child.material = materials.mat_translucentGray;
            break;
          case 'Red_LED':
            child.material = materials.mat_LEDRed;
            break;
          case 'rim':
          case 'hubcap':
            child.material = wheelMat;
            break;
          case 'wheel_guard':
          case 'button_guard':
          case 'eyeplate':
          case 'button':
          case 'plug':
          case 'Switch':
          case 'LED_Backface':
          case 'LED_BOX':
          case 'USB_PLUG':
          case 'TOP_IR_BOX':
            child.material = materials.mat_blackMatte;
            break;
          case 'top_rubber':
          case 'tread':
          case 'LED_backplate':
            child.material = materials.mat_rubber;
            break;
          default:
            // unassigned mats get random colors! Debug Helper!
            /*
            child.material = new THREE.MeshStandardMaterial({
              color: parseInt('0x'+Math.floor(Math.random()*16777215).toString(16), 16),
              side: THREE.DoubleSide,
              roughness: 0
            });
            */
        }
      }
    });
  }
  animateLeds = (animation) => e => {
    let frames = animation.length;
    let frame = 0;
    let timer = setInterval(() => {
      console.log('run')
      this.assignLeds(animation, frame);
      if (++frame === frames) {
        clearInterval(timer);
        this.assignLeds(animations.default, 0); // back to default
      }
    }, 200);
  }
  assignLeds(newPattern, frame){
    let pattern = this.getPattern(newPattern, frame);
    for (var i = 0; i < this.leds.length; i++) {
      if(parseInt(pattern[i], 10)){
        //this.leds[i].children[0].intensity = 20;
        TweenMax.to(this.leds[i].children[0], 0.2, { intensity: 20 });
        this.leds[i].material = materials.mat_LEDOn;
      } else {
        //this.leds[i].children[0].intensity = 0;
        TweenMax.to(this.leds[i].children[0], 0.2, { intensity: 0 });
        this.leds[i].material = materials.mat_LEDOff;
      }
    }
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
  getPositionPivot(object){
    let position = this.getWorldCoords(object);
    var pivot = new THREE.Object3D();
    console.log(position)
    pivot.position.x = position.x;
    pivot.position.y = position.y;
    pivot.position.z = position.z;
    object.position.x = position.x * -1;
    object.position.y = position.y * -1;
    object.position.z = position.z * -1;
    console.log(object.position)
    pivot.add(object);
    var axesHelper = new THREE.AxesHelper( 5 );
    pivot.add( axesHelper );
    return pivot;
  }
  spinWheels(){
    //console.log(this.getSubObject(this.mainModel.children, 'name', 'tread'));
    const object = this.getSubObject(this.mainModel.children, 'name', 'tread');
    const positionedPivot = this.getPositionPivot(object);
    this.scene.add(positionedPivot);

    //object.translate( position.x, position.y, position.z );





    TweenMax.to(positionedPivot.rotation, 10, {
      x: THREE.Math.degToRad(360),
      y: 0,
      z: 0,
      repeat:-1,
      ease:Linear.easeNone
    });



  }
  // Gets a SubObject from Main Models Group
  getSubObject(obj, key, value){
    return obj.find(v => v[key] === value);
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
      <div>
        <div className='controls'>
          <fieldset>
            <legend>Eyes:</legend>
            <button onClick={this.animateLeds(animations.default)}>Default</button>
            <button onClick={this.animateLeds(animations.angry)}>Angry</button>
            <button onClick={this.animateLeds(animations.cartoonFire)}>Cartoon Fire</button>
            <button onClick={this.animateLeds(animations.crying2)}>Crying 2</button>
            <button onClick={this.animateLeds(animations.curious1)}>Curious 1</button>

            <button onClick={this.animateLeds(animations.drunk)}>Drunk</button>
            <button onClick={this.animateLeds(animations.bored)}>Bored</button>
            <button onClick={this.animateLeds(animations.idleHappy)}>Idle Happy</button>
            <button onClick={this.animateLeds(animations.suspicious)}>Suspicious</button>
            <button onClick={this.animateLeds(animations.vomit)}>Vomit</button>
            <button onClick={this.animateLeds(animations.wideEyes)}>Wide Eyes</button>
            <button onClick={this.animateLeds(animations.excited)}>Excited</button>
            <button onClick={this.animateLeds(animations.laughingCrying)}>Laughing Crying</button>
          </fieldset>
          <fieldset>
            <legend>Color:</legend>
            <button onClick={this.setTexture(materials.mat_blueShell, materials.mat_blueShinyShell)}>Blue</button>
            <button onClick={this.setTexture(materials.mat_darkShell, materials.mat_darkShinyShell)}>Black</button>
          </fieldset>
          <fieldset>
            <legend>Animation:</legend>
            <button onClick={this.runAnimation('zoomIn')}>zoom in</button>
            <button onClick={this.runAnimation('drop')}>drop</button>
            <button onClick={this.runAnimation('driveInLeft')}>drive in left</button>
            <button onClick={this.runAnimation('driveInRight')}>drive in right</button>
            <button onClick={this.runAnimation('spin')}>spin</button>
            <button onClick={this.runAnimation('wiggle')}>wiggle</button>
            <button onClick={this.runAnimation('nod')}>nod</button>
          </fieldset>
        </div>
        <div ref={el => this.threestage = el} id='threestage' onClick={this.getCoords}></div>
      </div>
    );
  }
}

export default Viewer;
