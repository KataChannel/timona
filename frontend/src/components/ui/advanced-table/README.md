# Advanced Table Component

A comprehensive, dynamic data table component inspired by AG Grid Enterprise with TypeScript support and modern React patterns.

## Features

### ✅ Column Management
- **Column Pinning**: Pin columns to left or right side
- **Show/Hide Columns**: Toggle column visibility with settings dialog
- **Column Resizing**: Drag to resize columns with min/max width constraints
- **Auto-sizing**: Auto-size individual columns or all columns at once

### ✅ Sorting & Filtering
- **Multi-column Sorting**: Sort by multiple columns with priority indicators
- **Advanced Filtering**: Add multiple filter conditions with various operators
- **Column Filters**: Google Sheets-style filters with checkbox selection for each column
- **Global Search**: Search across all visible columns
- **Data Type Filters**: Type-specific filters (text, number, date, boolean, select)

### ✅ Editing & Actions
- **Inline Editing**: Double-click cells to edit with validation
- **Dialog Editing**: Modal-based editing (configurable)
- **Row Selection**: Single and multi-row selection with checkboxes
- **Bulk Actions**: Delete multiple rows with confirmation dialog
- **Data Validation**: Built-in and custom validation support

### ✅ Additional Features
- **Custom Cell Renderers**: Render custom components in cells
- **Custom Cell Editors**: Custom editing components
- **Export to CSV**: Export filtered/sorted data
- **Responsive Design**: Works on different screen sizes
- **TypeScript Support**: Full type safety and IntelliSense

## Basic Usage

```tsx
import { AdvancedTable, ColumnDef } from '@/components/ui/advanced-table';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'user' | 'manager';
  status: 'active' | 'inactive';
  joinDate: Date;
}

const columns: ColumnDef<User>[] = [
  {
    field: 'name',
    headerName: 'Name',
    width: 200,
    sortable: true,
    filterable: true,
    editable: true,
    pinned: 'left'
  },
  {
    field: 'email',
    headerName: 'Email',
    width: 250,
    sortable: true,
    filterable: true,
    editable: true
  },
  {
    field: 'role',
    headerName: 'Role',
    type: 'select',
    filterOptions: ['admin', 'user', 'manager'],
    sortable: true,
    filterable: true,
    editable: true
  }
];

function MyTable() {
  const [data, setData] = useState<User[]>([]);

  const handleEdit = async (user: User, field: keyof User, newValue: any) => {
    // Update data via API
    const success = await updateUser(user.id, { [field]: newValue });
    if (success) {
      setData(prev => prev.map(u => 
        u.id === user.id ? { ...u, [field]: newValue } : u
      ));
    }
    return success;
  };

  return (
    <AdvancedTable
      columns={columns}
      data={data}
      onRowEdit={handleEdit}
      config={{
        enableSorting: true,
        enableFiltering: true,
        enableColumnPinning: true,
        enableInlineEditing: true,
        showToolbar: true
      }}
      height={600}
    />
  );
}
```

## Column Configuration

### Basic Column Properties
```tsx
interface ColumnDef<T> {
  field: keyof T;           // Data field name
  headerName: string;       // Display name
  type?: ColumnType;        // Data type for filtering/editing
  width?: number;           // Column width
  minWidth?: number;        // Minimum width
  maxWidth?: number;        // Maximum width
  resizable?: boolean;      // Enable resizing
  sortable?: boolean;       // Enable sorting
  filterable?: boolean;     // Enable filtering
  editable?: boolean;       // Enable editing
  hide?: boolean;           // Hide column
  pinned?: 'left' | 'right' | null; // Pin position
}
```

### Custom Cell Renderers
```tsx
const columns: ColumnDef<User>[] = [
  {
    field: 'status',
    headerName: 'Status',
    cellRenderer: ({ value, data }) => (
      <Badge variant={value === 'active' ? 'default' : 'secondary'}>
        {value}
      </Badge>
    )
  }
];
```

### Custom Cell Editors
```tsx
const columns: ColumnDef<User>[] = [
  {
    field: 'role',
    headerName: 'Role',
    cellEditor: ({ value, onValueChange, onSave, onCancel }) => (
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="user">User</SelectItem>
        </SelectContent>
      </Select>
    )
  }
];
```

## Table Configuration

```tsx
const config: TableConfig = {
  enableSorting: true,              // Enable column sorting
  enableFiltering: true,            // Enable filtering
  enableColumnPinning: true,        // Enable column pinning
  enableColumnResizing: true,       // Enable column resizing
  enableColumnHiding: true,         // Enable show/hide columns
  enableRowSelection: true,         // Enable row selection
  enableInlineEditing: true,        // Enable inline editing
  enableDialogEditing: false,       // Enable dialog editing
  enableRowDeletion: true,          // Enable row deletion
  rowHeight: 40,                    // Row height in pixels
  headerHeight: 40,                 // Header height in pixels
  showToolbar: true,                // Show toolbar
  showPagination: false,            // Show pagination (not implemented yet)
  pageSize: 50,                     // Items per page
  virtualScrolling: false           // Virtual scrolling (not implemented yet)
};
```

