import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../config/database';
import { env } from '../../config/env';
import { Role } from '@prisma/client';
import { JwtPayload } from '../../types';
import { sendEmail } from '../notification/email.service';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
}

export async function register(
  name: string,
  email: string,
  password: string,
  phone: string | undefined,
  role: Role = Role.CUSTOMER
) {
  // Check if user exists
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error('Email already registered');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 12);
  const otp = generateOTP();

  // Create user
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hashedPassword,
      phone,
      role,
      isVerified: false,
      otpCode: otp,
      otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), // expires in 10 minutes
    },
  });

  // If registering as AGENT, create DeliveryAgent record
  if (role === Role.AGENT) {
    await prisma.deliveryAgent.create({
      data: {
        userId: user.id,
      },
    });
  }

  // Send OTP
  const html = `
    <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #09090b; color: #f4f4f5; border: 1px solid #333; border-radius: 12px;">
      <h1 style="color: #f97316;">🚀 LastMileUS Verification</h1>
      <p>Hi ${user.name},</p>
      <p>Your one-time verification code is:</p>
      <h2 style="font-size: 32px; letter-spacing: 5px; color: #10b981;">${otp}</h2>
      <p>This code expires in 10 minutes.</p>
    </div>
  `;
  
  await sendEmail(user.email, 'Verify your LastMileUS account', html);

  return { message: 'Registration successful. OTP sent to email.' };
}

export async function verifyOtp(email: string, otp: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error('User not found');
  if (user.isVerified) throw new Error('User already verified');
  
  if (user.otpCode !== otp) throw new Error('Invalid verification code');
  if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
    throw new Error('Verification code expired');
  }

  // Mark as verified
  const verifiedUser = await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true, otpCode: null, otpExpiresAt: null },
  });

  const token = generateToken(verifiedUser);
  return {
    user: {
      id: verifiedUser.id,
      name: verifiedUser.name,
      email: verifiedUser.email,
      phone: verifiedUser.phone,
      role: verifiedUser.role,
    },
    token,
  };
}

export async function login(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }

  // Bypass email verification for demo purposes since Resend free tier blocks unverified emails
  // if (!user.isVerified) {
  //   throw new Error('VERIFICATION_REQUIRED');
  // }

  const token = generateToken(user);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
    token,
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
      deliveryAgent: {
        select: {
          id: true,
          status: true,
          currentArea: true,
          zoneId: true,
          zone: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return user;
}

function generateToken(user: { id: string; email: string; role: Role }): string {
  const payload: JwtPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}