import ServerError from '@/utils/serverError.js';

/**
 * User class
 * @class User
 * @param {Object} user
 * @param {string} user.id
 * @param {boolean} user.is_root_user
 * @param {Array<{company_id: string, permissions: string[]}>} user.permissions
 * @param {string} user.session_id
 */
class AuthUser {

  id: string;

  session_id: string;

  is_root_user: boolean;

  permissions: Record<string, number>;

  constructor({ id, is_root_user, permissions = {}, session_id }: { id: string, is_root_user: boolean, permissions: Record<string, number>, session_id: string }) {
    this.id = id;
    this.session_id = session_id;
    this.is_root_user = is_root_user;
    this.permissions = permissions;
  }

  hasPermission(permission_code: string, access_level: number): boolean {
    if (this.is_root_user) return true;
    return this.permissions[permission_code] >= access_level;
  }

  permissionCheck(permission_code: string, access_level: number): void {
    if (!this.hasPermission(permission_code, access_level)) throw new ServerError('FORBIDDEN', `You don't have permission to perform this action (${permission_code}).`);
  }
}

export default AuthUser;
