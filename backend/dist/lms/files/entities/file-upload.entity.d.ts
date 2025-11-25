export declare enum FileUploadType {
    IMAGE = "IMAGE",
    VIDEO = "VIDEO",
    DOCUMENT = "DOCUMENT"
}
export declare class FileUploadResult {
    id: string;
    url: string;
    filename: string;
    mimetype: string;
    size: number;
    bucket: string;
}
