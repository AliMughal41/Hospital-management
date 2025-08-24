import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRecord, updateRecord } from '../firebase/database';

const HospitalContext = createContext();

export const useHospital = () => {
  const context = useContext(HospitalContext);
  if (!context) {
    throw new Error('useHospital must be used within a HospitalProvider');
  }
  return context;
};

export const HospitalProvider = ({ children }) => {
  const [hospitalName, setHospitalName] = useState('MediSyncX');
  const [loading, setLoading] = useState(true);

  // Load hospital settings from Firebase
  const loadHospitalSettings = async () => {
    try {
      const result = await getRecord('hospitalSettings');
      if (result.success && result.data) {
        const settings = result.data;
        if (settings.hospitalName) {
          setHospitalName(settings.hospitalName);
        }
      }
    } catch (error) {
      console.error('Error loading hospital settings:', error);
    } finally {
      setLoading(false);
    }
  };

  // Update hospital name
  const updateHospitalName = async (newName) => {
    try {
      const result = await updateRecord('hospitalSettings', { hospitalName: newName });
      if (result.success) {
        setHospitalName(newName);
        return { success: true };
      } else {
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('Error updating hospital name:', error);
      return { success: false, message: error.message };
    }
  };

  // Load settings on mount
  useEffect(() => {
    loadHospitalSettings();
  }, []);

  const value = {
    hospitalName,
    updateHospitalName,
    loading
  };

  return (
    <HospitalContext.Provider value={value}>
      {children}
    </HospitalContext.Provider>
  );
};
