import { NextResponse } from 'next/server';
import { furnitureData as sampleData } from '../../../data/furniture';
import { Connector } from '@google-cloud/cloud-sql-connector';
import mysql from 'mysql2/promise';

const cloudSqlConnectionName = "***REMOVED***"

export async function GET() {
  const connector = new Connector();
  const clientOpts = await connector.getOptions({
      instanceConnectionName: cloudSqlConnectionName
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
  console.log("furnitureData", furnitureData);
  if (!furnitureData ) {
    return NextResponse.json({
    success: true,
    data: sampleData,
    total: sampleData.length
  });
  }

  return NextResponse.json({
    success: true,
    data: furnitureData,
    total: furnitureData.length
  });
}