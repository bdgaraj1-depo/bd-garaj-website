/**
 * WhatsApp iletişim yardımcı fonksiyonları
 * Farklı cihaz ve tarayıcılar için optimize edilmiş
 */

const WHATSAPP_NUMBER = '905326832603';

/**
 * WhatsApp linki oluşturur
 * @param {string} message - Gönderilecek mesaj
 * @returns {string} - WhatsApp URL
 */
export const getWhatsAppLink = (message = '') => {
  const encodedMessage = encodeURIComponent(message);
  
  // Mobil cihaz kontrolü
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
  
  // Mobil cihazlarda wa.me, masaüstünde web.whatsapp.com kullan
  if (isMobile) {
    return `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodedMessage}` : ''}`;
  } else {
    return `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}${message ? `&text=${encodedMessage}` : ''}`;
  }
};

/**
 * WhatsApp bağlantısını yeni pencerede açar
 * @param {string} message - Gönderilecek mesaj
 */
export const openWhatsApp = (message = '') => {
  const url = getWhatsAppLink(message);
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Telefon numarasını döndürür
 * @returns {string} - Telefon numarası
 */
export const getWhatsAppNumber = () => WHATSAPP_NUMBER;

/**
 * Formatlanmış telefon numarasını döndürür (görüntüleme için)
 * @returns {string} - Formatlanmış telefon numarası
 */
export const getFormattedPhone = () => {
  return '+90 532 683 26 03';
};