## Event Handlers

```tsx
<AdvancedTable
  columns={columns}
  data={data}
  // Row editing
  onRowEdit={async (row, field, newValue) => {
    const success = await updateRow(row.id, field, newValue);
    return success;
  }}
  // Row creation
  onRowCreate={async (newRowData) => {
    const success = await createRow(newRowData);
    return success;
  }}
  // Row deletion
  onRowDelete={async (rows) => {
    const success = await deleteRows(rows.map(r => r.id));
    return success;
  }}
  // Row selection
  onRowSelect={(selectedRows) => {
    console.log('Selected rows:', selectedRows);
  }}
  // Sorting
  onSort={(sortConfigs) => {
    console.log('Sort configs:', sortConfigs);
  }}
  // Filtering
  onFilter={(filters) => {
    console.log('Active filters:', filters);
  }}
/>
```

## Google Sheets-Style Column Filters

The advanced table now includes Google Sheets-style column filters that appear on each column header.

### Features
- **Checkbox Selection**: Select specific values to filter by
- **Search in Filter**: Search within the filter values
- **Select All/None**: Quick selection controls
- **Sort Integration**: Sort A→Z or Z→A directly from filter popover
- **Active Filter Badge**: Visual indicator showing count of active filters per column
- **Multiple Selection**: Filter by multiple values at once

### Usage

Column filters are automatically enabled for all filterable columns. Simply hover over any column header to see the filter icon.

```tsx
const columns: ColumnDef<User>[] = [
  {
    field: 'status',
    headerName: 'Status',
    filterable: true,  // Enable column filter
    sortable: true
  },
  {
    field: 'role',
    headerName: 'Role',
    filterable: true,
    type: 'select'
  }
];
```

### Filter Behavior

1. **Hover State**: Filter icon appears when hovering over column header
2. **Active State**: Filter icon becomes blue with badge showing active filter count
3. **Single Value**: Selecting one value creates an 'equals' filter
4. **Multiple Values**: Selecting multiple values creates an 'in' filter
5. **Clear**: Click "Clear" in popover to remove all filters for that column
6. **Sort**: Use A→Z / Z→A buttons to sort column while keeping filter open

### Example

```tsx
// The component automatically handles column filters
<AdvancedTable
  columns={columns}
  data={data}
  onFilter={(filters) => {
    // Filters include both global filters and column filters
    console.log('Active filters:', filters);
    // Example: [
    //   { field: 'status', operator: 'in', value: ['active', 'pending'] },
    //   { field: 'role', operator: 'equals', value: 'admin' }
    // ]
  }}
/>
```

### Filter Operators

Column filters support the following operators:

- `equals`: Single value match (exact match)
- `in`: Multiple value match (includes any of)
- `notIn`: Exclude specific values (excludes all of)
- `isEmpty`: Field is empty/null
- `isNotEmpty`: Field has a value

## Data Types Support

### Text Fields
```tsx
{
  field: 'name',
  type: 'text',
  validation: (value) => value.length > 0 ? null : 'Name is required'
}
```

### Number Fields
```tsx
{
  field: 'salary',
  type: 'number',
  cellRenderer: ({ value }) => `$${value.toLocaleString()}`
}
```

### Date Fields
```tsx
{
  field: 'joinDate',
  type: 'date',
  cellRenderer: ({ value }) => value.toLocaleDateString()
}
```

### Boolean Fields
```tsx
{
  field: 'isActive',
  type: 'boolean'
}
```

### Select Fields
```tsx
{
  field: 'role',
  type: 'select',
  filterOptions: ['admin', 'user', 'manager']
}
```

## Styling

The component uses Tailwind CSS classes and can be customized through:

- `className` prop on the main component
- `headerClass` and `cellClass` on individual columns
- CSS custom properties for theming

## Performance Tips

1. **Virtual Scrolling**: Enable for large datasets (coming soon)
2. **Column Virtualization**: Only render visible columns for wide tables
3. **Memoization**: Use React.memo for custom cell renderers
4. **Debounced Search**: Global search is debounced for performance
5. **Lazy Loading**: Implement server-side pagination for large datasets

## Browser Support

- Chrome/Edge 88+
- Firefox 78+
- Safari 14+

## Dependencies

- React 18+
- TypeScript 4.5+
- Tailwind CSS 3+
- Radix UI components
- Lucide React icons