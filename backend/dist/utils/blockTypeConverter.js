"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BLOCK_TYPE_STRING_TO_NUMERIC = exports.BLOCK_TYPE_NUMERIC_TO_STRING = void 0;
exports.numericBlockTypeToString = numericBlockTypeToString;
exports.stringBlockTypeToNumeric = stringBlockTypeToNumeric;
exports.convertBlockTypesNumericToString = convertBlockTypesNumericToString;
exports.convertBlockTypesStringToNumeric = convertBlockTypesStringToNumeric;
exports.convertCreateBlockInputToBackend = convertCreateBlockInputToBackend;
exports.convertUpdateBlockInputToBackend = convertUpdateBlockInputToBackend;
exports.convertPageBlockToFrontend = convertPageBlockToFrontend;
exports.convertPageBlocksToFrontend = convertPageBlocksToFrontend;
exports.BLOCK_TYPE_NUMERIC_TO_STRING = {
    0: 'TEXT',
    1: 'IMAGE',
    2: 'VIDEO',
    3: 'CAROUSEL',
    4: 'HERO',
    5: 'BUTTON',
    6: 'DIVIDER',
    7: 'SPACER',
    8: 'TEAM',
    9: 'STATS',
    10: 'CONTACT_INFO',
    11: 'GALLERY',
    12: 'CARD',
    13: 'TESTIMONIAL',
    14: 'FAQ',
    15: 'CONTACT_FORM',
    16: 'COMPLETED_TASKS',
    17: 'CONTAINER',
    18: 'SECTION',
    19: 'GRID',
    20: 'FLEX_ROW',
    21: 'FLEX_COLUMN',
    22: 'COLUMN',
    23: 'ROW',
    24: 'DYNAMIC',
    25: 'PRODUCT_LIST',
    26: 'PRODUCT_DETAIL',
    27: 'PRODUCT_CAROUSEL',
};
exports.BLOCK_TYPE_STRING_TO_NUMERIC = {
    'TEXT': 0,
    'IMAGE': 1,
    'VIDEO': 2,
    'CAROUSEL': 3,
    'HERO': 4,
    'BUTTON': 5,
    'DIVIDER': 6,
    'SPACER': 7,
    'TEAM': 8,
    'STATS': 9,
    'CONTACT_INFO': 10,
    'GALLERY': 11,
    'CARD': 12,
    'TESTIMONIAL': 13,
    'FAQ': 14,
    'CONTACT_FORM': 15,
    'COMPLETED_TASKS': 16,
    'CONTAINER': 17,
    'SECTION': 18,
    'GRID': 19,
    'FLEX_ROW': 20,
    'FLEX_COLUMN': 21,
    'COLUMN': 22,
    'ROW': 23,
    'DYNAMIC': 24,
    'PRODUCT_LIST': 25,
    'PRODUCT_DETAIL': 26,
    'PRODUCT_CAROUSEL': 27,
};
function numericBlockTypeToString(numericType) {
    if (numericType === undefined)
        return undefined;
    const numeric = typeof numericType === 'string' ? parseInt(numericType, 10) : numericType;
    if (isNaN(numeric))
        return undefined;
    return exports.BLOCK_TYPE_NUMERIC_TO_STRING[numeric];
}
function stringBlockTypeToNumeric(stringType) {
    if (stringType === undefined)
        return undefined;
    const str = typeof stringType === 'number' ? String(stringType) : stringType;
    return exports.BLOCK_TYPE_STRING_TO_NUMERIC[str.toUpperCase()];
}
function convertBlockTypesNumericToString(types) {
    return types.map(numericBlockTypeToString);
}
function convertBlockTypesStringToNumeric(types) {
    return types.map(stringBlockTypeToNumeric);
}
function convertCreateBlockInputToBackend(input) {
    return {
        ...input,
        type: numericBlockTypeToString(input.type),
        children: input.children?.map(convertCreateBlockInputToBackend),
    };
}
function convertUpdateBlockInputToBackend(input) {
    return {
        ...input,
        type: input.type !== undefined ? numericBlockTypeToString(input.type) : undefined,
        children: input.children?.map(convertUpdateBlockInputToBackend),
    };
}
function convertPageBlockToFrontend(block) {
    if (!block)
        return block;
    return {
        ...block,
        type: stringBlockTypeToNumeric(block.type),
        children: block.children?.map(convertPageBlockToFrontend),
    };
}
function convertPageBlocksToFrontend(blocks) {
    return blocks.map(convertPageBlockToFrontend);
}
//# sourceMappingURL=blockTypeConverter.js.map