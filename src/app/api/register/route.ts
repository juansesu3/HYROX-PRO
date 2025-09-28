import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { User, Athlete } from '@/app/lib/models'; // Importamos los modelos actualizados
import bcrypt from 'bcryptjs';

// Tipado para el cuerpo de la petición, coincidiendo con el estado del frontend
interface RegisterRequestBody {
  email: string;
  password: string;
  category: 'individual' | 'doubles';
  doublesType?: 'men' | 'women' | 'mixed';
  athlete1: { username: string; [key: string]: any }; // Definimos la estructura esperada para athlete1
  athlete2?: { username: string; [key: string]: any };
  trainingPlan?: string;
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body: RegisterRequestBody = await request.json();
    const { email, password, category, doublesType, athlete1, athlete2, trainingPlan } = body;

    // --- Validación de Entradas ---
    if (!email || !password) {
      return NextResponse.json({ message: 'El email y la contraseña son obligatorios.' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ message: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }
    if (!athlete1 || !athlete1.username) {
        return NextResponse.json({ message: 'La información del Atleta 1 es obligatoria.' }, { status: 400 });
    }
    if (category === 'doubles' && (!athlete2 || !athlete2.username)) {
        return NextResponse.json({ message: 'La información del Atleta 2 es obligatoria para la categoría de dobles.' }, { status: 400 });
    }

    // --- Comprobar si el usuario ya existe ---
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: 'Este email ya está en uso.' }, { status: 409 });
    }

    // --- Creación de Usuario y Atletas ---
    // 1. Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // 2. Crear el documento del Usuario (la cuenta)
    const newUser = await User.create({
      email,
      password: hashedPassword,
      category,
      doublesType: category === 'doubles' ? doublesType : null,
      trainingPlan // Guardamos el plan generado por la IA
    });

    // 3. Crear el documento para el Atleta 1, vinculándolo al nuevo usuario
    await Athlete.create({
      ...athlete1,
      userId: newUser._id, // Vinculamos con el ID del usuario recién creado
    });

    // 4. Si es una categoría de dobles, crear el documento para el Atleta 2
    if (category === 'doubles' && athlete2) {
      await Athlete.create({
        ...athlete2,
        userId: newUser._id, // También se vincula al mismo usuario
      });
    }

    return NextResponse.json({ message: 'Usuario registrado con éxito.' }, { status: 201 });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error en el registro:", error);
    return NextResponse.json({ message: 'Error interno del servidor.', error: error.message }, { status: 500 });
  }
}
