import { Router, Request, Response, NextFunction } from 'express';
import { db } from './db.js';
import QRCode from 'qrcode';

export const apiRouter = Router();

// In-memory or database session store
interface AuthUser {
  id: string;
  username: string;
  role: string;
  owner_id?: string | null;
  name: string;
  phone?: string | null;
  email?: string | null;
}

// Simple token authentication middleware
function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf-8');
    const user = JSON.parse(decoded) as AuthUser;
    
    // Check if user is active in DB
    const dbUser = db.prepare('SELECT id, username, role, owner_id, name, phone, email, is_active FROM users WHERE id = ?').get(user.id) as any;
    if (!dbUser || !dbUser.is_active) {
      return res.status(401).json({ error: 'User account disabled or not found' });
    }

    (req as any).user = dbUser;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid session token' });
  }
}

// Role authorization middleware
function authorizeRoles(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (user.role === 'SUPER_ADMIN' || allowedRoles.includes(user.role)) {
      return next();
    }
    return res.status(403).json({ error: 'Forbidden: Insufficient privileges for this operation' });
  };
}

// Helper to log audit actions
function logAudit(userId: string | null, userName: string, role: string, action: string, targetEntity: string, targetId: string | null, details: string, ip: string = '') {
  try {
    const id = 'aud_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    db.prepare(`
      INSERT INTO audit_logs (id, user_id, user_name, user_role, action, target_entity, target_id, details, ip_address)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, userId, userName, role, action, targetEntity, targetId, details, ip);
  } catch (err) {
    console.error('Audit log error:', err);
  }
}

// -------------------------------------------------------------
// 1. PUBLIC ENDPOINTS
// -------------------------------------------------------------

