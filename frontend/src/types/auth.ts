export interface User {
  user_id: string;
  email: string;
  name: string;
  age?: number;
  role: UserRole;
  club_id: string;
  parent_function: boolean;
  head_coach_function: boolean;
  head_parent_function?: boolean;
  created_date: string;
  updated_date: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  club_id: string;
  email: string;
  password: string;
  name: string;
  age?: number;
  role: string;
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  user: User;
}

export enum UserRole {
  PLAYER = 'player',
  COACH = 'coach',
  FATHER = 'father',
  MOTHER = 'mother',
  ADULT = 'adult'
}