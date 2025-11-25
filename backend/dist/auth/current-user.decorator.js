"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CurrentUser = void 0;
const common_1 = require("@nestjs/common");
const graphql_1 = require("@nestjs/graphql");
exports.CurrentUser = (0, common_1.createParamDecorator)((data, context) => {
    let request;
    try {
        const gqlContext = graphql_1.GqlExecutionContext.create(context);
        request = gqlContext.getContext().req;
    }
    catch {
        request = context.switchToHttp().getRequest();
    }
    const user = request.user;
    return data ? user?.[data] : user;
});
//# sourceMappingURL=current-user.decorator.js.map