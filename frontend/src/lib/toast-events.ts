type ToastListener = (message: string) => void;

const listeners: ToastListener[] = [];

export const toastEvents = {
  subscribe(listener: ToastListener) {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  },
  emit(message: string) {
    listeners.forEach((fn) => fn(message));
  },
};
