
const VEHICLE_LOG_KEY = 'vehicleLog';

export const saveVehicleEntry = (entryData) => {
  const existingLog = getVehicleLog();
  const newEntry = {
    ...entryData,
    id: Date.now().toString(),
    entryTime: new Date().toISOString(),
    status: 'inside'
  };
  
  existingLog.push(newEntry);
  localStorage.setItem(VEHICLE_LOG_KEY, JSON.stringify(existingLog));
  return newEntry;
};

export const updateVehicleExit = (vehicleId) => {
  const log = getVehicleLog();
  const updatedLog = log.map(entry => {
    if (entry.id === vehicleId && entry.status === 'inside') {
      return {
        ...entry,
        exitTime: new Date().toISOString(),
        status: 'exited'
      };
    }
    return entry;
  });
  
  localStorage.setItem(VEHICLE_LOG_KEY, JSON.stringify(updatedLog));
  return updatedLog;
};

export const getVehicleLog = () => {
  const log = localStorage.getItem(VEHICLE_LOG_KEY);
  return log ? JSON.parse(log) : [];
};

export const clearVehicleHistory = () => {
  localStorage.removeItem(VEHICLE_LOG_KEY);
};

export const getActiveVehicles = () => {
  const log = getVehicleLog();
  return log.filter(entry => entry.status === 'inside');
};

export const exportToExcel = async () => {
  const XLSX = await import('xlsx');
  const log = getVehicleLog();
  
  const worksheet = XLSX.utils.json_to_sheet(log.map(entry => ({
    'Vehicle Number': entry.vehicleNumber,
    'Names': entry.names.join(', '),
    'Number of People': entry.numberOfPeople,
    'Purpose': entry.purpose,
    'Approved By': entry.approvedBy,
    'Entry Time': new Date(entry.entryTime).toLocaleString(),
    'Exit Time': entry.exitTime ? new Date(entry.exitTime).toLocaleString() : 'Still Inside',
    'Status': entry.status
  })));
  
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Vehicle Log');
  
  XLSX.writeFile(workbook, `vehicle_log_${new Date().toISOString().split('T')[0]}.xlsx`);
};
