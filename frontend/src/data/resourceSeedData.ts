import type { ResourceType, ResourceInstance } from '../types/resource';

// Seed data for Resource Types
export const SEED_RESOURCE_TYPES: ResourceType[] = [
  {
    id: 'equipment_inventory',
    name: 'Equipment Inventory',
    description: 'Manage equipment and tools used across projects',
    category: 'equipment',
    icon: '🔧',
    version: '1.0.0',
    status: 'published',
    schema: [
      {
        id: 'field-1',
        type: 'text',
        displayName: 'Equipment Name',
        internalName: 'equipment_name',
        required: true,
        unique: true,
        position: 0,
        helpText: 'The name or model of the equipment'
      },
      {
        id: 'field-2',
        type: 'enum',
        displayName: 'Status',
        internalName: 'status',
        required: true,
        unique: false,
        position: 1,
        enumOptions: [
          { label: 'Available', value: 'available', color: 'green' },
          { label: 'Checked Out', value: 'checked_out', color: 'yellow' },
          { label: 'Maintenance', value: 'maintenance', color: 'orange' },
          { label: 'Retired', value: 'retired', color: 'slate' }
        ]
      },
      {
        id: 'field-3',
        type: 'date',
        displayName: 'Purchase Date',
        internalName: 'purchase_date',
        required: false,
        unique: false,
        position: 2,
        helpText: 'When was this equipment purchased?'
      },
      {
        id: 'field-4',
        type: 'text',
        displayName: 'Serial Number',
        internalName: 'serial_number',
        required: false,
        unique: true,
        position: 3
      }
    ],
    operations: [
      {
        id: 'op-checkout',
        name: 'Checkout Equipment',
        description: 'Mark equipment as checked out',
        type: 'void',
        parameters: [],
        blocks: [
          {
            id: 'block-1',
            type: 'getItemId',
            label: 'Get Item ID',
            position: { x: 100, y: 100 },
            config: {},
            inputs: [],
            outputs: [{ id: 'out-1', label: 'Item ID', type: 'string', required: false }]
          },
          {
            id: 'block-2',
            type: 'updateFieldValue',
            label: 'Update Status',
            position: { x: 300, y: 100 },
            config: { fieldName: 'status' },
            inputs: [
              { id: 'in-1', label: 'Item ID', type: 'string', required: true },
              { id: 'in-2', label: 'New Value', type: 'string', required: true }
            ],
            outputs: []
          }
        ],
        connections: [
          {
            id: 'conn-1',
            sourceBlockId: 'block-1',
            sourceOutputId: 'out-1',
            targetBlockId: 'block-2',
            targetInputId: 'in-1'
          }
        ]
      }
    ],
    createdBy: 'admin',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15'),
    publishedAt: new Date('2024-01-15')
  },
  {
    id: 'team_members',
    name: 'Team Members',
    description: 'Track human resource allocation',
    category: 'hr',
    icon: '👥',
    version: '1.0.0',
    status: 'published',
    schema: [
      {
        id: 'field-1',
        type: 'text',
        displayName: 'Full Name',
        internalName: 'full_name',
        required: true,
        unique: false,
        position: 0
      },
      {
        id: 'field-2',
        type: 'text',
        displayName: 'Role',
        internalName: 'role',
        required: true,
        unique: false,
        position: 1
      },
      {
        id: 'field-3',
        type: 'enum',
        displayName: 'Availability',
        internalName: 'availability',
        required: true,
        unique: false,
        position: 2,
        enumOptions: [
          { label: 'Available', value: 'available', color: 'green' },
          { label: 'Busy', value: 'busy', color: 'orange' },
          { label: 'On Leave', value: 'on_leave', color: 'slate' }
        ]
      }
    ],
    operations: [],
    createdBy: 'admin',
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
    publishedAt: new Date('2024-01-20')
  }
];

// Seed data for Resource Instances
export const SEED_RESOURCE_INSTANCES: ResourceInstance[] = [
  {
    id: 'inst-1',
    typeId: 'equipment_inventory',
    typeName: 'Equipment Inventory',
    data: {
      equipment_name: 'MacBook Pro 16" M3',
      status: 'available',
      purchase_date: '2024-01-10',
      serial_number: 'MBP-2024-001'
    },
    createdBy: 'admin',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-01-16'),
    history: []
  },
  {
    id: 'inst-2',
    typeId: 'equipment_inventory',
    typeName: 'Equipment Inventory',
    data: {
      equipment_name: 'DSLR Camera Canon EOS R5',
      status: 'checked_out',
      purchase_date: '2023-12-05',
      serial_number: 'CAM-2023-045'
    },
    createdBy: 'admin',
    createdAt: new Date('2024-01-16'),
    updatedAt: new Date('2024-02-10'),
    history: [
      {
        id: 'log-1',
        operationId: 'op-checkout',
        operationName: 'Checkout Equipment',
        executedBy: 'john.doe',
        executedAt: new Date('2024-02-10'),
        parameters: {},
        result: 'success',
        changes: [
          {
            field: 'status',
            oldValue: 'available',
            newValue: 'checked_out'
          }
        ]
      }
    ]
  },
  {
    id: 'inst-3',
    typeId: 'team_members',
    typeName: 'Team Members',
    data: {
      full_name: 'Sarah Johnson',
      role: 'Senior Designer',
      availability: 'available'
    },
    createdBy: 'admin',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
    history: []
  },
  {
    id: 'inst-4',
    typeId: 'team_members',
    typeName: 'Team Members',
    data: {
      full_name: 'Michael Chen',
      role: 'Lead Developer',
      availability: 'busy'
    },
    createdBy: 'admin',
    createdAt: new Date('2024-01-21'),
    updatedAt: new Date('2024-01-21'),
    history: []
  }
];
