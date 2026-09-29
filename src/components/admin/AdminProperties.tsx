import React, { useState, useEffect } from 'react';
import { 
  Building, Search, Plus, Edit, Download, Filter, CheckCircle2, User, Phone,
  Calculator, Calendar, Clock, AlertTriangle, ShieldCheck, History, X, CheckCircle
} from 'lucide-react';
import { api } from '../../services/api';
import { useAssociation } from '../../context/AssociationContext';
import { Property, Owner } from '../../types';

interface AdminPropertiesProps {
  onSelectProperty?: (prop: Property) => void;
}

const calculateMonthsBetween = (fromStr: string, tillStr: string): number => {
  if (!fromStr || !tillStr) return 0;
  const from = new Date(fromStr);
  const till = new Date(tillStr);
  let months = (till.getFullYear() - from.getFullYear()) * 12 + (till.getMonth() - from.getMonth());
  if (till.getDate() >= from.getDate()) months += 1;
  return Math.max(1, months);
};

export const AdminProperties: React.FC<AdminPropertiesProps> = () => {
  const { regNo, regDate, totalSites } = useAssociation();
  const effectiveRegDate = regDate || '2018-10-12';

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

  // Quick Arrears Modal
  const [showQuickArrearsModal, setShowQuickArrearsModal] = useState(false);
  const [quickArrearsProp, setQuickArrearsProp] = useState<Property | null>(null);
  const [quickArrearsAmount, setQuickArrearsAmount] = useState<number>(0);
  const [quickArrearsFromDate, setQuickArrearsFromDate] = useState<string>(effectiveRegDate);
  const [quickArrearsTillDate, setQuickArrearsTillDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [quickArrearsMonths, setQuickArrearsMonths] = useState<number>(calculateMonthsBetween(effectiveRegDate, new Date().toISOString().split('T')[0]));
  const [quickArrearsNotes, setQuickArrearsNotes] = useState<string>('');
  const [quickArrearsSubmitting, setQuickArrearsSubmitting] = useState<boolean>(false);
  const [quickArrearsSuccess, setQuickArrearsSuccess] = useState<string | null>(null);

  // Main Form State
  const [formSiteNo, setFormSiteNo] = useState('');
  const [formHouseNo, setFormHouseNo] = useState('');
  const [formBlock, setFormBlock] = useState('North Block');
  const [formType, setFormType] = useState('Plot / Site');
  const [formStatus, setFormStatus] = useState('Vacant');
  const [formOccupancy, setFormOccupancy] = useState('None');
  const [formOwnerId, setFormOwnerId] = useState('');
  const [formMaintenance, setFormMaintenance] = useState(1500);
  const [formRemarks, setFormRemarks] = useState('');
  
  // Pending Maintenance from Reg Date State
  const [formPendingAmount, setFormPendingAmount] = useState<number>(0);
  const [formArrearsFromDate, setFormArrearsFromDate] = useState<string>(effectiveRegDate);
  const [formArrearsTillDate, setFormArrearsTillDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [formArrearsMonths, setFormArrearsMonths] = useState<number>(calculateMonthsBetween(effectiveRegDate, new Date().toISOString().split('T')[0]));
  const [formArrearsNotes, setFormArrearsNotes] = useState<string>('');
  const [enableArrearsEntry, setEnableArrearsEntry] = useState<boolean>(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [syncingSites, setSyncingSites] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const handleSyncDemarcatedSites = async () => {
    setSyncingSites(true);
    setSyncMessage(null);
    try {
      const res = await api.syncDemarcatedSites(parseInt(totalSites || '176', 10), true);
      setSyncMessage(res.message || `All ${res.count || 176} sites synchronized successfully`);
      fetchProps();
      setTimeout(() => setSyncMessage(null), 4000);
    } catch (err: any) {
      alert('Failed to sync demarcated sites: ' + (err.message || 'Unknown error'));
    } finally {
      setSyncingSites(false);
    }
  };

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
    const today = new Date().toISOString().split('T')[0];
    const initialMonths = calculateMonthsBetween(effectiveRegDate, today);
    setEditingProp(null);
    setFormSiteNo('');
    setFormHouseNo('');
    setFormBlock('');
    setFormType('Plot / Site');
    setFormStatus('Vacant');
    setFormOccupancy('None');
    setFormOwnerId('');
    setFormMaintenance(1500);
    setFormRemarks('');
    
    // Arrears initialization
    setFormArrearsFromDate(effectiveRegDate);
    setFormArrearsTillDate(today);
    setFormArrearsMonths(initialMonths);
    setFormPendingAmount(0);
    setFormArrearsNotes(`Pending maintenance arrears from association registration date (${effectiveRegDate} to ${today})`);
    setEnableArrearsEntry(false);
    
    setFormError(null);
    setShowAddModal(true);
  };

  const handleOpenEdit = (prop: Property) => {
    const today = new Date().toISOString().split('T')[0];
    const fromDate = prop.arrears_from_date || effectiveRegDate;
    const tillDate = prop.arrears_till_date || today;
    const months = prop.arrears_months_count || calculateMonthsBetween(fromDate, tillDate);

    setEditingProp(prop);
    setFormSiteNo(prop.site_number);
    setFormHouseNo(prop.house_number || '');
    setFormBlock(prop.block_phase || '');
    setFormType(prop.property_type || 'Plot / Site');
    setFormStatus(prop.status || 'Vacant');
    setFormOccupancy(prop.occupancy_status || 'None');
    setFormOwnerId(prop.owner_id || '');
    setFormMaintenance(prop.monthly_maintenance || 1500);
    setFormRemarks(prop.remarks || '');
    
    // Arrears initialization from property
    setFormArrearsFromDate(fromDate);
    setFormArrearsTillDate(tillDate);
    setFormArrearsMonths(months);
    setFormPendingAmount(prop.outstanding_balance || 0);
    setFormArrearsNotes(prop.arrears_notes || `Pending maintenance dues from association registered date (${fromDate} to ${tillDate})`);
    setEnableArrearsEntry(prop.outstanding_balance > 0 || Boolean(prop.arrears_from_date));
    
    setFormError(null);
    setShowAddModal(true);
  };

  // Open Quick Arrears Modal from table row
  const handleOpenQuickArrears = (prop: Property) => {
    const today = new Date().toISOString().split('T')[0];
    const fromDate = prop.arrears_from_date || effectiveRegDate;
    const tillDate = prop.arrears_till_date || today;
    const months = prop.arrears_months_count || calculateMonthsBetween(fromDate, tillDate);

    setQuickArrearsProp(prop);
    setQuickArrearsFromDate(fromDate);
    setQuickArrearsTillDate(tillDate);
    setQuickArrearsMonths(months);
    setQuickArrearsAmount(prop.outstanding_balance || 0);
    setQuickArrearsNotes(prop.arrears_notes || `Historical pending maintenance from association registered date (${fromDate} to ${tillDate}) [${months} months]`);
    setQuickArrearsSuccess(null);
    setShowQuickArrearsModal(true);
  };

  // Recalculate months when dates change
  const handleArrearsDatesChange = (fromDate: string, tillDate: string, isQuickModal = false) => {
    const months = calculateMonthsBetween(fromDate, tillDate);
    if (isQuickModal) {
      setQuickArrearsFromDate(fromDate);
      setQuickArrearsTillDate(tillDate);
      setQuickArrearsMonths(months);
    } else {
      setFormArrearsFromDate(fromDate);
      setFormArrearsTillDate(tillDate);
      setFormArrearsMonths(months);
    }
  };

  // Auto-calculate pending amount based on rate * months
  const handleAutoCalculateDues = (rate: number, months: number, isQuickModal = false) => {
    const calculated = rate * months;
    if (isQuickModal) {
      setQuickArrearsAmount(calculated);
    } else {
      setFormPendingAmount(calculated);
    }
  };

  const handleSaveQuickArrears = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickArrearsProp) return;

    setQuickArrearsSubmitting(true);
    setQuickArrearsSuccess(null);

    try {
      await api.setHistoricalArrears(quickArrearsProp.id, {
        pendingAmount: quickArrearsAmount,
        arrearsFromDate: quickArrearsFromDate,
        arrearsTillDate: quickArrearsTillDate,
        arrearsMonthsCount: quickArrearsMonths,
        notes: quickArrearsNotes
      });

      setQuickArrearsSuccess(`Pending maintenance of ₹${quickArrearsAmount.toLocaleString('en-IN')} updated successfully for Site #${quickArrearsProp.site_number}`);
      fetchProps();
      setTimeout(() => {
        setShowQuickArrearsModal(false);
      }, 1200);
    } catch (err: any) {
      alert('Failed to update pending arrears: ' + (err.message || 'Unknown error'));
    } finally {
      setQuickArrearsSubmitting(false);
    }
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
      remarks: formRemarks,
      pendingMaintenanceAmount: enableArrearsEntry ? formPendingAmount : (editingProp ? editingProp.outstanding_balance : 0),
      arrearsFromDate: enableArrearsEntry ? formArrearsFromDate : (editingProp?.arrears_from_date || null),
      arrearsTillDate: enableArrearsEntry ? formArrearsTillDate : (editingProp?.arrears_till_date || null),
      arrearsMonthsCount: enableArrearsEntry ? formArrearsMonths : (editingProp?.arrears_months_count || 0),
      arrearsNotes: enableArrearsEntry ? formArrearsNotes : (editingProp?.arrears_notes || '')
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
            Searchable registry of all {totalSites || 176} layout sites, ownership status, and maintenance balances. (Govt Reg No: <strong className="font-mono text-emerald-950 font-bold">{regNo}</strong> · Registered: <strong className="font-mono text-emerald-950 font-bold">{effectiveRegDate}</strong>)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleSyncDemarcatedSites}
            disabled={syncingSites}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            title="Create/Verify all 176 demarcated sites from Association Profile CMS"
          >
            <CheckCircle className={`w-3.5 h-3.5 text-emerald-700 ${syncingSites ? 'animate-spin' : ''}`} />
            <span>{syncingSites ? 'Syncing Sites...' : `Sync All ${totalSites || 176} Sites`}</span>
          </button>

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

      {syncMessage && (
        <div className="p-3.5 bg-emerald-50 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-300">
          <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{syncMessage}</span>
        </div>
      )}

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
          className="bg-white px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-medium text-slate-700"
        >
          <option value="">All Blocks</option>
          <option value="BLANK">Blank / Unassigned Block</option>
          <option value="North Block">North Block</option>
          <option value="South Block">South Block</option>
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
                    <td className="py-3.5 px-4 text-slate-700 font-medium">{p.block_phase || '—'}</td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-800 block">{p.property_type || 'Plot'}</span>
                      <span className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        p.status === 'Occupied' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`block ${p.owner_name ? 'font-bold text-slate-900' : 'text-slate-400 font-medium'}`}>
                        {p.owner_name || '—'}
                      </span>
                      {p.joint_owners && <span className="text-[10px] text-slate-500">Joint: {p.joint_owners}</span>}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-800">
                      {p.primary_mobile ? `+91 ${p.primary_mobile}` : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-right font-mono font-semibold">
                      ₹{p.monthly_maintenance}/mo
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className={`font-mono font-bold text-sm block ${
                        p.outstanding_balance > 0 ? 'text-amber-900' : 'text-emerald-800'
                      }`}>
                        ₹{Number(p.outstanding_balance).toLocaleString('en-IN')}
                      </span>
                      {p.outstanding_balance > 0 && (
                        <span className="text-[10px] text-amber-700 font-semibold block">
                          From {p.arrears_from_date || effectiveRegDate} ({p.arrears_months_count || calculateMonthsBetween(p.arrears_from_date || effectiveRegDate, new Date().toISOString().split('T')[0])} mos)
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenQuickArrears(p)}
                          title="Enter/Calculate Pending Maintenance from Association Registered Date to Till Date"
                          className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded text-[11px] transition cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                        >
                          <Clock className="w-3 h-3 text-amber-700" />
                          <span>Arrears</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded text-[11px] transition cursor-pointer inline-flex items-center gap-1"
                        >
                          <Edit className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Site Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden max-h-[92vh] flex flex-col">
            <div className="bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-amber-300" />
                <h3 className="font-bold text-sm text-white">
                  {editingProp ? `Edit Site #${editingProp.site_number}` : 'Add New Property / Site'}
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-emerald-200 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
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
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-bold"
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
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Layout Block (Optional)
                  </label>
                  <select
                    value={formBlock}
                    onChange={(e) => setFormBlock(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:outline-hidden font-medium"
                  >
                    <option value="">— Blank / Unassigned —</option>
                    <option value="North Block">North Block</option>
                    <option value="South Block">South Block</option>
                  </select>
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

              {/* DEDICATED HISTORICAL ARREARS SECTION: FROM REGISTRATION DATE TO TILL DATE */}
              <div className="bg-amber-50/80 rounded-xl p-4 border border-amber-300 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-amber-950 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-amber-800" />
                      <span>Pending Maintenance (From Association Registered Date to Till Date)</span>
                    </h4>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Enter or calculate cumulative pending dues from the association registration date (<strong>{effectiveRegDate}</strong>) to today.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0">
                    <input
                      type="checkbox"
                      checked={enableArrearsEntry}
                      onChange={(e) => setEnableArrearsEntry(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-amber-200 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-amber-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-amber-800"></div>
                  </label>
                </div>

                {enableArrearsEntry && (
                  <div className="space-y-3 pt-2 border-t border-amber-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                          Registration Date (From) *
                        </label>
                        <input
                          type="date"
                          value={formArrearsFromDate}
                          onChange={(e) => handleArrearsDatesChange(e.target.value, formArrearsTillDate, false)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-hidden font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                          Calculated Till Date *
                        </label>
                        <input
                          type="date"
                          value={formArrearsTillDate}
                          onChange={(e) => handleArrearsDatesChange(formArrearsFromDate, e.target.value, false)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-hidden font-mono"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                          Elapsed Months
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={formArrearsMonths}
                          onChange={(e) => setFormArrearsMonths(parseInt(e.target.value, 10) || 1)}
                          className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-hidden font-mono font-bold"
                        />
                      </div>
                    </div>

                    {/* Auto calculation helper button */}
                    <div className="flex flex-wrap items-center justify-between gap-2 bg-white/70 p-2.5 rounded-lg border border-amber-200">
                      <div className="text-[11px] text-amber-900">
                        Formula: <strong>{formArrearsMonths} months</strong> × <strong>₹{formMaintenance}/mo</strong> = <strong>₹{(formArrearsMonths * formMaintenance).toLocaleString('en-IN')}</strong>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleAutoCalculateDues(formMaintenance, formArrearsMonths, false)}
                        className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded text-[11px] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <Calculator className="w-3 h-3" />
                        <span>Auto-Fill ₹{(formArrearsMonths * formMaintenance).toLocaleString('en-IN')}</span>
                      </button>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-amber-950 mb-1">
                        Pending Maintenance Amount (₹) *
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-2 text-xs font-bold text-amber-800">₹</span>
                        <input
                          type="number"
                          step="any"
                          value={formPendingAmount}
                          onChange={(e) => setFormPendingAmount(parseFloat(e.target.value) || 0)}
                          placeholder="e.g. 54000"
                          className="w-full pl-7 pr-3 py-2 text-sm bg-white border-2 border-amber-400 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-hidden font-mono font-bold text-amber-950"
                        />
                      </div>
                      <span className="text-[10px] text-amber-800 mt-1 block">
                        You can adjust this amount to account for previous partial payments, waivers, or AGM negotiated dues.
                      </span>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-amber-950 mb-1">
                        Arrears Reference & Ledger Notes
                      </label>
                      <input
                        type="text"
                        value={formArrearsNotes}
                        onChange={(e) => setFormArrearsNotes(e.target.value)}
                        placeholder={`e.g. Arrears from association registration ${effectiveRegDate} to date as per audit`}
                        className="w-full px-2.5 py-1.5 text-xs bg-white border border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                      />
                    </div>
                  </div>
                )}
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

              <div className="border-t border-slate-200 pt-3 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {submitting ? 'Saving record...' : 'Save Site Details'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Update Historical Arrears Modal */}
      {showQuickArrearsModal && quickArrearsProp && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden">
            <div className="bg-amber-950 text-white p-4 sm:p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="font-bold text-sm text-white">
                    Site #{quickArrearsProp.site_number}: Pending Maintenance
                  </h3>
                  <p className="text-[11px] text-amber-200">
                    From Association Registered Date to Till Date
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQuickArrearsModal(false)}
                className="text-amber-300 hover:text-white p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveQuickArrears} className="p-5 sm:p-6 space-y-4">
              {quickArrearsSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-900 rounded-lg text-xs font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{quickArrearsSuccess}</span>
                </div>
              )}

              {/* Property Summary Header */}
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Site / House:</span>
                  <span className="font-bold text-slate-900">Site #{quickArrearsProp.site_number} {quickArrearsProp.house_number ? `(${quickArrearsProp.house_number})` : ''}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered Owner:</span>
                  <span className="font-semibold text-slate-800">{quickArrearsProp.owner_name || 'Unassigned'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Monthly Rate:</span>
                  <span className="font-mono font-bold text-emerald-800">₹{quickArrearsProp.monthly_maintenance}/month</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Association Registration:</span>
                  <span className="font-bold text-amber-900">{effectiveRegDate} ({regNo})</span>
                </div>
              </div>

              {/* Date Ranges */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Arrears From Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={quickArrearsFromDate}
                    onChange={(e) => handleArrearsDatesChange(e.target.value, quickArrearsTillDate, true)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Default: Reg Date</span>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                    Arrears Till Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={quickArrearsTillDate}
                    onChange={(e) => handleArrearsDatesChange(quickArrearsFromDate, e.target.value, true)}
                    className="w-full px-2.5 py-1.5 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-hidden font-mono"
                  />
                  <span className="text-[10px] text-slate-400">Default: Today</span>
                </div>
              </div>

              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 flex items-center justify-between gap-2">
                <div className="text-xs text-amber-950">
                  <span>Elapsed Period: <strong>{quickArrearsMonths} Months</strong></span>
                  <div className="text-[11px] text-amber-800">
                    Est. Dues: ₹{(quickArrearsMonths * quickArrearsProp.monthly_maintenance).toLocaleString('en-IN')}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleAutoCalculateDues(quickArrearsProp.monthly_maintenance, quickArrearsMonths, true)}
                  className="px-2.5 py-1 bg-amber-700 hover:bg-amber-800 text-white font-bold rounded text-[11px] transition cursor-pointer flex items-center gap-1 shadow-2xs"
                >
                  <Calculator className="w-3 h-3" />
                  <span>Set Rate × Mos</span>
                </button>
              </div>

              {/* Pending Maintenance Amount Input */}
              <div>
                <label className="block text-xs font-bold text-slate-900 mb-1">
                  Pending Maintenance Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm font-bold text-slate-500">₹</span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={quickArrearsAmount}
                    onChange={(e) => setQuickArrearsAmount(parseFloat(e.target.value) || 0)}
                    placeholder="Enter total pending dues"
                    className="w-full pl-8 pr-3 py-2 text-base font-mono font-bold text-amber-950 bg-white border-2 border-amber-400 rounded-xl focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                  />
                </div>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  This will update the site ledger, opening overdue bill, and total outstanding dues balance.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Notes / Audit Explanation
                </label>
                <input
                  type="text"
                  value={quickArrearsNotes}
                  onChange={(e) => setQuickArrearsNotes(e.target.value)}
                  placeholder="e.g. As per General Body resolution / audit ledger"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-600 focus:outline-hidden"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowQuickArrearsModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={quickArrearsSubmitting}
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-700 text-white font-bold text-xs rounded-xl transition cursor-pointer disabled:opacity-50 shadow-xs flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{quickArrearsSubmitting ? 'Updating...' : 'Save Pending Maintenance'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
