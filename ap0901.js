//
// 応用プログラミング 第9,10回 自由課題 (ap0901.js)
// G384422023 左近 麻貴
//
"use strict"; // 厳格モード

// ライブラリをモジュールとして読み込む
import * as THREE from "three";
import { OrbitControls} from 'three/addons';
import { GUI } from "ili-gui";

// ３Ｄページ作成関数の定義
function init() {
  // 制御変数の定義
  const param = {
    speed: 30,
    follow: false,//追跡
    birdsEye: true,//俯瞰
    course: true,//コース
    axes: false, // 座標軸
  };
  // GUIコントローラの設定
  const gui = new GUI();
  gui.add(param,"speed",5,50).name("速度");
  gui.add(param,"follow").name("追跡");
  gui.add(param, "birdsEye").name("俯瞰");
  gui.add(param,"course").name("コース");
  gui.add(param, "axes").name("座標軸");

  // シーン作成
  const scene = new THREE.Scene();

  // 座標軸の設定
  const axes = new THREE.AxesHelper(18);
  scene.add(axes);

  //平面の設定
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(1000,1000),
    new THREE.MeshBasicMaterial({color: 0x606060 })
  );
  plane.rotation.x = -0.5 * Math.PI;
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
  makeTire(-bodyW/2,-bodyH/2,-bodyD/3)
  scene.add(ride);
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
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(7,H,7),
      new THREE.MeshPhongMaterial({color:0x66827c})
    );
    building.position.set(x,H/2,z);
    scene.add(building);
  }
  makeBuilding(-25,37,15);

  //支柱の作成
  function makePillar(x,z,H){
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5,0.5,H,12),
      new THREE.MeshLambertMaterial({color:0xffcc00})
    );
    pillar.position.set(x,H/2,z);
    scene.add(pillar);
  }

  //レールの作成
  function makeRail(x,y,z){
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(bodyW,0.2,0.2),
      new THREE.MeshLambertMaterial({color:0xffcc00 })
    );
    rail.position.set(x,y-0.25,z);
    return rail;
  }
  //コースの設定
  // 制御点
  const controlPoints = [
    [-10,1,40],[-5,1,40],[5,60,40],[30,10,40],
    [35,10,40],[35,10,30],[35,30,15],[35,10,0],[35,40,-15],[35,15,-30],
    [30,15,-30],
    [30,15,-35],
    [10,15,-35],[10,15,-30],[10,20,30],
    [-10,20,30],[-10,20,20],[-10,50,10],[-10,10,-25],
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
    makePillar(BuildPillar.getComponent(0),BuildPillar.getComponent(2),BuildPillar.getComponent(1)-1,);
  }
   //レールの設置
   const BuildRail = new THREE.Vector3();
   const RailTarget = new THREE.Vector3();
   for(let i=0;i<400;i++){
     course.getPointAt(i/400,BuildRail);
     const Rail = makeRail(BuildRail.getComponent(0),BuildRail.getComponent(1),BuildRail.getComponent(2),);
     course.getPointAt((i+1)/400, RailTarget);
     Rail.lookAt(RailTarget);
     scene.add(Rail);
   }
  //光源の設定
  const light = new THREE.SpotLight(0xffffff, 100000);
  light.position.set(-100, 200, -100);
  scene.add(light);

  // カメラの作成
  const camera = new THREE.PerspectiveCamera(
    50, window.innerWidth/window.innerHeight, 0.1, 1000);
  camera.position.set(5,7,9);
  camera.lookAt(0,0,0);

  // レンダラの設定
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, innerHeight);
  renderer.setClearColor( 0x808080 );
    document.getElementById("output").appendChild(renderer.domElement);

  // カメラコントロール
  const orbitControls = new OrbitControls(camera, renderer.domElement);

  // 描画処理
  //描画のための変数
  const clock = new THREE.Clock();
  const ridePosition = new THREE.Vector3();
  const rideTarget = new THREE.Vector3();
  const cameraPosition = new THREE.Vector3();
  const cameraLook = new THREE.Vector3();
  // 描画関数
  function render() {
    //rideの位置と向きの設定
    const elapsedTime = clock.getElapsedTime()/param.speed;
    course.getPointAt(elapsedTime%1, ridePosition);
    ride.position.copy(ridePosition);
    eye.position.copy(ridePosition);
    course.getPointAt((elapsedTime+0.01)%1, rideTarget);
    eyeLook.position.copy(rideTarget);
    ride.lookAt(rideTarget);
    //カメラ制御の更新
    orbitControls.update();
    //カメラ位置のきりかえ
    if(param.follow){
      cameraPosition.copy(ridePosition);
      cameraPosition.y = cameraPosition.getComponent(1)+3;
      camera.position.copy(cameraPosition);
      cameraLook.copy(rideTarget);
      cameraLook.y = cameraLook.getComponent(1)+2;
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