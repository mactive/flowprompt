import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';

interface PromptRow extends RowDataPacket {
  id: number;
}

export async function GET() {
  try {
    // 查询一个随机的带有 structure 的提示
    const [rows] = await pool.execute<PromptRow[]>(
      'SELECT id FROM prompts WHERE structure IS NOT NULL AND LENGTH(structure) > 50 ORDER BY RAND() LIMIT 1'
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: 'No more prompts available' },
        { status: 404 }
      );
    }

    return NextResponse.json({ id: rows[0].id });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch random prompt' }, 
      { status: 500 }
    );
  }
} 
