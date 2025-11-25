"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.websiteSettingResolvers = void 0;
const client_1 = require("@prisma/client");
const graphql_1 = require("graphql");
const prisma = new client_1.PrismaClient();
exports.websiteSettingResolvers = {
    Query: {
        websiteSettings: async (_, args, context) => {
            const { category, group, isActive, isPublic } = args;
            const where = {};
            if (category)
                where.category = category;
            if (group)
                where.group = group;
            if (typeof isActive === 'boolean')
                where.isActive = isActive;
            if (typeof isPublic === 'boolean')
                where.isPublic = isPublic;
            return await prisma.websiteSetting.findMany({
                where,
                orderBy: [{ category: 'asc' }, { order: 'asc' }],
            });
        },
        publicWebsiteSettings: async (_, args) => {
            const { category, group } = args;
            const where = {
                isActive: true,
                isPublic: true,
            };
            if (category)
                where.category = category;
            if (group)
                where.group = group;
            return await prisma.websiteSetting.findMany({
                where,
                orderBy: [{ category: 'asc' }, { order: 'asc' }],
            });
        },
        websiteSetting: async (_, { key }) => {
            return await prisma.websiteSetting.findUnique({
                where: { key },
            });
        },
        websiteSettingsByCategory: async (_, { category }) => {
            return await prisma.websiteSetting.findMany({
                where: {
                    category,
                    isActive: true,
                    isPublic: true,
                },
                orderBy: { order: 'asc' },
            });
        },
        headerSettings: async () => {
            return await prisma.websiteSetting.findMany({
                where: {
                    category: 'HEADER',
                    isActive: true,
                    isPublic: true,
                },
                orderBy: { order: 'asc' },
            });
        },
        footerSettings: async () => {
            return await prisma.websiteSetting.findMany({
                where: {
                    category: 'FOOTER',
                    isActive: true,
                    isPublic: true,
                },
                orderBy: { order: 'asc' },
            });
        },
        websiteSettingsMap: async (_, args) => {
            const { category, group, isPublic } = args;
            const where = { isActive: true };
            if (category)
                where.category = category;
            if (group)
                where.group = group;
            if (typeof isPublic === 'boolean')
                where.isPublic = isPublic;
            const settings = await prisma.websiteSetting.findMany({
                where,
            });
            return settings.reduce((acc, setting) => {
                let parsedValue = setting.value;
                if (setting.type === 'BOOLEAN') {
                    parsedValue = setting.value === 'true';
                }
                else if (setting.type === 'NUMBER') {
                    parsedValue = parseFloat(setting.value || '0');
                }
                else if (setting.type === 'JSON') {
                    try {
                        parsedValue = JSON.parse(setting.value || '{}');
                    }
                    catch (e) {
                        parsedValue = {};
                    }
                }
                acc[setting.key] = parsedValue;
                return acc;
            }, {});
        },
    },
    Mutation: {
        createWebsiteSetting: async (_, { input }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError('Unauthorized', {
                    extensions: { code: 'UNAUTHORIZED' },
                });
            }
            return await prisma.websiteSetting.create({
                data: {
                    ...input,
                    createdBy: context.user.id,
                    updatedBy: context.user.id,
                },
            });
        },
        updateWebsiteSetting: async (_, { key, input }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError('Unauthorized', {
                    extensions: { code: 'UNAUTHORIZED' },
                });
            }
            return await prisma.websiteSetting.update({
                where: { key },
                data: {
                    ...input,
                    updatedBy: context.user.id,
                },
            });
        },
        updateWebsiteSettings: async (_, { settings }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError('Unauthorized', {
                    extensions: { code: 'UNAUTHORIZED' },
                });
            }
            const results = [];
            for (const { key, value } of settings) {
                const updated = await prisma.websiteSetting.update({
                    where: { key },
                    data: {
                        value,
                        updatedBy: context.user.id,
                    },
                });
                results.push(updated);
            }
            return results;
        },
        deleteWebsiteSetting: async (_, { key }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError('Unauthorized', {
                    extensions: { code: 'UNAUTHORIZED' },
                });
            }
            return await prisma.websiteSetting.delete({
                where: { key },
            });
        },
        bulkUpdateWebsiteSettings: async (_, { data }, context) => {
            if (!context.user) {
                throw new graphql_1.GraphQLError('Unauthorized', {
                    extensions: { code: 'UNAUTHORIZED' },
                });
            }
            const settingsData = JSON.parse(data);
            const results = [];
            for (const [key, value] of Object.entries(settingsData)) {
                const updated = await prisma.websiteSetting.upsert({
                    where: { key },
                    update: {
                        value: String(value),
                        updatedBy: context.user.id,
                    },
                    create: {
                        key,
                        value: String(value),
                        type: 'TEXT',
                        category: 'GENERAL',
                        label: key,
                        createdBy: context.user.id,
                        updatedBy: context.user.id,
                    },
                });
                results.push(updated);
            }
            return results;
        },
    },
    WebsiteSetting: {
        creator: async (parent) => {
            if (!parent.createdBy)
                return null;
            return await prisma.user.findUnique({
                where: { id: parent.createdBy },
            });
        },
        updater: async (parent) => {
            if (!parent.updatedBy)
                return null;
            return await prisma.user.findUnique({
                where: { id: parent.updatedBy },
            });
        },
    },
};
//# sourceMappingURL=websitesetting.resolver.js.map