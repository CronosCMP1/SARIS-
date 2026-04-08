import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useTracking = () => {
  const location = useLocation();

  useEffect(() => {
    // Dispara o PageView do Meta Pixel a cada mudança de rota
    if (typeof window !== 'undefined' && (window as any).fbq) {
      (window as any).fbq('track', 'PageView');
    }

    // Envia um evento de visualização de página virtual para o GTM
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      (window as any).dataLayer.push({
        event: 'virtual_page_view',
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);
};
