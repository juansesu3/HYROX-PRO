// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User } from '@/app/lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { email, username, password } = await request.json();

    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Email, nombre de usuario y contraseña son obligatorios.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'La contraseña debe tener al menos 6 caracteres.' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const normalizedUsername = username.toLowerCase().trim();

    // comprobar email
    const existingUserByEmail = await User.findOne({ email: normalizedEmail });
    if (existingUserByEmail) {
      return NextResponse.json(
        { error: 'Ya existe un usuario con este email.' },
        { status: 409 }
      );
    }

    // comprobar username
    const existingUserByUsername = await User.findOne({
      username: normalizedUsername,
    });
    if (existingUserByUsername) {
      return NextResponse.json(
        { error: 'El nombre de usuario ya está en uso.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
      // el modelo pone category='individual' y duoStatus='single' por defecto
    });

    return NextResponse.json(
      {
        message: 'Registro completado.',
        userId: String(newUser._id),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Register error:', error);

    if (error?.errors) {
      Object.values(error.errors).forEach((err: any) =>
        console.error('Validation:', err.message)
      );
    }

    return NextResponse.json(
      { error: 'Error interno del servidor.' },
      { status: 500 }
    );
  }
}
