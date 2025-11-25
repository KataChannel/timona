import { FileService } from '../../services/file.service';
import { FileFolder } from '../models/file.model';
import { CreateFolderInput, UpdateFolderInput } from '../inputs/file.input';
export declare class FolderResolver {
    private fileService;
    constructor(fileService: FileService);
    createFolder(input: CreateFolderInput, context: any): Promise<FileFolder>;
    getFolder(id: string, context: any): Promise<FileFolder>;
    getFolders(context: any): Promise<FileFolder[]>;
    updateFolder(input: UpdateFolderInput, context: any): Promise<FileFolder>;
    deleteFolder(id: string, context: any): Promise<boolean>;
}
