import mapBump from './bump.png';
const THREE = require('three');

export const materials = {
  mat_darkShell: new THREE.MeshPhongMaterial({
    color: 0x111111,
    specular: 0x111111,
    shininess: 20,
    bumpMap : THREE.ImageUtils.loadTexture(mapBump),
    bumpScale : 0.003
  }),
  mat_darkShinyShell: new THREE.MeshPhongMaterial({
    color: 0x111111,
    specular: 0x555555,
    shininess: 50
  }),
  mat_blueShell: new THREE.MeshPhongMaterial({
    color: 0x001087,
    specular: 0x0b1032,
    shininess: 20,
    bumpMap : THREE.ImageUtils.loadTexture(mapBump),
    bumpScale : 0.003
  }),
  mat_blueShinyShell: new THREE.MeshPhongMaterial({
    color: 0x001087,
    specular: 0x0b1032,
    shininess: 50
  }),
  mat_LEDOn: new THREE.MeshPhongMaterial({
    color: 0x66ca00,
    specular: 0x66ca00,
    shininess: 0
  }),
  mat_LEDOff: new THREE.MeshPhongMaterial({
    color: 0x000000,
    specular: 0x000000,
    shininess: 0
  }),
  mat_rubber: new THREE.MeshStandardMaterial({
    color: 0x111111,
    roughness: 50
  }),
  mat_blackMatte: new THREE.MeshStandardMaterial({
    color: 0x000000,
    roughness: 50
  }),
  mat_translucentGray: new THREE.MeshPhongMaterial({
    color: 0x000000,
    specular: 0x555555,
    shininess: 0,
    transparent: true,
    opacity: 0.9
  }),
  mat_IR: new THREE.MeshPhongMaterial({
    color: 0xFFFFFFF,
    specular: 0x555555,
    shininess: 10,
    transparent: true,
    opacity: 0.9
  }),
  mat_IRBlack: new THREE.MeshPhongMaterial({
    color: 0x000000,
    specular: 0x555555,
    shininess: 10,
    transparent: true,
    opacity: 0.9
  }),
  mat_LEDRed: new THREE.MeshPhongMaterial({
    color: 0x6d0909,
    specular: 0x6d0909,
    shininess: 10,
    transparent: true,
    opacity: 0.9
  })
};
