import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2/promise';
import type { Prompt } from '@/types/prompt';

type Props = {
  params: Promise<{
    id: string
  }>
}

interface PromptRow extends RowDataPacket, Prompt {
  id: number;
}

export async function GET(
  request: NextRequest,
  props: Props
) {
  const params = await props.params
  const currentId = parseInt(params.id);

  try {
    const [rows] = await pool.execute<PromptRow[]>(
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