import { NextResponse } from 'next/server';
// import { furnitureData as sampleData } from '../../../data/furniture';
import { Connector } from '@google-cloud/cloud-sql-connector';
import mysql from 'mysql2/promise';

const cloudSqlConnectionName = "***REMOVED***"

export async function GET() {
  try {
    const connector = new Connector();
    const clientOpts = await connector.getOptions({
        instanceConnectionName: cloudSqlConnectionName
    });
    console.log("furnitureData", process.env.DB_PASS);

    const pool = mysql.createPool({
        ...clientOpts,
        user: "root",
        password: process.env.DB_PASS,
        database: "room_simulator",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        connectTimeout: 10000,      // コネクション確立のタイムアウト（例: 10秒）
    });
    const furnitureData = await pool.query('SELECT * FROM products');
    console.log("furnitureData", furnitureData);

    return NextResponse.json({
      success: true,
      data: furnitureData,
      total: furnitureData.length
    });
  } catch (err) {
    console.error('DB fetch error:', err);
    return NextResponse.json({
      success: false,
      error: 'DB fetch failed',
    });
  }
}