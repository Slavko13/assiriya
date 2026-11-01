(() => {
  'use strict';

  const navToggle = document.querySelector('[data-nav-toggle]');
  const navPanel = document.querySelector('[data-nav-panel]');
  if (navToggle && navPanel) {
    navToggle.addEventListener('click', () => {
      const open = navToggle.getAttribute('aria-expanded') !== 'true';
      navToggle.setAttribute('aria-expanded', String(open));
      navPanel.classList.toggle('is-open', open);
    });
  }

  const contactDialog = document.querySelector('[data-contact-dialog]');
  document.querySelectorAll('[data-contact-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (contactDialog?.showModal) contactDialog.showModal();
    });
  });

  const statusDialog = document.querySelector('[data-status-dialog-modal]');
  const statusCopy = statusDialog?.querySelector('[data-status-copy]');
  const messages = {
    vehicle: 'Подбор по автомобилю ожидает решения об источнике каталога применяемости (DEC-004). Пока доступен каталог WooCommerce.',
    vin: 'VIN-заявка не отправляется: обязательные контакты, согласие и маршрут обработки зависят от DEC-017 и DEC-018.',
    b2b: 'B2B-сценарий откроется после утверждения минимального состава, полномочий и условий (DEC-016).',
    delivery: 'Города, способы получения и география ещё согласуются в DEC-001 и DEC-014.'
  };
  document.querySelectorAll('[data-status-dialog]').forEach((trigger) => {
    trigger.addEventListener('click', (event) => {
      event.preventDefault();
      const key = trigger.getAttribute('data-status-dialog');
      if (statusCopy && messages[key]) statusCopy.textContent = messages[key];
      if (statusDialog?.showModal) statusDialog.showModal();
    });
  });

  document.querySelectorAll('dialog').forEach((dialog) => {
    dialog.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
  });

  const updateCartCount = (_event, fragments) => {
    const fragment = fragments?.['div.widget_shopping_cart_content'];
    const count = fragment?.match(/mini_cart_item/g)?.length;
    const badge = document.querySelector('.az-cart-link b');
    if (badge && Number.isFinite(count)) badge.textContent = String(count);
  };
  if (window.jQuery) window.jQuery(document.body).on('added_to_cart', updateCartCount);
})();

