import React from 'react';

export const WhatsAppFloatingButton = ({ phoneNumber = '94765293943' }) => {
  const cleanPhone = String(phoneNumber).replace(/[^0-9]/g, '');
  const waUrl = `https://wa.me/${cleanPhone.startsWith('0') ? '94' + cleanPhone.slice(1) : cleanPhone}?text=${encodeURIComponent('Hi ELVANY, I would like to inquire about atelier garments.')}`;

  return (
    <a
      href={waUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="whatsapp-floating-btn"
      aria-label="Chat with ELVANY on WhatsApp"
      title="Chat with ELVANY on WhatsApp (076 529 3943)"
    >
      <span className="whatsapp-btn-pulse" aria-hidden="true" />
      <span className="whatsapp-btn-shine" aria-hidden="true" />
      <span className="whatsapp-floating-tooltip">Chat with us</span>
      <svg 
        viewBox="0 0 24 24" 
        width="26" 
        height="26" 
        fill="currentColor"
        style={{ display: 'block', position: 'relative', zIndex: 2 }}
      >
        <path d="M12.031 2C6.496 2 2 6.496 2 12.031c0 1.97.57 3.824 1.574 5.39L2.247 21.84l4.57-1.328A9.99 9.99 0 0012.03 22c5.535 0 10.031-4.496 10.031-10.031C22.062 6.496 17.566 2 12.031 2zm0 18.232c-1.637 0-3.197-.488-4.52-1.328l-.324-.203-2.709.787.787-2.639-.215-.342A8.196 8.196 0 013.824 12.03c0-4.524 3.683-8.207 8.207-8.207 4.524 0 8.207 3.683 8.207 8.207 0 4.524-3.683 8.202-8.207 8.202zm4.498-6.143c-.247-.123-1.46-.72-1.687-.803-.227-.082-.392-.123-.557.123-.165.247-.638.803-.782.968-.144.165-.288.185-.535.062-.247-.123-1.042-.384-1.986-1.226-.734-.655-1.23-1.464-1.374-1.71-.144-.247-.015-.38.108-.503.111-.111.247-.288.371-.432.123-.144.165-.247.247-.412.082-.165.041-.309-.021-.432-.062-.123-.557-1.343-.763-1.84-.2-.484-.403-.418-.557-.426-.144-.008-.309-.01-.473-.01s-.432.062-.659.309c-.227.247-.866.845-.866 2.062 0 1.216.886 2.392 1.01 2.557.123.165 1.745 2.665 4.227 3.737.59.255 1.05.408 1.41.523.593.188 1.133.161 1.56.098.477-.071 1.46-.597 1.666-1.173.206-.576.206-1.07.144-1.173-.062-.103-.227-.165-.473-.288z" />
      </svg>
    </a>
  );
};
