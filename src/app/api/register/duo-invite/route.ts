// src/app/api/register/duo-invite/route.ts
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import dbConnect from '@/app/lib/dbConnect';
import { User } from '@/app/lib/models/User';
import { DuoInvite } from '@/app/lib/models/DuoInvite';
import mongoose from 'mongoose';
const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h
const locales = ['en', 'es', 'fr'];

function detectLocale(pathname: string): string | null {
  const seg = pathname.split('/').filter(Boolean)[0];
  return locales.includes(seg) ? seg : null;
}

export async function POST(request: Request) {
  try {
    await dbConnect();

    const { userId, category, doublesType } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: 'userId es obligatorio para crear la invitación.' },
        { status: 400 }
      );
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return NextResponse.json(
        { error: 'userId no es un ObjectId válido.' },
        { status: 400 }
      );
    }

    if (category !== 'doubles') {
      return NextResponse.json(
        { error: 'La invitación solo aplica para categoría "doubles".' },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado.' },
        { status: 404 }
      );
    }

    const token = crypto.randomBytes(32).toString('hex');

    const invite = await DuoInvite.create({
      userId,
      token,
      category: 'doubles',
      doublesType: doublesType || 'mixed',
      status: 'pending',
      expiresAt, // 👈 nuevo campo
    });

    // ===============================
    // 🔍 Detectar locale actual
    // ===============================
    const requestUrl = new URL(request.url);
    const pathname = requestUrl.pathname; // ej: /es/api/register/duo-invite
    const locale = detectLocale(pathname) || 'en'; // default en

    // ===============================
    // 🌍 Construir URL con locale
    // ===============================
    const inviteUrl = `${requestUrl.origin}/${locale}/invite/duo/${invite.token}`;

    return NextResponse.json(
      { inviteUrl, token: invite.token },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Duo invite error:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor al generar la invitación.' },
      { status: 500 }
    );
  }
}
