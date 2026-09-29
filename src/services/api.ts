const TOKEN_KEY = 'upkar_auth_token';

export const authStorage = {
  getToken: () => localStorage.getItem(TOKEN_KEY),
  setToken: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  clearToken: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Network request failed');
  }

  return data;
}

export const api = {
  // Public
  getAssociationInfo: () => request<any>(`/api/public/association?_t=${Date.now()}`),
  getCommittee: () => request<any[]>('/api/public/committee'),
  getNotices: () => request<any[]>('/api/public/notices'),
  getAnnouncements: () => request<any[]>('/api/public/announcements'),
  getEvents: () => request<any[]>('/api/public/events'),
  getDocuments: () => request<any[]>('/api/public/documents'),
  getRules: () => request<any[]>('/api/public/rules'),
  getFaqs: () => request<any[]>('/api/public/faqs'),
  submitContact: (data: any) => request<any>('/api/public/contact', { method: 'POST', body: JSON.stringify(data) }),
  verifyNoc: (nocNumber: string) => request<any>(`/api/public/verify-noc/${encodeURIComponent(nocNumber)}`),

  // Auth
  login: (credentials: { username: string; password: string }) => 
    request<any>('/api/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  requestOwnerOtp: (siteNumber: string, mobileNumber: string) =>
    request<any>('/api/auth/owner-otp-request', { method: 'POST', body: JSON.stringify({ siteNumber, mobileNumber }) }),
  verifyOwnerOtp: (siteNumber: string, mobileNumber: string, otp: string) =>
    request<any>('/api/auth/owner-otp-verify', { method: 'POST', body: JSON.stringify({ siteNumber, mobileNumber, otp }) }),
  getMe: () => request<any>('/api/auth/me'),

  // Owner Portal
  getOwnerDashboard: () => request<any>('/api/owner/dashboard'),
  getOwnerBills: () => request<any[]>('/api/owner/bills'),
  getOwnerLedger: () => request<any>('/api/owner/ledger'),
  getOwnerPayments: () => request<any[]>('/api/owner/payments'),
  getOwnerReceipt: (receiptNumber: string) => request<any>(`/api/owner/receipt/${encodeURIComponent(receiptNumber)}`),
  payMaintenance: (data: { amount: number; paymentMethod: string; billId?: string; gatewayReference?: string }) =>
    request<any>('/api/owner/pay', { method: 'POST', body: JSON.stringify(data) }),
  getNocTypes: () => request<any[]>('/api/owner/noc-types'),
  getOwnerNocApplications: () => request<any[]>('/api/owner/noc-applications'),
  submitNocApplication: (data: any) => request<any>('/api/owner/noc-apply', { method: 'POST', body: JSON.stringify(data) }),
  getOwnerComplaints: () => request<any[]>('/api/owner/complaints'),
  submitComplaint: (data: any) => request<any>('/api/owner/complaints', { method: 'POST', body: JSON.stringify(data) }),
  getNotifications: () => request<any[]>('/api/owner/notifications'),
  markNotificationsRead: () => request<any>('/api/owner/notifications/read', { method: 'POST' }),

  // Admin Portal
  getAdminStats: () => request<any>('/api/admin/dashboard-stats'),
  getAdminAnalytics: () => request<any>('/api/admin/maintenance-analytics'),
  getAdminProperties: (params?: { search?: string; block?: string; status?: string; category?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/api/admin/properties${q ? '?' + q : ''}`);
  },
  createProperty: (data: any) => request<any>('/api/admin/properties', { method: 'POST', body: JSON.stringify(data) }),
  updateProperty: (id: string, data: any) => request<any>(`/api/admin/properties/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  syncDemarcatedSites: (count?: number, resetBlank?: boolean) => 
    request<any>('/api/admin/properties/sync-demarcated-sites', { method: 'POST', body: JSON.stringify({ count, resetBlank }) }),
  setHistoricalArrears: (id: string, data: any) => request<any>(`/api/admin/properties/${id}/historical-arrears`, { method: 'POST', body: JSON.stringify(data) }),
  getAdminOwners: () => request<any[]>('/api/admin/owners'),
  createOwner: (data: any) => request<any>('/api/admin/owners', { method: 'POST', body: JSON.stringify(data) }),
  updateOwner: (id: string, data: any) => request<any>(`/api/admin/owners/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  transferOwner: (data: any) => request<any>('/api/admin/owners/transfer', { method: 'POST', body: JSON.stringify(data) }),
  importOwners: (rows: any[]) => request<any>('/api/admin/import-owners', { method: 'POST', body: JSON.stringify({ rows }) }),

  getAdminBills: (params?: { period?: string; status?: string; site?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/api/admin/bills${q ? '?' + q : ''}`);
  },
  generateBills: (data: any) => request<any>('/api/admin/bills/generate', { method: 'POST', body: JSON.stringify(data) }),
  createSpecialCharge: (data: any) => request<any>('/api/admin/special-charges', { method: 'POST', body: JSON.stringify(data) }),
  createAdjustment: (data: any) => request<any>('/api/admin/adjustments', { method: 'POST', body: JSON.stringify(data) }),
  getAdminPayments: (params?: { search?: string; status?: string; method?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/api/admin/payments${q ? '?' + q : ''}`);
  },
  reconcilePayment: (data: { paymentId: string; newStatus: string; remarks?: string }) =>
    request<any>('/api/admin/payments/reconcile', { method: 'POST', body: JSON.stringify(data) }),
  
  getAdminNocApplications: (params?: { status?: string; type?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/api/admin/noc/applications${q ? '?' + q : ''}`);
  },
  actionNocApplication: (data: { applicationId: string; action: string; remarks?: string }) =>
    request<any>('/api/admin/noc/action', { method: 'POST', body: JSON.stringify(data) }),
  issueNocCertificate: (data: any) => request<any>('/api/admin/noc/issue', { method: 'POST', body: JSON.stringify(data) }),

  getAdminComplaints: (params?: { status?: string; category?: string }) => {
    const q = new URLSearchParams(params as any).toString();
    return request<any[]>(`/api/admin/complaints${q ? '?' + q : ''}`);
  },
  updateComplaint: (id: string, data: any) =>
    request<any>(`/api/admin/complaints/${id}/update`, { method: 'POST', body: JSON.stringify(data) }),

  // CMS
  getCmsNotices: () => request<any[]>('/api/admin/cms/notices'),
  saveCmsNotice: (data: any) => request<any>('/api/admin/cms/notices', { method: 'POST', body: JSON.stringify(data) }),
  deleteCmsNotice: (id: string) => request<any>(`/api/admin/cms/notices/${id}`, { method: 'DELETE' }),

  getCmsDocuments: () => request<any[]>('/api/admin/cms/documents'),
  saveCmsDocument: (data: any) => request<any>('/api/admin/cms/documents', { method: 'POST', body: JSON.stringify(data) }),
  deleteCmsDocument: (id: string) => request<any>(`/api/admin/cms/documents/${id}`, { method: 'DELETE' }),

  getCmsCommittee: () => request<any[]>('/api/admin/cms/committee'),
  saveCmsCommittee: (data: any) => request<any>('/api/admin/cms/committee', { method: 'POST', body: JSON.stringify(data) }),
  deleteCmsCommittee: (id: string) => request<any>(`/api/admin/cms/committee/${id}`, { method: 'DELETE' }),

  getCmsSettings: () => request<any>('/api/admin/cms/settings'),
  saveCmsSettings: (settings: Record<string, string>) =>
    request<any>('/api/admin/cms/settings', { method: 'POST', body: JSON.stringify({ settings }) }),
  syncCmsWebsite: (data?: { updatedDate?: string; settings?: Record<string, string> }) =>
    request<any>('/api/admin/cms/sync-website', { method: 'POST', body: JSON.stringify(data || {}) }),

  // Reports & Logs
  getCollectionReport: (params?: any) => {
    const q = new URLSearchParams(params).toString();
    return request<any>(`/api/admin/reports/collection${q ? '?' + q : ''}`);
  },
  getOutstandingReport: () => request<any>('/api/admin/reports/outstanding'),
  getAuditLogs: () => request<any[]>('/api/admin/audit-logs'),
};
