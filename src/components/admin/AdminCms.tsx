import React, { useState, useEffect, useRef } from 'react';
import { 
  Globe, Bell, Users, FileText, Plus, Edit, Trash2, CheckCircle2, ShieldCheck,
  Upload, Image as ImageIcon, Camera, KeyRound, Shield, Eye, EyeOff, Sparkles, Check, AlertCircle, X,
  RefreshCw, Phone, Mail, Building, Calendar
} from 'lucide-react';
import { api } from '../../services/api';
import { Notice, CommitteeMember, AssociationDocument, UserRole } from '../../types';

const PRESET_AVATARS = [
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&fit=crop&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=300&fit=crop&q=80'
];

const AVAILABLE_PERMISSIONS = [
  { id: 'manage_properties', label: 'Site Directory & Historical Arrears', desc: 'Add/edit sites, calculate pending maintenance from reg date' },
  { id: 'manage_owners', label: 'Owner Registry & Transfers', desc: 'Maintain owner records, contact details and title transfers' },
  { id: 'manage_billing', label: 'Maintenance Billing', desc: 'Generate monthly bills, record waivers and adjustments' },
  { id: 'manage_payments', label: 'Payments & Ledgers', desc: 'Reconcile gateway payments and enter offline bank collections' },
  { id: 'manage_noc', label: 'NOC Applications & Certificates', desc: 'Review, approve, and officially seal issued NOCs' },
  { id: 'manage_complaints', label: 'Grievance Helpdesk', desc: 'Assign complaints, update work status, and log resolutions' },
  { id: 'manage_cms', label: 'Public Website CMS', desc: 'Publish official circulars, bylaws, and layout documents' },
  { id: 'manage_committee', label: 'Committee Roster & Portal Access', desc: 'Configure managing committee members and credentials' },
  { id: 'view_reports', label: 'Financial Reports & Audit Trail', desc: 'View collection analytics, outstanding lists, and activity logs' },
  { id: 'manage_settings', label: 'System Configuration', desc: 'Update association rules, payment gateway, and notification keys' },
];

