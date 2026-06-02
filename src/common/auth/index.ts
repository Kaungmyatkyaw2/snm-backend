import { expo } from '@better-auth/expo';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { PrismaClient } from '../../../generated/prisma/client';
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
    requireEmailVerification: false,
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
