/**
 * SIMPLE ID GENERATOR
 * 
 * Each module has its own independent ID system starting from 1.
 * IDs are assigned based on the next available sequential number,
 * accounting for gaps created by deletions.
 * 
 * ID Format: PREFIX-NUMBER
 * Examples:
 * - P-01, P-02, P-03 (Patients)
 * - A-01, A-02, A-03 (Appointments)
 * - LT-01, LT-02, LT-03 (Lab Tests)
 * - ST-01, ST-02, ST-03 (Staff)
 */

// Generate ID based on next available sequential number
export const generateNextId = (existingData, prefix) => {
  console.log('generateNextId called with:', { existingData, prefix });
  
  if (!existingData || existingData.length === 0) {
    console.log('No existing data, returning:', `${prefix}-01`);
    return `${prefix}-01`;
  }

  // Extract numeric parts from existing IDs and find the highest number
  const numericIds = existingData
    .map(item => {
      const id = item.testId || item.patientId || item.appointmentId || item.staffId || item.id;
      console.log('Processing item:', item, 'ID found:', id);
      if (!id) return 0;
      
      // Extract number from format like "LT-02", "P-01", etc.
      const match = id.match(new RegExp(`${prefix}-(\\d+)`));
      const num = match ? parseInt(match[1]) : 0;
      console.log('Extracted number:', num);
      return num;
    })
    .filter(num => num > 0);

  console.log('Numeric IDs found:', numericIds);

  if (numericIds.length === 0) {
    console.log('No valid numeric IDs, returning:', `${prefix}-01`);
    return `${prefix}-01`;
  }

  // Find the highest number and increment
  const maxId = Math.max(...numericIds);
  const nextNumber = maxId + 1;
  const result = `${prefix}-${nextNumber.toString().padStart(2, '0')}`;
  
  console.log('Max ID:', maxId, 'Next number:', nextNumber, 'Result:', result);
  return result;
};

// Specific ID generators for each entity type
export const generatePatientId = (patients) => {
  return generateNextId(patients, 'P');
};

export const generateStaffId = (staff) => {
  return generateNextId(staff, 'ST');
};

export const generateAppointmentId = (appointments) => {
  return generateNextId(appointments, 'A');
};

export const generateLabTestId = (labTests) => {
  return generateNextId(labTests, 'LT');
};

export const generateBloodBankId = (bloodBanks) => {
  return generateNextId(bloodBanks, 'BB');
};

export const generateAccountId = (accounts) => {
  return generateNextId(accounts, 'ACC');
};

export const generateSettingId = (settings) => {
  return generateNextId(settings, 'SET');
};

export const generateExpenseId = (expenses) => {
  console.log('generateExpenseId called with:', expenses);
  const result = generateNextId(expenses, 'EX');
  console.log('Generated expense ID:', result);
  return result;
};
