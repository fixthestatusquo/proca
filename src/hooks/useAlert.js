import { create } from "zustand";

const alertStore = create(set => ({
  alerts: [],
  addAlert: alert => {
    const newAlert = {
      ...alert,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    };

    set(state => ({ alerts: [...state.alerts, newAlert] }));
  },
  removeAlert: id => {
    set(state => ({ alerts: state.alerts.filter(a => a.id !== id) }));
  },
}));

export function addAlert(alert) {
  alertStore.getState().addAlert({
    ...alert,
    componentOrigin: "external", // Mark as coming from outside React
    autoHideDuration: alert.autoHideDuration ?? 6000,
  });

  return alertStore.getState().alerts.slice(-1)[0]?.id;
}

export function removeAlert(id) {
  alertStore.getState().removeAlert(id);
}

// Still export the React hook for components
export const useAlertStore = alertStore;

// select only the (stable) action: subscribing to the whole store would re-render
// the caller (eg. Widget) on every alert add/remove, remounting the current step
// and wiping any unsaved form values
export const useAddAlert = () => useAlertStore(state => state.addAlert);

export const useAlert = () => {
  const addAlert = useAlertStore(state => state.addAlert);
  const removeAlert = useAlertStore(state => state.removeAlert);

  return {
    showAlert: addAlert,
    dismissAlert: removeAlert,
    dismissAll: () => useAlertStore.getState().clearAllAlerts(),
  };
};