export const AdminCms: React.FC = () => {
  const [activeSubTab, setActiveSubTab] = useState<'NOTICES' | 'COMMITTEE' | 'DOCUMENTS' | 'SETTINGS'>('NOTICES');

  // Notices State
  const [notices, setNotices] = useState<Notice[]>([]);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeDesc, setNoticeDesc] = useState('');
  const [noticeCategory, setNoticeCategory] = useState('General');
  const [noticePriority, setNoticePriority] = useState<'Normal' | 'Important' | 'Urgent'>('Normal');
  const [noticeAudience, setNoticeAudience] = useState('Public');
  const [noticeDate, setNoticeDate] = useState(new Date().toISOString().split('T')[0]);

  // Committee State
  const [committee, setCommittee] = useState<CommitteeMember[]>([]);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState<CommitteeMember | null>(null);
  const [memberName, setMemberName] = useState('');
  const [memberRole, setMemberRole] = useState('Committee Member');
  const [memberPhotoUrl, setMemberPhotoUrl] = useState('');
  const [memberPhone, setMemberPhone] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberOrder, setMemberOrder] = useState(1);
  const [memberPublicContact, setMemberPublicContact] = useState(true);
  const [memberTermStart, setMemberTermStart] = useState('2024-10-01');
  const [memberTermEnd, setMemberTermEnd] = useState('2026-09-30');
  
  // Portal Access Rights State
  const [memberPortalAccess, setMemberPortalAccess] = useState(false);
  const [memberAccessRole, setMemberAccessRole] = useState<UserRole>('COMMITTEE_MEMBER');
  const [memberLoginUsername, setMemberLoginUsername] = useState('');
  const [memberLoginPassword, setMemberLoginPassword] = useState('');
  const [showMemberPassword, setShowMemberPassword] = useState(false);
  const [memberPermissions, setMemberPermissions] = useState<string[]>([]);
  const [memberFormSubmitting, setMemberFormSubmitting] = useState(false);
  const [memberModalTab, setMemberModalTab] = useState<'DETAILS' | 'PHOTO' | 'ACCESS'>('DETAILS');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Documents State
  const [documents, setDocuments] = useState<AssociationDocument[]>([]);
  const [showDocModal, setShowDocModal] = useState(false);
  const [docTitle, setDocTitle] = useState('');
  const [docDesc, setDocDesc] = useState('');
  const [docCategory, setDocCategory] = useState('Association Documents');
  const [docVisibility, setDocVisibility] = useState<'Public' | 'Owners' | 'Admin'>('Public');

  // Association Info State
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [syncingWebsite, setSyncingWebsite] = useState(false);
  const [syncSuccessMsg, setSyncSuccessMsg] = useState<string | null>(null);

  const fetchCmsData = () => {
    Promise.all([
      api.getCmsNotices(),
      api.getCmsCommittee(),
      api.getCmsDocuments(),
      api.getCmsSettings()
    ])
      .then(([n, c, d, s]) => {
        setNotices(n || []);
        setCommittee(c || []);
        setDocuments(d || []);
        setSettings(s || {});
      })
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchCmsData();
  }, []);

  // Handle Photo File Upload with client-side canvas compression
  const handlePhotoFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 320;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setMemberPhotoUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Helper to suggest role-based permissions
  const applyRolePermissionDefaults = (role: UserRole) => {
    setMemberAccessRole(role);
    if (role === 'SUPER_ADMIN') {
      setMemberPermissions(AVAILABLE_PERMISSIONS.map(p => p.id));
    } else if (role === 'ASSOCIATION_ADMIN') {
      setMemberPermissions([
        'manage_properties', 'manage_owners', 'manage_billing', 'manage_payments',
        'manage_noc', 'manage_complaints', 'manage_cms', 'manage_committee', 'view_reports'
      ]);
    } else if (role === 'TREASURER') {
      setMemberPermissions(['manage_properties', 'manage_billing', 'manage_payments', 'view_reports']);
    } else if (role === 'SECRETARY') {
      setMemberPermissions(['manage_owners', 'manage_noc', 'manage_complaints', 'manage_cms', 'view_reports']);
    } else if (role === 'COMMITTEE_MEMBER') {
      setMemberPermissions(['manage_complaints', 'view_reports']);
    } else if (role === 'STAFF') {
      setMemberPermissions(['manage_complaints']);
    }
  };

  const generateSuggestedUsername = (name: string, role: string) => {
    let base = name.trim().toLowerCase().replace(/[^a-z0-9]/g, '.').replace(/\.+/g, '.').replace(/^\.|\.$/g, '');
    if (base.startsWith('sri.') || base.startsWith('smt.') || base.startsWith('dr.')) {
      base = base.replace(/^(sri\.|smt\.|dr\.)/, '');
    }
    if (role === 'TREASURER') return 'treasurer';
    if (role === 'SECRETARY') return 'secretary';
    if (role === 'SUPER_ADMIN') return 'president';
    return base || 'member';
  };

  // Open Add Committee Member
  const handleOpenAddMember = () => {
    setEditingMember(null);
    setMemberName('');
    setMemberRole('Committee Member');
    setMemberPhotoUrl('');
    setMemberPhone('');
    setMemberEmail('');
    setMemberOrder(committee.length + 1);
    setMemberPublicContact(true);
    setMemberTermStart('2024-10-01');
    setMemberTermEnd('2026-09-30');
    setMemberPortalAccess(false);
    setMemberAccessRole('COMMITTEE_MEMBER');
    setMemberLoginUsername('');
    setMemberLoginPassword('upkar123');
    setMemberPermissions(['manage_complaints', 'view_reports']);
    setMemberModalTab('DETAILS');
    setShowMemberModal(true);
  };

  // Open Edit Committee Member
  const handleOpenEditMember = (c: CommitteeMember) => {
    setEditingMember(c);
    setMemberName(c.name);
    setMemberRole(c.designation);
    setMemberPhotoUrl(c.photo_url || '');
    setMemberPhone(c.phone || '');
    setMemberEmail(c.email || '');
    setMemberOrder(c.display_order);
    setMemberPublicContact(c.show_contact_public === 1);
    setMemberTermStart(c.term_start || '2024-10-01');
    setMemberTermEnd(c.term_end || '2026-09-30');

    const hasAccess = Boolean(c.portal_access_enabled || (c.access_role && c.access_role !== 'NO_ACCESS'));
    setMemberPortalAccess(hasAccess);
    setMemberAccessRole(hasAccess && c.access_role && c.access_role !== 'NO_ACCESS' ? (c.access_role as UserRole) : 'COMMITTEE_MEMBER');
    setMemberLoginUsername(c.login_username || generateSuggestedUsername(c.name, c.designation));
    setMemberLoginPassword('');
    
    let permissions: string[] = [];
    if (c.access_permissions) {
      if (Array.isArray(c.access_permissions)) permissions = c.access_permissions;
      else if (typeof c.access_permissions === 'string') {
        try { permissions = JSON.parse(c.access_permissions); } catch (_) { permissions = c.access_permissions.split(','); }
      }
    }
    if (permissions.length === 0) {
      // Default based on role
      if (c.access_role === 'SUPER_ADMIN') permissions = AVAILABLE_PERMISSIONS.map(p => p.id);
      else if (c.access_role === 'TREASURER') permissions = ['manage_properties', 'manage_billing', 'manage_payments', 'view_reports'];
      else if (c.access_role === 'SECRETARY') permissions = ['manage_owners', 'manage_noc', 'manage_complaints', 'manage_cms', 'view_reports'];
      else permissions = ['manage_complaints', 'view_reports'];
    }
    setMemberPermissions(permissions);
    setMemberModalTab('DETAILS');
    setShowMemberModal(true);
  };

  // Save Committee Member
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!memberName || !memberRole) {
      alert('Please provide member name and designation');
      return;
    }

    setMemberFormSubmitting(true);
    try {
      await api.saveCmsCommittee({
        id: editingMember?.id,
        name: memberName,
        designation: memberRole,
        photoUrl: memberPhotoUrl,
        phone: memberPhone,
        email: memberEmail,
        termStart: memberTermStart,
        termEnd: memberTermEnd,
        displayOrder: memberOrder,
        showContactPublic: memberPublicContact,
        portalAccessEnabled: memberPortalAccess,
        accessRole: memberPortalAccess ? memberAccessRole : 'NO_ACCESS',
        accessPermissions: memberPermissions,
        loginUsername: memberLoginUsername,
        loginPassword: memberLoginPassword || undefined
      });
      setShowMemberModal(false);
      fetchCmsData();
    } catch (err: any) {
      alert('Failed to save committee member: ' + (err.message || 'Unknown error'));
    } finally {
      setMemberFormSubmitting(false);
    }
  };

  // Notice Actions
  const handleSaveNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveCmsNotice({
      id: editingNotice?.id,
      title: noticeTitle,
      description: noticeDesc,
      category: noticeCategory,
      priority: noticePriority,
      audience: noticeAudience,
      publishDate: noticeDate,
      isPublished: true
    });
    setShowNoticeModal(false);
    fetchCmsData();
  };

  const handleDeleteNotice = async (id: string) => {
    if (confirm('Are you sure you want to delete this notice?')) {
      await api.deleteCmsNotice(id);
      fetchCmsData();
    }
  };

  // Committee Actions
  const handleDeleteMember = async (id: string) => {
    if (confirm('Delete this committee member record?')) {
      await api.deleteCmsCommittee(id);
      fetchCmsData();
    }
  };

  // Documents Actions
  const handleSaveDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveCmsDocument({
      title: docTitle,
      description: docDesc,
      category: docCategory,
      visibility: docVisibility,
      fileUrl: '/docs/sample_doc.pdf',
      fileType: 'PDF',
      fileSize: '1.5 MB'
    });
    setShowDocModal(false);
    fetchCmsData();
  };

  const handleDeleteDoc = async (id: string) => {
    if (confirm('Delete this association document?')) {
      await api.deleteCmsDocument(id);
      fetchCmsData();
    }
  };

  // Settings Save & Synchronize Website
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSaved(false);
    setSyncSuccessMsg(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const payload = {
        ...settings,
        website_cms_updated_date: settings.website_cms_updated_date || today
      };
      const res = await api.saveCmsSettings(payload);
      if (res && res.settings) {
        setSettings(res.settings);
      }
      setSettingsSaved(true);
      window.dispatchEvent(new CustomEvent('cms-updated'));
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSyncWebsite = async () => {
    setSyncingWebsite(true);
    setSyncSuccessMsg(null);
    try {
      const today = new Date().toISOString().split('T')[0];
      const res = await api.syncCmsWebsite({
        updatedDate: settings.website_cms_updated_date || today,
        settings
      });
      if (res && res.settings) {
        setSettings(res.settings);
      }
      setSyncSuccessMsg(`Website data successfully synchronized across all pages as of ${res?.updatedDate || today}!`);
      window.dispatchEvent(new CustomEvent('cms-updated'));
      setTimeout(() => setSyncSuccessMsg(null), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to sync website');
    } finally {
      setSyncingWebsite(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Website Content Management System (CMS)</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Administer public website information, published circulars, committee roster, and document libraries.
          </p>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
        <button
          onClick={() => setActiveSubTab('NOTICES')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'NOTICES' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Notices ({notices.length})
        </button>
        <button
          onClick={() => setActiveSubTab('COMMITTEE')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'COMMITTEE' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Committee ({committee.length})
        </button>
        <button
          onClick={() => setActiveSubTab('DOCUMENTS')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'DOCUMENTS' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Documents ({documents.length})
        </button>
        <button
          onClick={() => setActiveSubTab('SETTINGS')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
            activeSubTab === 'SETTINGS' ? 'bg-white text-emerald-950 shadow-xs' : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Association Profile CMS
        </button>
      </div>

      {/* NOTICES SUBTAB */}
      {activeSubTab === 'NOTICES' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingNotice(null);
                setNoticeTitle('');
                setNoticeDesc('');
                setNoticeCategory('General');
                setNoticePriority('Normal');
                setNoticeAudience('Public');
                setShowNoticeModal(true);
              }}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Create Notice</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {notices.map((n) => (
              <div key={n.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                    <span className="font-bold text-emerald-800">{n.category}</span>
                    <span>·</span>
                    <span>{n.publish_date}</span>
                    <span>·</span>
                    <span>Audience: {n.audience}</span>
                    <span className={`font-bold ${n.priority === 'Urgent' ? 'text-red-600' : 'text-slate-600'}`}>
                      ({n.priority})
                    </span>
                  </div>
                  <h4 className="font-bold text-slate-900 text-sm">{n.title}</h4>
                  <p className="text-xs text-slate-600 line-clamp-1">{n.description}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingNotice(n);
                      setNoticeTitle(n.title);
                      setNoticeDesc(n.description);
                      setNoticeCategory(n.category);
                      setNoticePriority(n.priority);
                      setNoticeAudience(n.audience);
                      setNoticeDate(n.publish_date);
                      setShowNoticeModal(true);
                    }}
                    className="p-1.5 text-slate-600 hover:text-emerald-800 transition cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteNotice(n.id)}
                    className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* COMMITTEE SUBTAB */}
      {activeSubTab === 'COMMITTEE' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Managing Committee & Executive Portal Access</h3>
              <p className="text-xs text-slate-500">
                Manage executive leadership, upload official member photographs, and configure portal login credentials and role-based access rights.
              </p>
            </div>
            <button
              onClick={handleOpenAddMember}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Add Committee Member</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {committee.map((c) => {
              const hasAccess = Boolean(c.portal_access_enabled || (c.access_role && c.access_role !== 'NO_ACCESS'));
              return (
                <div key={c.id} className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition">
                  <div className="flex items-start gap-3.5">
                    {/* Member Photo Thumbnail */}
                    <div className="relative shrink-0">
                      {c.photo_url ? (
                        <img
                          src={c.photo_url}
                          alt={c.name}
                          className="w-13 h-13 rounded-xl object-cover border-2 border-emerald-700 shadow-2xs"
                        />
                      ) : (
                        <div className="w-13 h-13 rounded-xl bg-emerald-50 border-2 border-dashed border-emerald-300 flex flex-col items-center justify-center text-emerald-800">
                          <Users className="w-5 h-5 text-emerald-700" />
                          <span className="text-[9px] font-bold mt-0.5">No Photo</span>
                        </div>
                      )}
                      <span className="absolute -bottom-1 -right-1 bg-emerald-950 text-amber-300 font-mono text-[9px] px-1.5 py-0.2 rounded font-bold border border-white">
                        #{c.display_order}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                        <span className="text-xs font-bold text-emerald-800 px-2 py-0.5 bg-emerald-50 rounded border border-emerald-200">
                          {c.designation}
                        </span>
                        
                        {/* Portal Access Rights Badge */}
                        {hasAccess ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-bold bg-amber-100 text-amber-950 border border-amber-300">
                            <KeyRound className="w-3 h-3 text-amber-700" />
                            <span>Portal: {c.access_role}</span>
                            {c.login_username && (
                              <span className="text-amber-800 font-mono font-normal">(@{c.login_username})</span>
                            )}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200">
                            <Shield className="w-3 h-3 text-slate-400" />
                            <span>No Portal Access</span>
                          </span>
                        )}
                      </div>

                      <div className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span>Phone: <strong className="text-slate-700 font-mono">{c.phone || 'N/A'}</strong></span>
                        <span>·</span>
                        <span>Email: <strong className="text-slate-700">{c.email || 'N/A'}</strong></span>
                        <span>·</span>
                        <span>Term: {c.term_start || '2024'} – {c.term_end || '2026'}</span>
                        <span>·</span>
                        <span>Public: <strong className={c.show_contact_public ? 'text-emerald-700' : 'text-slate-400'}>{c.show_contact_public ? 'Visible' : 'Hidden'}</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => handleOpenEditMember(c)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 font-bold rounded-lg text-xs transition cursor-pointer flex items-center gap-1.5 border border-slate-200"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit & Access</span>
                    </button>
                    <button
                      onClick={() => handleDeleteMember(c.id)}
                      title="Delete Member"
                      className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* DOCUMENTS SUBTAB */}
      {activeSubTab === 'DOCUMENTS' && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setDocTitle('');
                setDocDesc('');
                setDocCategory('Association Documents');
                setDocVisibility('Public');
                setShowDocModal(true);
              }}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Document Record</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {documents.map((d) => (
              <div key={d.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{d.title}</h4>
                  <div className="text-xs text-slate-500">
                    Category: {d.category} · Visibility: <strong className="text-emerald-800">{d.visibility}</strong> · Size: {d.file_size}
                  </div>
                  {d.description && <p className="text-xs text-slate-600 mt-1">{d.description}</p>}
                </div>

                <button
                  onClick={() => handleDeleteDoc(d.id)}
                  className="p-1.5 text-slate-400 hover:text-red-600 transition cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SETTINGS SUBTAB */}
      {activeSubTab === 'SETTINGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header & Sync Status Banner */}
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-200 gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-emerald-800" />
                <h3 className="font-bold text-base text-slate-900">Official Association Identity & Website CMS Synchronization</h3>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Manage statutory information, site count, phone numbers, office address, and admin details synchronized across all public website pages.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleSyncWebsite}
                disabled={syncingWebsite}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingWebsite ? 'animate-spin' : ''}`} />
                <span>{syncingWebsite ? 'Synchronizing...' : 'Sync Website Now'}</span>
              </button>
            </div>
          </div>

          {/* Sync Status Card */}
          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-900 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Calendar className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Website Synchronization Status
                </span>
                <span className="text-sm font-extrabold text-emerald-950">
                  Last CMS Synchronized Date: <span className="font-mono text-emerald-900">{settings['website_cms_updated_date'] || new Date().toISOString().split('T')[0]}</span>
                </span>
                <p className="text-[11px] text-emerald-800 mt-0.5">
                  Synchronizes registration number, site count ({settings['total_sites_count'] || '176'}), phone numbers, address, and admin details across Navbar, Home, About, Contact & Footer.
                </p>
              </div>
            </div>
            <div className="shrink-0">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Active & Synced</span>
              </span>
            </div>
          </div>

          {syncSuccessMsg && (
            <div className="p-3 bg-emerald-100/90 text-emerald-950 rounded-xl text-xs font-medium flex items-center gap-2 border border-emerald-300 animate-fadeIn">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{syncSuccessMsg}</span>
            </div>
          )}

          {settingsSaved && !syncSuccessMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-medium flex items-center gap-2 border border-emerald-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Association settings saved and synced across website successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-6">
            {/* 1. Statutory Identity & Demarcation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-emerald-900">
                <Building className="w-3.5 h-3.5 text-emerald-700" />
                <span>1. Statutory Identity & Site Demarcation</span>
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Association Name</label>
                  <input
                    type="text"
                    value={settings['association_name'] || ''}
                    onChange={(e) => setSettings({ ...settings, association_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Government Registration Number (Reg No)</label>
                  <input
                    type="text"
                    value={settings['registration_number'] || ''}
                    onChange={(e) => setSettings({ ...settings, registration_number: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono font-bold text-slate-900"
                    placeholder="e.g. DRO-1/SOR/142/2018-19"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Date</label>
                  <input
                    type="date"
                    value={settings['registration_date'] || '2018-10-12'}
                    onChange={(e) => setSettings({ ...settings, registration_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-semibold text-slate-700">Number of Demarcated Sites</label>
                    <button
                      type="button"
                      onClick={async () => {
                        try {
                          const target = parseInt(settings['total_sites_count'] || '176', 10);
                          const res = await api.syncDemarcatedSites(target, true);
                          setSyncSuccessMsg(`Site directory updated: All ${res.count || target} sites created with owner details and block left blank.`);
                          setTimeout(() => setSyncSuccessMsg(null), 5000);
                        } catch (err: any) {
                          alert('Failed to sync site directory: ' + err.message);
                        }
                      }}
                      className="text-[10px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                      title="Generate all sites 1 to N in directory with blank owner & block"
                    >
                      Sync Directory (176 Sites)
                    </button>
                  </div>
                  <input
                    type="number"
                    value={settings['total_sites_count'] || '176'}
                    onChange={(e) => setSettings({ ...settings, total_sites_count: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono font-bold"
                    placeholder="176"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Website CMS Updated Date</label>
                  <input
                    type="date"
                    value={settings['website_cms_updated_date'] || new Date().toISOString().split('T')[0]}
                    onChange={(e) => setSettings({ ...settings, website_cms_updated_date: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-emerald-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono font-bold text-emerald-950 bg-emerald-50/50"
                  />
                </div>
              </div>
            </div>

            {/* 2. Registered Office & Helpline Numbers */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-emerald-900">
                <Phone className="w-3.5 h-3.5 text-emerald-700" />
                <span>2. Registered Layout Address & Contact Helplines</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Layout Office Address</label>
                <textarea
                  rows={2}
                  value={settings['address'] || ''}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  placeholder="Clubhouse & Association Office, Upkar Gardens Layout, Chandapura-Anekal Main Road, Bangalore - 560099"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Contact Phone (Office)</label>
                  <input
                    type="text"
                    value={settings['contact_phone'] || ''}
                    onChange={(e) => setSettings({ ...settings, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                    placeholder="+91 80 2783 4567"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">24/7 Security Gate & Emergency Desk</label>
                  <input
                    type="text"
                    value={settings['emergency_phone'] || ''}
                    onChange={(e) => setSettings({ ...settings, emergency_phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                    placeholder="+91 94801 23456"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Official Association Email</label>
                  <input
                    type="email"
                    value={settings['contact_email'] || ''}
                    onChange={(e) => setSettings({ ...settings, contact_email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    placeholder="contact@upkargardens.org"
                  />
                </div>
              </div>
            </div>

            {/* 3. Association Admin & Governance Details */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-emerald-900">
                <Users className="w-3.5 h-3.5 text-emerald-700" />
                <span>3. Association Admin & Leadership Details (Synced Across Website)</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Principal Admin / President Name</label>
                  <input
                    type="text"
                    value={settings['admin_name'] || ''}
                    onChange={(e) => setSettings({ ...settings, admin_name: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-bold"
                    placeholder="Sri. K. Venkatesh (President)"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Contact Phone</label>
                  <input
                    type="text"
                    value={settings['admin_phone'] || ''}
                    onChange={(e) => setSettings({ ...settings, admin_phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                    placeholder="+91 98450 12345"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Admin Official Email</label>
                  <input
                    type="email"
                    value={settings['admin_email'] || ''}
                    onChange={(e) => setSettings({ ...settings, admin_email: e.target.value })}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    placeholder="president@upkargardens.org"
                  />
                </div>
              </div>
            </div>

            {/* 4. Mission & Vision */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-emerald-900">
                <FileText className="w-3.5 h-3.5 text-emerald-700" />
                <span>4. Association Mission & Vision Statements</span>
              </h4>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Association Mission Statement</label>
                <textarea
                  rows={2}
                  value={settings['about_mission'] || ''}
                  onChange={(e) => setSettings({ ...settings, about_mission: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Association Vision Statement</label>
                <textarea
                  rows={2}
                  value={settings['about_vision'] || ''}
                  onChange={(e) => setSettings({ ...settings, about_vision: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={savingSettings}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>{savingSettings ? 'Saving & Syncing...' : 'Save & Sync Website Data'}</span>
              </button>

              <button
                type="button"
                onClick={handleSyncWebsite}
                disabled={syncingWebsite}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer border border-slate-300 flex items-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingWebsite ? 'animate-spin' : ''}`} />
                <span>{syncingWebsite ? 'Synchronizing...' : 'Sync Current Data'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Notice Modal */}
      {showNoticeModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {editingNotice ? 'Edit Notice' : 'Publish New Notice'}
              </h3>
              <button onClick={() => setShowNoticeModal(false)} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveNotice} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  value={noticeTitle}
                  onChange={(e) => setNoticeTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={noticeCategory}
                    onChange={(e) => setNoticeCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="General">General</option>
                    <option value="Maintenance Notice">Maintenance Notice</option>
                    <option value="Meeting Notice">Meeting Notice</option>
                    <option value="Water Notice">Water Notice</option>
                    <option value="Security Notice">Security Notice</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={noticePriority}
                    onChange={(e) => setNoticePriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Important">Important</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Audience</label>
                  <select
                    value={noticeAudience}
                    onChange={(e) => setNoticeAudience(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Public">Public (All Visitors)</option>
                    <option value="All Owners">Owners Only</option>
                    <option value="Committee Only">Committee Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Content *</label>
                <textarea
                  rows={4}
                  required
                  value={noticeDesc}
                  onChange={(e) => setNoticeDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Save & Publish Notice
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Committee Member Modal with Photo Upload & Portal Access Rights */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-bold text-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">
                    {editingMember ? `Edit Committee Member: ${editingMember.name}` : 'Add New Committee Member'}
                  </h3>
                  <p className="text-[11px] text-emerald-300">
                    Association leadership roster, official photograph, and executive portal access rights
                  </p>
                </div>
              </div>
              <button onClick={() => setShowMemberModal(false)} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            {/* Modal Internal Navigation Tabs */}
            <div className="bg-slate-100 px-5 pt-3 border-b border-slate-200 flex gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setMemberModalTab('DETAILS')}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  memberModalTab === 'DETAILS'
                    ? 'bg-white text-emerald-950 border-t border-x border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                <span>1. Member Profile</span>
              </button>

              <button
                type="button"
                onClick={() => setMemberModalTab('PHOTO')}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  memberModalTab === 'PHOTO'
                    ? 'bg-white text-emerald-950 border-t border-x border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-3.5 h-3.5" />
                <span>2. Member Photo {memberPhotoUrl && <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block"></span>}</span>
              </button>

              <button
                type="button"
                onClick={() => setMemberModalTab('ACCESS')}
                className={`px-3 py-1.5 rounded-t-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  memberModalTab === 'ACCESS'
                    ? 'bg-white text-emerald-950 border-t border-x border-slate-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>3. Portal Access Rights {memberPortalAccess && <span className="px-1.5 py-0.2 rounded text-[9px] bg-amber-400 text-amber-950 font-bold">Active</span>}</span>
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
              {/* TAB 1: DETAILS */}
              {memberModalTab === 'DETAILS' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Sri. K. Venkatesh"
                        value={memberName}
                        onChange={(e) => setMemberName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Role in Association *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. President / Treasurer / General Secretary"
                        value={memberRole}
                        onChange={(e) => setMemberRole(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-medium"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                      <input
                        type="text"
                        placeholder="e.g. +91 98450 12345"
                        value={memberPhone}
                        onChange={(e) => setMemberPhone(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Official Association Email</label>
                      <input
                        type="email"
                        placeholder="e.g. president@upkargardens.org"
                        value={memberEmail}
                        onChange={(e) => setMemberEmail(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Display Order</label>
                      <input
                        type="number"
                        min="1"
                        value={memberOrder}
                        onChange={(e) => setMemberOrder(parseInt(e.target.value, 10) || 1)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                      />
                      <span className="text-[10px] text-slate-400">Position in directory</span>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Term Start</label>
                      <input
                        type="date"
                        value={memberTermStart}
                        onChange={(e) => setMemberTermStart(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Term End</label>
                      <input
                        type="date"
                        value={memberTermEnd}
                        onChange={(e) => setMemberTermEnd(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                      />
                    </div>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <label className="flex items-center gap-2.5 text-xs font-medium text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={memberPublicContact}
                        onChange={(e) => setMemberPublicContact(e.target.checked)}
                        className="rounded text-emerald-800 w-4 h-4"
                      />
                      <span>Show phone number & email address on public website Committee Directory</span>
                    </label>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <span className="text-xs text-slate-400">Next: upload member photo or configure portal access</span>
                    <button
                      type="button"
                      onClick={() => setMemberModalTab('PHOTO')}
                      className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                    >
                      Next: Member Photo →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: PHOTO UPLOAD */}
              {memberModalTab === 'PHOTO' && (
                <div className="space-y-5">
                  <div className="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 text-xs text-emerald-950 flex items-start gap-3">
                    <ImageIcon className="w-5 h-5 text-emerald-800 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">Official Committee Member Photograph</strong>
                      <span>Upload a portrait photo for the portal directory. Images are automatically optimized and scaled for fast loading across devices.</span>
                    </div>
                  </div>

                  {/* Photo Preview & Upload Controls */}
                  <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="relative shrink-0">
                      {memberPhotoUrl ? (
                        <div className="relative group">
                          <img
                            src={memberPhotoUrl}
                            alt="Member Preview"
                            className="w-24 h-24 rounded-2xl object-cover border-3 border-emerald-700 shadow-sm"
                          />
                          <button
                            type="button"
                            onClick={() => setMemberPhotoUrl('')}
                            className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 shadow-md hover:bg-red-700 transition cursor-pointer"
                            title="Remove photo"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-24 h-24 rounded-2xl bg-white border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400">
                          <Camera className="w-8 h-8 text-slate-300" />
                          <span className="text-[10px] font-bold mt-1 text-slate-400">No Photo</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2.5 text-center sm:text-left flex-1">
                      <h4 className="font-bold text-slate-900 text-sm">Upload Photo from Device</h4>
                      <p className="text-xs text-slate-500">
                        Supports JPEG, PNG, WebP up to 10MB. Automatically formatted into professional avatar.
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <input
                          type="file"
                          ref={fileInputRef}
                          accept="image/*"
                          onChange={handlePhotoFileSelect}
                          className="hidden"
                        />
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Choose Image File</span>
                        </button>

                        {memberPhotoUrl && (
                          <button
                            type="button"
                            onClick={() => setMemberPhotoUrl('')}
                            className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg text-xs font-semibold transition cursor-pointer"
                          >
                            Remove Photo
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Option to paste image URL */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Or Specify Image URL Directly
                    </label>
                    <input
                      type="url"
                      placeholder="https://example.com/photos/member.jpg"
                      value={memberPhotoUrl.startsWith('data:') ? '' : memberPhotoUrl}
                      onChange={(e) => setMemberPhotoUrl(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                    />
                    {memberPhotoUrl.startsWith('data:') && (
                      <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                        ✓ Custom photo uploaded from your computer is attached.
                      </span>
                    )}
                  </div>

                  {/* Preset Avatar Gallery */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Or Select from Curated Committee Portrait Placeholders
                    </label>
                    <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                      {PRESET_AVATARS.map((url, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setMemberPhotoUrl(url)}
                          className={`relative rounded-xl overflow-hidden border-2 transition cursor-pointer aspect-square ${
                            memberPhotoUrl === url ? 'border-emerald-600 ring-2 ring-emerald-600' : 'border-slate-200 hover:border-slate-400'
                          }`}
                        >
                          <img src={url} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                          {memberPhotoUrl === url && (
                            <div className="absolute inset-0 bg-emerald-950/40 flex items-center justify-center">
                              <Check className="w-4 h-4 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMemberModalTab('DETAILS')}
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                    >
                      ← Back to Details
                    </button>
                    <button
                      type="button"
                      onClick={() => setMemberModalTab('ACCESS')}
                      className="px-4 py-2 bg-emerald-800 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                    >
                      Next: Portal Access Rights →
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: PORTAL ACCESS RIGHTS */}
              {memberModalTab === 'ACCESS' && (
                <div className="space-y-4">
                  {/* Master Portal Access Toggle */}
                  <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 flex items-center justify-between gap-4">
                    <div>
                      <h4 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-1.5">
                        <KeyRound className="w-4 h-4 text-emerald-800" />
                        <span>Enable Association Portal Access</span>
                      </h4>
                      <p className="text-[11px] text-slate-600 mt-0.5">
                        Allows this committee member to log in to the administrative console and manage association operations.
                      </p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={memberPortalAccess}
                        onChange={(e) => {
                          const val = e.target.checked;
                          setMemberPortalAccess(val);
                          if (val && !memberLoginUsername) {
                            setMemberLoginUsername(generateSuggestedUsername(memberName, memberRole));
                          }
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-800"></div>
                    </label>
                  </div>

                  {memberPortalAccess && (
                    <div className="space-y-4 pt-1">
                      {/* Access Role Selection */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Assigned Portal Access Role *
                        </label>
                        <select
                          value={memberAccessRole}
                          onChange={(e) => applyRolePermissionDefaults(e.target.value as UserRole)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-bold text-emerald-950"
                        >
                          <option value="SUPER_ADMIN">SUPER ADMIN (Full Master Governance & System Overrides)</option>
                          <option value="ASSOCIATION_ADMIN">ASSOCIATION ADMIN (Layout Management, Owners & CMS)</option>
                          <option value="TREASURER">TREASURER (Finance, Billing, Ledgers & Bank Collections)</option>
                          <option value="SECRETARY">GENERAL SECRETARY (Executive Notices, NOCs & Correspondence)</option>
                          <option value="COMMITTEE_MEMBER">COMMITTEE MEMBER (Grievance Inspection & Layout Review)</option>
                          <option value="STAFF">STAFF (Layout Supervisor & Field Inspections)</option>
                        </select>
                      </div>

                      {/* Login Credentials */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700">Portal Login Username *</label>
                            <button
                              type="button"
                              onClick={() => setMemberLoginUsername(generateSuggestedUsername(memberName, memberRole))}
                              className="text-[10px] text-emerald-800 hover:underline font-bold"
                            >
                              Auto-Generate
                            </button>
                          </div>
                          <input
                            type="text"
                            required={memberPortalAccess}
                            value={memberLoginUsername}
                            onChange={(e) => setMemberLoginUsername(e.target.value.toLowerCase().replace(/[^a-z0-9._-]/g, ''))}
                            placeholder="e.g. treasurer"
                            className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <label className="block text-xs font-semibold text-slate-700">
                              {editingMember ? 'Change Portal Password (Optional)' : 'Set Portal Password *'}
                            </label>
                            <button
                              type="button"
                              onClick={() => setMemberLoginPassword(`upkar${Math.floor(1000 + Math.random() * 9000)}`)}
                              className="text-[10px] text-emerald-800 hover:underline font-bold"
                            >
                              Randomize
                            </button>
                          </div>
                          <div className="relative">
                            <input
                              type={showMemberPassword ? 'text' : 'password'}
                              value={memberLoginPassword}
                              onChange={(e) => setMemberLoginPassword(e.target.value)}
                              placeholder={editingMember ? 'Leave empty to keep existing password' : 'e.g. upkar123'}
                              className="w-full px-3 py-2 pr-9 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                            />
                            <button
                              type="button"
                              onClick={() => setShowMemberPassword(!showMemberPassword)}
                              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 cursor-pointer"
                            >
                              {showMemberPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Granular Permissions Matrix */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-bold text-slate-800">
                            Granular Module Access Rights ({memberPermissions.length} granted)
                          </label>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setMemberPermissions(AVAILABLE_PERMISSIONS.map(p => p.id))}
                              className="text-[10px] text-emerald-800 hover:underline font-bold"
                            >
                              Select All
                            </button>
                            <span className="text-slate-300">·</span>
                            <button
                              type="button"
                              onClick={() => setMemberPermissions([])}
                              className="text-[10px] text-slate-500 hover:underline"
                            >
                              Clear
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 rounded-xl bg-white">
                          {AVAILABLE_PERMISSIONS.map((perm) => {
                            const isChecked = memberPermissions.includes(perm.id);
                            return (
                              <label
                                key={perm.id}
                                className={`p-2.5 rounded-lg border text-xs flex items-start gap-2.5 cursor-pointer transition ${
                                  isChecked
                                    ? 'bg-emerald-50/60 border-emerald-300 text-emerald-950 font-medium'
                                    : 'bg-slate-50/50 border-slate-200 text-slate-600 hover:bg-slate-50'
                                }`}
                              >
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setMemberPermissions([...memberPermissions, perm.id]);
                                    } else {
                                      setMemberPermissions(memberPermissions.filter(id => id !== perm.id));
                                    }
                                  }}
                                  className="mt-0.5 rounded text-emerald-800"
                                />
                                <div className="space-y-0.5">
                                  <div className="font-semibold text-slate-900 leading-tight">{perm.label}</div>
                                  <div className="text-[10px] text-slate-500 leading-tight">{perm.desc}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {!memberPortalAccess && (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-500">
                      This committee member will only appear in the public association roster. They will not be able to log in to the admin portal console.
                    </div>
                  )}

                  <div className="flex justify-start items-center pt-2">
                    <button
                      type="button"
                      onClick={() => setMemberModalTab('PHOTO')}
                      className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-200 transition cursor-pointer"
                    >
                      ← Back to Photo
                    </button>
                  </div>
                </div>
              )}

              {/* Form Footer Action */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  {memberPhotoUrl ? (
                    <img src={memberPhotoUrl} alt="" className="w-7 h-7 rounded-lg object-cover border border-emerald-600" />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-[10px] text-slate-400">
                      <Camera className="w-3.5 h-3.5" />
                    </div>
                  )}
                  <span className="text-xs text-slate-600 font-medium">
                    {memberPortalAccess ? `Access: ${memberAccessRole}` : 'Public Roster Only'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMemberModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={memberFormSubmitting}
                    className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs flex items-center gap-1.5"
                  >
                    {memberFormSubmitting ? 'Saving...' : 'Save Member & Access Rights'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Document Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">Add Association Document</h3>
              <button onClick={() => setShowDocModal(false)} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveDoc} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Document Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Layout Map / AGM Minutes"
                  value={docTitle}
                  onChange={(e) => setDocTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={docCategory}
                    onChange={(e) => setDocCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Rules & Regulations">Rules & Regulations</option>
                    <option value="Association Documents">Association Documents</option>
                    <option value="Financial Documents">Financial Documents</option>
                    <option value="Forms">Forms</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Visibility</label>
                  <select
                    value={docVisibility}
                    onChange={(e) => setDocVisibility(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Public">Public</option>
                    <option value="Owners">Owners Only</option>
                    <option value="Admin">Admin Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={docDesc}
                  onChange={(e) => setDocDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Upload Document Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
