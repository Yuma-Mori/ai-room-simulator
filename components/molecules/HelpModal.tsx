"use client"
import Image from "next/image"

const HelpModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="w-full h-screen bg-black/30 absolute top-0 left-0 pointer-events-auto "
        onClick={onClose}
      />
      <div className="lg:max-w-4xl relative h-screen z-10 m-6 bg-white rounded-lg shadow-lg p-8 max-w-xl w-full pointer-events-auto overflow-y-auto">
        <h3 className="text-2xl w-full text-center font-bold mb-4">使い方</h3>
        <h4 className="text-xl w-full text-center font-bold mb-4">素敵なお部屋をシミュレーション！</h4>
        <ul className="text-base list-disc pl-6 space-y-2">
          <li>まずはAIカメラからあなたのお部屋をセットアップしましょう</li>
          <li>または、「家具の手動追加」から家具を追加できます。</li>
          <li>一覧から家具の寸法や角度を変えましょう。
            <Image
              src={'/help/help.jpg'}
              alt="help"              
              className="w-full h-auto rounded-lg"
              width = {200}
              height={150}
            />
          </li>
          <li>家具をクリックして移動コントローラを付ければ、その家具を動かすことができます。
            <Image
              src={'/help/help1.jpg'}
              alt="help1"              
              className="w-full h-auto rounded-lg"
              width = {400}
              height={300}
            />
          </li>
          <li>ダブルクリックで移動コントローラを消すことができます。</li>
          <li>気になる家具をここで試したり、AIコンシェルジュに相談したり、自分の部屋に合う家具をAI検索できます！</li>
        </ul>
        <button
          className="mt-6 px-6 py-3 bg-blue-500 text-white rounded hover:bg-blue-600 w-full text-lg"
          onClick={onClose}
        >
          閉じる
        </button>
      </div>
    </div>
  );
};

export default HelpModal;