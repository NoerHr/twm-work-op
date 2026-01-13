/**
 * Batch Processing Task Generator
 * 
 * Generates realistic batch processing tasks for demo purposes.
 * Common use cases: Invoice processing, Order verification, Data entry, Quality checks
 */

import { TaskExecution, TaskFormField } from '../store/taskStore';

/**
 * Example 1: Invoice Batch Processing
 * Use case: Process 100 invoices that need approval
 */
export function createInvoiceBatchTask(): TaskExecution {
  return {
    id: 'batch-invoice-001',
    workflowId: 'wf-invoice-batch',
    workflowName: 'Invoice Batch Processing',
    assignedBy: {
      id: 'finance-manager-001',
      name: 'Diana Martinez',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana'
    },
    contributorId: 'current-user',
    status: 'pending',
    priority: 'high',
    scheduledDate: new Date(),
    dueDate: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
    projectId: 'proj-finance-2024',
    projectName: 'Finance Operations 2024',
    assignmentId: 'asg-invoice-processing',
    assignmentName: 'Monthly Invoice Processing',
    isBatch: true,
    batchTotal: 100,
    batchProcessed: 0,
    inputContext: {
      batchId: 'INV-BATCH-2024-001',
      period: 'January 2024',
      totalAmount: '$125,450.00',
      vendor: 'Multiple Vendors',
      department: 'Finance'
    },
    formData: {},
    formSchema: [
      {
        id: 'batch_items',
        type: 'batch',
        label: 'Invoice Batch Items',
        required: true,
        batchConfig: {
          columns: [
            { key: 'invoice_number', label: 'Invoice #', type: 'text' },
            { key: 'vendor', label: 'Vendor', type: 'text' },
            { key: 'amount', label: 'Amount', type: 'number' },
            { key: 'due_date', label: 'Due Date', type: 'date' },
            { key: 'status', label: 'Status', type: 'select' },
            { key: 'notes', label: 'Notes', type: 'text' }
          ],
          items: generateInvoiceItems(100),
          allowBulkActions: true
        }
      },
      {
        id: 'bulk_approval',
        type: 'select',
        label: 'Bulk Action',
        required: false,
        options: [
          { value: 'approve_all', label: 'Approve All Valid' },
          { value: 'reject_all', label: 'Reject All' },
          { value: 'flag_review', label: 'Flag for Review' }
        ]
      },
      {
        id: 'reviewer_notes',
        type: 'text',
        label: 'Batch Review Notes',
        required: false,
        placeholder: 'Add general notes about this batch...'
      }
    ],
    commentCount: 0
  };
}

/**
 * Example 2: Order Verification Batch
 * Use case: Verify 50 e-commerce orders before shipping
 */
export function createOrderVerificationBatchTask(): TaskExecution {
  return {
    id: 'batch-order-001',
    workflowId: 'wf-order-batch',
    workflowName: 'Order Verification Batch',
    assignedBy: {
      id: 'ops-manager-001',
      name: 'James Wilson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James'
    },
    contributorId: 'current-user',
    status: 'pending',
    priority: 'critical',
    scheduledDate: new Date(),
    dueDate: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
    projectId: 'proj-ecommerce-ops',
    projectName: 'E-Commerce Operations',
    assignmentId: 'asg-order-fulfillment',
    assignmentName: 'Order Fulfillment Process',
    isBatch: true,
    batchTotal: 50,
    batchProcessed: 0,
    inputContext: {
      batchId: 'ORD-BATCH-20240113',
      shipmentDate: new Date().toLocaleDateString(),
      warehouse: 'Warehouse A - Jakarta',
      carrier: 'Express Delivery Inc.',
      totalOrders: 50
    },
    formData: {},
    formSchema: [
      {
        id: 'batch_items',
        type: 'batch',
        label: 'Orders to Verify',
        required: true,
        batchConfig: {
          columns: [
            { key: 'order_id', label: 'Order ID', type: 'text' },
            { key: 'customer', label: 'Customer', type: 'text' },
            { key: 'items', label: 'Items', type: 'number' },
            { key: 'total', label: 'Total', type: 'text' },
            { key: 'address', label: 'Shipping Address', type: 'text' },
            { key: 'verification', label: 'Verify', type: 'select' }
          ],
          items: generateOrderItems(50),
          allowBulkActions: true
        }
      },
      {
        id: 'shipping_priority',
        type: 'select',
        label: 'Shipping Priority',
        required: true,
        options: [
          { value: 'same_day', label: 'Same Day Delivery' },
          { value: 'express', label: 'Express (1-2 days)' },
          { value: 'standard', label: 'Standard (3-5 days)' }
        ]
      }
    ],
    commentCount: 2
  };
}

