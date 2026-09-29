import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import { AssociationInfo, AssociationSettings } from '../types';

export const DEFAULT_ASSOCIATION_SETTINGS: AssociationSettings = {
  association_name: 'Upkar Gardens Owners Association (R)',
  registration_number: 'DRO-1/SOR/142/2018-19',
  registration_date: '2018-10-12',
  total_sites_count: '176',
  address: 'Clubhouse & Association Office, Upkar Gardens Layout, Chandapura-Anekal Main Road, Bangalore - 560099, Karnataka',
  contact_phone: '+91 80 2783 4567',
  emergency_phone: '+91 94801 23456',
  contact_email: 'contact@upkargardens.org',
  admin_name: 'Sri. K. Venkatesh (President)',
  admin_phone: '+91 98450 12345',
  admin_email: 'president@upkargardens.org',
  website_cms_updated_date: new Date().toISOString().split('T')[0],
  about_mission: 'To foster a secure, clean, self-sustaining, vibrant residential community with transparent governance, dependable infrastructure, and equitable association services for every property owner.',
  about_vision: 'To establish Upkar Gardens as one of Bangalore South’s model eco-friendly, green, and technologically connected residential layouts.'
};

interface AssociationContextType {
  info: AssociationInfo | null;
  settings: AssociationSettings;
  stats: {
    totalSites: number;
    occupiedSites: number;
    totalOwners: number;
    layoutArea: string;
    establishedYear: string;
  };
  loading: boolean;
  refreshAssociationInfo: () => Promise<void>;
  syncWebsiteData: (updatedDate?: string, customSettings?: Record<string, string>) => Promise<any>;
  
  // Quick convenient accessors synchronized across the website
  regNo: string;
  regDate: string;
  totalSites: string;
  address: string;
  phone: string;
  emergencyPhone: string;
  email: string;
  adminName: string;
  adminPhone: string;
  adminEmail: string;
  cmsUpdatedDate: string;
  mission: string;
  vision: string;
}

const AssociationContext = createContext<AssociationContextType | undefined>(undefined);

export const AssociationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [info, setInfo] = useState<AssociationInfo | null>(null);
  const [settings, setSettings] = useState<AssociationSettings>(DEFAULT_ASSOCIATION_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchInfo = useCallback(async () => {
    try {
      const data = await api.getAssociationInfo();
      if (data && data.settings) {
        setInfo(data);
        setSettings({
          ...DEFAULT_ASSOCIATION_SETTINGS,
          ...data.settings
        });
      }
    } catch (err) {
      console.error('Failed to load association settings:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInfo();

    // Listen for custom website cms update events
    const handleCmsUpdate = () => {
      fetchInfo();
    };

    window.addEventListener('cms-updated', handleCmsUpdate);
    return () => window.removeEventListener('cms-updated', handleCmsUpdate);
  }, [fetchInfo]);

  const syncWebsiteData = async (updatedDate?: string, customSettings?: Record<string, string>) => {
    const res = await api.syncCmsWebsite({
      updatedDate: updatedDate || new Date().toISOString().split('T')[0],
      settings: customSettings
    });
    if (res && res.settings) {
      setSettings(prev => ({
        ...prev,
        ...res.settings
      }));
    }
    await fetchInfo();
    window.dispatchEvent(new CustomEvent('cms-updated'));
    return res;
  };

  const stats = info?.stats || {
    totalSites: parseInt(settings.total_sites_count || '350', 10) || 350,
    occupiedSites: 0,
    totalOwners: 0,
    layoutArea: '45 Acres',
    establishedYear: '2018'
  };

  const value: AssociationContextType = {
    info,
    settings,
    stats: {
      ...stats,
      totalSites: parseInt(settings.total_sites_count || '350', 10) || stats.totalSites || 350
    },
    loading,
    refreshAssociationInfo: fetchInfo,
    syncWebsiteData,
    regNo: settings.registration_number || DEFAULT_ASSOCIATION_SETTINGS.registration_number,
    regDate: settings.registration_date || DEFAULT_ASSOCIATION_SETTINGS.registration_date,
    totalSites: settings.total_sites_count || DEFAULT_ASSOCIATION_SETTINGS.total_sites_count,
    address: settings.address || DEFAULT_ASSOCIATION_SETTINGS.address,
    phone: settings.contact_phone || DEFAULT_ASSOCIATION_SETTINGS.contact_phone,
    emergencyPhone: settings.emergency_phone || DEFAULT_ASSOCIATION_SETTINGS.emergency_phone,
    email: settings.contact_email || DEFAULT_ASSOCIATION_SETTINGS.contact_email,
    adminName: settings.admin_name || DEFAULT_ASSOCIATION_SETTINGS.admin_name,
    adminPhone: settings.admin_phone || DEFAULT_ASSOCIATION_SETTINGS.admin_phone,
    adminEmail: settings.admin_email || DEFAULT_ASSOCIATION_SETTINGS.admin_email,
    cmsUpdatedDate: settings.website_cms_updated_date || DEFAULT_ASSOCIATION_SETTINGS.website_cms_updated_date,
    mission: settings.about_mission || DEFAULT_ASSOCIATION_SETTINGS.about_mission!,
    vision: settings.about_vision || DEFAULT_ASSOCIATION_SETTINGS.about_vision!
  };

  return (
    <AssociationContext.Provider value={value}>
      {children}
    </AssociationContext.Provider>
  );
};

export const useAssociation = (): AssociationContextType => {
  const context = useContext(AssociationContext);
  if (!context) {
    throw new Error('useAssociation must be used within an AssociationProvider');
  }
  return context;
};
