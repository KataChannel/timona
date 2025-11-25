import { PrismaClient } from '@prisma/client';
import { GraphQLError } from 'graphql';

const prisma = new PrismaClient();

export const websiteSettingResolvers = {
  Query: {
    // Lấy tất cả settings (có phân quyền)
    websiteSettings: async (_: any, args: any, context: any) => {
      const { category, group, isActive, isPublic } = args;

      const where: any = {};
      if (category) where.category = category;
      if (group) where.group = group;
      if (typeof isActive === 'boolean') where.isActive = isActive;
      if (typeof isPublic === 'boolean') where.isPublic = isPublic;

      return await prisma.websiteSetting.findMany({
        where,
        orderBy: [{ category: 'asc' }, { order: 'asc' }],
      });
    },

    // Lấy settings public (không cần auth)
    publicWebsiteSettings: async (_: any, args: any) => {
      const { category, group } = args;

      const where: any = {
        isActive: true,
        isPublic: true,
      };
      if (category) where.category = category;
      if (group) where.group = group;

      return await prisma.websiteSetting.findMany({
        where,
        orderBy: [{ category: 'asc' }, { order: 'asc' }],
      });
    },

    // Lấy 1 setting theo key
    websiteSetting: async (_: any, { key }: any) => {
      return await prisma.websiteSetting.findUnique({
        where: { key },
      });
    },

    // Lấy settings theo category
    websiteSettingsByCategory: async (_: any, { category }: any) => {
      return await prisma.websiteSetting.findMany({
        where: {
          category,
          isActive: true,
          isPublic: true,
        },
        orderBy: { order: 'asc' },
      });
    },

    // Lấy header settings
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

    // Lấy footer settings
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

    // Lấy settings dạng key-value object
    websiteSettingsMap: async (_: any, args: any) => {
      const { category, group, isPublic } = args;

      const where: any = { isActive: true };
      if (category) where.category = category;
      if (group) where.group = group;
      if (typeof isPublic === 'boolean') where.isPublic = isPublic;

      const settings = await prisma.websiteSetting.findMany({
        where,
      });

      // Convert to key-value map
      return settings.reduce((acc: any, setting: any) => {
        // Parse value based on type
        let parsedValue = setting.value;
        
        if (setting.type === 'BOOLEAN') {
          parsedValue = setting.value === 'true';
        } else if (setting.type === 'NUMBER') {
          parsedValue = parseFloat(setting.value || '0');
        } else if (setting.type === 'JSON') {
          try {
            parsedValue = JSON.parse(setting.value || '{}');
          } catch (e) {
            parsedValue = {};
          }
        }

        acc[setting.key] = parsedValue;
        return acc;
      }, {});
    },
  },

  Mutation: {
    // Tạo setting mới
    createWebsiteSetting: async (_: any, { input }: any, context: any) => {
      // Check authentication
      if (!context.user) {
        throw new GraphQLError('Unauthorized', {
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

    // Update setting
    updateWebsiteSetting: async (_: any, { key, input }: any, context: any) => {
      // Check authentication
      if (!context.user) {
        throw new GraphQLError('Unauthorized', {
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

    // Update nhiều settings cùng lúc
    updateWebsiteSettings: async (_: any, { settings }: any, context: any) => {
      // Check authentication
      if (!context.user) {
        throw new GraphQLError('Unauthorized', {
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

    // Xóa setting
    deleteWebsiteSetting: async (_: any, { key }: any, context: any) => {
      // Check authentication
      if (!context.user) {
        throw new GraphQLError('Unauthorized', {
          extensions: { code: 'UNAUTHORIZED' },
        });
      }

      return await prisma.websiteSetting.delete({
        where: { key },
      });
    },

    // Bulk update từ JSON
    bulkUpdateWebsiteSettings: async (_: any, { data }: any, context: any) => {
      // Check authentication
      if (!context.user) {
        throw new GraphQLError('Unauthorized', {
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
    creator: async (parent: any) => {
      if (!parent.createdBy) return null;
      return await prisma.user.findUnique({
        where: { id: parent.createdBy },
      });
    },
    updater: async (parent: any) => {
      if (!parent.updatedBy) return null;
      return await prisma.user.findUnique({
        where: { id: parent.updatedBy },
      });
    },
  },
};
