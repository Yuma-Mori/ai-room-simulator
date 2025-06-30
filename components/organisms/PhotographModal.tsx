"use client";
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, X } from "lucide-react"
import Image from "next/image"
import { CameraAnalysisApiUrl, furnitureCatalog } from "@/constants/roomSimulatorConstants"

type BuildRoomProps = {
  BuildRoom: (room: {
    roomDimensions: { width: number; depth: number; height: number };
    furnitureData: Array<{
      name: string;
      positionX: number;
      positionY: number;
      positionZ: number;
      width: number;
      height: number;
      depth: number;
      rotation: { x: number; y: number; z: number };
    }>;
  }) => void;
  open?: boolean;
  onClose?: () => void;
};

const PhotographModal: React.FC<BuildRoomProps> = ({ BuildRoom, open, onClose }) => {
  if (!open) return null;

  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [APIFailed, setAPIFailed] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<{
    roomDimensions: { width: number; depth: number; height: number };
    furnitureData: Array<{
      name: string;
      positionX: number;
      positionY: number;
      positionZ: number;
      width: number;
      height: number;
      depth: number;
      rotation: { x: number; y: number; z: number };
    }>;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null)

  // カメラアイコン押下時
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // 画像変更時
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAPIFailed(false)
    setAnalysisResult(null);
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  // 画像クリア
  const handleClear = () => {
    setSelectedImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
    setAnalysisResult(null);
    setAPIFailed(false);
  }

  // API実行
  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!fileInputRef.current?.files?.[0]) return
    setIsUploading(true);
    setAPIFailed(false);

    // 画像をAPIにPOST
    const formData = new FormData()
    const furnitureList = furnitureCatalog.map((item) => item.name_en);
    formData.append("furnitureList", JSON.stringify(furnitureList));
    formData.append("image", fileInputRef.current.files[0]);

    try {
      const res = await fetch( CameraAnalysisApiUrl , {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);         
      }
      const result = await res.json();
      console.log("APIレスポンス:", result);

      // 親コンポーネントに部屋情報を渡す
      if (result.roomDimensions && result.furnitureData) {
        setAnalysisResult({
          roomDimensions: result.roomDimensions,
          furnitureData: result.furnitureData,
        });
      }
    } catch (err) {
      console.error("API Error:", err);
      setAPIFailed(true);
    } finally {
      setIsUploading(false);
    }
  };

  // 確認後に部屋を構築
  const handleConfirm = () => {
    if (analysisResult) {
      BuildRoom(analysisResult);
      setAnalysisResult(null);
      onClose?.();
    }
  };

  return (
    <div className="min-h-0 max-h-screen overflow-y-auto bg-black/30 p-4 fixed inset-0 z-100 flex lg:items-center justify-center overflow-y-auto">
      <div className="max-w-xl lg:max-w-4xl mx-auto space-y-4 w-full relative">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-lg">AIカメラでセットアップ</CardTitle>
            <p className="text-s text-gray-600 mt-2 text-center">
              ※ 画像は解析後すぐに破棄し、サーバには保存されません。
            </p>
            {onClose && (
              <Button
                onClick={() => { setAnalysisResult(null); onClose(); }}
                variant="ghost"
                size="icon"
                className="absolute top-3 right-3 bg-red-300 hover:bg-red-600 hover:text-gray-700 rounded-lg"
                aria-label="閉じる"
              >                
                <X className="h-6 w-6" />
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* ファイル入力 - カメラ起動用 */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />

            {/* カメラ起動ボタン */}
            <Button onClick={handleCameraClick} className="w-full" size="lg">
              <Camera className="mr-2 h-10 w-10" />
              { selectedImage ? "別の写真に変更" : "カメラで撮影"}
            </Button>

            {/* 撮影した画像のプレビュー */}
            <div className="flex flex-col md:flex-row gap-4 flex items-center justify-center">
              {selectedImage && (
                <div className="space-y-4 w-full h-full">
                  <div className="relative w-full max-h-[30vh] overflow-auto" style={{ aspectRatio: "4/3", minHeight: "20vh" }}>
                    <Image
                      src={selectedImage}
                      alt="撮影した画像"
                      fill
                      className="w-full h-auto rounded-lg"
                      unoptimized
                    />
                    <Button onClick={handleClear} variant="destructive" size="icon" className="absolute top-2 right-2">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  {/* アップロードボタン */}
                  {!analysisResult && (
                    <Button
                      onClick={handleUpload}
                      disabled={isUploading}
                      className="w-full text-white bg-gradient-to-r from-blue-500 to-blue-400 shadow hover:from-blue-600 hover:to-blue-500 border border-blue-400 hover:border-blue-600 text-base font-semibold transition-all duration-150"
                      size="lg"
                      style={{ boxShadow: "0 2px 8px 0 rgba(59,130,246,0.08)" }}
                    >
                      <Upload className="mr-2 h-5 w-5" />
                      {isUploading ? "解析中...（最長で1分ほどかかります）" : "AIかんたん解析"}
                    </Button>
                  )}                  
                </div>
              )}

              {/* 解析結果の確認ステップ */}
              {analysisResult && (
                <div className="space-y-4 w-full h-full p-4 ">
                  <div className="mb-2">
                    <div className="font-bold mb-1">お部屋</div>
                    <div>
                      <table className="w-full text-s border">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-1 border">幅(m)</th>
                            <th className="p-1 border">奥行(m)</th>
                            <th className="p-1 border">高さ(m)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <td className="p-1 border text-right">{analysisResult.roomDimensions.width}</td>
                          <td className="p-1 border text-right">{analysisResult.roomDimensions.depth}</td>
                          <td className="p-1 border text-right">{analysisResult.roomDimensions.height}</td>
                        </tbody>
                      </table>
                    </div>
                  </div>
                  <div>
                    <div className="font-bold mb-1">家具</div>
                    <div className="max-h-40 overflow-y-auto">
                      <table className="w-full text-s border">
                        <thead>
                          <tr className="bg-gray-100">
                            <th className="p-1 border">家具名</th>
                            <th className="p-1 border">幅(cm)</th>
                            <th className="p-1 border">奥行(cm)</th>
                            <th className="p-1 border">高さ(cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analysisResult.furnitureData.map((f, i) => (
                            <tr key={i}>
                              <td className="p-1 border">{furnitureCatalog.find((item) => item.name_en === f.name)?.name || f.name}</td>
                              <td className="p-1 border text-right">{Math.round(f.width * 100)}</td>
                              <td className="p-1 border text-right">{Math.round(f.depth * 100)}</td>
                              <td className="p-1 border text-right">{Math.round(f.height * 100)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>                  
                </div>
              )}
            </div>         

            {/* 確認ボタン */}
            {analysisResult && (
              <div className="flex gap-2 mt-4 ">
                <Button
                  onClick={handleConfirm}
                  className="flex-1 text-white bg-gradient-to-r from-blue-500 to-blue-400 shadow-md hover:from-blue-600 hover:to-blue-500 border-2 border-blue-400 hover:border-blue-600 text-lg font-bold scale-105 transition-transform"
                  size="lg"
                  style={{ boxShadow: "0 2px 8px 0 rgba(59,130,246,0.10)" }}
                >
                  この内容で部屋を再現
                </Button>
              </div>
            )}  

            {/* API失敗時のメッセージ */}
            {APIFailed && (
              <div className="p-3 bg-red-100 text-red-800 rounded-lg text-sm">
                お部屋解析に失敗しました。もう一度お試しください。
              </div>
            )}
          </CardContent>          
        </Card>
      </div>
    </div>
  );
};

export default PhotographModal;