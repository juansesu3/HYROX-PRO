// app/api/register/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, TrainingBlock } from '@/app/lib/models';
import { initialBlock } from '@/app/lib/seed-data'; // Importamos el plan inicial
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    const { username, email, password, age, weight, height, physicalActivityLevel } = body;

    // Validar que la contraseña existe
    if (!password || password.length < 6) {
      return NextResponse.json({ message: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    // Comprobar si el usuario o el email ya existen
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return NextResponse.json({ message: 'El email o el nombre de usuario ya están en uso.' }, { status: 409 });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear el nuevo usuario
    const newUser = await User.create({
      username,
      email,
      password: hashedPassword,
      age,
      weight,
      height,
      physicalActivityLevel,
    });

    // **NUEVO: Asignar los Bloques iniciales al nuevo usuario**
    if (newUser && initialBlock && initialBlock.length > 0) {
      const blocksForUser = initialBlock.map(block => ({
        ...block, // Copia toda la estructura del bloque
        userId: newUser._id, // Asocia el ID del nuevo usuario
      }));

      await TrainingBlock.insertMany(blocksForUser);
    }

    return NextResponse.json({ message: 'Usuario registrado y plan inicial asignado con éxito.' }, { status: 201 });
// eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return NextResponse.json({ message: 'Error al registrar el usuario.', error: error.message }, { status: 500 });
  }
}
