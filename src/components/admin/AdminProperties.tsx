import React, { useState, useEffect } from 'react';
import { Building, Search, Plus, Edit, Download, Filter, CheckCircle2, User, Phone } from 'lucide-react';
import { api } from '../../services/api';
import { Property, Owner } from '../../types';

interface AdminPropertiesProps {
  onSelectProperty?: (prop: Property) => void;
}

export const AdminProperties: React.FC<AdminPropertiesProps> = () => {
  const [properties, setProperties] = useState<Property[]>([]);
  const [owners, setOwners] = useState<Owner[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [blockFilter, setBlockFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProp, setEditingProp] = useState<Property | null>(null);

  // Form State
  const [formSiteNo, setFormSiteNo] = useState('');
  const [formHouseNo, setFormHouseNo] = useState('');
  const [formBlock, setFormBlock] = useState('Phase 1 - A Block');
  const [formType, setFormType] = useState('Plot / Site');
  const [formStatus, setFormStatus] = useState('Vacant');
  const [formOccupancy, setFormOccupancy] = useState('None');
  const [formOwnerId, setFormOwnerId] = useState('');
  const [formMaintenance, setFormMaintenance] = useState(1500);
  const [formRemarks, setFormRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchProps = () => {
    Promise.all([
      api.getAdminProperties({ search, block: blockFilter, status: statusFilter }),
      api.getAdminOwners()
    ])
      .then(([props, owns]) => {
        setProperties(props || []);
        setOwners(owns || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProps();
  }, [search, blockFilter, statusFilter]);

  const handleOpenAdd = () => {
    setEditingProp(null);
    setFormSiteNo('');
    setFormHouseNo('');
    setFormBlock('Phase 1 - A Block');
    setFormType('Plot / Site');
    setFormStatus('Vacant');
    setFormOccupancy('None');
    setFormOwnerId(owners[0]?.id || '');
    setFormMaintenance(1500);
    setFormRemarks('');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (prop: Property) => {
    setEditingProp(prop);
    setFormSiteNo(prop.site_number);
    setFormHouseNo(prop.house_number || '');
    setFormBlock(prop.block_phase || 'Phase 1 - A Block');
    setFormType(prop.property_type || 'Plot / Site');
    setFormStatus(prop.status || 'Vacant');
    setFormOccupancy(prop.occupancy_status || 'None');
    setFormOwnerId(prop.owner_id || '');
    setFormMaintenance(prop.monthly_maintenance || 1500);
    setFormRemarks(prop.remarks || '');
    setFormError(null);
    setShowAddModal(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formSiteNo) {
      setFormError('Site number is required');
      return;
    }

    setSubmitting(true);
    setFormError(null);

    const payload = {
      siteNumber: formSiteNo,
      houseNumber: formHouseNo,
      blockPhase: formBlock,
      propertyType: formType,
      status: formStatus,
      occupancyStatus: formOccupancy,
      ownerId: formOwnerId || null,
      monthlyMaintenance: formMaintenance,
      remarks: formRemarks
    };

    try {
      if (editingProp) {
        await api.updateProperty(editingProp.id, payload);
      } else {
        await api.createProperty(payload);
      }
      setShowAddModal(false);
      fetchProps();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save property record');
    } finally {
      setSubmitting(false);
    }
  };

  const exportCSV = () => {
    const headers = ['Site Number', 'House Number', 'Block/Phase', 'Type', 'Status', 'Owner Name', 'Mobile', 'Maintenance Rate', 'Outstanding Dues'];
    const rows = properties.map(p => [
      p.site_number,
      p.house_number || '',
      p.block_phase || '',
      p.property_type || '',
      p.status || '',
      `"${p.owner_name || ''}"`,
      p.primary_mobile || '',
      p.monthly_maintenance || 0,
      p.outstanding_balance || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `upkar_gardens_site_directory_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Site & House Property Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Searchable registry of all 350 layout sites, ownership status, and maintenance balances.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCSV}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer border border-slate-300"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Site</span>
          </button>
        </div>
      </div>

      {/* Filters Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by Site #, House #, Owner, Mobile..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
          />
        </div>

        <select
          value={blockFilter}
          onChange={(e) => setBlockFilter(e.target.value)}
          className="bg-white px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
        >
          <option value="">All Phases & Blocks</option>
          <option value="Phase 1 - A Block">Phase 1 - A Block</option>
          <option value="Phase 1 - B Block">Phase 1 - B Block</option>
          <option value="Phase 2 - B Block">Phase 2 - B Block</option>
          <option value="Phase 2 - C Block">Phase 2 - C Block</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-white px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
        >
          <option value="">All Statuses (Occupied / Vacant / Const)</option>
          <option value="Occupied">Occupied</option>
          <option value="Vacant">Vacant</option>
          <option value="Under Construction">Under Construction</option>
        </select>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {loading ? (
          <div className="py-12 text-center text-slate-500 text-xs">Loading properties...</div>
        ) : properties.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">No sites found matching criteria</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3 px-4">Site / House #</th>
                  <th className="py-3 px-4">Phase / Block</th>
                  <th className="py-3 px-4">Type & Status</th>
                  <th className="py-3 px-4">Registered Owner</th>
                  <th className="py-3 px-4">Mobile</th>
                  <th className="py-3 px-4 text-right">Maintenance</th>
                  <th className="py-3 px-4 text-right">Outstanding Dues</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {properties.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-bold text-slate-900 text-sm block">Site #{p.site_number}</span>
                      <span className="text-[11px] text-slate-500">{p.house_number ? `House: ${p.house_number}` : 'Plot'}</span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{p.block_phase || 'Phase 1'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{p.property_type || 'Plot'}</span>
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        p.status === 'Occupied' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-900 block">{p.owner_name || 'Unassigned / Developer'}</span>
                      {p.joint_owners && <span className="text-[10px] text-slate-500">Joint: {p.joint_owners}</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800">
                      {p.primary_mobile ? `+91 ${p.primary_mobile}` : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      ₹{p.monthly_maintenance}/mo
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-mono font-bold text-sm ${
                        p.outstanding_balance > 0 ? 'text-amber-900' : 'text-emerald-800'
                      }`}>
                        ₹{Number(p.outstanding_balance).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleOpenEdit(p)}
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

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 overflow-hidden">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-sm text-white">
                {editingProp ? `Edit Site #${editingProp.site_number}` : 'Add New Property / Site'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-emerald-200 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              {formError && (
                <div className="p-3 bg-red-50 text-red-700 rounded-lg text-xs font-medium">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Site Number *</label>
                  <input
                    type="text"
                    required
                    value={formSiteNo}
                    onChange={(e) => setFormSiteNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">House Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. UG-45"
                    value={formHouseNo}
                    onChange={(e) => setFormHouseNo(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Phase / Block</label>
                  <input
                    type="text"
                    value={formBlock}
                    onChange={(e) => setFormBlock(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Property Type</label>
                  <select
                    value={formType}
                    onChange={(e) => setFormType(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Plot / Site">Plot / Site (Vacant)</option>
                    <option value="Constructed Villa">Constructed Villa / House</option>
                    <option value="Commercial Plot">Commercial / Corner Plot</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                  >
                    <option value="Occupied">Occupied</option>
                    <option value="Vacant">Vacant</option>
                    <option value="Under Construction">Under Construction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Monthly Maintenance (₹)</label>
                  <input
                    type="number"
                    value={formMaintenance}
                    onChange={(e) => setFormMaintenance(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Assign Registered Owner</label>
                <select
                  value={formOwnerId}
                  onChange={(e) => setFormOwnerId(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                >
                  <option value="">-- No Owner Assigned (Developer / Open) --</option>
                  {owners.map(o => (
                    <option key={o.id} value={o.id}>
                      {o.owner_name} (+91 {o.primary_mobile})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Remarks / Dossier Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Corner site with avenue tree"
                  value={formRemarks}
                  onChange={(e) => setFormRemarks(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Saving record...' : 'Save Site Details'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
