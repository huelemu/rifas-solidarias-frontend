// src/app/utils/role.utils.ts - ARREGLADO
import { UserRole, UserRoleType } from '../services/auth.service';

export interface RoleConfig {
  label: string;
  description: string;
  permissions: string[];
  color: string;
}

export const ROLE_CONFIGS: Record<UserRoleType, RoleConfig> = {
  admin_global: {
    label: 'Administrador Global',
    description: 'Acceso completo a todo el sistema',
    permissions: [
      'manage_institutions',
      'manage_users',
      'manage_rifas',
      'view_all_reports',
      'system_settings'
    ],
    color: '#e74c3c'
  },
  admin_institucion: {
    label: 'Administrador de Institución',
    description: 'Gestiona su institución y sus rifas',
    permissions: [
      'manage_institution_users',
      'manage_institution_rifas',
      'view_institution_reports',
      'manage_vendedores'
    ],
    color: '#3498db'
  },
  vendedor: {
    label: 'Vendedor',
    description: 'Vende rifas asignadas',
    permissions: [
      'sell_rifas',
      'view_own_sales',
      'manage_customers',
      'generate_tickets'
    ],
    color: '#27ae60'
  },
  comprador: {
    label: 'Comprador',
    description: 'Compra rifas disponibles',
    permissions: [
      'buy_rifas',
      'view_own_purchases',
      'view_rifa_details'
    ],
    color: '#f39c12'
  }
};

export function getRoleConfig(role: UserRoleType): RoleConfig {
  return ROLE_CONFIGS[role];
}

export function hasPermission(userRole: UserRoleType, permission: string): boolean {
  const config = getRoleConfig(userRole);
  return config.permissions.includes(permission);
}

export function canAccessRoute(userRole: UserRoleType, requiredRoles: UserRoleType[]): boolean {
  return requiredRoles.includes(userRole);
}

export function isAdmin(role: UserRoleType): boolean {
  return role === 'admin_global' || role === 'admin_institucion';
}

export function canManageUsers(role: UserRoleType): boolean {
  return hasPermission(role, 'manage_users') || hasPermission(role, 'manage_institution_users');
}