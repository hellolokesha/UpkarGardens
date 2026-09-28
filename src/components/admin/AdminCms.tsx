import React, { useState, useEffect } from 'react';
import { Globe, Bell, Users, FileText, Plus, Edit, Trash2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { api } from '../../services/api';
import { Notice, CommitteeMember, AssociationDocument } from '../../types';

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
  const [memberPhone, setMemberPhone] = useState('');
  const [memberEmail, setMemberEmail] = useState('');
  const [memberOrder, setMemberOrder] = useState(1);
  const [memberPublicContact, setMemberPublicContact] = useState(true);

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
  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.saveCmsCommittee({
      id: editingMember?.id,
      name: memberName,
      designation: memberRole,
      phone: memberPhone,
      email: memberEmail,
      displayOrder: memberOrder,
      showContactPublic: memberPublicContact
    });
    setShowMemberModal(false);
    fetchCmsData();
  };

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

  // Settings Save
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSaved(false);
    try {
      await api.saveCmsSettings(settings);
      setSettingsSaved(true);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
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
          <div className="flex justify-end">
            <button
              onClick={() => {
                setEditingMember(null);
                setMemberName('');
                setMemberRole('Executive Member');
                setMemberPhone('');
                setMemberEmail('');
                setMemberOrder(committee.length + 1);
                setMemberPublicContact(true);
                setShowMemberModal(true);
              }}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Committee Member</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs divide-y divide-slate-100">
            {committee.map((c) => (
              <div key={c.id} className="p-4 sm:p-5 flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{c.name}</h4>
                  <div className="text-xs font-semibold text-emerald-800">{c.designation}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Phone: {c.phone || 'N/A'} · Email: {c.email || 'N/A'} · Order: #{c.display_order} · Public: {c.show_contact_public ? 'Yes' : 'Hidden'}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setEditingMember(c);
                      setMemberName(c.name);
                      setMemberRole(c.designation);
                      setMemberPhone(c.phone || '');
                      setMemberEmail(c.email || '');
                      setMemberOrder(c.display_order);
                      setMemberPublicContact(c.show_contact_public === 1);
                      setShowMemberModal(true);
                    }}
                    className="p-1.5 text-slate-600 hover:text-emerald-800 transition cursor-pointer"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteMember(c.id)}
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
          <div className="border-b border-slate-100 pb-3">
            <h3 className="font-bold text-base text-slate-900">Official Association Identity & Statutory CMS</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Edit the official details shown across the public website, payment receipts, and certificates.
            </p>
          </div>

          {settingsSaved && (
            <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Association settings saved successfully.</span>
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-4">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Government Registration Number</label>
                <input
                  type="text"
                  value={settings['registration_number'] || ''}
                  onChange={(e) => setSettings({ ...settings, registration_number: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Date</label>
                <input
                  type="text"
                  value={settings['registration_date'] || ''}
                  onChange={(e) => setSettings({ ...settings, registration_date: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Layout Sites Count</label>
                <input
                  type="text"
                  value={settings['total_sites_count'] || ''}
                  onChange={(e) => setSettings({ ...settings, total_sites_count: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Emergency Security Desk</label>
                <input
                  type="text"
                  value={settings['emergency_phone'] || ''}
                  onChange={(e) => setSettings({ ...settings, emergency_phone: e.target.value })}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Registered Layout Office Address</label>
              <textarea
                rows={2}
                value={settings['address'] || ''}
                onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
              />
            </div>

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

            <button
              type="submit"
              disabled={savingSettings}
              className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              {savingSettings ? 'Saving...' : 'Save CMS Settings'}
            </button>
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

      {/* Committee Member Modal */}
      {showMemberModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {editingMember ? 'Edit Committee Member' : 'Add Committee Member'}
              </h3>
              <button onClick={() => setShowMemberModal(false)} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveMember} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={memberName}
                  onChange={(e) => setMemberName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Designation / Role *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. President / Treasurer / Secretary"
                  value={memberRole}
                  onChange={(e) => setMemberRole(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={memberPhone}
                    onChange={(e) => setMemberPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Display Order</label>
                  <input
                    type="number"
                    value={memberOrder}
                    onChange={(e) => setMemberOrder(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Email</label>
                <input
                  type="email"
                  value={memberEmail}
                  onChange={(e) => setMemberEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <label className="flex items-center gap-2 text-xs font-medium text-slate-700 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={memberPublicContact}
                  onChange={(e) => setMemberPublicContact(e.target.checked)}
                  className="rounded text-emerald-800"
                />
                <span>Display phone & email on public committee page</span>
              </label>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Save Member Record
              </button>
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
