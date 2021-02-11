export interface SignUp {
  email: string;
  password: string;
  confirmPassword: string;
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
