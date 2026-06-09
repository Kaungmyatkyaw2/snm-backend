import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin, emailOTP } from 'better-auth/plugins';
import { PrismaClient } from '../../../generated/prisma/client';
import { sendEmail } from '../email';
import { buildOtpEmailTemplate } from '../email/template';
import { ac, adminRole, userRole } from './permissions';

const prisma = new PrismaClient();

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.APP_URL || 'http://localhost:3001',
  trustedOrigins: process.env.TRUSTED_ORIGINS
    ? process.env.TRUSTED_ORIGINS.split(',')
    : ['http://localhost:3000', 'http://localhost:3001', 'mobile://'],
  advanced: {
    disableOriginCheck: true,
  },
  database: prismaAdapter(prisma, {
    provider: 'postgresql',
  }),
  session: {
    expiresIn: 60 * 60 * 24,
    updateAge: 60 * 60 * 24,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
  },
  emailVerification: {
    autoSignInAfterVerification: true,
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },
  user: {
    additionalFields: {
      phone: {
        type: 'string',
        required: false,
        input: true,
      },
    },
  },
  plugins: [
    emailOTP({
      sendVerificationOnSignUp: true,
      overrideDefaultEmailVerification: true,

      async sendVerificationOTP({ email, otp, type }) {
        console.log('I am here sendVerificationOTP');
        const subjectByType: Record<string, string> = {
          'sign-in': 'Your Shwe Nyar Myay sign-in code',
          'email-verification': 'Verify your Shwe Nyar Myay email',
          'password-reset': 'Reset your Shwe Nyar Myay password',
        };

        const subject =
          subjectByType[type] ?? 'Your Shwe Nyar Myay verification code';
        const html = buildOtpEmailTemplate({
          otp,
          appUrl: process.env.APP_URL ?? '#',
        });

        await sendEmail({
          to: email,
          subject,
          text: html,
        });
      },
    }),
    //@ts-ignore
    expo(),
    //@ts-ignore
    admin({
      ac,
      defaultRole: 'customer',
      adminUserIds: [process.env.SUPER_ADMIN_ID || ''].filter(Boolean),
      roles: {
        admin: adminRole,
        customer: userRole,
      },
    }),
  ],
});
