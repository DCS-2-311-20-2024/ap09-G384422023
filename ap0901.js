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
    follow: false,//追跡
    birdsEye: true,//俯瞰
    course: true,//コース
    axes: true, // 座標軸
  };

  // GUIコントローラの設定
  const gui = new GUI();
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
    new THREE.PlaneGeometry(10,10),
    new THREE.MeshBasicMaterial({color: 0x606060 })
  );
  plane.rotation.x = -0.5 * Math.PI;
  //scene.add(plane);

  //乗り物の作成
  const bodyW = 2;
  const bodyH = 0.8;
  const bodyD = 3;
  const ride = new THREE.Group;
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(bodyW,bodyH,bodyD),
    new THREE.MeshBasicMaterial({color: 0xff4500})
  );
  ride.add(body);

  const center = new THREE.Mesh(
    new THREE.CylinderGeometry(bodyH,bodyH,bodyW,10,10,false,Math.PI/2,Math.PI/2),
    new THREE.MeshPhongMaterial({color: 0xff4500})
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
  
  //ビルの作成
  function makeBuilding(x,z,H){
    const building = new THREE.Mesh(
      new THREE.BoxGeometry(7,H,7),
      new THREE.MeshPhongMaterial({color:0x66827c})
    );
    building.position.set(x,H/2,z);
    scene.add(building);
  }
  //makeBuilding(0,0,15);

  //支柱の作成
  function makePillar(x,z,H){
    const pillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.5,0.5,H,12),
      new THREE.MeshLambertMaterial({color:0xfffafa})
    );
    pillar.position.set(x,H/2,z);
    scene.add(pillar);
  }
  //makePillar(0,0,3)

  //コースの設定
  // 制御点
  const controlPoints = [
    [-10,1,40],[-5,1,40],[5,50,40],[30,10,40],
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
    new THREE.LineBasicMaterial({color: "red"})
  );
  scene.add(courseObject);

  //光源の設定
  const light = new THREE.SpotLight(0xffffff, 1800);
  light.position.set(20, 20, 20);
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
  let v = 20;
  const clock = new THREE.Clock();
  const ridePosition = new THREE.Vector3();
  const rideTarget = new THREE.Vector3();
  const cameraPosition = new THREE.Vector3();
  // 描画関数
  function render() {
    
    //rideの位置と向きの設定
    const elapsedTime = clock.getElapsedTime()/v;
    course.getPointAt(elapsedTime%1, ridePosition);
    ride.position.copy(ridePosition);
    course.getPointAt((elapsedTime+0.01)%1, rideTarget);
    ride.lookAt(rideTarget);
    //カメラ制御の更新
    orbitControls.update();
    //カメラ位置のきりかえ
    if(param.follow){
      cameraPosition.lerpVectors(rideTarget, ridePosition,4);
      cameraPosition.y += 2.5;
      camera.position.copy(cameraPosition);
      camera.lookAt(ride.position);
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