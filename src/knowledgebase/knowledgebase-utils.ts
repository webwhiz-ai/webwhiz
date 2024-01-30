import { HttpException, HttpStatus } from '@nestjs/common';
import { UserSparse } from '../user/user.schema';
import { KnowledgebaseSparse, UserRoles } from './knowledgebase.schema';
import { use } from 'passport';

const rolePermissions = {
  [UserRoles.READER]: ['read'],
  [UserRoles.EDITOR]: ['read', 'edit'],
  [UserRoles.ADMIN]: ['read', 'edit', 'admin'],
};

export function checkUserPermissionForKb(
  user: UserSparse,
  kb: KnowledgebaseSparse,
  requiredPermissions?: string[],
) {
  if (!kb) {
    throw new HttpException('Invalid Knowledgebase Id', HttpStatus.NOT_FOUND);
  }
  if (!user._id.equals(kb.owner)) {
    // Check participants if the current user is not the kb owner
    // Assuming the owner should have all the admin access
    if (kb.participants) {
      // Fetch current user from participants list
      const userRoleObj = kb.participants.find(
        (obj) => obj.id.toString() === user._id.toString(),
      );
      if (userRoleObj) {
        const userPermissions = rolePermissions[userRoleObj.role];

        if (requiredPermissions) {
          // Check if the user's permissions include all required permissions
          const hasPermission = requiredPermissions.every((permission) =>
            userPermissions.includes(permission),
          );

          if (!hasPermission) {
            throw new HttpException('Unauthorised', HttpStatus.UNAUTHORIZED);
          }
        }
      } else {
        throw new HttpException('Unauthorised', HttpStatus.UNAUTHORIZED);
      }
    } else {
      throw new HttpException('Unauthorised', HttpStatus.UNAUTHORIZED);
    }
  }
}
