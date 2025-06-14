
'use client';
import { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { TransformControls } from 'three/examples/jsm/controls/TransformControls.js';
import { useParams } from 'next/navigation';
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Slider } from "@/components/ui/slider"
import { GLTFLoader, GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { Eye, EyeOff, RotateCcw, RotateCw, HelpCircle, Camera } from "lucide-react"

import FurnitureModal from "@/components/organisms/FurnitureModal";
import HelpModal from "@/components/molecules/HelpModal";
import PhotographModal from "@/components/organisms/PhotographModal";
import * as constants from "@/constants/roomSimulatorConstants";

type furnitureInfo = {
  id: string
  label: string
  color: string
  position: { x: number; y: number; z: number }
  rotation: { x: number; y: number; z: number }
  dimensions: { width: number; height: number; depth: number }
  mesh: THREE.Mesh
}

type StorageData = Omit<furnitureInfo, 'mesh'>
const fps = 30

const SimulateRoomArrangement: React.FC = () => {
  // parameter
  const params = useParams();
  const propertyId = params.property_id;

  // Ref
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const mouseRef = useRef<THREE.Vector2>(new THREE.Vector2())
  const orbitControlsRef = useRef<OrbitControls | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const sceneRef = useRef<THREE.Scene | null>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const transformControlsRef = useRef<TransformControls | null>(null)
  const raycasterRef = useRef<THREE.Raycaster | null>(null)
  const furnitureListRef = useRef<furnitureInfo[]>([]);

  // ローカルストレージの書き込み
  const saveFurnitureToLocalStorage = (furnitureData: furnitureInfo[]) => {
    const savingData:StorageData[] = furnitureData.map((furnitureData) => ({
      id: furnitureData.id,
      label: furnitureData.label,
      color: furnitureData.color,
      position: furnitureData.position,
      rotation: furnitureData.rotation,
      dimensions: furnitureData.dimensions,
    }));
    localStorage.setItem("furnitureData", JSON.stringify(savingData));
  };

  const saveRoomDimensionsToLocalStorage = (dimensions: { width: number; depth: number; height: number }) => {
    const roomDimensions = {
      width: dimensions.width,
      depth: dimensions.depth,
      height: dimensions.height,
    };
    localStorage.setItem("roomDimensions", JSON.stringify(roomDimensions));
  };

  // ローカルストレージの読み込み
  const loadFurnitureFromLocalStorage = async () => {
    const data = localStorage.getItem("furnitureData");
    if (!data) return;
  
    const savedFurniture = JSON.parse(data) as StorageData[];
    const loader = new GLTFLoader();
  
    const loadedFurniture: furnitureInfo[] = await Promise.all(
      savedFurniture.map((item) => {
        return new Promise<furnitureInfo>((resolve, reject) => {
          // 対応する家具データを検索
          const furniture = constants.furnitureCatalog.find((f) => f.name === item.label);
          if (!furniture) {
            console.error(`"${item.label}" に対応するモデルが見つかりません。`);
            return reject(`"${item.label}" に対応するモデルが見つかりません。`);
          }
  
          // GLTFLoaderを使用してモデルを読み込む
          loader.load(
            `/models/${furniture.model}`,
            (gltf: GLTF) => {
              const model = gltf.scene.children[0] as THREE.Mesh;
              model.position.set(item.position.x, item.position.y, item.position.z);
              model.rotation.set(item.rotation.x, item.rotation.y, item.rotation.z);
              model.scale.set(item.dimensions.width, item.dimensions.height, item.dimensions.depth);
  
              // 家具情報を作成
              const furnitureInfo: furnitureInfo = {
                ...item,
                mesh: model,
              };
  
              // シーンに追加
              sceneRef.current?.add(model);  
              resolve(furnitureInfo);
            },
            undefined,
            (error) => {
              console.error(`"${item.label}" のモデル読み込み中にエラーが発生しました:`, error);
              reject(error);
            }
          );
        });
      })
    );
  
    // 家具リストを更新
    setFurnitureList(loadedFurniture);
  };

  const loadRoomDimensionsFromLocalStorage = ():  { width: number; depth: number; height: number } => {
    const data = localStorage.getItem("roomDimensions");
    if (!data) return { width: 5, depth: 4, height: 2.5 }; // デフォルト値
    const roomDimensions = JSON.parse(data);
    return {
      width: roomDimensions.width || 5,
      depth: roomDimensions.depth || 4,
      height: roomDimensions.height || 2.5,
    };
  };

  // State
  const [furnitureList, setFurnitureList] = useState<furnitureInfo[]>([])
  const [expandedFurnitureId, setExpandedFurnitureId] = useState<string | null>(null)
  const [roomDimensions, setRoomDimensions] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedRoomDimensions = loadRoomDimensionsFromLocalStorage()
      return savedRoomDimensions
    } else {
      return { width: 5, depth: 4, height: 2.5 } // デフォルト値
    }
  })
  const roomDimensionsRef = useRef(roomDimensions);
  const [furnitureVisibility, setFurnitureVisibility] = useState<{ [id: string]: boolean }>({});
  // カメラ視点切り替え用state
  const [isViewCenter, setIsViewCenter] = useState(false);

  // 部屋の作成
  const textureLoader = new THREE.TextureLoader();

  const floorTexture = textureLoader.load('/textures/flooring.png');
  const floorMaterial = new THREE.MeshStandardMaterial({ map: floorTexture });

  const wallTexture = textureLoader.load('/textures/wallpaper_original.png'); 
  const wallMaterial = new THREE.MeshStandardMaterial({ map: wallTexture });

  const floorGeometry = new THREE.PlaneGeometry(roomDimensions.width, roomDimensions.depth)
  const leftWallGeometry = new THREE.PlaneGeometry(roomDimensions.width, roomDimensions.height)
  const rightWallGeometry = new THREE.PlaneGeometry(roomDimensions.depth, roomDimensions.height)

  const floor = new THREE.Mesh(floorGeometry, floorMaterial)
  floor.rotation.x = -Math.PI/2
  floor.position.set(roomDimensions.width/2, 0, roomDimensions.depth/2)
  const floorRef = useRef<THREE.Mesh>(floor)

  const leftWall = new THREE.Mesh(leftWallGeometry, wallMaterial)
  leftWall.position.set(roomDimensions.width, roomDimensions.height/2, roomDimensions.depth)
  const leftWallRef = useRef<THREE.Mesh>(leftWall)

  const rightWall = new THREE.Mesh(rightWallGeometry, wallMaterial)
  rightWall.rotation.y = Math.PI /2
  rightWall.position.set(-roomDimensions.width/2, roomDimensions.height/2, roomDimensions.depth/2)
  const rightWallRef = useRef<THREE.Mesh>(rightWall)

  const diagonalLeftWall = new THREE.Mesh(leftWallGeometry, wallMaterial);
  diagonalLeftWall.rotation.y = Math.PI
  diagonalLeftWall.position.set(roomDimensions.width/2, roomDimensions.height/2,  roomDimensions.depth)
  const diagonalLeftWallRef = useRef<THREE.Mesh>(diagonalLeftWall)

  const diagonalRightWall = new THREE.Mesh(rightWallGeometry, wallMaterial)
  diagonalRightWall.rotation.y = -Math.PI/2
  diagonalRightWall.position.set(roomDimensions.width, roomDimensions.height/2, roomDimensions.depth/2)
  const diagonalRightWallRef = useRef<THREE.Mesh>(diagonalRightWall)

  useEffect(() => {
    if (!canvasRef.current) return    

    // シーン
    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0xffe4b5); 
    sceneRef.current = scene;

    // キャンバス
    const canvas_width = canvasRef.current.clientWidth;
    const canvas_height = canvasRef.current.clientHeight;
    
    // カメラ
    const camera = new THREE.PerspectiveCamera(75, canvas_width / canvas_height, 0.1, 1000)
    camera.position.set(1.1 * roomDimensions.width, 1.1* roomDimensions.height, 1.1* roomDimensions.depth)
    camera.lookAt(roomDimensions.width/2, roomDimensions.height/2, roomDimensions.depth/2)
    cameraRef.current = camera

    // レンダラー
    const renderer = new THREE.WebGLRenderer({ canvas: canvasRef.current });
    renderer.setSize(canvas_width, canvas_height);
    renderer.setPixelRatio(window.devicePixelRatio);
    rendererRef.current = renderer

    // オービットコントロール
    const orbitControls = new OrbitControls(cameraRef.current, canvasRef.current)
    orbitControls.target.set(roomDimensions.width/2, roomDimensions.height/2, roomDimensions.depth/2)
    orbitControlsRef.current = orbitControls

    // レイキャスター
    const raycaster = new THREE.Raycaster();
    raycasterRef.current = raycaster
    
    // 部屋壁の追加
    sceneRef.current.add(floorRef.current, rightWallRef.current, leftWallRef.current, diagonalLeftWallRef.current, diagonalRightWallRef.current)

    // ライト
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1)
    directionalLight.position.set(roomDimensions.width, roomDimensions.height, roomDimensions.depth)
    sceneRef.current.add(ambientLight, directionalLight)

    // ローカルストレージのデータを読み込み
    const loadData = async () => {
      await loadFurnitureFromLocalStorage();
    };  
    loadData();

    // トランスフォームコントロール
    const transformControls = new TransformControls(cameraRef.current, canvasRef.current);    
    transformControlsRef.current = transformControls
    transformControlsRef.current.addEventListener('dragging-changed', (event) => {
      if (orbitControlsRef.current) {
        orbitControlsRef.current.enabled = !event.value;
      }
    });
    const gizmo = transformControlsRef.current.getHelper()
    sceneRef.current.add(gizmo)    

    // トランスフォームの付け替え
    const attachTransformControls = (event:MouseEvent) => {
      if (!cameraRef.current || !sceneRef.current || !transformControlsRef.current || !canvasRef.current || !raycasterRef.current) return // null チェック
      event.preventDefault();
        
      // 座標を正規化する
      // canvas上でのX, Y座標
      const canvasX = event.clientX - canvasRef.current.offsetLeft
      const canvasY = event.clientY - canvasRef.current.offsetTop

      // canvas要素の幅・高さ
      const canvasWidth = canvasRef.current.offsetWidth;
      const canvasHeight = canvasRef.current.offsetHeight;

      // -1〜+1の範囲で現在のマウス座標を正規化する
      mouseRef.current.x = (canvasX / canvasWidth) * 2 - 1;
      mouseRef.current.y = -(canvasY / canvasHeight) * 2 + 1;
  
      // レイキャスティングでマウスと重なるオブジェクトを取得
      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);  
      const furnitureMeshes = furnitureListRef.current.map((furniture) => furniture.mesh);
      const intersects = raycasterRef.current.intersectObjects(furnitureMeshes, true);
      
      if (intersects && intersects[0] && intersects[0].object) {
        const selectedObject = intersects[0].object;

        // TransformControlsを対象のボックスに適用
        if (selectedObject.isObject3D) {
          transformControlsRef.current.attach(selectedObject);
        }

        // 対象の家具を検索
        const targetObject = furnitureListRef.current.find((furniture) => furniture.mesh === selectedObject);

        // 対象の家具カードを展開
        if (targetObject) {
          setExpandedFurnitureId(targetObject.id);
        } else {
          setExpandedFurnitureId(null);
        }
      }  
    }
    canvasRef.current.addEventListener('click', (e)=>{attachTransformControls(e)})

    // ダブルクリック時にはTransformControlsを外す
    const detachTransformControls = () => {
      if (!transformControlsRef.current) return
      transformControlsRef.current.detach();
      setExpandedFurnitureId(null);
    }
    canvasRef.current.addEventListener('dblclick', ()=>{detachTransformControls()})

    // 座標変更時に壁抜けチェック    
    const handleTransformChange = () => {
      if (!transformControlsRef.current || !(transformControlsRef.current.mode === 'translate')) return
      const attachedObject = transformControlsRef.current?.object;
      if (!attachedObject ) return;
  
      // 対象の家具を検索
      const targetObject = furnitureListRef.current.find((furniture) => furniture.mesh === attachedObject);
      if (!targetObject) return;
      // 座標が変更されてない場合、または、壁からはみ出ていない場合は何もしない
      if (targetObject.position.x > targetObject.dimensions.width/2 &&
          targetObject.position.y > targetObject.dimensions.height/2 &&
          targetObject.position.z > targetObject.dimensions.depth/2 &&
          targetObject.position.x - targetObject.dimensions.width/2 > roomDimensionsRef.current.width &&
          targetObject.position.z - targetObject.dimensions.depth/2 > roomDimensionsRef.current.depth &&
          targetObject.position.x === attachedObject.position.x &&
          targetObject.position.y === attachedObject.position.y &&
          targetObject.position.z === attachedObject.position.z) return;      
  
      // 壁からはみ出ないように座標を更新
      const newPosition = {
        x: Math.min(Math.max(targetObject.dimensions.width/2, attachedObject.position.x), roomDimensionsRef.current.width - targetObject.dimensions.width/2),
        y: Math.max(targetObject.dimensions.height/2, attachedObject.position.y),
        z: Math.min(Math.max(targetObject.dimensions.depth/2, attachedObject.position.z), roomDimensionsRef.current.depth - targetObject.dimensions.depth/2),
      };
      attachedObject.position.set(newPosition.x, newPosition.y, newPosition.z);
  
      // 状態を更新
      setFurnitureList((prevFurnitureList) =>
        prevFurnitureList.map((furniture) =>
          furniture.id === targetObject.id
            ? { ...furniture, position: newPosition }
            : furniture
        )
      );
    };
    transformControlsRef.current.addEventListener('objectChange', handleTransformChange);
    
    // リサイズ時に画面サイズを変える
    const handleResize = () => {
      if (!canvasRef.current || !rendererRef.current || !cameraRef.current) return
      const newWidth = canvasRef.current.parentElement?.clientWidth;
      const newHeight = canvasRef.current.parentElement?.clientHeight;
      if (!newWidth || !newHeight) return
      rendererRef.current.setSize(newWidth, newHeight);
      rendererRef.current.setPixelRatio(window.devicePixelRatio);
      cameraRef.current.aspect = newWidth / newHeight;
      cameraRef.current.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);    

    // 描画
    const render = () => {
      if (!sceneRef.current || !rendererRef.current || !cameraRef.current || !orbitControlsRef.current) return      
      // fpsに応じて描画する
      if (animationFrameRef.current && (animationFrameRef.current % Math.floor(60 / fps)) === 0) {
        orbitControlsRef.current.update()
        rendererRef.current.render(sceneRef.current, cameraRef.current)
      }
      animationFrameRef.current = requestAnimationFrame(render)
    }
    render()

    // クリーンアップ関数
    return () => {
      // メモリリークを防ぐためにジオメトリとマテリアルを破棄。 ToDo：作った分だけ消すようにする。
      renderer.dispose()
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  useEffect(()=>{
    // 部屋の寸法変更フック
    if (!sceneRef.current || !orbitControlsRef.current) return

    // 壁の寸法変更
    floorRef.current.geometry.dispose()
    floorRef.current.geometry = new THREE.PlaneGeometry(roomDimensions.width, roomDimensions.depth)

    leftWallRef.current.geometry.dispose();
    leftWallRef.current.geometry = new THREE.PlaneGeometry(roomDimensions.width, roomDimensions.height);

    rightWallRef.current.geometry.dispose();
    rightWallRef.current.geometry = new THREE.PlaneGeometry(roomDimensions.depth, roomDimensions.height);

    diagonalLeftWallRef.current.geometry.dispose();
    diagonalLeftWallRef.current.geometry = new THREE.PlaneGeometry(roomDimensions.width, roomDimensions.height);

    diagonalRightWallRef.current.geometry.dispose();
    diagonalRightWallRef.current.geometry = new THREE.PlaneGeometry(roomDimensions.depth, roomDimensions.height);

    floorRef.current.position.set(roomDimensions.width/2, 0, roomDimensions.depth/2)
    leftWallRef.current.position.set(roomDimensions.width/2, roomDimensions.height/2, 0)
    rightWallRef.current.position.set(0, roomDimensions.height/2, roomDimensions.depth/2)
    diagonalLeftWallRef.current.position.set(roomDimensions.width/2, roomDimensions.height/2,  roomDimensions.depth)
    diagonalRightWallRef.current.position.set(roomDimensions.width, roomDimensions.height/2, roomDimensions.depth/2)

    sceneRef.current.add(leftWallRef.current, rightWallRef.current, floorRef.current, diagonalLeftWallRef.current, diagonalRightWallRef.current)

    // ローカルストレージに部屋の寸法を保存
    saveRoomDimensionsToLocalStorage(roomDimensions)

    // カメラが部屋の中心を見るようにする
    orbitControlsRef.current.target.set(roomDimensions.width/2, roomDimensions.height/2, roomDimensions.depth/2);
    roomDimensionsRef.current = roomDimensions;
  },[roomDimensions.width, roomDimensions.height, roomDimensions.depth])

  // 家具の追加
  const addFurniture = (label:string) => {
    if (!sceneRef.current || !transformControlsRef.current) return

    // 対応する家具データを検索
    const furniture = constants.furnitureCatalog.find((item) => item.name === label);
    if (!furniture) {
      console.error(`"${label}" の3Dモデルが読み込めませんでした。`);
      alert(`"${label}" の3Dモデルが読み込めませんでした。`);
      return;
    }

    // ランダムな色を生成
    const colorHex = Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")

    // 家具のサイズ
    const width = furniture.defaultScale[0]
    const height = furniture.defaultScale[1]
    const depth = furniture.defaultScale[2]

    // ランダムな位置を生成
    const x = (Math.random() + 0.5) * 2
    const y = height/2
    const z = (Math.random() + 0.5) * 2

    // GLTFLoaderを使用してGLBモデルを読み込む
    const loader = new GLTFLoader();
    loader.load(`/models/${furniture.model}`, (gltf:GLTF) => {
      console.log("gltf", gltf)
      const model = gltf.scene.children[0] as THREE.Mesh;
      model.position.set(x, y, z)
      model.scale.set(width, height, depth)
      sceneRef.current?.add(model)
      transformControlsRef.current?.attach(model)

      // 新しい家具の情報を作成
      const newFurniture: furnitureInfo = {
        id: `furniture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        label: label,
        color: `#${colorHex}`,
        position: { x, y, z },
        dimensions: { width, height, depth },
        rotation: { x: 0, y: 0, z: 0 }, // 初期回転を設定
        mesh: model,
      };

      setFurnitureList((prevFurnitureList) => [...prevFurnitureList, newFurniture])
      setFurnitureVisibility((prev) => ({
          ...prev,
          [newFurniture.id]: true, // 追加した家具はデフォルトで可視
      }));
      setExpandedFurnitureId(newFurniture.id)
    })
  }

  // 家具の可視状態切り替え
  const toggleFurnitureVisibility = (id: string) => {
    setFurnitureVisibility((prev) => {
      const newVisible = id in prev ? !prev[id]: false; // 既に存在する場合は反転、存在しない場合はfalse
      // メッシュの可視状態を変更
      const target = furnitureList.find((f) => f.id === id);
      if (target) target.mesh.visible = newVisible;
      if (target && transformControlsRef.current && transformControlsRef.current.object === target.mesh) {
        transformControlsRef.current.detach();
      }
      return { ...prev, [id]: newVisible };
    });
  };

  // 家具リストの変更時に可視状態を反映
  useEffect(() => {
    furnitureList.forEach((f) => {
      f.mesh.visible = furnitureVisibility[f.id] !== false;
    });
  }, [furnitureList, furnitureVisibility]);

  // スライダーによる家具の寸法変更
  const updateFurnitureDimensions = (id: string, dimensions: { width?: number; height?: number; depth?: number }) => {
    if (!sceneRef.current) return

    setFurnitureList((prevFurnitureList) => {
      return prevFurnitureList.map((furniture) => {
        if (furniture.id !== id) return furniture

        // 寸法をアップデート
        const updatedDimensions = {
          width: dimensions.width !== undefined ? dimensions.width  : furniture.dimensions.width,
          height: dimensions.height !== undefined ? dimensions.height  : furniture.dimensions.height,
          depth: dimensions.depth !== undefined ? dimensions.depth : furniture.dimensions.depth,
        };

        furniture.mesh.scale.set(updatedDimensions.width, updatedDimensions.height, updatedDimensions.depth)

        // 新しいメッシュをシーンに追加。
        sceneRef.current?.add(furniture.mesh)

        // furniture stateを更新
        return {
          ...furniture,
          dimensions: updatedDimensions,
          mesh: furniture.mesh,
        }
      })
    })
  }

  // スライダーによる家具の回転変更
  const updateFurnitureRotation = (id: string, rotation: { x?: number; y?: number; z?: number }) => {
    setFurnitureList((prevFurnitureList) =>
      prevFurnitureList.map((furniture) => {
        if (furniture.id !== id) return furniture;
  
        // 回転を更新
        const updatedRotation = {
          x: rotation.x !== undefined ? rotation.x : furniture.rotation.x,
          y: rotation.y !== undefined ? rotation.y : furniture.rotation.y,
          z: rotation.z !== undefined ? rotation.z : furniture.rotation.z,
        };
  
        // メッシュの回転を反映
        furniture.mesh.rotation.set(updatedRotation.x, updatedRotation.y, updatedRotation.z);
  
        return {
          ...furniture,
          rotation: updatedRotation,
        };
      })
    );
  };

  // 俯瞰⇔部屋の中心視点の切り替え
  const switchCameraView = () => {
    const newIsViewCenter = !isViewCenter;
    if (!cameraRef.current || !orbitControlsRef.current) return;

    if (newIsViewCenter) {
      // 部屋の中心にカメラを置く
      cameraRef.current.position.set(
        roomDimensions.width / 2,
        roomDimensions.height / 2,
        roomDimensions.depth / 2+0.01
      );
      // 少し前方を見る
      cameraRef.current.lookAt(
        roomDimensions.width / 2,
        roomDimensions.height / 2,
        roomDimensions.depth / 2
      );
    } else {
      // 俯瞰視点
      cameraRef.current.position.set(
        1.1 * roomDimensions.width,
        1.1 * roomDimensions.height,
        1.1 * roomDimensions.depth
      );
      cameraRef.current.lookAt(
        roomDimensions.width / 2,
        roomDimensions.height / 2,
        roomDimensions.depth / 2
      );
    }
    cameraRef.current.updateProjectionMatrix();
    orbitControlsRef.current.update();
    setIsViewCenter(newIsViewCenter);
  }

  // 家具の削除
  const removeFurniture = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!sceneRef.current || !transformControlsRef.current) return

    // 削除するfurnitureのidを検索
    const furnitureToRemove = furnitureList.find((furniture) => furniture.id === id)
    if (!furnitureToRemove) return

    // TransformControlsがこのオブジェクトにアタッチされている場合、detachする
    if (transformControlsRef.current.object === furnitureToRemove.mesh) {
      transformControlsRef.current.detach();
    }

    // シーンから削除
    sceneRef.current.remove(furnitureToRemove.mesh)

    // マテリアルとジオメトリの削除
    furnitureToRemove.mesh.geometry.dispose()
    if (furnitureToRemove.mesh.material instanceof THREE.Material) {
      furnitureToRemove.mesh.material.dispose()
    } else if (Array.isArray(furnitureToRemove.mesh.material)) {
      furnitureToRemove.mesh.material.forEach((material) => material.dispose())
    }

    // furniture stateを更新
    setFurnitureList((prevFurnitureList) => prevFurnitureList.filter((furniture) => furniture.id !== id))
    saveFurnitureToLocalStorage(furnitureList.filter((furniture) => furniture.id !== id))

    // 家具メニュー開閉
    if (expandedFurnitureId === id) {
      setExpandedFurnitureId(null)
    }
  }

  //  家具メニュートグルの開閉
  const toggleExpanded = (id: string) => {
    setExpandedFurnitureId(expandedFurnitureId === id ? null : id)
  }

  // 家具のリストを更新
  useEffect(() => {
    furnitureListRef.current = furnitureList;    
    if (furnitureList.length > 0) {
      console.log("saving furnitureList", furnitureList)
      saveFurnitureToLocalStorage(furnitureList);
    }
  }, [furnitureList]);

  // idを指定してTransformControlsをアタッチ
  const attachTransformControlsById = (id: string) => {
    if (!transformControlsRef.current || !sceneRef.current) return;
  
    // 対象の家具を検索
    const targetObject = furnitureList.find((furniture) => furniture.id === id);
    if (!targetObject) return;
  
    // TransformControlsを対象の家具にアタッチ
    transformControlsRef.current.detach(); // 前回の対象をリセット
    transformControlsRef.current.attach(targetObject.mesh);
  };

  // API結果をもとに部屋を構築
  const buildRoomFromApi = (apiData: {
    roomDimensions:{width: number; depth: number; height: number }, 
    furnitureData: Array<{
      name: string;
      positionX: number;
      positionY: number;
      positionZ: number;
      width: number;
      height: number;
      depth: number;
      rotation: { x: number; y: number; z: number };
    }> }) => {
    console.log("Building room from API data:", apiData);
    if (apiData.roomDimensions) {
        setRoomDimensions(apiData.roomDimensions);
      }
    if (apiData.furnitureData) {
      // 必要に応じて既存家具をクリア
      setFurnitureList([]);
      // 家具を追加
      for (const f of apiData.furnitureData) {
        console.log("Adding furniture from API:", f.name);
        
        const furniture = constants.furnitureCatalog.find((item) => item.name_en === f.name);
        if (!furniture) {
          console.error(`"${f.name}"`);
          return;
        }
        // ランダムな色を生成
        const colorHex = Math.floor(Math.random() * 16777215)
          .toString(16)
          .padStart(6, "0")
        // GLTFLoaderを使用してGLBモデルを読み込む
        const loader = new GLTFLoader();
        loader.load(`/models/${furniture.model}`, (gltf:GLTF) => {
          console.log("gltf", gltf)
          const model = gltf.scene.children[0] as THREE.Mesh;
          model.position.set(f.positionX, f.positionY, f.positionZ)
          model.scale.set(f.width, f.height, f.depth)
          sceneRef.current?.add(model)
          transformControlsRef.current?.attach(model)

          // 新しい家具の情報を作成
          const newFurniture: furnitureInfo = {
            id: `furniture-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            label: furniture.name,
            color: `#${colorHex}`,
            position: { x: f.positionX, y: f.positionY, z: f.positionZ },
            dimensions: { width: f.width, height: f.height, depth: f.depth },
            rotation: { x: 0, y: 0, z: 0 }, 
            mesh: model,
          };

          setFurnitureList((prevFurnitureList) => [...prevFurnitureList, newFurniture])
          setFurnitureVisibility((prev) => ({
              ...prev,
              [newFurniture.id]: true, // 追加した家具はデフォルトで可視
          }));
        })
      }
    }
  }

  // モーダル操作
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);

  // スマホ縦画面で横画面を推奨する案内
  useEffect(() => {
    const checkOrientation = () => {
      if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
        // スマホ縦画面の場合のみ表示
        const id = "orientation-alert";
        if (!document.getElementById(id)) {
          const div = document.createElement("div");
          div.id = id;
          div.className = "fixed inset-0 z-[100] flex items-center justify-center bg-black/70";
          div.innerHTML = `
            <div class="bg-white rounded-lg shadow-lg p-6 text-center">
              <div class="text-xl font-bold mb-2">横画面推奨</div>
              <div class="mb-4 text-base">このサービスは横画面でのご利用を推奨しています。<br>端末を横向きにしてください。</div>
            </div>
          `;
          document.body.appendChild(div);
        }
      } else {
        // 横画面やPCの場合は非表示
        const alert = document.getElementById("orientation-alert");
        if (alert) alert.remove();
      }
    };

    window.addEventListener("resize", checkOrientation);
    checkOrientation();

    return () => {
      window.removeEventListener("resize", checkOrientation);
      const alert = document?.getElementById("orientation-alert");
      if (alert) alert.remove();
    };
  }, []);

  return (
    <div className="flex h-screen w-full">
      <div className="w-2/5 lg:w-1/4 p-4 bg-gray-100 text-black block h-screen overflow-y-scroll">            
        <h2 className="text-2xl font-bold mb-4">Room Simulator propertyId:{propertyId}</h2>
        <RoomDimensionSection roomDimensions={roomDimensions} setRoomDimensions={setRoomDimensions}/>
        <AddFurnitureSection setIsModalOpen={setIsModalOpen}/> 
        <HandleFurnitureSection 
          furnitureList={furnitureList} 
          expandedFurnitureId={expandedFurnitureId} 
          attachTransformControlsById={attachTransformControlsById} 
          removeFurniture={removeFurniture} 
          updateFurnitureDimensions={updateFurnitureDimensions} 
          updateFurnitureRotation={updateFurnitureRotation}
          toggleExpanded={toggleExpanded}
          furnitureVisibility={furnitureVisibility}
          toggleFurnitureVisibility={toggleFurnitureVisibility}
        />
        <footer className="bg-gray-200 text-gray-700 text-sm p-4">
          <p>テクスチャ提供: <a href="http://www.freepik.com" className="text-blue-500 underline">Designed by Kjpargeter / Freepik</a></p>
        </footer>
      </div>
      <div className="w-3/5 lg:w-3/4 h-screen ">
        <canvas className="w-full h-full" ref={canvasRef} />
      </div>

      <FurnitureModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelect={addFurniture}
      />

      <button
        className="fixed bottom-24 right-6 z-50 bg-white text-blue-500 rounded-full shadow-lg w-12 h-12 flex items-center justify-center hover:bg-blue-100 border border-blue-300"
        onClick={switchCameraView}
        aria-label="視点切り替え"
        type="button"
        title={isViewCenter ? "俯瞰視点に切り替え" : "部屋の中心を見る" }
      >
        <Eye className="w-7 h-7" />
      </button>
      
      <HelpModal open={isHelpOpen} onClose={() => setIsHelpOpen(false)} />

      <button
        className="fixed bottom-6 right-6 z-50 bg-blue-500 text-white rounded-full shadow-lg w-12 h-12 flex items-center justify-center hover:bg-blue-600"
        onClick={() => setIsHelpOpen(true)}
        aria-label="操作方法ヘルプ"
        type="button"
      >
        <HelpCircle className="w-7 h-7" />
      </button>

      <button
        className="fixed bottom-40 right-6 z-50 bg-white text-blue-500 rounded-full shadow-lg w-12 h-12 flex items-center justify-center hover:bg-blue-100 border border-blue-300"
        onClick={() => setIsPhotoModalOpen(true)}
        aria-label="部屋を撮影して解析"
        type="button"        
      >
        <Camera className="w-7 h-7" />
      </button>
      <PhotographModal
        open={isPhotoModalOpen}
        BuildRoom={buildRoomFromApi} // 部屋構築用の関数
        onClose={() => setIsPhotoModalOpen(false)}
      />
    </div>
  )
}