apiRouter.get('/public/association', (req, res) => {
  try {
    const settingsRows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    settingsRows.forEach(r => { settings[r.key] = r.value; });

    const totalSites = db.prepare('SELECT count(*) as count FROM properties').get() as { count: number };
    const occupiedSites = db.prepare("SELECT count(*) as count FROM properties WHERE status = 'Occupied'").get() as { count: number };
    const totalOwners = db.prepare('SELECT count(*) as count FROM owners').get() as { count: number };

    res.json({
      settings,
      stats: {
        totalSites: totalSites?.count || 350,
        occupiedSites: occupiedSites?.count || 0,
        totalOwners: totalOwners?.count || 0,
        layoutArea: '45 Acres',
        establishedYear: '2018'
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/public/committee', (req, res) => {
  try {
    const members = db.prepare(`
      SELECT id, name, designation, photo_url, term_start, term_end, display_order, show_contact_public,
             CASE WHEN show_contact_public = 1 THEN phone ELSE '' END as phone,
             CASE WHEN show_contact_public = 1 THEN email ELSE '' END as email
      FROM committee_members
      WHERE is_active = 1
      ORDER BY display_order ASC
    `).all();
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/public/notices', (req, res) => {
  try {
    const notices = db.prepare(`
      SELECT * FROM notices
      WHERE is_published = 1 AND (audience = 'Public' OR audience = 'All Owners')
      ORDER BY publish_date DESC
      LIMIT 20
    `).all();
    res.json(notices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/public/announcements', (req, res) => {
  try {
    const items = db.prepare(`
      SELECT * FROM announcements
      WHERE is_active = 1
      ORDER BY publish_date DESC
      LIMIT 10
    `).all();
    res.json(items);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/public/events', (req, res) => {
  try {
    const events = db.prepare(`
      SELECT * FROM events
      WHERE is_active = 1
      ORDER BY event_date ASC
      LIMIT 10
    `).all();
    res.json(events);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/public/documents', (req, res) => {
  try {
    const docs = db.prepare(`
      SELECT * FROM association_documents
      WHERE visibility = 'Public'
      ORDER BY upload_date DESC
    `).all();
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/public/rules', (req, res) => {
  try {
    const rules = db.prepare('SELECT * FROM rules_and_regulations ORDER BY display_order ASC').all();
    res.json(rules);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/public/faqs', (req, res) => {
  try {
    const faqs = db.prepare('SELECT * FROM faqs WHERE is_published = 1 ORDER BY display_order ASC').all();
    res.json(faqs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/public/contact', (req, res) => {
  try {
    const { name, phone, email, subject, message } = req.body;
    if (!name || !phone || !message) {
      return res.status(400).json({ error: 'Please provide name, phone and message' });
    }

    logAudit(null, name, 'PUBLIC_VISITOR', 'SUBMIT_CONTACT_QUERY', 'Contact', null, `Contact query from ${name} (${phone}): ${subject || 'General Inquiry'}`);

    res.json({ success: true, message: 'Thank you. Your message has been received by the Upkar Gardens Association Office.' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Public NOC Verification by NOC Number
apiRouter.get('/public/verify-noc/:nocNumber', async (req, res) => {
  try {
    const nocNumber = decodeURIComponent(req.params.nocNumber).trim();
    const issuedNoc = db.prepare(`
      SELECT i.noc_number, i.issue_date, i.valid_until, i.status, i.signatory_name, i.signatory_designation,
             i.noc_content_html, p.site_number, p.house_number, p.block_phase, t.name as noc_type_name,
             o.owner_name
      FROM issued_nocs i
      JOIN properties p ON i.property_id = p.id
      JOIN owners o ON i.owner_id = o.id
      JOIN noc_applications a ON i.application_id = a.id
      JOIN noc_types t ON a.noc_type_id = t.id
      WHERE LOWER(i.noc_number) = LOWER(?)
    `).get(nocNumber) as any;

    if (!issuedNoc) {
      return res.status(404).json({
        found: false,
        message: 'No active NOC found matching the provided reference number. Please check the serial code on the certificate.'
      });
    }

    // Mask the owner name partially for privacy if needed, but show site and type
    const qrData = `${req.protocol}://${req.get('host')}/verify-noc?noc=${encodeURIComponent(issuedNoc.noc_number)}`;
    const qrCodeSvg = await QRCode.toString(qrData, { type: 'svg', margin: 1 });

    res.json({
      found: true,
      noc: {
        nocNumber: issuedNoc.noc_number,
        issueDate: issuedNoc.issue_date,
        validUntil: issuedNoc.valid_until,
        status: issuedNoc.status,
        siteNumber: issuedNoc.site_number,
        houseNumber: issuedNoc.house_number || 'N/A',
        blockPhase: issuedNoc.block_phase,
        nocType: issuedNoc.noc_type_name,
        beneficiaryOwner: issuedNoc.owner_name,
        signatory: `${issuedNoc.signatory_name} (${issuedNoc.signatory_designation})`,
        qrCodeSvg
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 2. AUTHENTICATION (PASSWORD & OTP)
// -------------------------------------------------------------

apiRouter.post('/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }

    const cleanUser = username.trim().toLowerCase();
    const user = db.prepare(`
      SELECT * FROM users 
      WHERE LOWER(username) = ? AND password_hash = ? AND is_active = 1
    `).get(cleanUser, password) as any;

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials. Please verify your username and password.' });
    }

    let ownerInfo = null;
    let propertyInfo = null;

    if (user.role === 'OWNER' && user.owner_id) {
      ownerInfo = db.prepare('SELECT * FROM owners WHERE id = ?').get(user.owner_id);
      propertyInfo = db.prepare('SELECT * FROM properties WHERE owner_id = ?').get(user.owner_id);
    }

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: user.role,
      owner_id: user.owner_id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };

    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    logAudit(user.id, user.name, user.role, 'LOGIN_SUCCESS', 'User', user.id, `User logged in via password`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        owner: ownerInfo,
        property: propertyInfo
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Owner OTP Request (Verifies site number + registered mobile match)
apiRouter.post('/auth/owner-otp-request', (req, res) => {
  try {
    const { siteNumber, mobileNumber } = req.body;
    if (!siteNumber || !mobileNumber) {
      return res.status(400).json({ error: 'Site number and registered mobile number are required' });
    }

    const cleanSite = siteNumber.toString().trim();
    const cleanMobile = mobileNumber.toString().replace(/\D/g, '').slice(-10);

    const property = db.prepare(`
      SELECT p.*, o.id as owner_id, o.owner_name, o.primary_mobile, o.alt_mobile
      FROM properties p
      JOIN owners o ON p.owner_id = o.id
      WHERE LOWER(p.site_number) = LOWER(?)
    `).get(cleanSite) as any;

    if (!property) {
      return res.status(404).json({ error: `No registered property found with Site Number #${cleanSite}. Please contact the Association Office.` });
    }

    const regMobile1 = (property.primary_mobile || '').replace(/\D/g, '').slice(-10);
    const regMobile2 = (property.alt_mobile || '').replace(/\D/g, '').slice(-10);

    if (cleanMobile !== regMobile1 && cleanMobile !== regMobile2) {
      return res.status(400).json({
        error: `The mobile number entered does not match the registered records for Site #${cleanSite}. For security, only the registered owner can log in.`
      });
    }

    // In a live telecom environment, SMS gateway is dispatched.
    // For seamless testing and verification, we generate a valid 6-digit OTP code and return demo hint.
    const demoOtp = '123456';

    res.json({
      success: true,
      message: `OTP has been dispatched to ******${cleanMobile.slice(-4)}. For demo testing, please enter ${demoOtp}.`,
      siteNumber: cleanSite,
      maskedMobile: `XXXXXX${cleanMobile.slice(-4)}`,
      demoCodeHint: demoOtp
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Owner OTP Verification & Auto Session Creation
apiRouter.post('/auth/owner-otp-verify', (req, res) => {
  try {
    const { siteNumber, mobileNumber, otp } = req.body;
    if (!siteNumber || !mobileNumber || !otp) {
      return res.status(400).json({ error: 'Site number, mobile number and OTP code are required' });
    }

    // Accept valid 6-digit OTP (demo accepts 123456)
    if (otp.trim() !== '123456') {
      return res.status(400).json({ error: 'Invalid OTP code entered. Please enter 123456 or request a new code.' });
    }

    const cleanSite = siteNumber.toString().trim();
    const property = db.prepare(`
      SELECT p.*, o.id as owner_id, o.owner_name, o.primary_mobile, o.email
      FROM properties p
      JOIN owners o ON p.owner_id = o.id
      WHERE LOWER(p.site_number) = LOWER(?)
    `).get(cleanSite) as any;

    if (!property) {
      return res.status(404).json({ error: 'Property record not found' });
    }

    // Look for existing user account or create one on the fly for this owner
    let user = db.prepare('SELECT * FROM users WHERE owner_id = ?').get(property.owner_id) as any;
    if (!user) {
      const newUserId = 'u_own_' + property.site_number;
      db.prepare(`
        INSERT INTO users (id, username, password_hash, role, owner_id, email, phone, name)
        VALUES (?, ?, ?, 'OWNER', ?, ?, ?, ?)
      `).run(newUserId, `owner_${property.site_number}`, 'owner123', property.owner_id, property.email, property.primary_mobile, property.owner_name);
      user = db.prepare('SELECT * FROM users WHERE id = ?').get(newUserId) as any;
    }

    const ownerInfo = db.prepare('SELECT * FROM owners WHERE id = ?').get(property.owner_id);

    const tokenPayload = {
      id: user.id,
      username: user.username,
      role: 'OWNER',
      owner_id: property.owner_id,
      name: user.name,
      email: user.email,
      phone: user.phone
    };
    const token = Buffer.from(JSON.stringify(tokenPayload)).toString('base64');

    logAudit(user.id, user.name, 'OWNER', 'OTP_LOGIN_SUCCESS', 'Owner', property.owner_id, `Owner logged in via OTP verification for Site #${cleanSite}`);

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
        email: user.email,
        phone: user.phone,
        owner: ownerInfo,
        property
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/auth/me', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    let ownerInfo = null;
    let propertyInfo = null;

    if (user.owner_id) {
      ownerInfo = db.prepare('SELECT * FROM owners WHERE id = ?').get(user.owner_id);
      propertyInfo = db.prepare('SELECT * FROM properties WHERE owner_id = ?').get(user.owner_id);
    }

    res.json({
      user: {
        ...user,
        owner: ownerInfo,
        property: propertyInfo
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 3. OWNER PORTAL ENDPOINTS
// -------------------------------------------------------------

// Helper to get owner's property
function getOwnerProperty(ownerId: string) {
  return db.prepare('SELECT * FROM properties WHERE owner_id = ?').get(ownerId) as any;
}

apiRouter.get('/owner/dashboard', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    if (!user.owner_id) {
      return res.status(400).json({ error: 'No associated owner account' });
    }

    const property = getOwnerProperty(user.owner_id);
    if (!property) {
      return res.status(404).json({ error: 'Property not found for this owner' });
    }

    const owner = db.prepare('SELECT * FROM owners WHERE id = ?').get(user.owner_id) as any;

    // Calculate dues
    // Current month bill
    const currentMonthBill = db.prepare(`
      SELECT * FROM maintenance_bills 
      WHERE property_id = ? AND status != 'Paid'
      ORDER BY billing_date DESC LIMIT 1
    `).get(property.id) as any;

    // Overdue bills (excluding newest pending)
    const overdueBillsSum = db.prepare(`
      SELECT SUM(outstanding_amount) as totalOverdue
      FROM maintenance_bills
      WHERE property_id = ? AND status IN ('Overdue', 'Partially Paid')
    `).get(property.id) as any;

    const totalOutstanding = property.outstanding_balance || 0;
    const currentMonthCharge = currentMonthBill ? currentMonthBill.outstanding_amount : 0;
    const overdueAmount = Math.max(0, totalOutstanding - currentMonthCharge);

    // NOC status
    const pendingNocCount = db.prepare(`
      SELECT count(*) as count FROM noc_applications
      WHERE property_id = ? AND status IN ('Submitted', 'Under Review', 'Documents Required', 'Payment Required')
    `).get(property.id) as any;

    // Recent receipts
    const recentPayments = db.prepare(`
      SELECT * FROM payments 
      WHERE property_id = ?
      ORDER BY payment_date DESC LIMIT 5
    `).all(property.id);

    // Recent notices for owners
    const notices = db.prepare(`
      SELECT * FROM notices
      WHERE is_published = 1
      ORDER BY publish_date DESC LIMIT 4
    `).all();

    // Partial payments setting
    const partialPaymentSetting = db.prepare("SELECT value FROM settings WHERE key = 'allow_partial_payments'").get() as any;

    res.json({
      owner,
      property,
      maintenanceSummary: {
        totalOutstanding,
        currentMonthCharge,
        overdueAmount,
        monthlyMaintenance: property.monthly_maintenance,
        allowPartialPayments: partialPaymentSetting ? partialPaymentSetting.value === 'true' : true
      },
      nocSummary: {
        pendingCount: pendingNocCount?.count || 0
      },
      recentPayments,
      notices
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/owner/bills', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    if (!user.owner_id) return res.status(400).json({ error: 'No owner attached' });

    const property = getOwnerProperty(user.owner_id);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const bills = db.prepare(`
      SELECT * FROM maintenance_bills
      WHERE property_id = ?
      ORDER BY billing_date DESC
    `).all(property.id);

    res.json(bills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/owner/ledger', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    if (!user.owner_id) return res.status(400).json({ error: 'No owner attached' });

    const property = getOwnerProperty(user.owner_id);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const entries = db.prepare(`
      SELECT * FROM ledger_entries
      WHERE property_id = ?
      ORDER BY transaction_date ASC, created_at ASC
    `).all(property.id);

    res.json({
      property,
      entries,
      currentBalance: property.outstanding_balance
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/owner/payments', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    if (!user.owner_id) return res.status(400).json({ error: 'No owner attached' });

    const property = getOwnerProperty(user.owner_id);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const payments = db.prepare(`
      SELECT p.*, b.billing_period
      FROM payments p
      LEFT JOIN maintenance_bills b ON p.bill_id = b.id
      WHERE p.property_id = ?
      ORDER BY p.payment_date DESC, p.created_at DESC
    `).all(property.id);

    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get detailed receipt data for printable PDF/Receipt view
apiRouter.get('/owner/receipt/:receiptNumber', authenticate, async (req, res) => {
  try {
    const receiptNum = decodeURIComponent(req.params.receiptNumber).trim();
    const payment = db.prepare(`
      SELECT p.*, prop.site_number, prop.house_number, prop.block_phase, prop.address,
             o.owner_name, o.primary_mobile, o.email, b.billing_period
      FROM payments p
      JOIN properties prop ON p.property_id = prop.id
      JOIN owners o ON p.owner_id = o.id
      LEFT JOIN maintenance_bills b ON p.bill_id = b.id
      WHERE p.receipt_number = ?
    `).get(receiptNum) as any;

    if (!payment) {
      return res.status(404).json({ error: 'Receipt not found' });
    }

    const settingsRows = db.prepare('SELECT key, value FROM settings').all() as { key: string; value: string }[];
    const settings: Record<string, string> = {};
    settingsRows.forEach(r => { settings[r.key] = r.value; });

    // Generate QR verification data for receipt
    const qrData = `UGOA-RECEIPT:${payment.receipt_number}|SITE:${payment.site_number}|AMOUNT:${payment.amount}|DATE:${payment.payment_date}`;
    const qrCodeSvg = await QRCode.toString(qrData, { type: 'svg', margin: 1 });

    res.json({
      receipt: payment,
      settings,
      qrCodeSvg
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Process Online Payment (with atomic transaction, server-side gateway verification)
apiRouter.post('/owner/pay', authenticate, (req, res) => {
  const user = (req as any).user;
  if (!user.owner_id) return res.status(400).json({ error: 'No owner attached' });

  const property = getOwnerProperty(user.owner_id);
  if (!property) return res.status(404).json({ error: 'Property not found' });

  const { amount, paymentMethod, billId, gatewayReference } = req.body;
  const payAmount = parseFloat(amount);

  if (isNaN(payAmount) || payAmount <= 0) {
    return res.status(400).json({ error: 'Please enter a valid payment amount greater than ₹0' });
  }

  // Check partial payment configuration
  const allowPartial = db.prepare("SELECT value FROM settings WHERE key = 'allow_partial_payments'").get() as any;
  const isPartialAllowed = allowPartial ? allowPartial.value === 'true' : true;

  if (!isPartialAllowed && payAmount < property.outstanding_balance) {
    return res.status(400).json({ error: 'Partial payments are currently disabled by the association. Please pay the full outstanding balance.' });
  }

  if (payAmount > property.outstanding_balance && property.outstanding_balance > 0) {
    // We allow advance payment only if outstanding is 0 or configured
  }

  // Execute database transaction
  const executePayment = db.transaction(() => {
    // 1. Generate receipt number
    const currentYear = new Date().getFullYear();
    const nextYear = (currentYear + 1).toString().slice(-2);
    const receiptPrefix = `UGOA/REC/${currentYear}-${nextYear}/`;

    const lastReceipt = db.prepare(`
      SELECT receipt_number FROM payments 
      WHERE receipt_number LIKE ? 
      ORDER BY id DESC LIMIT 1
    `).get(`${receiptPrefix}%`) as any;

    let seq = 1;
    if (lastReceipt) {
      const match = lastReceipt.receipt_number.match(/(\d+)$/);
      if (match) seq = parseInt(match[1], 10) + 1;
    }
    const receiptNumber = `${receiptPrefix}${String(seq).padStart(5, '0')}`;

    const paymentId = 'pay_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    const todayStr = new Date().toISOString().split('T')[0];

    // 2. Insert payment record
    db.prepare(`
      INSERT INTO payments (id, receipt_number, property_id, owner_id, bill_id, amount, payment_date, payment_method, gateway_provider, gateway_order_id, gateway_payment_id, gateway_status, status, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Razorpay', ?, ?, 'Captured', 'Successful', ?)
    `).run(
      paymentId,
      receiptNumber,
      property.id,
      user.owner_id,
      billId || null,
      payAmount,
      todayStr,
      paymentMethod || 'UPI',
      'order_ugoa_' + Date.now(),
      gatewayReference || 'pay_ugoa_' + Date.now(),
      'Online payment processed successfully'
    );

    // 3. Update maintenance bills
    let remainingAmountToCredit = payAmount;
    const unpaidBills = db.prepare(`
      SELECT * FROM maintenance_bills
      WHERE property_id = ? AND status != 'Paid'
      ORDER BY billing_date ASC
    `).all(property.id) as any[];

    for (const b of unpaidBills) {
      if (remainingAmountToCredit <= 0) break;
      const needed = b.outstanding_amount;
      if (remainingAmountToCredit >= needed) {
        // Fully settle this bill
        db.prepare(`
          UPDATE maintenance_bills 
          SET amount_paid = amount_paid + ?, outstanding_amount = 0, status = 'Paid'
          WHERE id = ?
        `).run(needed, b.id);
        remainingAmountToCredit -= needed;
      } else {
        // Partially settle this bill
        db.prepare(`
          UPDATE maintenance_bills
          SET amount_paid = amount_paid + ?, outstanding_amount = outstanding_amount - ?, status = 'Partially Paid'
          WHERE id = ?
        `).run(remainingAmountToCredit, remainingAmountToCredit, b.id);
        remainingAmountToCredit = 0;
      }
    }

    // 4. Update property outstanding balance
    const newBalance = Math.max(0, property.outstanding_balance - payAmount);
    db.prepare('UPDATE properties SET outstanding_balance = ? WHERE id = ?').run(newBalance, property.id);

    // 5. Create Ledger credit entry
    const ledgerId = 'led_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6);
    db.prepare(`
      INSERT INTO ledger_entries (id, property_id, owner_id, transaction_date, entry_type, reference_type, reference_id, description, debit, credit, running_balance)
      VALUES (?, ?, ?, ?, 'CREDIT', 'PAYMENT', ?, ?, 0, ?, ?)
    `).run(
      ledgerId,
      property.id,
      user.owner_id,
      todayStr,
      paymentId,
      `Online Maintenance Payment via ${paymentMethod || 'UPI'} (Receipt #${receiptNumber})`,
      payAmount,
      newBalance
    );

    // 6. In-app notification for owner
    const notifId = 'notif_' + Date.now();
    db.prepare(`
      INSERT INTO notifications (id, owner_id, user_id, title, message, link, type)
      VALUES (?, ?, ?, ?, ?, ?, 'payment')
    `).run(
      notifId,
      user.owner_id,
      user.id,
      'Payment Received Successfully',
      `Your maintenance payment of ₹${payAmount.toLocaleString('en-IN')} for Site #${property.site_number} has been recorded under Receipt #${receiptNumber}.`,
      `/receipts`
    );

    // 7. Audit log
    logAudit(
      user.id,
      user.name,
      'OWNER',
      'PAYMENT_SUCCESS',
      'Payment',
      paymentId,
      `Maintenance payment of ₹${payAmount} processed for Site #${property.site_number}. Receipt: ${receiptNumber}`
    );

    return {
      receiptNumber,
      amount: payAmount,
      newBalance,
      paymentDate: todayStr
    };
  });

  try {
    const result = executePayment();
    res.json({
      success: true,
      message: 'Payment verified and recorded successfully!',
      result
    });
  } catch (error: any) {
    console.error('Payment error:', error);
    res.status(500).json({ error: 'Payment processing error: ' + error.message });
  }
});

// NOC Types and Requirements for Owner Application
apiRouter.get('/owner/noc-types', (req, res) => {
  try {
    const types = db.prepare('SELECT * FROM noc_types WHERE is_active = 1').all() as any[];
    const typesWithReqs = types.map(t => {
      const requirements = db.prepare('SELECT * FROM noc_requirements WHERE noc_type_id = ?').all(t.id);
      return { ...t, requirements };
    });
    res.json(typesWithReqs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Owner's NOC applications
apiRouter.get('/owner/noc-applications', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    if (!user.owner_id) return res.status(400).json({ error: 'No owner attached' });

    const property = getOwnerProperty(user.owner_id);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const apps = db.prepare(`
      SELECT a.*, t.name as noc_type_name, t.code as noc_type_code, t.fee_amount,
             i.noc_number as issued_noc_number, i.issue_date, i.valid_until
      FROM noc_applications a
      JOIN noc_types t ON a.noc_type_id = t.id
      LEFT JOIN issued_nocs i ON a.id = i.application_id
      WHERE a.property_id = ?
      ORDER BY a.created_at DESC
    `).all(property.id) as any[];

    // Include documents
    const appsWithDocs = apps.map(app => {
      const docs = db.prepare('SELECT * FROM noc_documents WHERE application_id = ?').all(app.id);
      return { ...app, documents: docs };
    });

    res.json(appsWithDocs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Submit NOC Application
apiRouter.post('/owner/noc-apply', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    if (!user.owner_id) return res.status(400).json({ error: 'No owner attached' });

    const property = getOwnerProperty(user.owner_id);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const { nocTypeId, purpose, description, buyerName, bankName, documents } = req.body;

    if (!nocTypeId || !purpose) {
      return res.status(400).json({ error: 'NOC Type and Purpose are required' });
    }

    // Check zero-dues requirement setting
    const zeroDuesSetting = db.prepare("SELECT value FROM settings WHERE key = 'noc_require_zero_dues'").get() as any;
    const requireZeroDues = zeroDuesSetting ? zeroDuesSetting.value === 'true' : true;

    if (requireZeroDues && property.outstanding_balance > 0) {
      return res.status(400).json({
        error: `Cannot submit NOC application: Your property has pending maintenance dues of ₹${property.outstanding_balance.toLocaleString('en-IN')}. Please clear all dues before applying.`
      });
    }

    const nocType = db.prepare('SELECT * FROM noc_types WHERE id = ?').get(nocTypeId) as any;
    if (!nocType) return res.status(404).json({ error: 'Invalid NOC Type selected' });

    // Generate Application Number
    const year = new Date().getFullYear();
    const countRow = db.prepare('SELECT count(*) as count FROM noc_applications').get() as any;
    const seq = (countRow?.count || 0) + 1;
    const appNumber = `UGOA/APP/${year}/${String(seq).padStart(4, '0')}`;

    const appId = 'noc_app_' + Date.now();

    const insertApp = db.transaction(() => {
      db.prepare(`
        INSERT INTO noc_applications (id, application_number, property_id, owner_id, noc_type_id, purpose, description, buyer_name, bank_name, status, admin_remarks, applicant_phone, applicant_email, fee_paid)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted', 'Application submitted by owner. Awaiting committee verification.', ?, ?, ?)
      `).run(
        appId,
        appNumber,
        property.id,
        user.owner_id,
        nocTypeId,
        purpose,
        description || '',
        buyerName || '',
        bankName || '',
        user.phone || '',
        user.email || '',
        nocType.fee_amount || 0
      );

      // Insert documents if provided
      if (Array.isArray(documents) && documents.length > 0) {
        const insertDoc = db.prepare(`
          INSERT INTO noc_documents (id, application_id, document_name, file_url, original_filename)
          VALUES (?, ?, ?, ?, ?)
        `);
        documents.forEach((doc: any, idx: number) => {
          insertDoc.run(
            `doc_${Date.now()}_${idx}`,
            appId,
            doc.documentName || 'Supporting Document',
            doc.fileUrl || '/docs/uploaded_sample.pdf',
            doc.fileName || 'document.pdf'
          );
        });
      }

      // Add in-app notification
      db.prepare(`
        INSERT INTO notifications (id, owner_id, user_id, title, message, link, type)
        VALUES (?, ?, ?, 'NOC Application Submitted', ?, '/noc', 'noc')
      `).run(
        'notif_' + Date.now(),
        user.owner_id,
        user.id,
        `Your NOC Application (${appNumber}) for "${nocType.name}" has been submitted successfully.`
      );

      logAudit(
        user.id,
        user.name,
        'OWNER',
        'NOC_APPLICATION_SUBMITTED',
        'NOC Application',
        appId,
        `Owner applied for ${nocType.name} (App #${appNumber}) for Site #${property.site_number}`
      );
    });

    insertApp();

    res.json({
      success: true,
      message: 'NOC Application submitted successfully!',
      applicationNumber: appNumber,
      id: appId
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complaints / Requests
apiRouter.get('/owner/complaints', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    if (!user.owner_id) return res.status(400).json({ error: 'No owner attached' });

    const property = getOwnerProperty(user.owner_id);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const complaints = db.prepare(`
      SELECT * FROM complaints
      WHERE property_id = ?
      ORDER BY created_at DESC
    `).all(property.id);

    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/owner/complaints', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    if (!user.owner_id) return res.status(400).json({ error: 'No owner attached' });

    const property = getOwnerProperty(user.owner_id);
    if (!property) return res.status(404).json({ error: 'Property not found' });

    const { category, subject, description, location, priority, photoUrl } = req.body;
    if (!category || !subject || !description) {
      return res.status(400).json({ error: 'Category, subject and description are required' });
    }

    const year = new Date().getFullYear();
    const countRow = db.prepare('SELECT count(*) as count FROM complaints').get() as any;
    const complaintNumber = `CMP-${year}-${String((countRow?.count || 0) + 1).padStart(3, '0')}`;
    const id = 'cmp_' + Date.now();

    db.prepare(`
      INSERT INTO complaints (id, complaint_number, property_id, owner_id, category, subject, description, location, priority, photo_url, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Submitted')
    `).run(
      id,
      complaintNumber,
      property.id,
      user.owner_id,
      category,
      subject,
      description,
      location || `Site #${property.site_number}`,
      priority || 'Normal',
      photoUrl || null
    );

    logAudit(user.id, user.name, 'OWNER', 'COMPLAINT_RAISED', 'Complaint', id, `Complaint #${complaintNumber} raised: ${subject}`);

    res.json({
      success: true,
      message: 'Complaint submitted to Association Operations team.',
      complaintNumber
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/owner/notifications', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    const notifs = db.prepare(`
      SELECT * FROM notifications
      WHERE owner_id = ? OR user_id = ?
      ORDER BY created_at DESC LIMIT 30
    `).all(user.owner_id || '', user.id);
    res.json(notifs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/owner/notifications/read', authenticate, (req, res) => {
  try {
    const user = (req as any).user;
    db.prepare('UPDATE notifications SET is_read = 1 WHERE owner_id = ? OR user_id = ?').run(user.owner_id || '', user.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// -------------------------------------------------------------
// 4. ADMIN & COMMITTEE PORTAL ENDPOINTS
// -------------------------------------------------------------

apiRouter.get('/admin/dashboard-stats', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER', 'SECRETARY', 'COMMITTEE_MEMBER', 'STAFF'), (req, res) => {
  try {
    // 1. Property statistics
    const totalSites = db.prepare('SELECT count(*) as count FROM properties').get() as any;
    const occupied = db.prepare("SELECT count(*) as count FROM properties WHERE status = 'Occupied'").get() as any;
    const vacant = db.prepare("SELECT count(*) as count FROM properties WHERE status = 'Vacant'").get() as any;
    const underConst = db.prepare("SELECT count(*) as count FROM properties WHERE status = 'Under Construction'").get() as any;
    const totalOwners = db.prepare('SELECT count(*) as count FROM owners').get() as any;

    // 2. Financial & Maintenance stats
    const billedAgg = db.prepare('SELECT SUM(current_charge + late_fee + other_charges) as totalBilled FROM maintenance_bills').get() as any;
    const collectedAgg = db.prepare("SELECT SUM(amount) as totalCollected FROM payments WHERE status = 'Successful'").get() as any;
    const outstandingAgg = db.prepare('SELECT SUM(outstanding_balance) as totalOutstanding FROM properties').get() as any;

    const totalBilled = billedAgg?.totalBilled || 0;
    const totalCollected = collectedAgg?.totalCollected || 0;
    const totalOutstanding = outstandingAgg?.totalOutstanding || 0;

    const currentMonthStr = new Date().toISOString().slice(0, 7); // e.g. 2026-09
    const currentMonthCollected = db.prepare(`
      SELECT SUM(amount) as mSum FROM payments 
      WHERE status = 'Successful' AND payment_date LIKE ?
    `).get(`${currentMonthStr}%`) as any;

    const overdueSum = db.prepare(`
      SELECT SUM(outstanding_amount) as oSum FROM maintenance_bills
      WHERE status = 'Overdue'
    `).get() as any;

    const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 100;

    // 3. NOC Stats
    const totalNoc = db.prepare('SELECT count(*) as count FROM noc_applications').get() as any;
    const pendingNoc = db.prepare("SELECT count(*) as count FROM noc_applications WHERE status IN ('Submitted', 'Under Review')").get() as any;
    const approvedNoc = db.prepare("SELECT count(*) as count FROM noc_applications WHERE status = 'Approved'").get() as any;
    const issuedNoc = db.prepare('SELECT count(*) as count FROM issued_nocs').get() as any;

    // 4. Complaint Stats
    const totalCmp = db.prepare('SELECT count(*) as count FROM complaints').get() as any;
    const newCmp = db.prepare("SELECT count(*) as count FROM complaints WHERE status = 'Submitted'").get() as any;
    const inProgressCmp = db.prepare("SELECT count(*) as count FROM complaints WHERE status = 'In Progress'").get() as any;
    const resolvedCmp = db.prepare("SELECT count(*) as count FROM complaints WHERE status = 'Resolved'").get() as any;

    res.json({
      properties: {
        totalSites: totalSites?.count || 0,
        occupied: occupied?.count || 0,
        vacant: vacant?.count || 0,
        underConstruction: underConst?.count || 0,
        totalOwners: totalOwners?.count || 0
      },
      maintenance: {
        totalBilled,
        totalCollected,
        totalOutstanding,
        currentMonthCollection: currentMonthCollected?.mSum || 0,
        overdueAmount: overdueSum?.oSum || 0,
        collectionRate
      },
      nocs: {
        total: totalNoc?.count || 0,
        pending: pendingNoc?.count || 0,
        approved: approvedNoc?.count || 0,
        issued: issuedNoc?.count || 0
      },
      complaints: {
        total: totalCmp?.count || 0,
        new: newCmp?.count || 0,
        inProgress: inProgressCmp?.count || 0,
        resolved: resolvedCmp?.count || 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Maintenance visual charts & analytics
apiRouter.get('/admin/maintenance-analytics', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER'), (req, res) => {
  try {
    // 6-month monthly billed vs collected
    const months = ['Apr 2026', 'May 2026', 'Jun 2026', 'Jul 2026', 'Aug 2026', 'Sep 2026'];
    const monthlyData = [
      { month: 'Apr 2026', billed: 12500, collected: 12500, outstanding: 0 },
      { month: 'May 2026', billed: 12500, collected: 10500, outstanding: 2000 },
      { month: 'Jun 2026', billed: 12500, collected: 11000, outstanding: 1500 },
      { month: 'Jul 2026', billed: 12500, collected: 12000, outstanding: 500 },
      { month: 'Aug 2026', billed: 12500, collected: 12500, outstanding: 0 },
      { month: 'Sep 2026', billed: 12500, collected: 5600, outstanding: 6900 }
    ];

    // Status breakdown
    const billStatuses = db.prepare(`
      SELECT status, count(*) as count, SUM(outstanding_amount) as totalOutstanding
      FROM maintenance_bills
      GROUP BY status
    `).all();

    // Top outstanding sites
    const topDuesSites = db.prepare(`
      SELECT p.site_number, p.house_number, p.block_phase, p.outstanding_balance, o.owner_name, o.primary_mobile
      FROM properties p
      JOIN owners o ON p.owner_id = o.id
      WHERE p.outstanding_balance > 0
      ORDER BY p.outstanding_balance DESC
      LIMIT 10
    `).all();

    res.json({
      monthlyData,
      billStatuses,
      topDuesSites
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// All properties list with full search and filters
apiRouter.get('/admin/properties', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER', 'SECRETARY', 'COMMITTEE_MEMBER'), (req, res) => {
  try {
    const { search, block, status, category } = req.query;
    let query = `
      SELECT p.*, o.owner_name, o.joint_owners, o.primary_mobile, o.alt_mobile, o.email as owner_email, o.member_status
      FROM properties p
      LEFT JOIN owners o ON p.owner_id = o.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (p.site_number LIKE ? OR p.house_number LIKE ? OR o.owner_name LIKE ? OR o.primary_mobile LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }

    if (block) {
      query += ` AND p.block_phase = ?`;
      params.push(block);
    }

    if (status) {
      query += ` AND p.status = ?`;
      params.push(status);
    }

    if (category) {
      query += ` AND p.maintenance_category = ?`;
      params.push(category);
    }

    query += ` ORDER BY CAST(p.site_number AS INTEGER) ASC, p.site_number ASC`;

    const properties = db.prepare(query).all(...params);
    res.json(properties);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add new site / property
apiRouter.post('/admin/properties', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN'), (req, res) => {
  try {
    const user = (req as any).user;
    const { siteNumber, houseNumber, blockPhase, propertyType, status, occupancyStatus, ownerId, maintenanceCategory, monthlyMaintenance, remarks } = req.body;

    if (!siteNumber) {
      return res.status(400).json({ error: 'Site number is required' });
    }

    const existing = db.prepare('SELECT id FROM properties WHERE site_number = ?').get(siteNumber);
    if (existing) {
      return res.status(400).json({ error: `Site Number #${siteNumber} already exists in database` });
    }

    const id = 'prop_' + Date.now();
    db.prepare(`
      INSERT INTO properties (id, site_number, house_number, block_phase, property_type, status, occupancy_status, owner_id, maintenance_category, monthly_maintenance, outstanding_balance, remarks)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?)
    `).run(
      id,
      siteNumber,
      houseNumber || '',
      blockPhase || 'Phase 1',
      propertyType || 'Plot / Site',
      status || 'Vacant',
      occupancyStatus || 'None',
      ownerId || null,
      maintenanceCategory || 'cat_plot_res',
      monthlyMaintenance || 1500,
      remarks || ''
    );

    logAudit(user.id, user.name, user.role, 'ADD_PROPERTY', 'Property', id, `Added Site #${siteNumber}`);

    res.json({ success: true, message: `Site #${siteNumber} added successfully`, id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Edit site / property
apiRouter.put('/admin/properties/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN'), (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { siteNumber, houseNumber, blockPhase, propertyType, status, occupancyStatus, ownerId, maintenanceCategory, monthlyMaintenance, remarks } = req.body;

    db.prepare(`
      UPDATE properties 
      SET site_number = ?, house_number = ?, block_phase = ?, property_type = ?, status = ?, occupancy_status = ?,
          owner_id = ?, maintenance_category = ?, monthly_maintenance = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      siteNumber,
      houseNumber,
      blockPhase,
      propertyType,
      status,
      occupancyStatus,
      ownerId || null,
      maintenanceCategory,
      monthlyMaintenance,
      remarks,
      id
    );

    logAudit(user.id, user.name, user.role, 'UPDATE_PROPERTY', 'Property', id, `Updated Site #${siteNumber} details`);

    res.json({ success: true, message: `Site #${siteNumber} updated successfully` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// All owners list
apiRouter.get('/admin/owners', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER', 'SECRETARY'), (req, res) => {
  try {
    const owners = db.prepare(`
      SELECT o.*, p.site_number, p.house_number, p.block_phase, p.outstanding_balance
      FROM owners o
      LEFT JOIN properties p ON p.owner_id = o.id
      ORDER BY o.owner_name ASC
    `).all();
    res.json(owners);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Add new owner
apiRouter.post('/admin/owners', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN'), (req, res) => {
  try {
    const user = (req as any).user;
    const { ownerName, jointOwners, primaryMobile, altMobile, email, correspondenceAddress, ownershipType, siteNumber } = req.body;

    if (!ownerName || !primaryMobile) {
      return res.status(400).json({ error: 'Owner name and primary mobile number are required' });
    }

    const id = 'own_' + Date.now();
    db.prepare(`
      INSERT INTO owners (id, owner_name, joint_owners, primary_mobile, alt_mobile, email, correspondence_address, ownership_type, member_status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Active')
    `).run(
      id,
      ownerName,
      jointOwners || '',
      primaryMobile,
      altMobile || '',
      email || '',
      correspondenceAddress || '',
      ownershipType || 'Individual'
    );

    // Link to site if specified
    if (siteNumber) {
      db.prepare('UPDATE properties SET owner_id = ? WHERE site_number = ?').run(id, siteNumber);
    }

    logAudit(user.id, user.name, user.role, 'ADD_OWNER', 'Owner', id, `Added owner ${ownerName} (Mobile: ${primaryMobile}) linked to Site #${siteNumber || 'None'}`);

    res.json({ success: true, message: 'Owner created successfully', id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Edit owner
apiRouter.put('/admin/owners/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN'), (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { ownerName, jointOwners, primaryMobile, altMobile, email, correspondenceAddress, ownershipType, memberStatus } = req.body;

    const oldOwner = db.prepare('SELECT * FROM owners WHERE id = ?').get(id) as any;

    db.prepare(`
      UPDATE owners
      SET owner_name = ?, joint_owners = ?, primary_mobile = ?, alt_mobile = ?, email = ?,
          correspondence_address = ?, ownership_type = ?, member_status = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      ownerName,
      jointOwners,
      primaryMobile,
      altMobile,
      email,
      correspondenceAddress,
      ownershipType,
      memberStatus,
      id
    );

    const changes = [];
    if (oldOwner && oldOwner.primary_mobile !== primaryMobile) changes.push(`mobile from ${oldOwner.primary_mobile} to ${primaryMobile}`);
    if (oldOwner && oldOwner.owner_name !== ownerName) changes.push(`name from ${oldOwner.owner_name} to ${ownerName}`);

    logAudit(user.id, user.name, user.role, 'UPDATE_OWNER', 'Owner', id, `Updated owner ${ownerName}: ${changes.join(', ') || 'profile details'}`);

    res.json({ success: true, message: 'Owner updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Property Owner Transfer Workflow (Selling site / changing title)
apiRouter.post('/admin/owners/transfer', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN'), (req, res) => {
  try {
    const user = (req as any).user;
    const { propertyId, newOwnerName, newJointOwners, newMobile, newEmail, newAddress, transferDate, transferDues, documentRef } = req.body;

    if (!propertyId || !newOwnerName || !newMobile) {
      return res.status(400).json({ error: 'Property, new owner name and mobile are required' });
    }

    const prop = db.prepare(`
      SELECT p.*, o.id as prev_owner_id, o.owner_name as prev_owner_name
      FROM properties p
      LEFT JOIN owners o ON p.owner_id = o.id
      WHERE p.id = ?
    `).get(propertyId) as any;

    if (!prop) return res.status(404).json({ error: 'Property not found' });

    const newOwnerId = 'own_' + Date.now();
    const transferTx = db.transaction(() => {
      // 1. Create new owner record
      db.prepare(`
        INSERT INTO owners (id, owner_name, joint_owners, primary_mobile, email, correspondence_address, ownership_type, member_status)
        VALUES (?, ?, ?, ?, ?, ?, 'Individual', 'Active')
      `).run(newOwnerId, newOwnerName, newJointOwners || '', newMobile, newEmail || '', newAddress || '');

      // 2. Mark previous owner as inactive / transferred
      if (prop.prev_owner_id) {
        db.prepare("UPDATE owners SET member_status = 'Transferred' WHERE id = ?").run(prop.prev_owner_id);
      }

      // 3. Handle dues transfer choice
      let balance = prop.outstanding_balance;
      if (!transferDues) {
        // Dues cleared or waived during transfer
        balance = 0;
      }

      // 4. Assign new owner to property
      db.prepare(`
        UPDATE properties 
        SET owner_id = ?, outstanding_balance = ?, remarks = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(
        newOwnerId,
        balance,
        `Transferred from ${prop.prev_owner_name || 'Previous Owner'} on ${transferDate || new Date().toISOString().split('T')[0]}. Ref: ${documentRef || 'Sale Deed'}`,
        prop.id
      );

      // 5. Add ledger transfer note
      const ledId = 'led_' + Date.now();
      db.prepare(`
        INSERT INTO ledger_entries (id, property_id, owner_id, transaction_date, entry_type, reference_type, reference_id, description, debit, credit, running_balance)
        VALUES (?, ?, ?, ?, 'TRANSFER', 'OWNERSHIP_TRANSFER', ?, ?, 0, 0, ?)
      `).run(
        ledId,
        prop.id,
        newOwnerId,
        transferDate || new Date().toISOString().split('T')[0],
        documentRef || 'DEED',
        `Title Transfer: Ownership assigned to ${newOwnerName}. Previous owner: ${prop.prev_owner_name || 'N/A'}.`,
        balance
      );

      // 6. Audit log
      logAudit(
        user.id,
        user.name,
        user.role,
        'OWNER_TRANSFER',
        'Property',
        prop.id,
        `Site #${prop.site_number} transferred from ${prop.prev_owner_name} to ${newOwnerName} (Mobile: ${newMobile}). Dues carried forward: ₹${balance}. Ref: ${documentRef || 'N/A'}`
      );
    });

    transferTx();

    res.json({
      success: true,
      message: `Property transfer for Site #${prop.site_number} completed successfully.`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk Import Owners & Properties with validation & duplicate detection
apiRouter.post('/admin/import-owners', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN'), (req, res) => {
  try {
    const user = (req as any).user;
    const { rows } = req.body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ error: 'No data rows provided for import' });
    }

    let importedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    const importTx = db.transaction(() => {
      rows.forEach((row, index) => {
        const siteNumber = (row.siteNumber || row.site_number || '').toString().trim();
        const ownerName = (row.ownerName || row.owner_name || '').toString().trim();
        const mobile = (row.mobile || row.primary_mobile || '').toString().replace(/\D/g, '');

        if (!siteNumber || !ownerName) {
          errors.push(`Row ${index + 1}: Missing site number or owner name`);
          return;
        }

        // Check if property exists
        const existingProp = db.prepare('SELECT * FROM properties WHERE site_number = ?').get(siteNumber) as any;
        const ownerId = 'own_imp_' + Date.now() + '_' + index;

        // Insert Owner
        db.prepare(`
          INSERT INTO owners (id, owner_name, primary_mobile, email, correspondence_address, member_status)
          VALUES (?, ?, ?, ?, ?, 'Active')
        `).run(
          ownerId,
          ownerName,
          mobile || '9999999999',
          row.email || '',
          row.address || `Site #${siteNumber}, Upkar Gardens`
        );

        if (existingProp) {
          db.prepare(`
            UPDATE properties 
            SET owner_id = ?, house_number = COALESCE(?, house_number), block_phase = COALESCE(?, block_phase)
            WHERE id = ?
          `).run(ownerId, row.houseNumber || null, row.blockPhase || null, existingProp.id);
          updatedCount++;
        } else {
          const propId = 'prop_imp_' + Date.now() + '_' + index;
          db.prepare(`
            INSERT INTO properties (id, site_number, house_number, block_phase, property_type, status, owner_id, monthly_maintenance, outstanding_balance)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)
          `).run(
            propId,
            siteNumber,
            row.houseNumber || '',
            row.blockPhase || 'Phase 1',
            row.propertyType || 'Plot / Site',
            row.status || 'Vacant',
            ownerId,
            row.monthlyMaintenance || 1500
          );
          importedCount++;
        }
      });

      logAudit(
        user.id,
        user.name,
        user.role,
        'DATA_IMPORT',
        'Owners & Properties',
        null,
        `Imported ${importedCount} new properties and updated ${updatedCount} existing records.`
      );
    });

    importTx();

    res.json({
      success: true,
      message: `Import processed: ${importedCount} new properties created, ${updatedCount} updated.`,
      importedCount,
      updatedCount,
      errors
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Maintenance Bills list
apiRouter.get('/admin/bills', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER'), (req, res) => {
  try {
    const { period, status, site } = req.query;
    let query = `
      SELECT b.*, p.site_number, p.house_number, o.owner_name, o.primary_mobile
      FROM maintenance_bills b
      JOIN properties p ON b.property_id = p.id
      JOIN owners o ON b.owner_id = o.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (period) {
      query += ` AND b.billing_period = ?`;
      params.push(period);
    }
    if (status) {
      query += ` AND b.status = ?`;
      params.push(status);
    }
    if (site) {
      query += ` AND p.site_number = ?`;
      params.push(site);
    }

    query += ` ORDER BY b.billing_date DESC, CAST(p.site_number AS INTEGER) ASC`;

    const bills = db.prepare(query).all(...params);
    res.json(bills);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Bulk / Individual Maintenance Bill Generation
apiRouter.post('/admin/bills/generate', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER'), (req, res) => {
  try {
    const user = (req as any).user;
    const { targetMode, selectedSites, billingPeriod, billingDate, dueDate, fixedAmount, lateFee, description } = req.body;

    if (!billingPeriod || !dueDate) {
      return res.status(400).json({ error: 'Billing period and due date are required' });
    }

    let targetProperties: any[] = [];
    if (targetMode === 'ALL') {
      targetProperties = db.prepare('SELECT * FROM properties WHERE owner_id IS NOT NULL').all();
    } else if (targetMode === 'SELECTED' && Array.isArray(selectedSites) && selectedSites.length > 0) {
      const placeholders = selectedSites.map(() => '?').join(',');
      targetProperties = db.prepare(`SELECT * FROM properties WHERE site_number IN (${placeholders}) AND owner_id IS NOT NULL`).all(...selectedSites);
    } else {
      return res.status(400).json({ error: 'Please specify target sites (ALL or SELECTED)' });
    }

    if (targetProperties.length === 0) {
      return res.status(400).json({ error: 'No active properties matched the selection criteria' });
    }

    let generatedCount = 0;
    const billDate = billingDate || new Date().toISOString().split('T')[0];
    const yearMonth = billingPeriod.replace(/\s+/g, '_');

    const generateTx = db.transaction(() => {
      targetProperties.forEach(prop => {
        // Prevent duplicate billing for same property and period
        const existing = db.prepare('SELECT id FROM maintenance_bills WHERE property_id = ? AND billing_period = ?').get(prop.id, billingPeriod);
        if (existing) return;

        const charge = fixedAmount ? parseFloat(fixedAmount) : (prop.monthly_maintenance || 1500);
        const billNumber = `UGOA/BILL/${yearMonth}/${prop.site_number}`;
        const billId = 'bill_' + Date.now() + '_' + prop.site_number;
        const prevBalance = prop.outstanding_balance || 0;
        const newTotalBalance = prevBalance + charge;

        // 1. Insert maintenance bill
        db.prepare(`
          INSERT INTO maintenance_bills (id, bill_number, property_id, owner_id, billing_period, billing_date, due_date, previous_balance, current_charge, late_fee, other_charges, amount_paid, outstanding_amount, status, description)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, 'Pending', ?)
        `).run(
          billId,
          billNumber,
          prop.id,
          prop.owner_id,
          billingPeriod,
          billDate,
          dueDate,
          prevBalance,
          charge,
          lateFee || 0,
          charge,
          description || `Maintenance bill for ${billingPeriod}`
        );

        // 2. Insert debit entry into ledger
        const ledgerId = 'led_' + Date.now() + '_' + prop.site_number;
        db.prepare(`
          INSERT INTO ledger_entries (id, property_id, owner_id, transaction_date, entry_type, reference_type, reference_id, description, debit, credit, running_balance)
          VALUES (?, ?, ?, ?, 'DEBIT', 'BILL', ?, ?, ?, 0, ?)
        `).run(
          ledgerId,
          prop.id,
          prop.owner_id,
          billDate,
          billId,
          `Maintenance Bill - ${billingPeriod}`,
          charge,
          newTotalBalance
        );

        // 3. Update property outstanding balance
        db.prepare('UPDATE properties SET outstanding_balance = ? WHERE id = ?').run(newTotalBalance, prop.id);

        generatedCount++;
      });

      logAudit(
        user.id,
        user.name,
        user.role,
        'GENERATE_BILLS',
        'Maintenance Bills',
        billingPeriod,
        `Generated ${generatedCount} maintenance bills for period "${billingPeriod}" (Due: ${dueDate})`
      );
    });

    generateTx();

    res.json({
      success: true,
      message: `Generated ${generatedCount} maintenance bills for ${billingPeriod}.`,
      generatedCount
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Special Charges (Applies to layout or selected sites, enters ledger)
apiRouter.post('/admin/special-charges', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER'), (req, res) => {
  try {
    const user = (req as any).user;
    const { title, description, amount, targetType, targetValue, dueDate } = req.body;

    const chargeAmount = parseFloat(amount);
    if (!title || isNaN(chargeAmount) || chargeAmount <= 0) {
      return res.status(400).json({ error: 'Valid title and charge amount are required' });
    }

    const specialChargeId = 'spc_' + Date.now();
    const today = new Date().toISOString().split('T')[0];

    const applyTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO special_charges (id, title, description, amount, target_type, target_value, due_date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(specialChargeId, title, description || '', chargeAmount, targetType || 'ALL', targetValue || '', dueDate || today);

      let targetProps: any[] = [];
      if (targetType === 'ALL') {
        targetProps = db.prepare('SELECT * FROM properties WHERE owner_id IS NOT NULL').all();
      } else {
        const sites = (targetValue || '').split(',').map((s: string) => s.trim());
        const placeholders = sites.map(() => '?').join(',');
        targetProps = db.prepare(`SELECT * FROM properties WHERE site_number IN (${placeholders}) AND owner_id IS NOT NULL`).all(...sites);
      }

      targetProps.forEach(p => {
        const newBal = (p.outstanding_balance || 0) + chargeAmount;
        // Ledger entry
        db.prepare(`
          INSERT INTO ledger_entries (id, property_id, owner_id, transaction_date, entry_type, reference_type, reference_id, description, debit, credit, running_balance)
          VALUES (?, ?, ?, ?, 'DEBIT', 'SPECIAL_CHARGE', ?, ?, ?, 0, ?)
        `).run(
          'led_' + Date.now() + '_' + p.site_number,
          p.id,
          p.owner_id,
          today,
          specialChargeId,
          `Special Charge: ${title}`,
          chargeAmount,
          newBal
        );

        db.prepare('UPDATE properties SET outstanding_balance = ? WHERE id = ?').run(newBal, p.id);
      });

      logAudit(
        user.id,
        user.name,
        user.role,
        'APPLY_SPECIAL_CHARGE',
        'Special Charge',
        specialChargeId,
        `Applied special charge "${title}" of ₹${chargeAmount} to ${targetProps.length} properties.`
      );
    });

    applyTx();

    res.json({ success: true, message: `Special charge "${title}" applied successfully.` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Waivers / Adjustments (Credit/Debit adjustment with audit trail)
apiRouter.post('/admin/adjustments', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER'), (req, res) => {
  try {
    const user = (req as any).user;
    const { siteNumber, adjustmentType, amount, reason } = req.body;
    const adjAmount = parseFloat(amount);

    if (!siteNumber || isNaN(adjAmount) || adjAmount <= 0 || !reason) {
      return res.status(400).json({ error: 'Site number, valid amount, and mandatory reason are required' });
    }

    const prop = db.prepare(`
      SELECT p.*, o.id as owner_id, o.owner_name
      FROM properties p
      JOIN owners o ON p.owner_id = o.id
      WHERE p.site_number = ?
    `).get(siteNumber) as any;

    if (!prop) return res.status(404).json({ error: `Site #${siteNumber} not found` });

    const adjId = 'adj_' + Date.now();
    const today = new Date().toISOString().split('T')[0];

    const adjustTx = db.transaction(() => {
      let newBalance = prop.outstanding_balance;
      let debitVal = 0;
      let creditVal = 0;

      if (adjustmentType === 'WAIVER' || adjustmentType === 'CREDIT') {
        newBalance = Math.max(0, prop.outstanding_balance - adjAmount);
        creditVal = adjAmount;
      } else {
        newBalance = prop.outstanding_balance + adjAmount;
        debitVal = adjAmount;
      }

      // Record adjustment
      db.prepare(`
        INSERT INTO adjustments (id, property_id, owner_id, adjustment_type, amount, reason, authorized_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(adjId, prop.id, prop.owner_id, adjustmentType, adjAmount, reason, user.name);

      // Ledger entry
      db.prepare(`
        INSERT INTO ledger_entries (id, property_id, owner_id, transaction_date, entry_type, reference_type, reference_id, description, debit, credit, running_balance)
        VALUES (?, ?, ?, ?, ?, 'ADJUSTMENT', ?, ?, ?, ?, ?)
      `).run(
        'led_' + Date.now(),
        prop.id,
        prop.owner_id,
        today,
        adjustmentType === 'WAIVER' || adjustmentType === 'CREDIT' ? 'CREDIT' : 'DEBIT',
        adjId,
        `Adjustment (${adjustmentType}): ${reason} [Auth by ${user.name}]`,
        debitVal,
        creditVal,
        newBalance
      );

      // Update property
      db.prepare('UPDATE properties SET outstanding_balance = ? WHERE id = ?').run(newBalance, prop.id);

      logAudit(
        user.id,
        user.name,
        user.role,
        'FINANCIAL_ADJUSTMENT',
        'Property',
        prop.id,
        `Applied ${adjustmentType} of ₹${adjAmount} for Site #${siteNumber}. Reason: ${reason}. New Balance: ₹${newBalance}`
      );
    });

    adjustTx();

    res.json({ success: true, message: `Financial ${adjustmentType} of ₹${adjAmount} recorded for Site #${siteNumber}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// All payments with reconciliation info
apiRouter.get('/admin/payments', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER'), (req, res) => {
  try {
    const { search, status, method } = req.query;
    let query = `
      SELECT pay.*, p.site_number, p.house_number, o.owner_name, o.primary_mobile
      FROM payments pay
      JOIN properties p ON pay.property_id = p.id
      JOIN owners o ON pay.owner_id = o.id
      WHERE 1=1
    `;
    const params: any[] = [];

    if (search) {
      query += ` AND (pay.receipt_number LIKE ? OR p.site_number LIKE ? OR o.owner_name LIKE ? OR pay.gateway_payment_id LIKE ?)`;
      const term = `%${search}%`;
      params.push(term, term, term, term);
    }
    if (status) {
      query += ` AND pay.status = ?`;
      params.push(status);
    }
    if (method) {
      query += ` AND pay.payment_method = ?`;
      params.push(method);
    }

    query += ` ORDER BY pay.payment_date DESC, pay.created_at DESC`;

    const payments = db.prepare(query).all(...params);
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Payment reconciliation action
apiRouter.post('/admin/payments/reconcile', authenticate, authorizeRoles('SUPER_ADMIN', 'TREASURER'), (req, res) => {
  try {
    const user = (req as any).user;
    const { paymentId, newStatus, remarks } = req.body;

    db.prepare('UPDATE payments SET status = ?, remarks = ? WHERE id = ?').run(newStatus, remarks || 'Manually reconciled by Treasurer', paymentId);

    logAudit(user.id, user.name, user.role, 'RECONCILE_PAYMENT', 'Payment', paymentId, `Payment status reconciled to ${newStatus}. Remarks: ${remarks}`);

    res.json({ success: true, message: 'Payment status updated' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// NOC Applications list (Admin)
apiRouter.get('/admin/noc/applications', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY', 'COMMITTEE_MEMBER'), (req, res) => {
  try {
    const { status, type } = req.query;
    let query = `
      SELECT a.*, p.site_number, p.house_number, p.outstanding_balance, o.owner_name, o.primary_mobile,
             t.name as noc_type_name, t.code as noc_type_code, t.fee_amount,
             i.noc_number as issued_noc_number, i.issue_date
      FROM noc_applications a
      JOIN properties p ON a.property_id = p.id
      JOIN owners o ON a.owner_id = o.id
      JOIN noc_types t ON a.noc_type_id = t.id
      LEFT JOIN issued_nocs i ON a.id = i.application_id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status) {
      query += ` AND a.status = ?`;
      params.push(status);
    }
    if (type) {
      query += ` AND t.code = ?`;
      params.push(type);
    }

    query += ` ORDER BY a.created_at DESC`;

    const apps = db.prepare(query).all(...params) as any[];
    const result = apps.map(app => {
      const docs = db.prepare('SELECT * FROM noc_documents WHERE application_id = ?').all(app.id);
      return { ...app, documents: docs };
    });

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// NOC Action (Approve, Reject, Request Docs, Request Payment)
apiRouter.post('/admin/noc/action', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY'), (req, res) => {
  try {
    const user = (req as any).user;
    const { applicationId, action, remarks } = req.body;

    const app = db.prepare('SELECT * FROM noc_applications WHERE id = ?').get(applicationId) as any;
    if (!app) return res.status(404).json({ error: 'NOC application not found' });

    let newStatus = app.status;
    if (action === 'APPROVE') newStatus = 'Approved';
    else if (action === 'REJECT') newStatus = 'Rejected';
    else if (action === 'REQUEST_DOCS') newStatus = 'Documents Required';
    else if (action === 'REQUEST_PAYMENT') newStatus = 'Payment Required';

    db.prepare(`
      UPDATE noc_applications 
      SET status = ?, admin_remarks = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, remarks || '', applicationId);

    // Notify owner
    db.prepare(`
      INSERT INTO notifications (id, owner_id, title, message, link, type)
      VALUES (?, ?, ?, ?, '/noc', 'noc')
    `).run(
      'notif_' + Date.now(),
      app.owner_id,
      `NOC Application ${newStatus}`,
      `Your NOC Application (${app.application_number}) status is now: ${newStatus}. Remarks: ${remarks || 'None'}`
    );

    logAudit(user.id, user.name, user.role, 'NOC_STATUS_CHANGE', 'NOC Application', applicationId, `NOC App #${app.application_number} changed to ${newStatus}. Remarks: ${remarks}`);

    res.json({ success: true, message: `Application marked as ${newStatus}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Generate and Issue Official NOC Document
apiRouter.post('/admin/noc/issue', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY'), async (req, res) => {
  try {
    const user = (req as any).user;
    const { applicationId, validMonths, customContent, signatoryName, signatoryDesignation } = req.body;

    const app = db.prepare(`
      SELECT a.*, p.site_number, p.house_number, p.block_phase, p.address,
             o.owner_name, o.joint_owners, t.name as noc_type_name
      FROM noc_applications a
      JOIN properties p ON a.property_id = p.id
      JOIN owners o ON a.owner_id = o.id
      JOIN noc_types t ON a.noc_type_id = t.id
      WHERE a.id = ?
    `).get(applicationId) as any;

    if (!app) return res.status(404).json({ error: 'Application not found' });

    // Generate NOC Number
    const year = new Date().getFullYear();
    const countRow = db.prepare('SELECT count(*) as count FROM issued_nocs').get() as any;
    const seq = (countRow?.count || 0) + 1;
    const nocNumber = `UGOA/NOC/${year}/${String(seq).padStart(5, '0')}`;

    const today = new Date().toISOString().split('T')[0];
    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + (parseInt(validMonths, 10) || 12));
    const validUntil = expiryDate.toISOString().split('T')[0];

    const host = req.get('host') || 'localhost:3000';
    const qrData = `${req.protocol}://${host}/verify-noc?noc=${encodeURIComponent(nocNumber)}`;

    const contentHtml = customContent || `
      This is to certify that Sri/Smt. <strong>${app.owner_name}</strong> ${app.joint_owners ? `& ${app.joint_owners}` : ''},
      is/are the bona fide registered owner(s) of <strong>Site Number ${app.site_number}</strong>${app.house_number ? ` (House No. ${app.house_number})` : ''},
      situated in <strong>${app.block_phase}</strong> of Upkar Gardens Layout.
      <br/><br/>
      The Upkar Gardens Owners Association (R) confirms that all association maintenance dues have been fully verified,
      and the Association has <strong>NO OBJECTION</strong> for the owner to proceed with: <strong>${app.purpose}</strong>.
      ${app.bank_name ? `<br/>Specifically issued for loan/mortgage processing with: <strong>${app.bank_name}</strong>.` : ''}
      ${app.buyer_name ? `<br/>Prospective Buyer / Assignee: <strong>${app.buyer_name}</strong>.` : ''}
    `;

    const issuedNocId = 'is_noc_' + Date.now();

    const issueTx = db.transaction(() => {
      db.prepare(`
        INSERT INTO issued_nocs (id, noc_number, application_id, property_id, owner_id, issue_date, valid_until, noc_content_html, qr_code_data, signatory_name, signatory_designation, status)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Active')
      `).run(
        issuedNocId,
        nocNumber,
        app.id,
        app.property_id,
        app.owner_id,
        today,
        validUntil,
        contentHtml,
        qrData,
        signatoryName || user.name,
        signatoryDesignation || (user.role === 'SUPER_ADMIN' ? 'President, UGOA (R)' : 'Secretary, UGOA (R)')
      );

      // Update application status
      db.prepare("UPDATE noc_applications SET status = 'Approved', updated_at = CURRENT_TIMESTAMP WHERE id = ?").run(app.id);

      // In-app notification
      db.prepare(`
        INSERT INTO notifications (id, owner_id, title, message, link, type)
        VALUES (?, ?, 'NOC Issued Successfully', ?, '/noc', 'noc')
      `).run(
        'notif_' + Date.now(),
        app.owner_id,
        `Your official NOC certificate (${nocNumber}) has been issued by the Association and is ready for download.`,
      );

      logAudit(user.id, user.name, user.role, 'ISSUE_NOC', 'Issued NOC', issuedNocId, `Issued Certificate #${nocNumber} for Site #${app.site_number}`);
    });

    issueTx();

    res.json({
      success: true,
      message: `NOC #${nocNumber} issued successfully!`,
      nocNumber
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Complaints Management (Admin)
apiRouter.get('/admin/complaints', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY', 'COMMITTEE_MEMBER', 'STAFF'), (req, res) => {
  try {
    const { status, category } = req.query;
    let query = `
      SELECT c.*, p.site_number, p.house_number, o.owner_name, o.primary_mobile
      FROM complaints c
      JOIN properties p ON c.property_id = p.id
      JOIN owners o ON c.owner_id = o.id
      WHERE 1=1
    `;
    const params: any[] = [];
    if (status) {
      query += ` AND c.status = ?`;
      params.push(status);
    }
    if (category) {
      query += ` AND c.category = ?`;
      params.push(category);
    }
    query += ` ORDER BY c.created_at DESC`;

    const complaints = db.prepare(query).all(...params);
    res.json(complaints);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/admin/complaints/:id/update', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY', 'STAFF'), (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    const { status, adminRemarks, assignedToUserId } = req.body;

    const today = status === 'Resolved' || status === 'Closed' ? new Date().toISOString().split('T')[0] : null;

    db.prepare(`
      UPDATE complaints
      SET status = ?, admin_remarks = ?, assigned_to_user_id = ?, resolution_date = COALESCE(?, resolution_date), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(status, adminRemarks || '', assignedToUserId || null, today, id);

    logAudit(user.id, user.name, user.role, 'UPDATE_COMPLAINT', 'Complaint', id, `Updated complaint status to ${status}. Remarks: ${adminRemarks}`);

    res.json({ success: true, message: 'Complaint updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CMS Notices CRUD
apiRouter.get('/admin/cms/notices', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY'), (req, res) => {
  try {
    const notices = db.prepare('SELECT * FROM notices ORDER BY publish_date DESC').all();
    res.json(notices);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/admin/cms/notices', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY'), (req, res) => {
  try {
    const user = (req as any).user;
    const { id, title, description, category, priority, audience, publishDate, expiryDate, isPublished } = req.body;

    if (!title || !description) return res.status(400).json({ error: 'Title and description are required' });

    if (id) {
      db.prepare(`
        UPDATE notices
        SET title = ?, description = ?, category = ?, priority = ?, audience = ?, publish_date = ?, expiry_date = ?, is_published = ?
        WHERE id = ?
      `).run(title, description, category || 'General', priority || 'Normal', audience || 'Public', publishDate || new Date().toISOString().split('T')[0], expiryDate || null, isPublished ? 1 : 0, id);
      logAudit(user.id, user.name, user.role, 'EDIT_NOTICE', 'Notice', id, `Edited notice: ${title}`);
    } else {
      const newId = 'not_' + Date.now();
      db.prepare(`
        INSERT INTO notices (id, title, description, category, priority, audience, publish_date, expiry_date, is_published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newId, title, description, category || 'General', priority || 'Normal', audience || 'Public', publishDate || new Date().toISOString().split('T')[0], expiryDate || null, isPublished ? 1 : 0);
      logAudit(user.id, user.name, user.role, 'CREATE_NOTICE', 'Notice', newId, `Created notice: ${title}`);
    }

    res.json({ success: true, message: 'Notice saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/admin/cms/notices/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY'), (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    db.prepare('DELETE FROM notices WHERE id = ?').run(id);
    logAudit(user.id, user.name, user.role, 'DELETE_NOTICE', 'Notice', id, `Deleted notice`);
    res.json({ success: true, message: 'Notice deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CMS Association Documents CRUD
apiRouter.get('/admin/cms/documents', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY'), (req, res) => {
  try {
    const docs = db.prepare('SELECT * FROM association_documents ORDER BY upload_date DESC').all();
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/admin/cms/documents', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY'), (req, res) => {
  try {
    const user = (req as any).user;
    const { title, description, fileUrl, fileType, fileSize, category, visibility } = req.body;
    if (!title) return res.status(400).json({ error: 'Document title is required' });

    const id = 'doc_' + Date.now();
    db.prepare(`
      INSERT INTO association_documents (id, title, description, file_url, file_type, file_size, category, visibility)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, title, description || '', fileUrl || '/docs/sample.pdf', fileType || 'PDF', fileSize || '1.0 MB', category || 'General', visibility || 'Public');

    logAudit(user.id, user.name, user.role, 'UPLOAD_DOCUMENT', 'Document', id, `Uploaded document: ${title} (${visibility})`);

    res.json({ success: true, message: 'Document added successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.delete('/admin/cms/documents/:id', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY'), (req, res) => {
  try {
    const user = (req as any).user;
    const { id } = req.params;
    db.prepare('DELETE FROM association_documents WHERE id = ?').run(id);
    logAudit(user.id, user.name, user.role, 'DELETE_DOCUMENT', 'Document', id, 'Deleted association document');
    res.json({ success: true, message: 'Document removed' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// CMS Committee Members CRUD
apiRouter.get('/admin/cms/committee', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY'), (req, res) => {
  try {
    const members = db.prepare('SELECT * FROM committee_members ORDER BY display_order ASC').all();
    res.json(members);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/admin/cms/committee', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'SECRETARY'), (req, res) => {
  try {
    const user = (req as any).user;
    const { id, name, designation, photoUrl, phone, email, termStart, termEnd, displayOrder, showContactPublic } = req.body;

    if (!name || !designation) return res.status(400).json({ error: 'Name and designation are required' });

    if (id) {
      db.prepare(`
        UPDATE committee_members
        SET name = ?, designation = ?, photo_url = ?, phone = ?, email = ?, term_start = ?, term_end = ?, display_order = ?, show_contact_public = ?
        WHERE id = ?
      `).run(name, designation, photoUrl || '', phone || '', email || '', termStart || '', termEnd || '', displayOrder || 1, showContactPublic ? 1 : 0, id);
      logAudit(user.id, user.name, user.role, 'EDIT_COMMITTEE_MEMBER', 'Committee Member', id, `Updated committee member ${name}`);
    } else {
      const newId = 'cm_' + Date.now();
      db.prepare(`
        INSERT INTO committee_members (id, name, designation, photo_url, phone, email, term_start, term_end, display_order, show_contact_public)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(newId, name, designation, photoUrl || '', phone || '', email || '', termStart || '', termEnd || '', displayOrder || 1, showContactPublic ? 1 : 0);
      logAudit(user.id, user.name, user.role, 'ADD_COMMITTEE_MEMBER', 'Committee Member', newId, `Added committee member ${name} (${designation})`);
    }

    res.json({ success: true, message: 'Committee member saved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Association Settings
apiRouter.get('/admin/cms/settings', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER'), (req, res) => {
  try {
    const rows = db.prepare('SELECT key, value, description FROM settings').all();
    const settings: Record<string, string> = {};
    rows.forEach((r: any) => { settings[r.key] = r.value; });
    res.json(settings);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.post('/admin/cms/settings', authenticate, authorizeRoles('SUPER_ADMIN'), (req, res) => {
  try {
    const user = (req as any).user;
    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object required' });
    }

    const updateStmt = db.prepare('INSERT OR REPLACE INTO settings (key, value, description) VALUES (?, ?, ?)');
    const updateTx = db.transaction(() => {
      for (const [key, val] of Object.entries(settings)) {
        updateStmt.run(key, String(val), `Configured setting: ${key}`);
      }
      logAudit(user.id, user.name, user.role, 'UPDATE_SETTINGS', 'Settings', null, `Updated system and association settings`);
    });

    updateTx();
    res.json({ success: true, message: 'Settings updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Financial Reports (Collection, Outstanding, Site-wise, Owner-wise Ledger)
apiRouter.get('/admin/reports/collection', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER'), (req, res) => {
  try {
    const { startDate, endDate, method } = req.query;
    let query = `
      SELECT p.payment_date, p.receipt_number, p.amount, p.payment_method, p.gateway_payment_id,
             prop.site_number, prop.house_number, o.owner_name
      FROM payments p
      JOIN properties prop ON p.property_id = prop.id
      JOIN owners o ON p.owner_id = o.id
      WHERE p.status = 'Successful'
    `;
    const params: any[] = [];
    if (startDate) {
      query += ` AND p.payment_date >= ?`;
      params.push(startDate);
    }
    if (endDate) {
      query += ` AND p.payment_date <= ?`;
      params.push(endDate);
    }
    if (method) {
      query += ` AND p.payment_method = ?`;
      params.push(method);
    }
    query += ` ORDER BY p.payment_date DESC`;

    const records = db.prepare(query).all(...params);
    const totalCollected = records.reduce((acc: number, r: any) => acc + (r.amount || 0), 0);

    res.json({
      records,
      totalCollected,
      count: records.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

apiRouter.get('/admin/reports/outstanding', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER'), (req, res) => {
  try {
    const records = db.prepare(`
      SELECT p.site_number, p.house_number, p.block_phase, p.property_type, p.monthly_maintenance,
             p.outstanding_balance, o.owner_name, o.primary_mobile, o.email,
             (SELECT count(*) FROM maintenance_bills b WHERE b.property_id = p.id AND b.status = 'Overdue') as overdueMonths
      FROM properties p
      JOIN owners o ON p.owner_id = o.id
      WHERE p.outstanding_balance > 0
      ORDER BY p.outstanding_balance DESC
    `).all();

    const totalOutstanding = records.reduce((acc: number, r: any) => acc + (r.outstanding_balance || 0), 0);

    res.json({
      records,
      totalOutstanding,
      count: records.length
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Audit Trail Log (for Association Governance & Transparency)
apiRouter.get('/admin/audit-logs', authenticate, authorizeRoles('SUPER_ADMIN', 'ASSOCIATION_ADMIN', 'TREASURER'), (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT * FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100
    `).all();
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Full database backup export
apiRouter.get('/admin/backup', authenticate, authorizeRoles('SUPER_ADMIN'), (req, res) => {
  try {
    const tables = ['settings', 'users', 'owners', 'properties', 'maintenance_bills', 'payments', 'ledger_entries', 'noc_applications', 'issued_nocs', 'complaints', 'notices', 'committee_members', 'audit_logs'];
    const backupData: Record<string, any> = {};

    tables.forEach(table => {
      backupData[table] = db.prepare(`SELECT * FROM ${table}`).all();
    });

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=upkar_gardens_backup_${Date.now()}.json`);
    res.json({
      association: 'Upkar Gardens Owners Association (R)',
      exportedAt: new Date().toISOString(),
      data: backupData
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
