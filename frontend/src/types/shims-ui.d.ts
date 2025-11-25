declare module '*/ui/*' {
  import * as React from 'react';
  export const Button: any;
  export const Tabs: any;
  export const TabsList: any;
  export const TabsTrigger: any;
  export const TabsContent: any;
  export const Input: any;
  export const Label: any;
  export const Textarea: any;
  export const Select: any;
  export const Dialog: any;
  export const Checkbox: any;
  export const Switch: any;
  const _default: any;
  export default _default;
}

// Also stub local page-builder style panel exports
declare module '*page-builder/panels/StylePanel/*' {
  const StylePanel: any;
  export { StylePanel };
}

// Fallback for any ui tsx imports
declare module '../../../ui/*' {
  const anyExport: any;
  export = anyExport;
}
