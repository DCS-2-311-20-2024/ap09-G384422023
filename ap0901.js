//
// 応用プログラミング 第9,10回 自由課題 (ap0901.js)
// G384422023 左近 麻貴
//
"use strict"; // 厳格モード

// ライブラリをモジュールとして読み込む
import * as THREE from "three";
import {GLTFLoader} from "three/addons";
import { OrbitControls} from 'three/addons';
import { GUI } from "ili-gui";

// ３Ｄページ作成関数の定義
function init() {
  // 制御変数の定義
  const param = {
    speed: 30,
    opacity: 1.0,
    follow: false,//追跡
    birdsEye: true,//俯瞰
    axes: false, // 座標軸
  };
  // GUIコントローラの設定
  const gui = new GUI();
  gui.add(param,"speed",5,50).name("速度");
  gui.add(param,"opacity",0.0,1.0).name("レールの透明度")
  .onChange(()=>{
    rails.children.forEach((rail)=>{
      rail.material.opacity = param.opacity;
    })
  });
  gui.add(param,"follow").name("乗る");
  gui.add(param, "birdsEye").name("俯瞰");
  gui.add(param, "axes").name("座標軸");

  // シーン作成
  const scene = new THREE.Scene();

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(5,7,9);
  camera.lookAt(0,0,0);

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, innerHeight);
  renderer.setClearColor( 0x808080 );
  renderer.shadowMap.enabled = true;
  document.getElementById("output").appendChild(renderer.domElement);
  // カメラコントロール
  const orbitControls = new OrbitControls(camera, renderer.domElement);
  orbitControls.enableDumping = true;

  //背景の設定
  let renderTarget;
  function setBackground(){
    const loader = new THREE.TextureLoader();
    const texture = loader.load(
      "haikei.jpg",
      () => {
        renderTarget
         = new THREE.WebGLCubeRenderTarget(texture.image.height);
         renderTarget.fromEquirectangularTexture(renderer, texture);
         scene.background = renderTarget.texture;
         render();
      }
    )
  }
  setBackground();
  //テクスチャの読み込み
  const textureLoader = new THREE.TextureLoader();
  const texture1 = textureLoader.load("buildingTexture.avif");
  const texture2 = textureLoader.load("planeTexture.jpg");

  //平面の設定
  const planeMaterial = new THREE.MeshPhongMaterial({color:0xffffff});
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(500,500),
    planeMaterial
  );
  planeMaterial.map = texture2;
  plane.rotation.x = -0.5 * Math.PI;
  plane.receiveShadow = true;
  scene.add(plane);

  //乗り物の作成
  const bodyW = 2;
  const bodyH = 0.8;
  const bodyD = 3;
  const ride = new THREE.Group;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW,bodyH,bodyD),
    new THREE.MeshLambertMaterial({color: 0xff4500})
  );
  ride.add(body);

  const center = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyH,bodyH,bodyW,10,10,false,Math.PI/2,Math.PI/2),
    new THREE.MeshLambertMaterial({color: 0xff4500})
  );
  center.position.set(0,-bodyH/2,bodyD/2);
  center.rotation.x = Math.PI/2;
  center.rotation.z = Math.PI/2
  ride.add(center);
 
  function makeTire(x,y,z){
    const tire = new THREE.Mesh(
      new THREE.CylinderGeometry(bodyH/2,bodyH/2,0.3,16),
      new THREE.MeshPhongMaterial({color:0x23363f})
    );
    tire.position.set(x,y,z);
    tire.rotation.z = Math.PI/2;
    ride.add(tire);
  }
  makeTire(bodyW/2,-bodyH/2,bodyD/2);
  makeTire(bodyW/2,-bodyH/2,-bodyD/3)
  makeTire(-bodyW/2,-bodyH/2,bodyD/2);
  makeTire(-bodyW/2,-bodyH/2,-bodyD/3);

  function makeLight(x,y,z){
    const light = new THREE.Mesh(
      new THREE.SphereGeometry(0.3,12,12),
      new THREE.MeshBasicMaterial({color:0xffffff})
    );
    light.position.set(x,y,z);
    ride.add(light);
  }
  makeLight(-0.6,0,2.2);
  makeLight(0.6,0,2.2);
  ride.castShadow = true;
  scene.add(ride);
  const ride2 = ride.clone();
  const ride3 = ride.clone();
  scene.add(ride2);
  scene.add(ride3);
  //視点制御のジオメトリー
  const eye = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({color:0xffffff})
  );
  eye.position.y += 2;
  scene.add(eye);
  const eyeLook = new THREE.Mesh(
    new THREE.BoxGeometry(1,1,1),
    new THREE.MeshBasicMaterial({color:0xff1493})
  );
  eyeLook.position.y +=2;
  eyeLook.position.z +=2;
  eyeLook.visible = false;
  scene.add(eyeLook);
  
  
  //ビルの作成
  function makeBuilding(x,z,H){
    const buildingMaterial = new THREE.MeshPhongMaterial({color:0x508186,});
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(9,H,9),
      buildingMaterial
    );
    buildingMaterial.map = texture1;
    building.position.set(x,H/2,z);
    building.castShadow = true;
    scene.add(building);
  }
  for(let x=100;x<200;x+=10){
    for(let z=-200;z<200;z+=10){
      if(Math.random()<0.1)makeBuilding(x,z+4.5,(Math.random()*30)+15);
    }
  }
  for(let x=-100;x>-200;x-=10){
    for(let z=-200;z<200;z+=10){
      if(Math.random()<0.1)makeBuilding(x,z+4.5,(Math.random()*30)+15);
    }
  }
  for(let x=-100;x<100;x+=10){
    for(let z=100;z<200;z+=10){
      if(Math.random()<0.1)makeBuilding(x,z+4.5,(Math.random()*30)+15);
    }
  }
  for(let x=-100;x<100;x+=10){
    for(let z=-100;z>-200;z-=10){
      if(Math.random()<0.1)makeBuilding(x,z+4.5,(Math.random()*30)+15);
    }
  }
  
  const rails = new THREE.Group();
  //支柱の作成
  function makePillar(x,z,H){
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5,0.5,H,12),
      new THREE.MeshLambertMaterial({color:0xffcc00,opacity:param.opacity,transparent:true})
    );
    pillar.position.set(x,H/2,z);
    pillar.castshadow = true;
    rails.add(pillar);
  }

  //レールの作成
  function makeRail(x,y,z){
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW,0.2,0.2),
      new THREE.MeshLambertMaterial({color:0xffcc00,opacity:param.opacity,transparent:true })
    );
    rail.position.set(x,y-0.25,z);
    return rail;
  }
  function makeRailMid(x,y,z){
    const railmid = new THREE.Mesh(
      new THREE.BoxGeometry(0.2,0.4,0.6),
      new THREE.MeshLambertMaterial({color:0xffcc00,opacity:param.opacity,transparent:true })
    );
    railmid.position.set(x,y-0.25,z);
    return railmid;
  }
  //コースの設定
  // 制御点
  const controlPoints = [
    [-10,1,40],[-5,1,40],[5,60,40],[30,10,40],
    [35,10,40],[35,10,30],[35,30,15],[35,10,0],[35,40,-15],[35,15,-30],
    [30,15,-30],
    [30,15,-35],
    [10,15,-35],[10,5,-30],[10,20,30],
    [-10,20,30],[-10,20,20],[-10,60,10],[-15,10,-25],
    [-10,15,-40],
    [-20,20,-35],
    [-20,20,-30],[-30,60,-15],
    [-35,5,40]
  ]
  //コースの補間
  const course = new THREE.CatmullRomCurve3(
    controlPoints.map((p) => {
      return(new THREE.Vector3()).set(...p);
    }),true
  );
  //コースの描画
  const points = course.getPoints(300);
  const courseObject = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(points),
    new THREE.LineBasicMaterial({color: 0xffcc00})
  );
  scene.add(courseObject);

  //支柱の設置
  const BuildPillar = new THREE.Vector3();
  for(let i=0;i<20;i++){
    course.getPointAt(i/20,BuildPillar);
    makePillar(BuildPillar.getComponent(0),BuildPillar.getComponent(2),BuildPillar.getComponent(1)-2,);
  }
   //レールの設置
   const BuildRail = new THREE.Vector3();
   const RailTarget = new THREE.Vector3();
   const BuildRailmid = new THREE.Vector3();
   const RailmidTarget = new THREE.Vector3();
   for(let i=0;i<1000;i++){
     course.getPointAt(i/1000,BuildRail);
     const Rail = makeRail(BuildRail.getComponent(0),BuildRail.getComponent(1),BuildRail.getComponent(2),);
     course.getPointAt((i+1)/1000, RailTarget);
     Rail.lookAt(RailTarget);
     rails.add(Rail);
   }
   for(let i=0;i<1000;i++){
    course.getPointAt(i/1000,BuildRailmid);
    const Railmid = makeRailMid(BuildRailmid.getComponent(0),BuildRailmid.getComponent(1),BuildRailmid.getComponent(2),);
    course.getPointAt((i+1)/1000, RailmidTarget);
    Railmid.lookAt(RailmidTarget);
    rails.add(Railmid);
  }
  rails.children.forEach((rail)=>{
    rail.castShadow = true;
  })
  scene.add(rails);
  

  //光源の設定
  const light = new THREE.SpotLight(0xffffff, 100000);
  const DirectionalLight = new THREE.DirectionalLight(0xffffff,0.4);
  light.position.set(0, 200, 0);
  DirectionalLight.position.set(-100,100,100);
  light.castShadow = true;
  scene.add(light);
  scene.add(DirectionalLight);

  // 描画処理
  //描画のための変数
  const clock = new THREE.Clock();
  const ridePosition = new THREE.Vector3();
  const rideTarget = new THREE.Vector3();
  const ride2Position = new THREE.Vector3();
  const ride2Target = new THREE.Vector3();
  const ride3Position = new THREE.Vector3();
  const ride3Target = new THREE.Vector3();
  const cameraPosition = new THREE.Vector3();
  const cameraLook = new THREE.Vector3();
  // 描画関数
  function render() {
    //scene.background = renderTarget.texture;
    //rideの位置と向きの設定
    const elapsedTime = clock.getElapsedTime()/param.speed;
    course.getPointAt(elapsedTime%1, ridePosition);
    course.getPointAt((elapsedTime+0.3)%1, ride2Position);
    course.getPointAt((elapsedTime+0.6)%1, ride3Position);
    ride.position.copy(ridePosition);
    ride2.position.copy(ride2Position);
    ride3.position.copy(ride3Position);
    eye.position.copy(ridePosition);
    course.getPointAt((elapsedTime+0.005)%1, rideTarget);
    course.getPointAt((elapsedTime+0.301)%1, ride2Target);
    course.getPointAt((elapsedTime+0.601)%1, ride3Target);
    eyeLook.position.copy(rideTarget);
    ride.lookAt(rideTarget);
    ride2.lookAt(ride2Target);
    ride3.lookAt(ride3Target);
    //カメラ制御の更新
    orbitControls.update();
    //カメラ位置のきりかえ
    if(param.follow){
      cameraPosition.copy(ridePosition);
      cameraPosition.y = cameraPosition.getComponent(1)+3;
      camera.position.copy(cameraPosition);
      cameraLook.copy(rideTarget);
      cameraLook.y = cameraLook.getComponent(1)+3;
      camera.lookAt(cameraLook);
      camera.up.set(0,1,0);
    }else if(param.birdsEye){
      camera.position.set(-100,100,100);
      camera.lookAt(0,0,0);
    }
    //コースの表示
    courseObject.visible = param.course;
    // 座標軸の表示
    axes.visible = param.axes;
    // 描画
    renderer.render(scene, camera);
    // 次のフレームでの描画要請
    requestAnimationFrame(render);
  }

  // 描画開始
  render();
}

init();