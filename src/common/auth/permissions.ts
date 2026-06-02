import { createAccessControl } from 'better-auth/plugins/access';

export const statement = {
  catalog: ['read'],
  auth: ['read'],
} as const;

export const ac = createAccessControl(statement);

export const adminRole = ac.newRole({
  catalog: ['read'],
  auth: ['read'],
});

export const userRole = ac.newRole({
  catalog: ['read'],
  auth: ['read'],
});
