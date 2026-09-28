import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_DIR = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = path.join(DB_DIR, 'upkar_association.db');
export const db = new Database(DB_PATH);

// Enable WAL mode & foreign keys for performance and data integrity
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL,
      owner_id TEXT,
      email TEXT,
      phone TEXT,
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS owners (
      id TEXT PRIMARY KEY,
      owner_name TEXT NOT NULL,
      joint_owners TEXT,
      primary_mobile TEXT NOT NULL,
      alt_mobile TEXT,
      email TEXT,
      correspondence_address TEXT,
      ownership_type TEXT DEFAULT 'Individual',
      member_status TEXT DEFAULT 'Active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS properties (
      id TEXT PRIMARY KEY,
      site_number TEXT UNIQUE NOT NULL,
      house_number TEXT,
      block_phase TEXT DEFAULT 'Phase 1',
      property_type TEXT DEFAULT 'Plot / Site',
      address TEXT,
      status TEXT DEFAULT 'Vacant',
      occupancy_status TEXT DEFAULT 'Self',
      owner_id TEXT REFERENCES owners(id) ON DELETE SET NULL,
      maintenance_category TEXT DEFAULT 'Residential Plot',
      monthly_maintenance REAL DEFAULT 1500,
      outstanding_balance REAL DEFAULT 0,
      remarks TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS maintenance_categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      monthly_amount REAL NOT NULL,
      quarterly_amount REAL NOT NULL,
      annual_amount REAL NOT NULL,
      late_fee_percent REAL DEFAULT 2.0,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS maintenance_bills (
      id TEXT PRIMARY KEY,
      bill_number TEXT UNIQUE NOT NULL,
      property_id TEXT NOT NULL REFERENCES properties(id),
      owner_id TEXT REFERENCES owners(id),
      billing_period TEXT NOT NULL,
      billing_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      previous_balance REAL DEFAULT 0,
      current_charge REAL NOT NULL,
      late_fee REAL DEFAULT 0,
      other_charges REAL DEFAULT 0,
      amount_paid REAL DEFAULT 0,
      outstanding_amount REAL NOT NULL,
      status TEXT DEFAULT 'Pending',
      description TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS payments (
      id TEXT PRIMARY KEY,
      receipt_number TEXT UNIQUE NOT NULL,
      property_id TEXT NOT NULL REFERENCES properties(id),
      owner_id TEXT REFERENCES owners(id),
      bill_id TEXT REFERENCES maintenance_bills(id),
      amount REAL NOT NULL,
      payment_date TEXT NOT NULL,
      payment_method TEXT NOT NULL,
      gateway_provider TEXT DEFAULT 'Razorpay',
      gateway_order_id TEXT,
      gateway_payment_id TEXT,
      gateway_status TEXT DEFAULT 'Captured',
      status TEXT DEFAULT 'Successful',
      remarks TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS ledger_entries (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL REFERENCES properties(id),
      owner_id TEXT REFERENCES owners(id),
      transaction_date TEXT NOT NULL,
      entry_type TEXT NOT NULL,
      reference_type TEXT NOT NULL,
      reference_id TEXT,
      description TEXT NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      running_balance REAL NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS special_charges (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      amount REAL NOT NULL,
      target_type TEXT DEFAULT 'ALL',
      target_value TEXT,
      due_date TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS adjustments (
      id TEXT PRIMARY KEY,
      property_id TEXT NOT NULL REFERENCES properties(id),
      owner_id TEXT REFERENCES owners(id),
      adjustment_type TEXT NOT NULL,
      amount REAL NOT NULL,
      reason TEXT NOT NULL,
      authorized_by TEXT NOT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS refunds (
      id TEXT PRIMARY KEY,
      payment_id TEXT REFERENCES payments(id),
      property_id TEXT NOT NULL REFERENCES properties(id),
      owner_id TEXT REFERENCES owners(id),
      amount REAL NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'Refunded',
      reference_number TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS noc_types (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL,
      name TEXT NOT NULL,
      description TEXT,
      fee_amount REAL DEFAULT 0,
      requires_payment INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS noc_requirements (
      id TEXT PRIMARY KEY,
      noc_type_id TEXT NOT NULL REFERENCES noc_types(id),
      document_name TEXT NOT NULL,
      is_mandatory INTEGER DEFAULT 1,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS noc_applications (
      id TEXT PRIMARY KEY,
      application_number TEXT UNIQUE NOT NULL,
      property_id TEXT NOT NULL REFERENCES properties(id),
      owner_id TEXT REFERENCES owners(id),
      noc_type_id TEXT NOT NULL REFERENCES noc_types(id),
      purpose TEXT NOT NULL,
      description TEXT,
      buyer_name TEXT,
      bank_name TEXT,
      status TEXT DEFAULT 'Submitted',
      admin_remarks TEXT,
      applicant_phone TEXT,
      applicant_email TEXT,
      fee_paid REAL DEFAULT 0,
      fee_receipt_id TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS noc_documents (
      id TEXT PRIMARY KEY,
      application_id TEXT NOT NULL REFERENCES noc_applications(id) ON DELETE CASCADE,
      document_name TEXT NOT NULL,
      file_url TEXT NOT NULL,
      original_filename TEXT,
      uploaded_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS issued_nocs (
      id TEXT PRIMARY KEY,
      noc_number TEXT UNIQUE NOT NULL,
      application_id TEXT NOT NULL REFERENCES noc_applications(id),
      property_id TEXT NOT NULL REFERENCES properties(id),
      owner_id TEXT REFERENCES owners(id),
      issue_date TEXT NOT NULL,
      valid_until TEXT,
      noc_content_html TEXT NOT NULL,
      qr_code_data TEXT,
      signatory_name TEXT NOT NULL,
      signatory_designation TEXT NOT NULL,
      status TEXT DEFAULT 'Active',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS complaints (
      id TEXT PRIMARY KEY,
      complaint_number TEXT UNIQUE NOT NULL,
      property_id TEXT NOT NULL REFERENCES properties(id),
      owner_id TEXT REFERENCES owners(id),
      category TEXT NOT NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      location TEXT,
      status TEXT DEFAULT 'Submitted',
      priority TEXT DEFAULT 'Normal',
      photo_url TEXT,
      assigned_to_user_id TEXT REFERENCES users(id),
      admin_remarks TEXT,
      resolution_date TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS notices (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      category TEXT DEFAULT 'General',
      priority TEXT DEFAULT 'Normal',
      audience TEXT DEFAULT 'Public',
      attachment_url TEXT,
      publish_date TEXT NOT NULL,
      expiry_date TEXT,
      is_published INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      image_url TEXT,
      category TEXT DEFAULT 'General',
      publish_date TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      event_name TEXT NOT NULL,
      event_date TEXT NOT NULL,
      event_time TEXT NOT NULL,
      venue TEXT NOT NULL,
      description TEXT,
      agenda TEXT,
      attachment_url TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS association_documents (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT,
      file_url TEXT NOT NULL,
      file_type TEXT DEFAULT 'PDF',
      file_size TEXT DEFAULT '1.2 MB',
      category TEXT DEFAULT 'Association Documents',
      visibility TEXT DEFAULT 'Public',
      upload_date TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS committee_members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      designation TEXT NOT NULL,
      photo_url TEXT,
      phone TEXT,
      email TEXT,
      term_start TEXT,
      term_end TEXT,
      display_order INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      show_contact_public INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS rules_and_regulations (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      display_order INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS faqs (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      display_order INTEGER DEFAULT 1,
      is_published INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      owner_id TEXT,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      link TEXT,
      is_read INTEGER DEFAULT 0,
      type TEXT DEFAULT 'info',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      user_name TEXT NOT NULL,
      user_role TEXT NOT NULL,
      action TEXT NOT NULL,
      target_entity TEXT NOT NULL,
      target_id TEXT,
      details TEXT,
      ip_address TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_properties_site ON properties(site_number);
    CREATE INDEX IF NOT EXISTS idx_bills_property ON maintenance_bills(property_id);
    CREATE INDEX IF NOT EXISTS idx_ledger_property ON ledger_entries(property_id);
    CREATE INDEX IF NOT EXISTS idx_payments_property ON payments(property_id);
    CREATE INDEX IF NOT EXISTS idx_noc_app_num ON noc_applications(application_number);
    CREATE INDEX IF NOT EXISTS idx_issued_noc_num ON issued_nocs(noc_number);
  `);

  seedInitialData();
}

function seedInitialData() {
  const countRow = db.prepare('SELECT COUNT(*) as count FROM settings').get() as { count: number };
  if (countRow && countRow.count > 0) {
    return; // Already seeded
  }

  const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)');
  
  insertSetting.run('association_name', 'Upkar Gardens Owners Association (R)', 'Official Association Name');
  insertSetting.run('registration_number', 'DRO-1/SOR/142/2018-19', 'Government Registration Number');
  insertSetting.run('registration_date', '2018-10-12', 'Date of Association Registration');
  insertSetting.run('address', 'Clubhouse & Association Office, Upkar Gardens Layout, Chandapura-Anekal Main Road, Bangalore - 560099, Karnataka', 'Official Registered Address');
  insertSetting.run('contact_phone', '+91 80 2783 4567', 'Official Contact Phone');
  insertSetting.run('contact_email', 'contact@upkargardens.org', 'Official Contact Email');
  insertSetting.run('emergency_phone', '+91 94801 23456', '24x7 Security & Emergency Desk');
  insertSetting.run('total_sites_count', '350', 'Total Layout Sites');
  insertSetting.run('financial_year', '2026-27', 'Active Financial Year');
  insertSetting.run('currency_symbol', '₹', 'Currency Symbol');
  insertSetting.run('receipt_prefix', 'UGOA/REC/2026-27/', 'Prefix for maintenance receipts');
  insertSetting.run('noc_prefix', 'UGOA/NOC/2026/', 'Prefix for issued NOCs');
  insertSetting.run('allow_partial_payments', 'true', 'Whether owners can make partial maintenance payments');
  insertSetting.run('noc_require_zero_dues', 'true', 'Require zero outstanding maintenance dues for NOC submission');
  insertSetting.run('payment_gateway_provider', 'Razorpay', 'Default online payment gateway provider');
  insertSetting.run('payment_gateway_env', 'Test', 'Payment Gateway Environment (Test/Live)');
  insertSetting.run('payment_gateway_key_id', 'rzp_test_upkar_2026', 'Gateway Key ID');
  insertSetting.run('sms_notifications_enabled', 'true', 'SMS Notifications status');
  insertSetting.run('whatsapp_notifications_enabled', 'true', 'WhatsApp Alerts status');
  insertSetting.run('email_notifications_enabled', 'true', 'Email Dispatch status');
  insertSetting.run('otp_auth_enabled', 'true', 'Allow Owner Login via Mobile OTP');
  insertSetting.run('about_mission', 'To foster a secure, clean, self-sustaining, vibrant residential community with transparent governance, dependable infrastructure, and equitable association services for every property owner.', 'Association Mission');
  insertSetting.run('about_vision', 'To establish Upkar Gardens as one of Bangalore South’s model eco-friendly, green, and technologically connected residential layouts.', 'Association Vision');

  // Insert Maintenance Categories
  const insertCat = db.prepare('INSERT INTO maintenance_categories (id, name, monthly_amount, quarterly_amount, annual_amount, late_fee_percent, description) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertCat.run('cat_villa', 'Constructed House / Villa', 2500, 7500, 30000, 2.0, 'Occupied or constructed independent house');
  insertCat.run('cat_plot_res', 'Residential Plot (Vacant)', 1500, 4500, 18000, 2.0, 'Vacant residential layout plot');
  insertCat.run('cat_commercial', 'Commercial / Corner Plot', 3000, 9000, 36000, 2.5, 'Commercial or corner premium location');

  // Insert Users (Super Admin, Association Admin, Treasurer, Secretary, Staff)
  const insertUser = db.prepare('INSERT INTO users (id, username, password_hash, role, email, phone, name) VALUES (?, ?, ?, ?, ?, ?, ?)');
  insertUser.run('u_admin', 'admin', 'admin123', 'SUPER_ADMIN', 'president@upkargardens.org', '9845012345', 'Sri. K. Venkatesh (President)');
  insertUser.run('u_treasurer', 'treasurer', 'treasurer123', 'TREASURER', 'treasurer@upkargardens.org', '9845023456', 'Sri. R. Narayanappa (Treasurer)');
  insertUser.run('u_secretary', 'secretary', 'secretary123', 'SECRETARY', 'secretary@upkargardens.org', '9845034567', 'Smt. Anitha Suresh (Secretary)');
  insertUser.run('u_staff', 'staff', 'staff123', 'STAFF', 'office@upkargardens.org', '9845045678', 'M. Ramesh (Layout Supervisor)');

  // Seed NOC Types
  const insertNocType = db.prepare('INSERT INTO noc_types (id, code, name, description, fee_amount, requires_payment) VALUES (?, ?, ?, ?, ?, ?)');
  insertNocType.run('noc_sale', 'NOC_SALE', 'Property Sale / Transfer NOC', 'Mandatory for registration of sale deed / title transfer to buyer', 2500, 1);
  insertNocType.run('noc_const', 'NOC_CONST', 'Building Construction NOC', 'Required prior to commencement of house construction in layout', 5000, 1);
  insertNocType.run('noc_loan', 'NOC_LOAN', 'Bank Loan / Mortgage NOC', 'Provided to nationalized/private banks for home loan sanction', 1000, 1);
  insertNocType.run('noc_reno', 'NOC_RENO', 'Renovation / Modification NOC', 'For structural modifications, compound wall, or major landscaping', 1500, 1);
  insertNocType.run('noc_other', 'NOC_OTHER', 'General Association Clearance NOC', 'For BESCOM / BWSSB / Khata transfer or official utility clearances', 500, 0);

  // Seed NOC Requirements
  const insertReq = db.prepare('INSERT INTO noc_requirements (id, noc_type_id, document_name, is_mandatory, description) VALUES (?, ?, ?, ?, ?)');
  insertReq.run('req_1', 'noc_sale', 'Sale Agreement or Draft Sale Deed', 1, 'Draft agreement containing prospective buyer details');
  insertReq.run('req_2', 'noc_sale', 'Latest Property Tax Paid Receipt', 1, 'Gram Panchayat / BBMP Tax receipt for current financial year');
  insertReq.run('req_3', 'noc_sale', 'Owner Aadhaar & PAN Card Copy', 1, 'Government identity proof of all registered owners');
  insertReq.run('req_4', 'noc_sale', 'Up-to-date Association Maintenance Clearance', 1, 'Zero dues verified in system');

  insertReq.run('req_5', 'noc_const', 'Approved Sanctioned Building Plan', 1, 'Plan approved by planning authority/Panchayat');
  insertReq.run('req_6', 'noc_const', 'Layout Setback & Drainage Undertaking', 1, 'Signed undertaking to adhere to layout bylaws');
  insertReq.run('req_7', 'noc_const', 'Debris & Road Protection Deposit Receipt', 1, 'Refundable deposit payment receipt');

  insertReq.run('req_8', 'noc_loan', 'Bank Loan Sanction / Application Letter', 1, 'Official loan letter with property schedule');
  insertReq.run('req_9', 'noc_loan', 'Latest E-Khata / Title Document Copy', 1, 'Copy of current title deed/Khata');

  // Committee Members
  const insertMember = db.prepare(`
    INSERT INTO committee_members (id, name, designation, photo_url, phone, email, term_start, term_end, display_order, show_contact_public)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertMember.run('cm_1', 'Sri. K. Venkatesh', 'President', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80', '+91 98450 12345', 'president@upkargardens.org', '2024-10-01', '2026-09-30', 1, 1);
  insertMember.run('cm_2', 'Sri. B. Muralidhar', 'Vice President', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&q=80', '+91 98450 22345', 'vp@upkargardens.org', '2024-10-01', '2026-09-30', 2, 1);
  insertMember.run('cm_3', 'Smt. Anitha Suresh', 'General Secretary', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&fit=crop&q=80', '+91 98450 34567', 'secretary@upkargardens.org', '2024-10-01', '2026-09-30', 3, 1);
  insertMember.run('cm_4', 'Sri. R. Narayanappa', 'Treasurer', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&fit=crop&q=80', '+91 98450 23456', 'treasurer@upkargardens.org', '2024-10-01', '2026-09-30', 4, 1);
  insertMember.run('cm_5', 'Sri. Praveen Kumar', 'Joint Secretary', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&fit=crop&q=80', '+91 98450 55432', 'jointsec@upkargardens.org', '2024-10-01', '2026-09-30', 5, 1);
  insertMember.run('cm_6', 'Dr. Radhakrishna Rao', 'Executive Member (Security & Water)', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&fit=crop&q=80', '+91 98450 66543', 'water@upkargardens.org', '2024-10-01', '2026-09-30', 6, 1);

  // Seed Owners & Properties
  const insertOwner = db.prepare(`
    INSERT INTO owners (id, owner_name, joint_owners, primary_mobile, alt_mobile, email, correspondence_address, ownership_type, member_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertProp = db.prepare(`
    INSERT INTO properties (id, site_number, house_number, block_phase, property_type, address, status, occupancy_status, owner_id, maintenance_category, monthly_maintenance, outstanding_balance, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Owner 1: Site 125 (Demo Primary Owner for login testing)
  insertOwner.run('own_125', 'Lokesha M.', 'Sowmya L.', '9876543210', '9876543211', 'hello.lokesha@gmail.com', 'Site 125, Upkar Gardens Phase 1, Bangalore', 'Individual', 'Active');
  insertProp.run('prop_125', '125', 'UG-45', 'Phase 1 - A Block', 'Constructed Villa', 'Plot No. 125, 2nd Main, Upkar Gardens', 'Occupied', 'Self', 'own_125', 'cat_villa', 2500, 4500, 'Resident since 2021');

  // Also create a linked user login for Owner 125
  insertUser.run('u_own_125', 'owner125', 'owner123', 'OWNER', 'hello.lokesha@gmail.com', '9876543210', 'Lokesha M.');
  db.prepare('UPDATE users SET owner_id = ? WHERE id = ?').run('own_125', 'u_own_125');

  // Owner 2: Site 42
  insertOwner.run('own_42', 'Sunil Kumar Hegde', 'Rekha Hegde', '9845112233', '9845112234', 'sunil.hegde@example.com', 'Site 42, 1st Cross, Upkar Gardens', 'Joint', 'Active');
  insertProp.run('prop_42', '42', 'UG-12', 'Phase 1 - A Block', 'Constructed House', 'Plot No. 42, 1st Cross, Upkar Gardens', 'Occupied', 'Tenant', 'own_42', 'cat_villa', 2500, 0, 'Maintenance paid up to date');

  // Owner 3: Site 108
  insertOwner.run('own_108', 'Dr. Manjunatha Reddy', '', '9880123456', '', 'dr.reddy@example.com', '#34, 5th Block, Jayanagar, Bangalore', 'Individual', 'Active');
  insertProp.run('prop_108', '108', '', 'Phase 2 - B Block', 'Residential Plot', 'Plot No. 108, 4th Cross, Upkar Gardens', 'Vacant', 'None', 'own_108', 'cat_plot_res', 1500, 6000, 'Pending for 4 quarters');

  // Owner 4: Site 15
  insertOwner.run('own_15', 'C. H. Chandrashekar', 'Gayathri C.', '9900234567', '', 'chandra.shekar@example.com', 'Site 15, 3rd Main, Upkar Gardens', 'Individual', 'Active');
  insertProp.run('prop_15', '15', 'UG-05', 'Phase 1 - A Block', 'Constructed House', 'Plot No. 15, 3rd Main, Upkar Gardens', 'Occupied', 'Self', 'own_15', 'cat_villa', 2500, 2500, 'Current month pending');

  // Owner 5: Site 210
  insertOwner.run('own_210', 'K. V. Subrahmanya', '', '9741098765', '', 'subramanya.kv@example.com', 'Site 210, 6th Cross, Upkar Gardens', 'Individual', 'Active');
  insertProp.run('prop_210', '210', '', 'Phase 2 - C Block', 'Residential Plot', 'Plot No. 210, 6th Cross, Upkar Gardens', 'Vacant', 'None', 'own_210', 'cat_plot_res', 1500, 0, 'Advance paid ₹3,000');

  // Owner 6: Site 88
  insertOwner.run('own_88', 'Rajeshwari Sharma', 'Rohit Sharma', '9448123789', '', 'rajeshwari.s@example.com', 'Site 88, 2nd Cross, Upkar Gardens', 'Joint', 'Active');
  insertProp.run('prop_88', '88', 'UG-28', 'Phase 1 - B Block', 'Constructed House', 'Plot No. 88, 2nd Cross, Upkar Gardens', 'Under Construction', 'None', 'own_88', 'cat_villa', 2500, 7500, 'Construction ongoing');

  // Seed Bills & Ledger for Site 125
  const insertBill = db.prepare(`
    INSERT INTO maintenance_bills (id, bill_number, property_id, owner_id, billing_period, billing_date, due_date, previous_balance, current_charge, late_fee, other_charges, amount_paid, outstanding_amount, status, description)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertLedger = db.prepare(`
    INSERT INTO ledger_entries (id, property_id, owner_id, transaction_date, entry_type, reference_type, reference_id, description, debit, credit, running_balance)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  const insertPayment = db.prepare(`
    INSERT INTO payments (id, receipt_number, property_id, owner_id, bill_id, amount, payment_date, payment_method, gateway_provider, gateway_order_id, gateway_payment_id, gateway_status, status, remarks)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  // Bill 1 for Site 125 (Paid previously)
  insertBill.run('bill_125_1', 'UGOA/BILL/2026/04/001', 'prop_125', 'own_125', 'April 2026', '2026-04-01', '2026-04-15', 0, 2500, 0, 0, 2500, 0, 'Paid', 'Regular monthly maintenance for April 2026');
  insertLedger.run('led_1', 'prop_125', 'own_125', '2026-04-01', 'DEBIT', 'BILL', 'bill_125_1', 'Monthly Maintenance - April 2026', 2500, 0, 2500);
  insertPayment.run('pay_1', 'UGOA/REC/2026-27/00101', 'prop_125', 'own_125', 'bill_125_1', 2500, '2026-04-10', 'UPI', 'Razorpay', 'order_demo_101', 'pay_demo_101', 'Captured', 'Successful', 'Maintenance paid on time via UPI');
  insertLedger.run('led_2', 'prop_125', 'own_125', '2026-04-10', 'CREDIT', 'PAYMENT', 'pay_1', 'Payment via UPI (Receipt #UGOA/REC/2026-27/00101)', 0, 2500, 0);

  // Bill 2 for Site 125 (May 2026 - Overdue partial)
  insertBill.run('bill_125_2', 'UGOA/BILL/2026/05/001', 'prop_125', 'own_125', 'May 2026', '2026-05-01', '2026-05-15', 0, 2500, 100, 0, 600, 2000, 'Partially Paid', 'Regular monthly maintenance for May 2026');
  insertLedger.run('led_3', 'prop_125', 'own_125', '2026-05-01', 'DEBIT', 'BILL', 'bill_125_2', 'Monthly Maintenance - May 2026', 2500, 0, 2500);
  insertLedger.run('led_4', 'prop_125', 'own_125', '2026-05-16', 'DEBIT', 'LATE_FEE', 'bill_125_2', 'Late Fee for delayed payment - May 2026', 100, 0, 2600);
  insertPayment.run('pay_2', 'UGOA/REC/2026-27/00188', 'prop_125', 'own_125', 'bill_125_2', 600, '2026-05-20', 'UPI', 'Razorpay', 'order_demo_188', 'pay_demo_188', 'Captured', 'Successful', 'Part payment made via UPI');
  insertLedger.run('led_5', 'prop_125', 'own_125', '2026-05-20', 'CREDIT', 'PAYMENT', 'pay_2', 'Partial Payment via UPI (Receipt #UGOA/REC/2026-27/00188)', 0, 600, 2000);

  // Bill 3 for Site 125 (Current Month: September 2026 - Current due ₹2,500, Total Pending = 2000 + 2500 = ₹4,500 as in master prompt example!)
  insertBill.run('bill_125_3', 'UGOA/BILL/2026/09/001', 'prop_125', 'own_125', 'September 2026', '2026-09-01', '2026-10-10', 2000, 2500, 0, 0, 0, 2500, 'Pending', 'Regular monthly maintenance for September 2026');
  insertLedger.run('led_6', 'prop_125', 'own_125', '2026-09-01', 'DEBIT', 'BILL', 'bill_125_3', 'Monthly Maintenance - September 2026', 2500, 0, 4500);

  // Seed sample NOC Application for Site 125
  const insertNocApp = db.prepare(`
    INSERT INTO noc_applications (id, application_number, property_id, owner_id, noc_type_id, purpose, description, buyer_name, bank_name, status, admin_remarks, applicant_phone, applicant_email, fee_paid, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertNocApp.run(
    'app_1001',
    'UGOA/APP/2026/001',
    'prop_125',
    'own_125',
    'noc_loan',
    'Home Improvement Loan Sanction',
    'Application submitted to State Bank of India for solar rooftop and renovation loan',
    '',
    'State Bank of India, Chandapura Branch',
    'Under Review',
    'Documents received; pending maintenance dues clearance verification before final committee signoff.',
    '9876543210',
    'hello.lokesha@gmail.com',
    1000,
    '2026-09-20 11:30:00'
  );

  // Seed an already Issued NOC for Site 42 (so verification page `/verify-noc` has real verifiable data!)
  insertNocApp.run(
    'app_1000',
    'UGOA/APP/2026/000',
    'prop_42',
    'own_42',
    'noc_loan',
    'Housing Loan Mortgage',
    'Loan from HDFC Bank for property development',
    '',
    'HDFC Bank Ltd, Electronic City Branch',
    'Approved',
    'All documents verified and dues cleared.',
    '9845112233',
    'sunil.hegde@example.com',
    1000,
    '2026-08-15 09:15:00'
  );

  const insertIssuedNoc = db.prepare(`
    INSERT INTO issued_nocs (id, noc_number, application_id, property_id, owner_id, issue_date, valid_until, noc_content_html, qr_code_data, signatory_name, signatory_designation, status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertIssuedNoc.run(
    'is_42',
    'UGOA/NOC/2026/00042',
    'app_1000',
    'prop_42',
    'own_42',
    '2026-08-18',
    '2027-08-17',
    'This is to certify that Upkar Gardens Owners Association (R) has No Objection to Sri Sunil Kumar Hegde, owner of Site No. 42 (House UG-12), mortgaging the said property with HDFC Bank Ltd.',
    'https://ais-dev-zbmvjjieouhvd5bmnkit7j-900189815570.asia-east1.run.app/verify-noc?noc=UGOA/NOC/2026/00042',
    'Sri. K. Venkatesh',
    'President, UGOA (R)',
    'Active'
  );

  // Seed Complaints
  const insertComplaint = db.prepare(`
    INSERT INTO complaints (id, complaint_number, property_id, owner_id, category, subject, description, location, status, priority, admin_remarks, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertComplaint.run(
    'comp_1',
    'CMP-2026-089',
    'prop_125',
    'own_125',
    'Street Lights',
    'Street light #L-14 flickering and turning off at night',
    'The LED street pole light opposite Site 125 has been malfunctioning since yesterday evening.',
    'Opposite Site 125, 2nd Main',
    'In Progress',
    'Normal',
    'Electrician Mr. Kumar dispatched for ballast replacement.',
    '2026-09-25 18:45:00'
  );

  // Seed Notices
  const insertNotice = db.prepare(`
    INSERT INTO notices (id, title, description, category, priority, audience, publish_date, expiry_date, is_published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertNotice.run(
    'not_1',
    'Annual General Body Meeting (AGM) 2026 Notification',
    'Notice is hereby given that the 8th Annual General Body Meeting (AGM) of Upkar Gardens Owners Association (R) will be held on Sunday, October 18, 2026 at 10:00 AM at the Layout Community Hall. All property owners are requested to attend. Agenda copy is available in the Documents section.',
    'Meeting Notice',
    'Important',
    'All Owners',
    '2026-09-20',
    '2026-10-19',
    1
  );
  insertNotice.run(
    'not_2',
    'Borewell & Water Supply Pipeline Maintenance Schedule',
    'Quarterly flushing and preventive motor maintenance for Borewells 2 & 4 will be undertaken on Wednesday from 11:00 AM to 4:00 PM. Layout overhead tank will be filled beforehand. Residents are advised to store sufficient water.',
    'Water Notice',
    'Normal',
    'Public',
    '2026-09-24',
    '2026-10-01',
    1
  );
  insertNotice.run(
    'not_3',
    'Urgent: Clearance of Q2 Maintenance Dues Before Sep 30',
    'Owners with pending maintenance dues are cordially requested to clear their accounts online via the portal. Prompt payment helps the association maintain continuous 24/7 security, gardening, and street illumination services.',
    'Maintenance Notice',
    'Urgent',
    'All Owners',
    '2026-09-26',
    '2026-10-05',
    1
  );

  // Seed Announcements
  const insertAnnouncement = db.prepare(`
    INSERT INTO announcements (id, title, content, category, publish_date)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertAnnouncement.run(
    'ann_1',
    'New Automated RFID Boom Barrier Installed at Main Gate',
    'We are delighted to announce that new RFID tag reader barriers are now fully operational at the Chandapura main gate for enhanced community security. Registered residents can collect complimentary vehicle tags from the Association Office.',
    'Infrastructure',
    '2026-09-15'
  );
  insertAnnouncement.run(
    'ann_2',
    'Green Upkar Tree Plantation Drive this Saturday',
    'Join our voluntary committee and fellow residents for planting 100 indigenous saplings across 3rd and 4th cross avenues. Tea and refreshments will be served at the clubhouse at 8:30 AM.',
    'Community',
    '2026-09-22'
  );

  // Seed Events
  const insertEvent = db.prepare(`
    INSERT INTO events (id, event_name, event_date, event_time, venue, description, agenda)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insertEvent.run(
    'ev_1',
    'Annual General Body Meeting (AGM) 2026',
    '2026-10-18',
    '10:00 AM - 1:30 PM',
    'Upkar Gardens Layout Community Clubhouse',
    'Statutory annual general body meeting with election of committee members and presentation of audited accounts.',
    '1. Welcome Address by President\n2. Secretary Annual Activity Report\n3. Presentation & Approval of Audited Financial Statements\n4. Review of Layout Infrastructure & Security Upgrades\n5. Open Floor Resident Q&A\n6. Vote of Thanks followed by Community Lunch'
  );
  insertEvent.run(
    'ev_2',
    'Dussehra & Diwali Cultural Evening',
    '2026-10-24',
    '5:30 PM - 9:00 PM',
    'Central Park & Amphitheatre, Upkar Gardens',
    'Traditional music, children fancy dress, rangoli showcase, and community feast.',
    'Fun games, traditional lighting, cultural dance by layout children, community dinner.'
  );

  // Seed Association Documents
  const insertDoc = db.prepare(`
    INSERT INTO association_documents (id, title, description, file_url, file_type, file_size, category, visibility)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertDoc.run('doc_1', 'Association Bylaws & Registered Constitution', 'Official bylaws registered under Karnataka Societies Registration Act 1960', '/docs/bylaws.pdf', 'PDF', '2.4 MB', 'Rules & Regulations', 'Public');
  insertDoc.run('doc_2', 'Layout Master Plan & Sanction Map', 'Sanctioned layout plan with site demarcation, parks, and civic amenities', '/docs/layout-plan.pdf', 'PDF', '5.1 MB', 'Association Documents', 'Public');
  insertDoc.run('doc_3', 'Audited Financial Accounts FY 2025-26', 'Independent Chartered Accountant audit statement and balance sheet', '/docs/audit-fy25-26.pdf', 'PDF', '1.8 MB', 'Financial Documents', 'Owners');
  insertDoc.run('doc_4', 'House Construction Guidelines & Setback Rules', 'Official layout specifications for setbacks, compound wall, and rainwater harvesting', '/docs/construction-guidelines.pdf', 'PDF', '850 KB', 'Rules & Regulations', 'Public');
  insertDoc.run('doc_5', 'NOC Application Form (Physical / Offline)', 'Standard prescribed application form for offline submissions if needed', '/docs/noc-application-form.pdf', 'PDF', '320 KB', 'Forms', 'Public');

  // Seed Rules
  const insertRule = db.prepare(`
    INSERT INTO rules_and_regulations (id, category, title, content, display_order)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertRule.run('r_1', 'Security & Gate Entry', 'Speed Limits & Vehicle Entry', 'All vehicles inside the layout must observe a maximum speed limit of 20 km/h. Commercial heavy vehicles are prohibited between 9:00 PM and 7:00 AM.', 1);
  insertRule.run('r_2', 'Construction Bylaws', 'Dumping of Debris & Road Encroachment', 'Construction materials must be unloaded strictly within the allocated plot boundary. Mixing concrete on asphalt roads is strictly forbidden and subject to fine.', 2);
  insertRule.run('r_3', 'Garbage & Cleanliness', 'Segregation of Waste', 'Wet waste and dry waste must be segregated at source. Garbage collection is conducted every morning between 7:30 AM and 9:30 AM.', 3);
  insertRule.run('r_4', 'Noise & Celebrations', 'Quiet Hours Protocol', 'Music and loud outdoor speakers must be turned down by 10:00 PM in consideration of elders and school children.', 4);

  // Seed FAQs
  const insertFaq = db.prepare(`
    INSERT INTO faqs (id, category, question, answer, display_order)
    VALUES (?, ?, ?, ?, ?)
  `);
  insertFaq.run('f_1', 'Maintenance', 'How is the maintenance amount calculated?', 'Maintenance rates are set by the General Body based on property category: ₹1,500/month for vacant residential plots, ₹2,500/month for constructed villas, and ₹3,000/month for commercial/corner sites.', 1);
  insertFaq.run('f_2', 'Payment', 'Can I make partial maintenance payments online?', 'Yes, if partial payment is enabled by the committee, you can pay any amount up to your total outstanding balance directly using UPI, Net Banking, or Debit/Credit cards.', 2);
  insertFaq.run('f_3', 'NOC', 'How long does it take to obtain an NOC?', 'Online applications with complete document uploads are typically reviewed by the committee and issued within 3 to 5 business days after verifying dues clearance.', 3);
  insertFaq.run('f_4', 'NOC', 'How can a bank or buyer verify my NOC?', 'Each issued NOC features a unique serial number and cryptographic QR code. Anyone can verify the authenticity instantly on the public /verify-noc page.', 4);

  // Seed Initial Audit Log
  const insertAudit = db.prepare(`
    INSERT INTO audit_logs (id, user_id, user_name, user_role, action, target_entity, target_id, details)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insertAudit.run('aud_1', 'u_admin', 'Sri. K. Venkatesh', 'SUPER_ADMIN', 'SYSTEM_INITIALIZATION', 'Database', 'upkar_association', 'Initial database schema and layout data provisioned successfully.');
}
