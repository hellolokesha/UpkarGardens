export type UserRole = 
  | 'SUPER_ADMIN' 
  | 'ASSOCIATION_ADMIN' 
  | 'TREASURER' 
  | 'SECRETARY' 
  | 'COMMITTEE_MEMBER' 
  | 'STAFF' 
  | 'OWNER';

export interface User {
  id: string;
  username: string;
  role: UserRole;
  owner_id?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
  owner?: Owner | null;
  property?: Property | null;
}

export interface Owner {
  id: string;
  owner_name: string;
  joint_owners?: string;
  primary_mobile: string;
  alt_mobile?: string;
  email?: string;
  correspondence_address?: string;
  ownership_type?: string;
  member_status?: string;
  created_at?: string;
  site_number?: string;
  house_number?: string;
  block_phase?: string;
  outstanding_balance?: number;
}

export interface Property {
  id: string;
  site_number: string;
  house_number?: string;
  block_phase?: string;
  property_type?: string;
  address?: string;
  status?: string;
  occupancy_status?: string;
  owner_id?: string;
  maintenance_category?: string;
  monthly_maintenance: number;
  outstanding_balance: number;
  remarks?: string;
  owner_name?: string;
  joint_owners?: string;
  primary_mobile?: string;
  alt_mobile?: string;
  owner_email?: string;
  arrears_from_date?: string;
  arrears_till_date?: string;
  arrears_months_count?: number;
  arrears_notes?: string;
}

export interface MaintenanceBill {
  id: string;
  bill_number: string;
  property_id: string;
  owner_id: string;
  billing_period: string;
  billing_date: string;
  due_date: string;
  previous_balance: number;
  current_charge: number;
  late_fee: number;
  other_charges: number;
  amount_paid: number;
  outstanding_amount: number;
  status: 'Paid' | 'Partially Paid' | 'Pending' | 'Overdue' | 'Waived' | 'Cancelled';
  description?: string;
  site_number?: string;
  house_number?: string;
  owner_name?: string;
  primary_mobile?: string;
}

export interface Payment {
  id: string;
  receipt_number: string;
  property_id: string;
  owner_id: string;
  bill_id?: string;
  amount: number;
  payment_date: string;
  payment_method: string;
  gateway_provider?: string;
  gateway_order_id?: string;
  gateway_payment_id?: string;
  gateway_status?: string;
  status: string;
  remarks?: string;
  site_number?: string;
  house_number?: string;
  owner_name?: string;
  primary_mobile?: string;
  billing_period?: string;
}

export interface LedgerEntry {
  id: string;
  property_id: string;
  owner_id: string;
  transaction_date: string;
  entry_type: 'DEBIT' | 'CREDIT' | 'TRANSFER';
  reference_type: string;
  reference_id?: string;
  description: string;
  debit: number;
  credit: number;
  running_balance: number;
}

export interface NocType {
  id: string;
  code: string;
  name: string;
  description: string;
  fee_amount: number;
  requires_payment: number;
  is_active: number;
  requirements?: NocRequirement[];
}

export interface NocRequirement {
  id: string;
  noc_type_id: string;
  document_name: string;
  is_mandatory: number;
  description?: string;
}

export interface NocApplication {
  id: string;
  application_number: string;
  property_id: string;
  owner_id: string;
  noc_type_id: string;
  purpose: string;
  description?: string;
  buyer_name?: string;
  bank_name?: string;
  status: 'Submitted' | 'Under Review' | 'Documents Required' | 'Payment Required' | 'Approved' | 'Rejected' | 'Cancelled' | 'Issued';
  admin_remarks?: string;
  applicant_phone?: string;
  applicant_email?: string;
  fee_paid?: number;
  created_at: string;
  noc_type_name?: string;
  noc_type_code?: string;
  fee_amount?: number;
  site_number?: string;
  house_number?: string;
  owner_name?: string;
  primary_mobile?: string;
  outstanding_balance?: number;
  issued_noc_number?: string;
  issue_date?: string;
  valid_until?: string;
  documents?: {
    id: string;
    document_name: string;
    file_url: string;
    original_filename?: string;
  }[];
}

export interface IssuedNoc {
  id: string;
  noc_number: string;
  application_id: string;
  property_id: string;
  owner_id: string;
  issue_date: string;
  valid_until?: string;
  noc_content_html: string;
  qr_code_data?: string;
  signatory_name: string;
  signatory_designation: string;
  status: string;
  site_number?: string;
  house_number?: string;
  owner_name?: string;
  noc_type?: string;
}

export interface Complaint {
  id: string;
  complaint_number: string;
  property_id: string;
  owner_id: string;
  category: string;
  subject: string;
  description: string;
  location?: string;
  status: 'Submitted' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed' | 'Rejected';
  priority: 'Normal' | 'Important' | 'Urgent';
  photo_url?: string;
  assigned_to_user_id?: string;
  admin_remarks?: string;
  resolution_date?: string;
  created_at: string;
  site_number?: string;
  house_number?: string;
  owner_name?: string;
  primary_mobile?: string;
}

export interface Notice {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: 'Normal' | 'Important' | 'Urgent';
  audience: string;
  attachment_url?: string;
  publish_date: string;
  expiry_date?: string;
  is_published: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  image_url?: string;
  category: string;
  publish_date: string;
}

export interface EventItem {
  id: string;
  event_name: string;
  event_date: string;
  event_time: string;
  venue: string;
  description: string;
  agenda?: string;
  attachment_url?: string;
}

export interface AssociationDocument {
  id: string;
  title: string;
  description?: string;
  file_url: string;
  file_type: string;
  file_size: string;
  category: string;
  visibility: 'Public' | 'Owners' | 'Committee' | 'Admin';
  upload_date?: string;
}

export interface CommitteeMember {
  id: string;
  name: string;
  designation: string;
  photo_url?: string;
  phone?: string;
  email?: string;
  term_start?: string;
  term_end?: string;
  display_order: number;
  show_contact_public: number;
  access_role?: UserRole | 'NO_ACCESS';
  user_id?: string;
  login_username?: string;
  portal_access_enabled?: number | boolean;
  access_permissions?: string[] | string;
  has_active_account?: boolean;
}

export interface RuleRegulation {
  id: string;
  category: string;
  title: string;
  content: string;
  display_order: number;
}

export interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  display_order: number;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  user_name: string;
  user_role: string;
  action: string;
  target_entity: string;
  target_id?: string;
  details?: string;
  ip_address?: string;
  created_at: string;
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  link?: string;
  is_read: number;
  type: string;
  created_at: string;
}

export interface AssociationSettings {
  association_name: string;
  registration_number: string;
  registration_date: string;
  total_sites_count: string;
  address: string;
  contact_phone: string;
  emergency_phone: string;
  contact_email: string;
  admin_name: string;
  admin_phone: string;
  admin_email: string;
  website_cms_updated_date: string;
  about_mission?: string;
  about_vision?: string;
  [key: string]: string | undefined;
}

export interface AssociationInfo {
  settings: AssociationSettings;
  stats: {
    totalSites: number;
    occupiedSites: number;
    totalOwners: number;
    layoutArea: string;
    establishedYear: string;
  };
}
