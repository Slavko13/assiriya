(() => {
  'use strict';

  const navToggle = document.querySelector('[data-nav-toggle]');
  const navPanel = document.querySelector('[data-nav-panel]');
  if (navToggle && navPanel) {
    const navLabel = navToggle.querySelector('[data-nav-label]');
    const navOpenLabel = navToggle.getAttribute('data-nav-open-label');
    const navCloseLabel = navToggle.getAttribute('data-nav-close-label');
    const setNavOpen = (open) => {
      navToggle.setAttribute('aria-expanded', String(open));
      navPanel.classList.toggle('is-open', open);
      if (navLabel && navOpenLabel && navCloseLabel) {
        navLabel.textContent = open ? navCloseLabel : navOpenLabel;
      }
    };
    const closeNavOnEscape = (event) => {
      if (event.key !== 'Escape' || navToggle.getAttribute('aria-expanded') !== 'true') return;
      event.preventDefault();
      setNavOpen(false);
      navToggle.focus();
    };
    navToggle.addEventListener('click', () => {
      setNavOpen(navToggle.getAttribute('aria-expanded') !== 'true');
    });
    navToggle.addEventListener('keydown', closeNavOnEscape);
    navPanel.addEventListener('keydown', closeNavOnEscape);
  }

  const contactDialog = document.querySelector('[data-contact-dialog]');
  let contactTrigger = null;
  document.querySelectorAll('[data-contact-open]').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      if (contactDialog?.showModal) {
        contactTrigger = trigger;
        contactDialog.showModal();
      }
    });
  });
  contactDialog?.addEventListener('close', () => {
    if (contactTrigger?.isConnected) contactTrigger.focus();
    contactTrigger = null;
  });

  const statusDialog = document.querySelector('[data-status-dialog-modal]');
  const statusCopy = statusDialog?.querySelector('[data-status-copy]');
  let statusTrigger = null;
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
      const hasMessage = key && Object.prototype.hasOwnProperty.call(messages, key);
      if (!statusDialog?.showModal || !statusCopy || !hasMessage) return;
      statusCopy.textContent = messages[key];
      statusTrigger = trigger;
      statusDialog.showModal();
    });
  });
  statusDialog?.addEventListener('close', () => {
    if (statusTrigger?.isConnected) statusTrigger.focus();
    statusTrigger = null;
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

