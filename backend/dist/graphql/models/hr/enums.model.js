"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ClearanceStatus = exports.OffboardingStatus = exports.OnboardingStatus = exports.DocumentType = exports.TerminationType = exports.ContractType = exports.EmploymentEventType = exports.MaritalStatus = exports.Gender = void 0;
const graphql_1 = require("@nestjs/graphql");
var Gender;
(function (Gender) {
    Gender["MALE"] = "MALE";
    Gender["FEMALE"] = "FEMALE";
    Gender["OTHER"] = "OTHER";
})(Gender || (exports.Gender = Gender = {}));
var MaritalStatus;
(function (MaritalStatus) {
    MaritalStatus["SINGLE"] = "SINGLE";
    MaritalStatus["MARRIED"] = "MARRIED";
    MaritalStatus["DIVORCED"] = "DIVORCED";
    MaritalStatus["WIDOWED"] = "WIDOWED";
})(MaritalStatus || (exports.MaritalStatus = MaritalStatus = {}));
var EmploymentEventType;
(function (EmploymentEventType) {
    EmploymentEventType["ONBOARDING"] = "ONBOARDING";
    EmploymentEventType["PROMOTION"] = "PROMOTION";
    EmploymentEventType["TRANSFER"] = "TRANSFER";
    EmploymentEventType["SALARY_CHANGE"] = "SALARY_CHANGE";
    EmploymentEventType["POSITION_CHANGE"] = "POSITION_CHANGE";
    EmploymentEventType["DEPARTMENT_CHANGE"] = "DEPARTMENT_CHANGE";
    EmploymentEventType["OFFBOARDING"] = "OFFBOARDING";
})(EmploymentEventType || (exports.EmploymentEventType = EmploymentEventType = {}));
var ContractType;
(function (ContractType) {
    ContractType["PROBATION"] = "PROBATION";
    ContractType["FULL_TIME"] = "FULL_TIME";
    ContractType["PART_TIME"] = "PART_TIME";
    ContractType["CONTRACT"] = "CONTRACT";
    ContractType["INTERNSHIP"] = "INTERNSHIP";
    ContractType["FREELANCE"] = "FREELANCE";
})(ContractType || (exports.ContractType = ContractType = {}));
var TerminationType;
(function (TerminationType) {
    TerminationType["RESIGNATION"] = "RESIGNATION";
    TerminationType["TERMINATION"] = "TERMINATION";
    TerminationType["RETIREMENT"] = "RETIREMENT";
    TerminationType["CONTRACT_END"] = "CONTRACT_END";
    TerminationType["MUTUAL_AGREEMENT"] = "MUTUAL_AGREEMENT";
})(TerminationType || (exports.TerminationType = TerminationType = {}));
var DocumentType;
(function (DocumentType) {
    DocumentType["CV"] = "CV";
    DocumentType["CONTRACT"] = "CONTRACT";
    DocumentType["ID_CARD"] = "ID_CARD";
    DocumentType["PASSPORT"] = "PASSPORT";
    DocumentType["DEGREE"] = "DEGREE";
    DocumentType["CERTIFICATE"] = "CERTIFICATE";
    DocumentType["PHOTO"] = "PHOTO";
    DocumentType["BANK_INFO"] = "BANK_INFO";
    DocumentType["HEALTH_CERTIFICATE"] = "HEALTH_CERTIFICATE";
    DocumentType["OTHER"] = "OTHER";
})(DocumentType || (exports.DocumentType = DocumentType = {}));
var OnboardingStatus;
(function (OnboardingStatus) {
    OnboardingStatus["PENDING"] = "PENDING";
    OnboardingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OnboardingStatus["COMPLETED"] = "COMPLETED";
    OnboardingStatus["CANCELLED"] = "CANCELLED";
})(OnboardingStatus || (exports.OnboardingStatus = OnboardingStatus = {}));
var OffboardingStatus;
(function (OffboardingStatus) {
    OffboardingStatus["INITIATED"] = "INITIATED";
    OffboardingStatus["IN_PROGRESS"] = "IN_PROGRESS";
    OffboardingStatus["PENDING_APPROVAL"] = "PENDING_APPROVAL";
    OffboardingStatus["APPROVED"] = "APPROVED";
    OffboardingStatus["COMPLETED"] = "COMPLETED";
    OffboardingStatus["CANCELLED"] = "CANCELLED";
})(OffboardingStatus || (exports.OffboardingStatus = OffboardingStatus = {}));
var ClearanceStatus;
(function (ClearanceStatus) {
    ClearanceStatus["PENDING"] = "PENDING";
    ClearanceStatus["PARTIAL"] = "PARTIAL";
    ClearanceStatus["COMPLETE"] = "COMPLETE";
})(ClearanceStatus || (exports.ClearanceStatus = ClearanceStatus = {}));
(0, graphql_1.registerEnumType)(Gender, {
    name: 'Gender',
    description: 'Gender types',
});
(0, graphql_1.registerEnumType)(MaritalStatus, {
    name: 'MaritalStatus',
    description: 'Marital status types',
});
(0, graphql_1.registerEnumType)(EmploymentEventType, {
    name: 'EmploymentEventType',
    description: 'Employment event types for tracking employment history',
});
(0, graphql_1.registerEnumType)(ContractType, {
    name: 'ContractType',
    description: 'Employment contract types',
});
(0, graphql_1.registerEnumType)(TerminationType, {
    name: 'TerminationType',
    description: 'Employment termination types',
});
(0, graphql_1.registerEnumType)(DocumentType, {
    name: 'DocumentType',
    description: 'Employee document types',
});
(0, graphql_1.registerEnumType)(OnboardingStatus, {
    name: 'OnboardingStatus',
    description: 'Onboarding process status',
});
(0, graphql_1.registerEnumType)(OffboardingStatus, {
    name: 'OffboardingStatus',
    description: 'Offboarding process status',
});
(0, graphql_1.registerEnumType)(ClearanceStatus, {
    name: 'ClearanceStatus',
    description: 'Clearance status for offboarding',
});
//# sourceMappingURL=enums.model.js.map