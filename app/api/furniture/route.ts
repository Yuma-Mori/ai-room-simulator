import { NextResponse } from 'next/server';
// import { furnitureData } from '../../../data/furniture';
import { Connector } from '@google-cloud/cloud-sql-connector';
import mysql from 'mysql2/promise';

export async function GET() {
  await new Promise(resolve => setTimeout(resolve, 100));
  const connector = new Connector();
    const clientOpts = await connector.getOptions({
        instanceConnectionName: "***REMOVED***"
    });
    const pool = mysql.createPool({
        ...clientOpts,
        user: "root",
        password: process.env.DB_PASS,
        database: "room_simulator",
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    const furnitureData = await pool.query('SELECT * FROM products');

  return NextResponse.json({
    success: true,
    data: furnitureData,
    total: furnitureData.length
  });
}