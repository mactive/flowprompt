export interface Prompt {
  id: number;
  model_name: string;
  prompt: string;
  prompt_cn: string | null;
  image_url: string | null;
  source: string | null;
  source_id: string;
  search_keyword: string;
  structure: string | null;  // 可以根据实际的结构化数据定义更具体的类型
  created_at: Date;
  updated_at: Date | null;
} 