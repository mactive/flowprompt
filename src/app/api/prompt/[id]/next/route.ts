import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

type Props = {
  params: {
    id: string;
  };
};

export async function GET(
  _request: NextRequest,
  props: Props
) {
  const currentId = parseInt(props.params.id);

  try {
    const [rows] = await pool.execute<any[]>(
      'SELECT id FROM prompts WHERE id > ? AND structure IS NOT NULL ORDER BY id ASC LIMIT 1',
      [currentId]
    );

    if (!rows || rows.length === 0) {
      return NextResponse.json(
        { message: 'No more prompts available' },
        { status: 404 }
      );
    }

    return NextResponse.json({ nextId: rows[0].id });
    
  } catch (error) {
    console.error('Error finding next prompt:', error);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
} 