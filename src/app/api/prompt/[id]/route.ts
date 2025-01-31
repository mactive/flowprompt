import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import type { Prompt } from '@/types/prompt';

type Props = {
  params: {
    id: string;
  };
};

export async function GET(
  _request: NextRequest,
  props: Props
) {
  try {
    // 打印数据库配置（仅用于测试）
    console.log('Database Config:', {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME
    });

    const id = props.params.id;
    
    const [rows] = await pool.execute<Prompt[]>(
      'SELECT * FROM prompts WHERE id = ?',
      [id]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { error: 'Prompt not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(rows[0]);
    
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 