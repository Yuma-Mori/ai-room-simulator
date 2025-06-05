import { Furniture } from '@/types/furniture';

export const furnitureData: Furniture[] = [
  {
    id: '1',
    name: 'モダンソファ',
    price: 89800,
    image: '/furniture/sofa-modern.jpg',
    description: '洗練されたデザインのモダンソファ。リビングルームの主役として、快適な座り心地と美しいフォルムを両立しています。',
    dimensions: {
      width: 180,
      height: 85,
      depth: 90
    },
    category: 'ソファ',
    inStock: true
  },
  {
    id: '2',
    name: 'ウォールナット ダイニングテーブル',
    price: 128000,
    image: '/furniture/dining-table-walnut.jpg',
    description: '天然ウォールナット材を使用した高品質なダイニングテーブル。木目の美しさが際立つ、長く愛用できる一品です。',
    dimensions: {
      width: 160,
      height: 72,
      depth: 90
    },
    category: 'テーブル',
    inStock: true
  },
  {
    id: '3',
    name: 'エルゴノミック オフィスチェア',
    price: 45600,
    image: '/furniture/office-chair-ergonomic.jpg',
    description: '人間工学に基づいて設計されたオフィスチェア。長時間の作業でも疲れにくく、スタイリッシュなデザインが魅力です。',
    dimensions: {
      width: 65,
      height: 120,
      depth: 65
    },
    category: 'チェア',
    inStock: true
  },
  {
    id: '4',
    name: 'ミニマル ベッドフレーム',
    price: 67800,
    image: '/furniture/bed-minimal.jpg',
    description: 'シンプルで美しいミニマルデザインのベッドフレーム。寝室を上品で落ち着いた空間に演出します。',
    dimensions: {
      width: 140,
      height: 85,
      depth: 200
    },
    category: 'ベッド',
    inStock: false
  },
  {
    id: '5',
    name: 'スカンジナビア ブックシェルフ',
    price: 34500,
    image: '/furniture/bookshelf-scandinavian.jpg',
    description: '北欧スタイルのブックシェルフ。本だけでなく、お気に入りの小物も美しく飾れる機能的なデザインです。',
    dimensions: {
      width: 80,
      height: 180,
      depth: 30
    },
    category: '収納',
    inStock: true
  },
  {
    id: '6',
    name: 'ガラストップ コーヒーテーブル',
    price: 52300,
    image: '/furniture/coffee-table-glass.jpg',
    description: '透明感のあるガラストップが特徴のコーヒーテーブル。空間を広く見せる効果があり、モダンなリビングにぴったりです。',
    dimensions: {
      width: 120,
      height: 45,
      depth: 60
    },
    category: 'テーブル',
    inStock: true
  }
];