type RoomDimensionSectionProps = {
  roomDimensions: { width: number; depth: number; height: number };
  setRoomDimensions: React.Dispatch<React.SetStateAction<{ width: number; depth: number; height: number }>>;
};

function RoomDimensionSection({ roomDimensions, setRoomDimensions }: RoomDimensionSectionProps) {
  // 部屋の寸法を変更するセクション
  return (
    <div className="mb-1 lg:mb-6">
      <h3 className="text-base lg:text-lg font-semibold mb-1 lg:mb-4">部屋の寸法</h3>
      <div className="grid grid-cols-3 gap-4">
        <div className="p-2 lg:p-4 bg-white shadow rounded">
          <Label htmlFor="room-width" className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            幅 (m)
          </Label>
          <input
            id="room-width"
            type="number"
            min="0"
            step="0.1"
            value={roomDimensions.width}
            onChange={(e) => setRoomDimensions({ ...roomDimensions, width: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs lg:text-sm focus:ring focus:ring-blue-300"
          />
        </div>
        <div className="p-2 lg:p-4 bg-white shadow rounded">
          <Label htmlFor="room-depth" className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            奥行 (m)
          </Label>
          <input
            id="room-depth"
            type="number"
            min="0"
            step="0.1"
            value={roomDimensions.depth}
            onChange={(e) => setRoomDimensions({ ...roomDimensions, depth: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs lg:text-sm focus:ring focus:ring-blue-300"
          />
        </div>
        <div className="p-2 lg:p-4 bg-white shadow rounded">
          <Label htmlFor="room-height" className="block text-xs lg:text-sm font-medium text-gray-700 mb-2">
            高さ (m)
          </Label>
          <input
            id="room-height"
            type="number"
            min="0"
            step="0.1"
            value={roomDimensions.height}
            onChange={(e) => setRoomDimensions({ ...roomDimensions, height: Number(e.target.value) })}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs lg:text-sm focus:ring focus:ring-blue-300"
          />
        </div>
      </div>
    </div>
  )
}

type AddFurnitureSectionProps = {
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function AddFurnitureSection({setIsModalOpen}: AddFurnitureSectionProps) {
  // 家具の追加セクション
  return(
    <div className="mb-1 lg:mb-6">
          <div className="flex items-center gap-2" onClick={() => setIsModalOpen(true)}>
            <h3 className="text-base lg:text-lg font-semibold text-blue-500">家具の追加</h3>
            <Button
              variant="ghost"
              size="icon"
              className="text-blue-500"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </Button>
          </div>
    </div>
  )
}

type HandleFurnitureSectionProps = {
  furnitureList: furnitureInfo[];
  expandedFurnitureId: string | null;
  attachTransformControlsById: (id: string) => void;
  removeFurniture: (id: string, e: React.MouseEvent) => void;
  updateFurnitureDimensions: (id: string, dimensions: { width?: number; height?: number; depth?: number }) => void;
  updateFurnitureRotation: (id: string, rotation: { x?: number; y?: number; z?: number }) => void;
  toggleExpanded: (id: string) => void;
  furnitureVisibility: { [id: string]: boolean };
  toggleFurnitureVisibility: (id: string) => void;
}

function HandleFurnitureSection({furnitureList, expandedFurnitureId, attachTransformControlsById, removeFurniture, updateFurnitureDimensions, updateFurnitureRotation, toggleExpanded, furnitureVisibility, toggleFurnitureVisibility,}: HandleFurnitureSectionProps) {
  // 家具の操作セクション
  
  // 各家具IDごとにrefを保持
  const cardRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // expandedFurnitureIdが変わった時にスクロール
  useEffect(() => {
    if (expandedFurnitureId && cardRefs.current[expandedFurnitureId]) {
      cardRefs.current[expandedFurnitureId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [expandedFurnitureId]);

  return (
    <div className="w-full h-3/5 bg-gray-50 p-4 overflow-y-scroll border-l">
      <h3 className="font-medium mb-1 lg:mb-4 text-base lg:text-lg">家具一覧</h3>
      {furnitureList.length === 0 ? (
        <p className="text-sm text-gray-500">
          家具を追加してください。
        </p>
      ) : (
        <div className="space-y-3">
          {furnitureList.map((furniture, index) => (
            <Card key={`${furniture.id}-${index}`} ref={(el) => {cardRefs.current[furniture.id] = el}} className={`p-3`} onClick={() => attachTransformControlsById(furniture.id)}>
              <div>{furniture.label}</div>
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full" style={{ backgroundColor: furniture.color }} />
                <div className="flex-1 text-xs">
                  <div>X: {furniture.position.x.toFixed(2)}</div>
                  <div>Y: {furniture.position.y.toFixed(2)}</div>
                  <div>Z: {furniture.position.z.toFixed(2)}</div>
                </div>                
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleExpanded(furniture.id)}
                  title={expandedFurnitureId === furniture.id ? "詳細を閉じる" : "詳細を開く"}
                >
                  {expandedFurnitureId === furniture.id ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button> 
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFurnitureVisibility(furniture.id);
                  }}
                  title={(furniture.id in furnitureVisibility ? furnitureVisibility[furniture.id] : true) === false ? "表示" : "非表示"}
                >
                  {(furniture.id in furnitureVisibility ? furnitureVisibility[furniture.id] : true) === false ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>                   
                <Button variant="ghost" size="icon" onClick={(e) => removeFurniture(furniture.id, e)} title="削除">
                  <Trash2 className="h-4 w-4" />
                </Button>                
              </div>

              {expandedFurnitureId === furniture.id && (
                <div className="mt-3 pt-3 border-t">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`width-${furniture.id}`} className="text-s">
                          幅: {Math.round(furniture.dimensions.width* 100)} cm
                        </Label>  
                        <div className="flex gap-1">                              
                          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => updateFurnitureDimensions(
                            furniture.id, 
                            { width: Math.max(furniture.dimensions.width - constants.furnitureDimensionChangeValue, constants.furnitureDimensionsMinimum) }) // 最小値以下の時に最小値に丸める
                            }>
                            - {constants.furnitureDimensionChangeValue * 100} cm
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => updateFurnitureDimensions(
                            furniture.id, 
                            { width: Math.min(furniture.dimensions.width + constants.furnitureDimensionChangeValue, constants.furnitureDimensionsMaximum) }) // 最大値以下の時に最大値に丸める
                            }>
                            + {constants.furnitureDimensionChangeValue * 100} cm
                          </Button>
                        </div>                          
                      </div>
                      <Slider
                        id={`width-${furniture.id}`}
                        min={constants.furnitureDimensionsMinimum * 100}
                        max={constants.furnitureDimensionsMaximum * 100}
                        step={1}
                        value={[furniture.dimensions.width * 100 ]} // m -> cm に変換して表示
                        onValueChange={(value) => updateFurnitureDimensions(furniture.id, { width: value[0] /100 })} // cm -> m に変換して保存
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`height-${furniture.id}`} className="text-s">
                          高さ: {Math.round(furniture.dimensions.height* 100)} cm
                        </Label>
                        <div className="flex gap-1">                              
                          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => updateFurnitureDimensions(
                            furniture.id, 
                            { height: Math.max(furniture.dimensions.height - constants.furnitureDimensionChangeValue, constants.furnitureDimensionsMinimum) })
                            }>
                            - {constants.furnitureDimensionChangeValue * 100} cm
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => updateFurnitureDimensions(
                            furniture.id, 
                            { height: Math.min(furniture.dimensions.height + constants.furnitureDimensionChangeValue, constants.furnitureDimensionsMaximum) })
                            }>
                            + {constants.furnitureDimensionChangeValue * 100} cm
                          </Button>
                        </div>
                      </div>
                      <Slider
                        id={`height-${furniture.id}`}
                        min={constants.furnitureDimensionsMinimum * 100}
                        max={constants.furnitureDimensionsMaximum * 100}
                        step={1}
                        value={[furniture.dimensions.height * 100]}
                        onValueChange={(value) => updateFurnitureDimensions(furniture.id, { height: value[0]/100 })}
                      />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`depth-${furniture.id}`} className="text-s">
                          奥行き: {Math.round(furniture.dimensions.depth* 100)} cm
                        </Label>
                        <div className="flex gap-1">                              
                          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => updateFurnitureDimensions(
                            furniture.id, 
                            { depth: Math.max(furniture.dimensions.depth - constants.furnitureDimensionChangeValue, constants.furnitureDimensionsMinimum ) })}>
                            - {constants.furnitureDimensionChangeValue * 100} cm
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => updateFurnitureDimensions(
                            furniture.id, 
                            { depth: Math.min(furniture.dimensions.depth + constants.furnitureDimensionChangeValue, constants.furnitureDimensionsMaximum ) })
                            }>
                            + {constants.furnitureDimensionChangeValue * 100} cm
                          </Button>
                        </div>
                      </div>
                      <Slider
                        id={`depth-${furniture.id}`}
                        min={constants.furnitureDimensionsMinimum * 100}
                        max={constants.furnitureDimensionsMaximum * 100}
                        step={1}
                        value={[furniture.dimensions.depth * 100]}
                        onValueChange={(value) => updateFurnitureDimensions(furniture.id, { depth: value[0]/100 })}
                      />
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <Label htmlFor={`rotation-y-${furniture.id}`} className="text-s">
                          回転: {Math.round((furniture.rotation.y * (180 / Math.PI)) * 10) / 10}°
                        </Label>
                        <div className="flex gap-1">
                          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => updateFurnitureRotation(furniture.id, { y: Math.max(furniture.rotation.y - Math.PI / 2, 0) })}>
                            <RotateCw className="h-3.5 w-3.5 mr-1" />
                            -90°
                          </Button>
                          <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => updateFurnitureRotation(furniture.id, { y: Math.min(furniture.rotation.y + Math.PI / 2, 2*Math.PI) })}>
                            <RotateCcw className="h-3.5 w-3.5 mr-1" />
                            +90°
                          </Button>
                        </div>
                      </div>                          
                      <Slider
                        id={`rotation-y-${furniture.id}`}
                        min={0}
                        max={360}
                        step={1}
                        value={[Math.round(furniture.rotation.y * (180 / Math.PI))]} // ラジアン -> 度 に変換して表示
                        onValueChange={(value) =>
                          updateFurnitureRotation(furniture.id, { y: (value[0] * Math.PI) / 180 }) // 度 -> ラジアン に変換して保存
                        }
                      />
                    </div>
                    
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default SimulateRoomArrangement
