import { SetMetadata } from '@nestjs/common';

const IS_API_KEY_AUTH = 'isApiKeyAuth';
const ApiKeyAuth = () => SetMetadata(IS_API_KEY_AUTH, true);

export { IS_API_KEY_AUTH, ApiKeyAuth };
