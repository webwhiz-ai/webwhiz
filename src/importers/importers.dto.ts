import { IsNotEmpty } from 'class-validator';
import { IsObjectId } from '../common/custom-class-validators';

export class AddDocumentDTO {
  @IsObjectId()
  @IsNotEmpty()
  knowledgebaseId: string;
}