/**
 * Example 3: Product Quality Check Batch
 * Use case: QC inspection for 200 manufactured items
 */
export function createQualityCheckBatchTask(): TaskExecution {
  return {
    id: 'batch-qc-001',
    workflowId: 'wf-qc-batch',
    workflowName: 'Quality Control Batch Inspection',
    assignedBy: {
      id: 'qc-supervisor-001',
      name: 'Linda Chen',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Linda'
    },
    contributorId: 'current-user',
    status: 'pending',
    priority: 'high',
    scheduledDate: new Date(),
    dueDate: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours
    projectId: 'proj-manufacturing',
    projectName: 'Manufacturing Quality Assurance',
    assignmentId: 'asg-qc-inspection',
    assignmentName: 'Daily QC Inspection',
    isBatch: true,
    batchTotal: 200,
    batchProcessed: 0,
    inputContext: {
      batchId: 'QC-BATCH-2024-W02',
      productLine: 'Widget Series X',
      inspectionDate: new Date().toLocaleDateString(),
      shift: 'Morning Shift',
      expectedDefectRate: '< 2%'
    },
    formData: {},
    formSchema: [
      {
        id: 'batch_items',
        type: 'batch',
        label: 'Items for Inspection',
        required: true,
        batchConfig: {
          columns: [
            { key: 'serial_number', label: 'Serial #', type: 'text' },
            { key: 'product_code', label: 'Product Code', type: 'text' },
            { key: 'weight', label: 'Weight (g)', type: 'number' },
            { key: 'dimensions', label: 'Dimensions', type: 'text' },
            { key: 'qc_status', label: 'QC Result', type: 'select' },
            { key: 'defects', label: 'Defects Found', type: 'text' }
          ],
          items: generateQCItems(200),
          allowBulkActions: true
        }
      },
      {
        id: 'inspection_photo',
        type: 'camera',
        label: 'Batch Inspection Photo',
        required: false
      },
      {
        id: 'supervisor_signature',
        type: 'signature',
        label: 'Inspector Signature',
        required: true
      }
    ],
    commentCount: 1
  };
}

/**
 * Example 4: Data Entry Batch (Customer Records)
 * Use case: Import and validate 150 customer records
 */
export function createDataEntryBatchTask(): TaskExecution {
  return {
    id: 'batch-data-001',
    workflowId: 'wf-data-batch',
    workflowName: 'Customer Data Import Batch',
    assignedBy: {
      id: 'data-manager-001',
      name: 'Robert Kim',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert'
    },
    contributorId: 'current-user',
    status: 'pending',
    priority: 'normal',
    scheduledDate: new Date(),
    dueDate: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours
    projectId: 'proj-crm-migration',
    projectName: 'CRM System Migration',
    assignmentId: 'asg-data-import',
    assignmentName: 'Customer Database Import',
    isBatch: true,
    batchTotal: 150,
    batchProcessed: 0,
    inputContext: {
      batchId: 'DATA-IMP-2024-001',
      source: 'Legacy CRM Export',
      importDate: new Date().toLocaleDateString(),
      recordsTotal: 150,
      validationRequired: true
    },
    formData: {},
    formSchema: [
      {
        id: 'batch_items',
        type: 'batch',
        label: 'Customer Records',
        required: true,
        batchConfig: {
          columns: [
            { key: 'customer_id', label: 'Customer ID', type: 'text' },
            { key: 'company_name', label: 'Company Name', type: 'text' },
            { key: 'email', label: 'Email', type: 'text' },
            { key: 'phone', label: 'Phone', type: 'text' },
            { key: 'validation', label: 'Validation Status', type: 'select' },
            { key: 'issues', label: 'Issues Found', type: 'text' }
          ],
          items: generateCustomerRecords(150),
          allowBulkActions: true
        }
      },
      {
        id: 'validation_rule',
        type: 'select',
        label: 'Apply Validation Rule',
        required: true,
        options: [
          { value: 'strict', label: 'Strict - Reject Invalid' },
          { value: 'moderate', label: 'Moderate - Flag Issues' },
          { value: 'lenient', label: 'Lenient - Accept with Warnings' }
        ]
      }
    ],
    commentCount: 0
  };
}

