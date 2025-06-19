"use client"
const HelpModal: React.FC<{ open: boolean; onClose: () => void }> = ({ open, onClose }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div
        className="w-full h-full bg-black/30 absolute top-0 left-0 pointer-events-auto"
        onClick={onClose}
      />
      <div className="relative z-10 m-6 bg-white rounded-lg shadow-lg p-8 max-w-xl w-full pointer-events-auto">
        <h3 className="text-2xl w-full text-center font-bold mb-4">楽しみ方</h3>
        <h4 className="text-xl w-full text-center font-bold mb-4">素敵な部屋をシミュレーション！</h4>
        <ul className="text-base list-disc pl-6 space-y-2">
          <li>「家具の追加」から家具を追加できます。</li>
          <li>一覧から家具の寸法や角度を変えましょう。</li>
          <li>家具をクリックで移動コントローラを付け、</li>
          <li>ダブルクリックで移動コントローラを消すことができます。</li>
          <li>模様替えのシミュレーションや新しい家具を買うときの空想に！</li>
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