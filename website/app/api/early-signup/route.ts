import { NextResponse } from "next/server";
import { prisma } from "@/prisma";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if ( !email || typeof email !== 'string') {
      return NextResponse.json({error: 'Invalid email'}, { status: 400});
    }
    const earlySignupUser = await prisma.earlySignup.create({
      data: { email }
    });
    console.log(`earlySignee :- ${earlySignupUser}`);
    return NextResponse.json({message: 'Signed up successfully'}, {status: 200});
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({error: 'Something went wrong'}, {status: 500});
  }
}
