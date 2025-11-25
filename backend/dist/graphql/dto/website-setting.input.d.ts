export declare enum SettingCategory {
    GENERAL = "GENERAL",
    HEADER = "HEADER",
    FOOTER = "FOOTER",
    SEO = "SEO",
    SOCIAL = "SOCIAL",
    CONTACT = "CONTACT",
    APPEARANCE = "APPEARANCE",
    ANALYTICS = "ANALYTICS",
    PAYMENT = "PAYMENT",
    SHIPPING = "SHIPPING",
    SUPPORT_CHAT = "SUPPORT_CHAT",
    AUTH = "AUTH"
}
export declare enum SettingType {
    TEXT = "TEXT",
    TEXTAREA = "TEXTAREA",
    NUMBER = "NUMBER",
    BOOLEAN = "BOOLEAN",
    SELECT = "SELECT",
    JSON = "JSON",
    COLOR = "COLOR",
    IMAGE = "IMAGE",
    URL = "URL"
}
export declare class CreateWebsiteSettingInput {
    key: string;
    label: string;
    value?: string;
    description?: string;
    type: SettingType;
    category: SettingCategory;
    group?: string;
    order?: number;
    options?: any;
    validation?: any;
    isActive?: boolean;
    isPublic?: boolean;
    createdBy?: string;
    updatedBy?: string;
}
export declare class UpdateWebsiteSettingInput {
    label?: string;
    value?: string;
    description?: string;
    type?: SettingType;
    category?: SettingCategory;
    group?: string;
    order?: number;
    options?: any;
    validation?: any;
    isActive?: boolean;
    isPublic?: boolean;
    updatedBy?: string;
}
