import { HttpException, HttpStatus } from '@nestjs/common';
import { UserSparse } from '../user/user.schema';
import { KnowledgebaseSparse, UserRoles, ModelProvider } from './knowledgebase.schema';

export enum UserPermissions {
  READ = 'read',
  EDIT = 'edit',
  DELETE = 'delete',
  INVITE_USER = 'invite_user',
  DELETE_USER = 'delete_user',
}

const rolePermissions = {
  [UserRoles.READER]: [UserPermissions.READ],
  [UserRoles.EDITOR]: [UserPermissions.READ, UserPermissions.EDIT],
  [UserRoles.ADMIN]: [
    UserPermissions.READ,
    UserPermissions.EDIT,
    UserPermissions.DELETE,
    UserPermissions.INVITE_USER,
    UserPermissions.DELETE_USER,
  ],
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
          const hasPermission = requiredPermissions.every(
            (permission: UserPermissions) =>
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

/**
 * Determines the correct model provider based on the model name
 */
export function getModelProviderFromModel(model: string): ModelProvider {
  if (!model) {
    return ModelProvider.OPENAI; // Default fallback
  }
  
  // Claude models
  if (model.includes('claude')) {
    return ModelProvider.ANTHROPIC;
  }
  
  // OpenAI models (including GPT variants)
  if (model.includes('gpt') || model.includes('text-davinci') || model.includes('text-curie')) {
    return ModelProvider.OPENAI;
  }
  
  // Default to OpenAI for unknown models (backward compatibility)
  return ModelProvider.OPENAI;
}

/**
 * Validates and fixes chatWidgetData to ensure model and modelProvider are consistent
 */
export function validateAndFixChatWidgetData(chatWidgetData: any): any {
  if (!chatWidgetData || typeof chatWidgetData !== 'object') {
    return chatWidgetData;
  }
  
  // If model is present but modelProvider is missing or incorrect, fix it
  if (chatWidgetData.model) {
    const correctProvider = getModelProviderFromModel(chatWidgetData.model);
    chatWidgetData.modelProvider = correctProvider;
  }
  
  return chatWidgetData;
}
