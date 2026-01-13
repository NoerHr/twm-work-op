import { toast } from 'sonner@2.0.3';

export function useToast() {
  return {
    success: (message: string, description?: string) => {
      toast.success(message, {
        description,
        duration: 4000,
      });
    },
    error: (message: string, description?: string) => {
      toast.error(message, {
        description,
        duration: 5000,
      });
    },
    info: (message: string, description?: string) => {
      toast.info(message, {
        description,
        duration: 4000,
      });
    },
    warning: (message: string, description?: string) => {
      toast.warning(message, {
        description,
        duration: 4000,
      });
    },
    loading: (message: string) => {
      return toast.loading(message);
    },
    promise: <T,>(
      promise: Promise<T>,
      messages: {
        loading: string;
        success: string;
        error: string;
      }
    ) => {
      return toast.promise(promise, messages);
    },
    dismiss: (id?: string | number) => {
      toast.dismiss(id);
    }
  };
}
