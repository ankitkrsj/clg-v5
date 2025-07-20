export interface User {
  id: string;
  email: string;
  username: string;
  created_at: string;
  is_blocked: boolean;
  block_reason?: string;
}

export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: 'deposit' | 'bet' | 'win' | 'loss' | 'pending_deposit';
  amount: number;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  screenshot_url?: string;
  admin_notes?: string;
  created_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  game_id: string;
  bet_type: 'number' | 'color' | 'size';
  bet_value: string; // number (0-9), color (red/green), or size (big/small)
  amount: number;
  result: 'win' | 'loss' | 'pending';
  payout: number;
  created_at: string;
}

export interface Game {
  id: string;
  game_number: number;
  status: 'waiting' | 'betting' | 'completed';
  start_time: string;
  end_time?: string;
  result_number?: number;
  result_color?: 'red' | 'green';
  result_size?: 'big' | 'small';
  is_fixed: boolean;
  fixed_result?: number;
  created_at: string;
}

export interface AdminSettings {
  id: string;
  qr_code_url: string;
  header_banner_text: string;
  header_banner_active: boolean;
  game_duration: number; // in seconds
  created_at: string;
  updated_at: string;
}

export type ColorOption = 'red' | 'green' | 'blue' | 'yellow';
export type BetType = 'number' | 'color' | 'size';
export type GameStatus = 'waiting' | 'betting' | 'completed';