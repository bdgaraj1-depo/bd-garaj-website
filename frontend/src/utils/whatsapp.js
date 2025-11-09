/**
 * WhatsApp iletişim yardımcı fonksiyonları
 * Farklı cihaz ve tarayıcılar için optimize edilmiş
 */

const WHATSAPP_NUMBER = '905326832603';

/**
 * WhatsApp linki oluşturur - Hem mobil hem PC için wa.me kullanır
 * @param {string} message - Gönderilecek mesaj
 * @returns {string} - WhatsApp URL
 */
export const getWhatsAppLink = (message = '') => {
  const encodedMessage = encodeURIComponent(message);
  // wa.me hem WhatsApp Desktop hem WhatsApp Web'i otomatik açar
  return `https://wa.me/${WHATSAPP_NUMBER}${message ? `?text=${encodedMessage}` : ''}`;
};

/**
 * WhatsApp bağlantısını aynı pencerede açar (PC ve mobil için)
 * @param {string} message - Gönderilecek mesaj
 */
export const openWhatsApp = (message = '') => {
  const url = getWhatsAppLink(message);
  // Aynı pencerede aç - WhatsApp Desktop/Web otomatik açılır
  window.location.href = url;
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