/**
 * Example 5: Expense Report Batch Approval
 * Use case: Approve/reject 75 expense reports
 */
export function createExpenseBatchTask(): TaskExecution {
  return {
    id: 'batch-expense-001',
    workflowId: 'wf-expense-batch',
    workflowName: 'Expense Report Batch Approval',
    assignedBy: {
      id: 'finance-director-001',
      name: 'Patricia Lee',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia'
    },
    contributorId: 'current-user',
    status: 'pending',
    priority: 'high',
    scheduledDate: new Date(),
    dueDate: new Date(Date.now() + 3 * 60 * 60 * 1000), // 3 hours
    projectId: 'proj-finance-ops',
    projectName: 'Finance Operations',
    assignmentId: 'asg-expense-approval',
    assignmentName: 'Monthly Expense Processing',
    isBatch: true,
    batchTotal: 75,
    batchProcessed: 0,
    inputContext: {
      batchId: 'EXP-BATCH-JAN-2024',
      period: 'January 2024',
      totalClaimedAmount: '$45,230.00',
      departmentsCount: 8,
      approvalDeadline: new Date(Date.now() + 3 * 60 * 60 * 1000).toLocaleString()
    },
    formData: {},
    formSchema: [
      {
        id: 'batch_items',
        type: 'batch',
        label: 'Expense Reports',
        required: true,
        batchConfig: {
          columns: [
            { key: 'report_id', label: 'Report ID', type: 'text' },
            { key: 'employee', label: 'Employee', type: 'text' },
            { key: 'department', label: 'Department', type: 'text' },
            { key: 'amount', label: 'Amount', type: 'text' },
            { key: 'category', label: 'Category', type: 'text' },
            { key: 'decision', label: 'Decision', type: 'select' }
          ],
          items: generateExpenseReports(75),
          allowBulkActions: true
        }
      },
      {
        id: 'approval_notes',
        type: 'text',
        label: 'Batch Approval Notes',
        required: false,
        placeholder: 'Add notes for this batch approval...'
      }
    ],
    commentCount: 5
  };
}

// ============================================
// HELPER FUNCTIONS - Generate Mock Data
// ============================================

function generateInvoiceItems(count: number): any[] {
  const vendors = ['Acme Corp', 'TechSupply Inc', 'Office Depot', 'Global Parts Ltd', 'Metro Services'];
  const items: any[] = [];
  
  for (let i = 1; i <= count; i++) {
    const amount = (Math.random() * 5000 + 100).toFixed(2);
    const daysUntilDue = Math.floor(Math.random() * 30) + 1;
    const dueDate = new Date(Date.now() + daysUntilDue * 24 * 60 * 60 * 1000);
    
    items.push({
      invoice_number: `INV-2024-${String(i).padStart(4, '0')}`,
      vendor: vendors[Math.floor(Math.random() * vendors.length)],
      amount: `$${amount}`,
      due_date: dueDate.toLocaleDateString(),
      status: 'pending',
      notes: ''
    });
  }
  
  return items;
}

