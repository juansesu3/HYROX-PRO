// app/api/blocks/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/dbConnect';
import { TrainingBlock } from '@/app/lib/models';

export async function GET() {
  try {
    await dbConnect();

    // Busca todos los bloques de entrenamiento y los ordena por su número
    const blocks = await TrainingBlock.find({}).sort({ blockNumber: 'asc' });

    return NextResponse.json(blocks);
  } catch (error) {
    console.error('Error al obtener los bloques:', error);
    return NextResponse.json({ message: 'Error al obtener los bloques de entrenamiento' }, { status: 500 });
  }
}

export async function POST(request: Request) {
    try {
      await dbConnect();
  
      // 1. Obtiene el cuerpo de la petición, que debería ser un array de bloques.
      const blocksToInsert = await request.json();
  
      // 2. Validación básica: Asegurarse de que se ha enviado un array.
      if (!Array.isArray(blocksToInsert) || blocksToInsert.length === 0) {
        return NextResponse.json({ message: 'El cuerpo de la petición debe ser un array de bloques no vacío.' }, { status: 400 });
      }
  
      // 3. Limpiar la colección existente para evitar duplicados.
      // ¡PRECAUCIÓN! Esto elimina todos los bloques existentes. 
      // Comenta o elimina esta línea si prefieres añadir bloques sin borrar los anteriores.
      console.log('Limpiando la colección TrainingBlock antes de insertar...');
      await TrainingBlock.deleteMany({});
      
      // 4. Insertar la colección de bloques en la base de datos.
      // `insertMany` es eficiente para insertar múltiples documentos a la vez.
      console.log(`Insertando ${blocksToInsert.length} bloque(s)...`);
      const newBlocks = await TrainingBlock.insertMany(blocksToInsert);
  
      // 5. Devolver una respuesta de éxito con los datos insertados.
      return NextResponse.json({ message: 'Bloques insertados con éxito', data: newBlocks }, { status: 201 });
  
    } catch (error) {
      console.error('Error al insertar los bloques:', error);
      return NextResponse.json({ message: 'Error al insertar los bloques de entrenamiento' }, { status: 500 });
    }
  }
  
