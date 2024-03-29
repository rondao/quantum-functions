export interface SignUp {
  email: string;
  password: string;
  name: string;
}

export interface SignIn {
  email: string;
  password: string;
}

export interface Class {
  id?: string;
  name: string;
  subject: string;
  professor: string;
}

export interface Professor {
  id?: string;
  name: string;
  bio: string;
}
