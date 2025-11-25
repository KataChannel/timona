"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const testing_1 = require("@nestjs/testing");
const project_resolver_1 = require("./project.resolver");
describe('ProjectResolver', () => {
    let resolver;
    beforeEach(async () => {
        const module = await testing_1.Test.createTestingModule({
            providers: [project_resolver_1.ProjectResolver],
        }).compile();
        resolver = module.get(project_resolver_1.ProjectResolver);
    });
    it('should be defined', () => {
        expect(resolver).toBeDefined();
    });
});
//# sourceMappingURL=project.resolver.spec.js.map