function generateOrderItems(count: number): any[] {
  const customers = ['John Doe', 'Jane Smith', 'Bob Johnson', 'Alice Williams', 'Charlie Brown'];
  const cities = ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Semarang'];
  const items: any[] = [];
  
  for (let i = 1; i <= count; i++) {
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const total = (Math.random() * 500 + 50).toFixed(2);
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const city = cities[Math.floor(Math.random() * cities.length)];
    
    items.push({
      order_id: `#ORD-${String(i).padStart(5, '0')}`,
      customer: customer,
      items: itemCount,
      total: `Rp ${(parseFloat(total) * 15000).toLocaleString('id-ID')}`,
      address: `${city}, Indonesia`,
      verification: 'pending'
    });
  }
  
  return items;
}

function generateQCItems(count: number): any[] {
  const productCodes = ['WGT-X100', 'WGT-X200', 'WGT-X300', 'WGT-X400'];
  const items: any[] = [];
  
  for (let i = 1; i <= count; i++) {
    const weight = (Math.random() * 50 + 450).toFixed(1); // 450-500g
    const width = (Math.random() * 2 + 98).toFixed(1); // 98-100mm
    const height = (Math.random() * 2 + 48).toFixed(1); // 48-50mm
    
    items.push({
      serial_number: `SN-2024-${String(i).padStart(6, '0')}`,
      product_code: productCodes[Math.floor(Math.random() * productCodes.length)],
      weight: weight,
      dimensions: `${width}×${height}×20mm`,
      qc_status: 'pending',
      defects: ''
    });
  }
  
  return items;
}

function generateCustomerRecords(count: number): any[] {
  const companies = ['Tech Solutions', 'Digital Agency', 'Marketing Pro', 'Sales Force', 'Cloud Systems'];
  const domains = ['techsol', 'digitalag', 'mktpro', 'salesf', 'cloudsys'];
  const items: any[] = [];
  
  for (let i = 1; i <= count; i++) {
    const companyIndex = Math.floor(Math.random() * companies.length);
    const company = `${companies[companyIndex]} ${i}`;
    const domain = domains[companyIndex];
    
    items.push({
      customer_id: `CUST-${String(i).padStart(5, '0')}`,
      company_name: company,
      email: `contact@${domain}${i}.com`,
      phone: `+62 ${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      validation: 'pending',
      issues: ''
    });
  }
  
  return items;
}

function generateExpenseReports(count: number): any[] {
  const employees = ['Sarah Johnson', 'Mike Chen', 'Alex Rivera', 'Diana Martinez', 'Robert Kim'];
  const departments = ['Sales', 'Marketing', 'Engineering', 'Finance', 'Operations', 'HR', 'IT', 'Support'];
  const categories = ['Travel', 'Meals', 'Office Supplies', 'Software', 'Training', 'Client Entertainment'];
  const items: any[] = [];
  
  for (let i = 1; i <= count; i++) {
    const amount = (Math.random() * 800 + 50).toFixed(2);
    const employee = employees[Math.floor(Math.random() * employees.length)];
    const department = departments[Math.floor(Math.random() * departments.length)];
    const category = categories[Math.floor(Math.random() * categories.length)];
    
    items.push({
      report_id: `EXP-${String(i).padStart(4, '0')}`,
      employee: employee,
      department: department,
      amount: `$${amount}`,
      category: category,
      decision: 'pending'
    });
  }
  
  return items;
}

// ============================================
// BATCH TASK COLLECTION
// ============================================

/**
 * Get all batch processing tasks for demo
 */
export function getAllBatchTasks(): TaskExecution[] {
  return [
    createInvoiceBatchTask(),
    createOrderVerificationBatchTask(),
    createQualityCheckBatchTask(),
    createDataEntryBatchTask(),
    createExpenseBatchTask()
  ];
}

/**
 * Get a random batch task (useful for demos)
 */
export function getRandomBatchTask(): TaskExecution {
  const tasks = getAllBatchTasks();
  return tasks[Math.floor(Math.random() * tasks.length)];
}
