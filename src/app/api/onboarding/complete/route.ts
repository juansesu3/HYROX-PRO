import { NextResponse } from 'next/server';
import mongoose from 'mongoose'; // 👈 Importante importar mongoose
import dbConnect from '@/app/lib/dbConnect';
import { Training } from '@/app/lib/models/Training';
import { Athlete } from '@/app/lib/models/Athlete';

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    const { userId, training, athlete1, athlete2 } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // --- PASO CLAVE: PRE-GENERAR EL ID DEL TRAINING ---
    // Generamos un ObjectId válido manualmente aquí para poder 
    // dárselo a los atletas antes de crear el documento de Training.
    const generatedTrainingId = new mongoose.Types.ObjectId();

    // --- PASO 1: GUARDAR ATLETA 1 ---
    const newAthlete1 = await Athlete.findOneAndUpdate(
      { userId: userId, username: athlete1.username },
      { 
        ...athlete1, 
        userId, 
        trainingId: generatedTrainingId // 👈 Ahora sí tenemos el ID
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    
    // --- PASO 2: GUARDAR ATLETA 2 (Opcional) ---
    let newAthlete2 = null;
    if (athlete2 && athlete2.username) {
      newAthlete2 = await Athlete.findOneAndUpdate(
        { userId: userId, username: athlete2.username },
        { 
          ...athlete2, 
          userId,
          trainingId: generatedTrainingId // 👈 También se lo pasamos aquí
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    }

    // --- PASO 3: CREAR TRAINING ---
    const newTraining = await Training.create({
      _id: generatedTrainingId, // 👈 Usamos el ID que generamos al principio
      ownerUserId: userId,
      
      athlete1Id: newAthlete1._id,
      athlete2Id: newAthlete2 ? newAthlete2._id : undefined,
      
      division: training.division, 
      mode: training.mode,
      gender: training.gender,
      
      status: 'active'
    });

    return NextResponse.json({
      success: true,
      trainingId: newTraining._id,
      message: 'Setup completado'
    }, { status: 201 });

  } catch (error: any) {
    console.error("Error en onboarding API:", error);
    // Devolvemos el mensaje exacto del error para facilitar depuración
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}