// Type Imports
import type { PermissionRowType } from '@/types/apps/permissionTypes'

export const db: PermissionRowType[] = [
  {
    id: 1,
    name: 'Management',
    assignedTo: 'administrator',
    createdDate: '14 Apr 2021, 8:43 PM',
    core: true
  },
  {
    id: 2,
    assignedTo: 'administrator',
    name: 'Manage Billing & Roles',
    createdDate: '16 Sep 2021, 5:20 PM',
    core: true
  },
  {
    id: 3,
    name: 'Add & Remove Users',
    createdDate: '14 Oct 2021, 10:20 AM',
    assignedTo: ['administrator', 'manager'],
    core: false
  },
  {
    id: 4,
    name: 'Project Planning',
    createdDate: '14 Oct 2021, 10:20 AM',
    assignedTo: ['administrator', 'users', 'support'],
    core: false
  },
  {
    id: 5,
    name: 'Manage Email Sequences',
    createdDate: '23 Aug 2021, 2:00 PM',
    assignedTo: ['administrator', 'users', 'support'],
    core: false
  },
  {
    id: 6,
    name: 'Client Communication',
    createdDate: '15 Apr 2021, 11:30 AM',
    assignedTo: ['administrator', 'manager'],
    core: false
  },
  {
    id: 7,
    name: 'Only View',
    createdDate: '04 Dec 2021, 8:15 PM',
    assignedTo: ['administrator', 'restricted-user'],
    core: false
  },
  {
    id: 8,
    name: 'Financial Management',
    createdDate: '25 Feb 2021, 10:30 AM',
    assignedTo: ['administrator', 'manager'],
    core: false
  },
  {
    id: 9,
    name: 'Manage Others’ Tasks',
    createdDate: '04 Nov 2021, 11:45 AM',
    assignedTo: ['administrator', 'support'],
    core: false
  }
]
