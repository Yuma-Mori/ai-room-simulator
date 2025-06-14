"use client"
import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Camera, Upload, X } from "lucide-react"
import Image from "next/image"
import { CameraAnalysisApiUrl } from "@/constants/roomSimulatorConstants"

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
  const [uploadResult, setUploadResult] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // カメラアイコン押下時
  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  // 画像変更時
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
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
    setUploadResult(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  // 画像選択時
  const handleUpload = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!fileInputRef.current?.files?.[0]) return
    setIsUploading(true);

    // 画像をAPIにPOST
    const formData = new FormData()
    formData.append("image", fileInputRef.current.files[0])

    try {
      const res = await fetch( CameraAnalysisApiUrl , {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        alert("部屋解析APIの呼び出しに失敗しました");
        return;
      }
      const result = await res.json();
      console.log("APIレスポンス:", result);

      // 親コンポーネントに部屋情報を渡す
      if (result.roomDimensions && result.furnitureData) {
        BuildRoom({
          roomDimensions: result.roomDimensions,
          furnitureData: result.furnitureData,
        });
      }
    } catch (err) {
      console.error("API Error:", err);
      alert("部屋解析APIの呼び出し中にエラーが発生しました");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black/30 p-4 fixed inset-0 z-50 flex items-center justify-center">
      <div className="max-w-md mx-auto space-y-4 w-full relative">        
        <Card>
          <CardHeader>
            <CardTitle className="text-center">カメラ撮影 & AI解析</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 隠しファイル入力 - カメラ起動用 */}
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
              <Camera className="mr-2 h-5 w-5" />
              カメラで撮影
            </Button>

            {/* 撮影した画像のプレビュー */}
            {selectedImage && (
              <div className="space-y-4">
                <div className="relative">
                  <Image
                    src={selectedImage || "/placeholder.svg"}
                    alt="撮影した画像"
                    width={400}
                    height={300}
                    className="w-full h-auto rounded-lg border"
                  />
                  <Button onClick={handleClear} variant="destructive" size="icon" className="absolute top-2 right-2">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* アップロードボタン */}
                <Button onClick={handleUpload} disabled={isUploading} className="w-full" size="lg">
                  <Upload className="mr-2 h-5 w-5" />
                  {isUploading ? "アップロード中..." : "APIに送信"}
                </Button>
              </div>
            )}

            {/* アップロード結果 */}
            {uploadResult && (
              <div
                className={`p-3 rounded-lg text-sm ${
                  uploadResult.includes("成功") ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {uploadResult}
              </div>
            )}

            {onClose && (
            <Button
              onClick={onClose}
              variant="ghost"
              size="icon"
              className="mt-6 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 w-full text-lg"
              aria-label="閉じる"
            >              
              閉じる
            </Button>
            )}
          </CardContent>          
        </Card>
      </div>
    </div>
  );
};

export default PhotographModal;