import { useRouter } from 'vue-router';

export const useGoBack = () => {
  const router = useRouter();

  return (fallback: string): void => {
    if (typeof window.history.state?.back === 'string') {
      router.back();
    } else {
      void router.replace(fallback);
    }
  };
};
