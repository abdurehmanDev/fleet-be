import db from '../../config/db';
import { roles, permissions, rolePermissions } from '../schema';
import logger from '../../config/logger';

const ROLES_SEED = [
  { name: 'SUPER_ADMIN', description: 'Full system access' },
  { name: 'OWNER', description: 'Fleet owner with full management access' },
  { name: 'MANAGER', description: 'Limited management access' },
];

const PERMISSIONS_SEED = [
  { name: 'CREATE_DRIVER', description: 'Create new drivers' },
  { name: 'UPDATE_DRIVER', description: 'Update driver details' },
  { name: 'DELETE_DRIVER', description: 'Delete drivers' },
  { name: 'VIEW_ANALYTICS', description: 'View analytics and reports' },
  { name: 'CREATE_VEHICLE', description: 'Create new vehicles' },
  { name: 'UPDATE_VEHICLE', description: 'Update vehicle details' },
  { name: 'DELETE_VEHICLE', description: 'Delete vehicles' },
  { name: 'MANAGE_EARNINGS', description: 'Manage weekly and company earnings' },
];

// Role -> Permission mapping
const ROLE_PERMISSION_MAP: Record<string, string[]> = {
  SUPER_ADMIN: [
    'CREATE_DRIVER', 'UPDATE_DRIVER', 'DELETE_DRIVER',
    'VIEW_ANALYTICS', 'CREATE_VEHICLE', 'UPDATE_VEHICLE',
    'DELETE_VEHICLE', 'MANAGE_EARNINGS',
  ],
  OWNER: [
    'CREATE_DRIVER', 'UPDATE_DRIVER', 'DELETE_DRIVER',
    'VIEW_ANALYTICS', 'CREATE_VEHICLE', 'UPDATE_VEHICLE',
    'DELETE_VEHICLE', 'MANAGE_EARNINGS',
  ],
  MANAGER: [
    'CREATE_DRIVER', 'UPDATE_DRIVER',
    'VIEW_ANALYTICS', 'CREATE_VEHICLE', 'UPDATE_VEHICLE',
  ],
};

async function seed() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Seed roles
    const insertedRoles = await db.insert(roles).values(ROLES_SEED).returning();
    logger.info(`✅ Seeded ${insertedRoles.length} roles`);

    // Seed permissions
    const insertedPermissions = await db.insert(permissions).values(PERMISSIONS_SEED).returning();
    logger.info(`✅ Seeded ${insertedPermissions.length} permissions`);

    // Seed role-permission mappings
    const rolePermEntries: { roleId: string; permissionId: string }[] = [];

    for (const role of insertedRoles) {
      const permNames = ROLE_PERMISSION_MAP[role.name] || [];
      for (const permName of permNames) {
        const perm = insertedPermissions.find((p) => p.name === permName);
        if (perm) {
          rolePermEntries.push({ roleId: role.id, permissionId: perm.id });
        }
      }
    }

    await db.insert(rolePermissions).values(rolePermEntries);
    logger.info(`✅ Seeded ${rolePermEntries.length} role-permission mappings`);

    logger.info('🎉 Seeding completed successfully');
    process.exit(0);
  } catch (err) {
    logger.error({ err }, '❌ Seeding failed');
    process.exit(1);
  }
}

seed();
