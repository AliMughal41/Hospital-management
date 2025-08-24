import { 
  ref, 
  push, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  off,
  query,
  orderByChild,
  equalTo
} from "firebase/database";
import { database } from "./config";

// User Profile Operations
export const createUserProfile = async (userId, profileData) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await set(userRef, {
      ...profileData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return { success: true, message: "Profile created successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getUserProfile = async (userId) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    const snapshot = await get(userRef);
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: false, message: "User profile not found" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateUserProfile = async (userId, updates) => {
  try {
    const userRef = ref(database, `users/${userId}`);
    await update(userRef, {
      ...updates,
      updatedAt: Date.now()
    });
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Medical Records Operations
export const createMedicalRecord = async (userId, recordData) => {
  try {
    const recordsRef = ref(database, `medicalRecords/${userId}`);
    const newRecordRef = push(recordsRef);
    await set(newRecordRef, {
      ...recordData,
      id: newRecordRef.key,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return { success: true, message: "Medical record created successfully", id: newRecordRef.key };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getMedicalRecords = async (userId) => {
  try {
    const recordsRef = ref(database, `medicalRecords/${userId}`);
    const snapshot = await get(recordsRef);
    if (snapshot.exists()) {
      const records = [];
      snapshot.forEach((childSnapshot) => {
        records.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return { success: true, data: records };
    } else {
      return { success: true, data: [] };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateMedicalRecord = async (userId, recordId, updates) => {
  try {
    const recordRef = ref(database, `medicalRecords/${userId}/${recordId}`);
    await update(recordRef, {
      ...updates,
      updatedAt: Date.now()
    });
    return { success: true, message: "Medical record updated successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deleteMedicalRecord = async (userId, recordId) => {
  try {
    const recordRef = ref(database, `medicalRecords/${userId}/${recordId}`);
    await remove(recordRef);
    return { success: true, message: "Medical record deleted successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Appointments Operations
export const createAppointment = async (appointmentData) => {
  try {
    const appointmentsRef = ref(database, 'appointments');
    const newAppointmentRef = push(appointmentsRef);
    await set(newAppointmentRef, {
      ...appointmentData,
      id: newAppointmentRef.key,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return { success: true, message: "Appointment created successfully", id: newAppointmentRef.key };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getAppointments = async (userId, userType = 'patient') => {
  try {
    const appointmentsRef = ref(database, 'appointments');
    const queryRef = query(appointmentsRef, orderByChild(userType === 'patient' ? 'patientId' : 'doctorId'), equalTo(userId));
    const snapshot = await get(queryRef);
    
    if (snapshot.exists()) {
      const appointments = [];
      snapshot.forEach((childSnapshot) => {
        appointments.push({
          id: childSnapshot.key,
          ...childSnapshot.val()
        });
      });
      return { success: true, data: appointments };
    } else {
      return { success: true, data: [] };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateAppointment = async (appointmentId, updates) => {
  try {
    const appointmentRef = ref(database, `appointments/${appointmentId}`);
    await update(appointmentRef, {
      ...updates,
      updatedAt: Date.now()
    });
    return { success: true, message: "Appointment updated successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deleteAppointment = async (appointmentId) => {
  try {
    const appointmentRef = ref(database, `appointments/${appointmentId}`);
    await remove(appointmentRef);
    return { success: true, message: "Appointment deleted successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Real-time listeners
export const subscribeToUserProfile = (userId, callback) => {
  const userRef = ref(database, `users/${userId}`);
  onValue(userRef, callback);
  return () => off(userRef, 'value', callback);
};

export const subscribeToMedicalRecords = (userId, callback) => {
  const recordsRef = ref(database, `medicalRecords/${userId}`);
  onValue(recordsRef, callback);
  return () => off(recordsRef, 'value', callback);
};

export const subscribeToAppointments = (userId, userType, callback) => {
  const appointmentsRef = ref(database, 'appointments');
  const queryRef = query(appointmentsRef, orderByChild(userType === 'patient' ? 'patientId' : 'doctorId'), equalTo(userId));
  onValue(queryRef, callback);
  return () => off(queryRef, 'value', callback);
};

// Dashboard Statistics Functions
export const getTotalPatients = async () => {
  try {
    const patientsRef = ref(database, 'patients');
    const snapshot = await get(patientsRef);
    if (snapshot.exists()) {
      // Count patient records stored under 'patients'
      return { success: true, count: snapshot.size || Object.keys(snapshot.val()).length };
    } else {
      return { success: true, count: 0 };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getTotalBloodBankUnits = async () => {
  try {
    const bloodBankRef = ref(database, 'bloodBank');
    const snapshot = await get(bloodBankRef);
    if (snapshot.exists()) {
      let totalUnits = 0;
      snapshot.forEach((childSnapshot) => {
        const bloodData = childSnapshot.val();
        // Sum up all available blood units
        if (bloodData.units && typeof bloodData.units === 'number') {
          totalUnits += bloodData.units;
        }
      });
      return { success: true, count: totalUnits };
    } else {
      return { success: true, count: 0 };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getTotalAppointments = async () => {
  try {
    const appointmentsRef = ref(database, 'appointments');
    const snapshot = await get(appointmentsRef);
    if (snapshot.exists()) {
      let count = 0;
      snapshot.forEach(() => {
        count++;
      });
      return { success: true, count };
    } else {
      return { success: true, count: 0 };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getTotalLabTests = async () => {
  try {
    const testsRef = ref(database, 'labTests');
    const snapshot = await get(testsRef);
    if (snapshot.exists()) {
      return { success: true, count: snapshot.size || Object.keys(snapshot.val()).length };
    } else {
      return { success: true, count: 0 };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

// Messages/Chat Operations
export const sendMessage = async (chatId, message) => {
  try {
    const messagesRef = ref(database, `chats/${chatId}/messages`);
    const newMessageRef = push(messagesRef);
    await set(newMessageRef, {
      ...message,
      id: newMessageRef.key,
      timestamp: Date.now()
    });
    
    // Update chat metadata
    const chatRef = ref(database, `chats/${chatId}`);
    await update(chatRef, {
      lastMessage: message.text,
      lastMessageTime: Date.now(),
      updatedAt: Date.now()
    });
    
    return { success: true, message: "Message sent successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const subscribeToMessages = (chatId, callback) => {
  const messagesRef = ref(database, `chats/${chatId}/messages`);
  const queryRef = query(messagesRef, orderByChild('timestamp'));
  onValue(queryRef, callback);
  return () => off(queryRef, 'value', callback);
};

// General CRUD helper functions
export const createRecord = async (path, data) => {
  try {
    const recordRef = ref(database, path);
    const newRecordRef = push(recordRef);
    await set(newRecordRef, {
      ...data,
      id: newRecordRef.key,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
    return { success: true, message: "Record created successfully", id: newRecordRef.key };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const getRecord = async (path) => {
  try {
    const recordRef = ref(database, path);
    const snapshot = await get(recordRef);
    if (snapshot.exists()) {
      return { success: true, data: snapshot.val() };
    } else {
      return { success: false, message: "Record not found" };
    }
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const updateRecord = async (path, updates) => {
  try {
    const recordRef = ref(database, path);
    await update(recordRef, {
      ...updates,
      updatedAt: Date.now()
    });
    return { success: true, message: "Record updated successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const deleteRecord = async (path) => {
  try {
    const recordRef = ref(database, path);
    await remove(recordRef);
    return { success: true, message: "Record deleted successfully" };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

export const subscribeToRecord = (path, callback) => {
  const recordRef = ref(database, path);
  onValue(recordRef, callback);
  return () => off(recordRef, 'value', callback);
};

