'use client';

import { useEffect, useState } from 'react';

type Props = {
  children: React.ReactNode;
};

export default function OrientationWrapper({ children }: Props) {
  const [isLandscape, setIsLandscape] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.matchMedia('(orientation: landscape)').matches);
    };

    checkOrientation(); // 初回チェック

    const mediaQuery = window.matchMedia('(orientation: landscape)');
    mediaQuery.addEventListener('change', checkOrientation);

    return () => {
      mediaQuery.removeEventListener('change', checkOrientation);
    };
  }, []);

  if (isLandscape === null) {
    return null; // 初期ロード時は何も表示しない（ローディングでも可）
  }

  return (
    <>
      {isLandscape ? (
        children
      ) : (
        <div
          style={{
            height: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            textAlign: 'center',
            padding: '1rem',
            backgroundColor: '#fff',
            color: '#000',
          }}
        >
          <p style={{ fontSize: '1.5rem' }}>横画面にしてください</p>
        </div>
      )}
    </>
  );
}
