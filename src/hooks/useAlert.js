import { create } from 'zustand';

const alertStore = create((set) => ({
  alerts: [],
  addAlert: (alert) => {
    const newAlert = { 
      ...alert, 
      id: Date.now(),
      timestamp: new Date().toISOString()
    };
    set((state) => ({ alerts: [...state.alerts, newAlert] }));
  },
  removeAlert: (id) => {
    set((state) => ({ alerts: state.alerts.filter(a => a.id !== id) }));
  }
}));

export function addAlert(alert) {
  alertStore.getState().addAlert({
    ...alert,
    componentOrigin: 'external', // Mark as coming from outside React
    autoHideDuration: alert.autoHideDuration ?? 6000
  });
  
  return alertStore.getState().alerts.slice(-1)[0]?.id;
}

export function removeAlert(id) {
  alertStore.getState().removeAlert(id);
}

// Still export the React hook for components
export const useAlertStore = alertStore;

export const useAlert = (componentName) => {
  const { addAlert, removeAlert } = useAlertStore();
  
  return {
    showAlert: (alert) => {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Alert] ${componentName}:`, alert);
      }
      
      addAlert({ 
        ...alert, 
        componentOrigin: componentName 
      });
    },
    dismissAlert: removeAlert,
    dismissAll: () => useAlertStore.getState().clearAllAlerts()
  };
};
