import React, { useState, useEffect } from 'react';
import { Users, Plus, Edit, ArrowRightLeft, Search, Phone, Mail, MapPin, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';
import { Owner, Property } from '../../types';

export const AdminOwners: React.FC = () => {
  const [owners, setOwners] = useState<Owner[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingOwner, setEditingOwner] = useState<Owner | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferProp, setTransferProp] = useState<Property | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formJoint, setFormJoint] = useState('');
  const [formMobile, setFormMobile] = useState('');
  const [formAltMobile, setFormAltMobile] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formOwnershipType, setFormOwnershipType] = useState('Individual');
  const [formSiteNo, setFormSiteNo] = useState('');

  // Transfer Form State
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newJoint, setNewJoint] = useState('');
  const [newMobile, setNewMobile] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferDues, setTransferDues] = useState(true);
  const [documentRef, setDocumentRef] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOwners = () => {
    Promise.all([api.getAdminOwners(), api.getAdminProperties()])
      .then(([owns, props]) => {
        setOwners(owns || []);
        setProperties(props || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOwners();
  }, []);

  const handleOpenAdd = () => {
    setEditingOwner(null);
    setFormName('');
    setFormJoint('');
    setFormMobile('');
    setFormAltMobile('');
    setFormEmail('');
    setFormAddress('');
    setFormOwnershipType('Individual');
    setFormSiteNo('');
    setError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (owner: Owner) => {
    setEditingOwner(owner);
    setFormName(owner.owner_name);
    setFormJoint(owner.joint_owners || '');
    setFormMobile(owner.primary_mobile);
    setFormAltMobile(owner.alt_mobile || '');
    setFormEmail(owner.email || '');
    setFormAddress(owner.correspondence_address || '');
    setFormOwnershipType(owner.ownership_type || 'Individual');
    setFormSiteNo(owner.site_number || '');
    setError(null);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || !formMobile) {
      setError('Owner name and primary mobile are required');
      return;
    }

    setSubmitting(true);
    setError(null);

    const payload = {
      ownerName: formName,
      jointOwners: formJoint,
      primaryMobile: formMobile,
      altMobile: formAltMobile,
      email: formEmail,
      correspondenceAddress: formAddress,
      ownershipType: formOwnershipType,
      siteNumber: formSiteNo || undefined
    };

    try {
      if (editingOwner) {
        await api.updateOwner(editingOwner.id, payload);
      } else {
        await api.createOwner(payload);
      }
      setShowAddModal(false);
      fetchOwners();
    } catch (err: any) {
      setError(err.message || 'Failed to save owner profile');
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenTransfer = (prop: Property) => {
    setTransferProp(prop);
    setNewOwnerName('');
    setNewJoint('');
    setNewMobile('');
    setNewEmail('');
    setNewAddress('');
    setTransferDues(true);
    setDocumentRef('');
    setError(null);
    setShowTransferModal(true);
  };

  const handleExecuteTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferProp || !newOwnerName || !newMobile) {
      setError('Please provide new owner name and primary mobile');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      await api.transferOwner({
        propertyId: transferProp.id,
        newOwnerName,
        newJointOwners: newJoint,
        newMobile,
        newEmail,
        newAddress,
        transferDate,
        transferDues,
        documentRef
      });
      setShowTransferModal(false);
      fetchOwners();
    } catch (err: any) {
      setError(err.message || 'Property transfer workflow failed');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOwners = owners.filter(o => {
    return o.owner_name.toLowerCase().includes(search.toLowerCase()) ||
           o.primary_mobile.includes(search) ||
           (o.site_number || '').includes(search) ||
           (o.email || '').toLowerCase().includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Registered Owners Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Member records, contact coordinates, joint title holders, and ownership transfer workflows.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member / Owner</span>
          </button>
        </div>
      </div>

      {/* Search and Transfer Quick Action Strip */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Owner Name, Site #, Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        {/* Property Transfer Trigger select */}
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs font-semibold text-slate-600 whitespace-nowrap">Transfer Title:</span>
          <select
            onChange={(e) => {
              const selected = properties.find(p => p.id === e.target.value);
              if (selected) handleOpenTransfer(selected);
            }}
            value=""
            className="bg-white px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden cursor-pointer"
          >
            <option value="">Select a Site to Transfer...</option>
            {properties.map(p => (
              <option key={p.id} value={p.id}>
                Site #{p.site_number} ({p.owner_name || 'No Owner'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Owners Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading members...</div>
        ) : filteredOwners.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No registered owners found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Primary Owner</th>
                  <th className="py-3 px-4">Joint Owner(s)</th>
                  <th className="py-3 px-4">Site / House</th>
                  <th className="py-3 px-4">Primary Mobile</th>
                  <th className="py-3 px-4">Email Address</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOwners.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block text-sm">{o.owner_name}</span>
                      <span className="text-[11px] text-slate-400">{o.ownership_type || 'Individual'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      {o.joint_owners || '—'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-950">
                      {o.site_number ? `Site #${o.site_number}` : 'Unassigned'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-slate-900">
                      +91 {o.primary_mobile}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {o.email || '—'}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        o.member_status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {o.member_status || 'Active'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(o)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Owner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {editingOwner ? `Edit Profile: ${editingOwner.owner_name}` : 'Register New Layout Owner'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-emerald-200 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Owner Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="As per registered sale deed"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Joint Owner(s) (Optional)</label>
                <input
                  type="text"
                  placeholder="Spouse / Family joint title holders"
                  value={formJoint}
                  onChange={(e) => setFormJoint(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Primary Mobile *</label>
                  <input
                    type="tel"
                    required
                    placeholder="10-digit mobile"
                    value={formMobile}
                    onChange={(e) => setFormMobile(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Alternate Mobile</label>
                  <input
                    type="tel"
                    placeholder="Secondary contact"
                    value={formAltMobile}
                    onChange={(e) => setFormAltMobile(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Correspondence Address</label>
                <textarea
                  rows={2}
                  value={formAddress}
                  onChange={(e) => setFormAddress(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              {!editingOwner && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Link to Layout Site # (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 125 or 42"
                    value={formSiteNo}
                    onChange={(e) => setFormSiteNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving record...' : 'Save Owner Profile'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Property Owner Transfer Workflow Modal (Section 85) */}
      {showTransferModal && transferProp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-amber-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-sm text-white">
                  Property Ownership Transfer Workflow (Site #{transferProp.site_number})
                </h3>
              </div>
              <button onClick={() => setShowTransferModal(false)} className="text-amber-200 hover:text-white p-1 cursor-pointer">
                ✕
              </button>
            </div>

            <form onSubmit={handleExecuteTransfer} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="bg-amber-50 rounded-xl p-3 border border-amber-200 text-xs text-amber-950 space-y-1">
                <div>
                  <strong>Previous Registered Owner:</strong> {transferProp.owner_name || 'Unassigned'}
                </div>
                <div>
                  <strong>Current Outstanding Maintenance Dues:</strong> ₹{transferProp.outstanding_balance.toLocaleString('en-IN')}
                </div>
              </div>

              {error && <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">{error}</div>}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Owner Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="As registered in newly executed Sale Deed"
                  value={newOwnerName}
                  onChange={(e) => setNewOwnerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">New Joint Owner(s)</label>
                <input
                  type="text"
                  value={newJoint}
                  onChange={(e) => setNewJoint(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Primary Mobile *</label>
                  <input
                    type="tel"
                    required
                    value={newMobile}
                    onChange={(e) => setNewMobile(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">New Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Transfer Date</label>
                  <input
                    type="date"
                    value={transferDate}
                    onChange={(e) => setTransferDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Sale Deed / Document Ref</label>
                  <input
                    type="text"
                    placeholder="e.g. Registered Deed #4521/2026"
                    value={documentRef}
                    onChange={(e) => setDocumentRef(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                  <input
                    type="checkbox"
                    checked={transferDues}
                    onChange={(e) => setTransferDues(e.target.checked)}
                    className="rounded text-emerald-800"
                  />
                  <span>Transfer outstanding balance (₹{transferProp.outstanding_balance}) to new owner account</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-1 pl-6">
                  If unchecked, existing dues will be marked cleared/settled on transfer.
                </p>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-amber-900 hover:bg-amber-800 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Processing Title Transfer...' : 'Complete Ownership Transfer'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
