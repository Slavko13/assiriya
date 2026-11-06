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
    navPanel.addEventListener('click', (event) => {
      if (navToggle.getAttribute('aria-expanded') !== 'true') return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      const link = target.closest('a[href]');
      if (!link || !navPanel.contains(link)) return;
      let fragmentTarget = null;
      let fragmentUrl = null;
      if (event instanceof MouseEvent && event.detail === 0 && !event.defaultPrevented && link instanceof HTMLAnchorElement) {
        const currentUrl = new URL(window.location.href);
        const linkUrl = new URL(link.href, currentUrl);
        const isSameDocument = linkUrl.origin === currentUrl.origin
          && linkUrl.pathname === currentUrl.pathname
          && linkUrl.search === currentUrl.search;
        const candidateTarget = linkUrl.hash ? document.getElementById(linkUrl.hash.slice(1)) : null;
        if (isSameDocument && candidateTarget instanceof HTMLElement && candidateTarget.getAttribute('tabindex') === '-1') {
          fragmentTarget = candidateTarget;
          fragmentUrl = linkUrl;
        }
      }
      setNavOpen(false);
      if (fragmentTarget && fragmentUrl) {
        window.requestAnimationFrame(() => {
          if (fragmentTarget.isConnected && window.location.hash === fragmentUrl.hash) {
            fragmentTarget.focus({ preventScroll: true });
          }
        });
      }
    });
    document.addEventListener('click', (event) => {
      if (navToggle.getAttribute('aria-expanded') !== 'true') return;
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (navToggle.contains(target) || navPanel.contains(target) || target.closest('dialog')) return;
      setNavOpen(false);
    });
    const navBreakpoint = window.matchMedia('(max-width: 900px)');
    const resetNavAtBreakpoint = () => setNavOpen(false);
    if (navBreakpoint.addEventListener) navBreakpoint.addEventListener('change', resetNavAtBreakpoint);
    else navBreakpoint.addListener(resetNavAtBreakpoint);
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

  const cartRoot = document.querySelector('.wp-block-woocommerce-cart');
  if (cartRoot && document.body.classList.contains('woocommerce-cart')) {
    const cartLabels = [
      ['.wc-block-cart-items caption h2', 'Products in cart', 'Товары в корзине'],
      ['.wc-block-cart-items__header-image > span', 'Product', 'Товар'],
      ['.wc-block-cart-items__header-product .screen-reader-text', 'Details', 'О товаре'],
      ['.wc-block-cart-items__header-total > span', 'Total', 'Сумма'],
      ['.wc-block-cart__totals-title', 'Cart totals', 'Итого'],
      ['.wc-block-components-totals-coupon .wc-block-components-panel__button', 'Add coupons', 'Добавить промокод'],
      ['.wc-block-components-totals-footer-item .wc-block-components-totals-item__label', 'Estimated total', 'Итого к оплате'],
      ['.wc-block-cart__submit-button .wc-block-components-button__text', 'Proceed to Checkout', 'Перейти к оформлению'],
    ];
    const localizeCart = () => {
      cartLabels.forEach(([selector, source, translated]) => {
        cartRoot.querySelectorAll(selector).forEach((element) => {
          element.childNodes.forEach((node) => {
            if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim() === source) {
              node.textContent = translated;
            }
          });
        });
      });

      cartRoot.querySelectorAll([
        '.wc-block-components-quantity-selector__input[aria-label]',
        '.wc-block-components-quantity-selector__button[aria-label]',
        '.wc-block-cart-item__remove-link[aria-label]',
      ].join(',')).forEach((element) => {
        const label = element.getAttribute('aria-label') ?? '';
        const replacements = [
          [/^Quantity of (.+) in your cart\.$/, 'Количество товара «$1» в корзине'],
          [/^Reduce quantity of (.+)$/, 'Уменьшить количество товара «$1»'],
          [/^Increase quantity of (.+)$/, 'Увеличить количество товара «$1»'],
          [/^Remove (.+) from cart$/, 'Удалить товар «$1» из корзины'],
        ];
        for (const [pattern, replacement] of replacements) {
          if (!pattern.test(label)) continue;
          element.setAttribute('aria-label', label.replace(pattern, replacement));
          break;
        }
      });
    };
    localizeCart();
    const cartObserver = new MutationObserver(localizeCart);
    cartObserver.observe(cartRoot, { childList: true, subtree: true });
    window.addEventListener('pagehide', (event) => {
      if (!event.persisted) cartObserver.disconnect();
    });

    const cartStore = window.wc?.wcBlocksData?.cartStore;
    const dataRegistry = window.wp?.data;
    const headerCartCount = document.querySelector('#az-cart-count');
    if (cartStore && dataRegistry?.select && dataRegistry?.subscribe && headerCartCount) {
      const syncHeaderCartCount = () => {
        const count = dataRegistry.select(cartStore)?.getCartData?.()?.itemsCount;
        if (!Number.isSafeInteger(count) || count < 0) return;
        const nextCount = String(count);
        if (headerCartCount.textContent !== nextCount) headerCartCount.textContent = nextCount;
      };
      syncHeaderCartCount();
      const unsubscribeCartStore = dataRegistry.subscribe(syncHeaderCartCount);
      window.addEventListener('pageshow', (event) => {
        if (event.persisted) syncHeaderCartCount();
      });
      window.addEventListener('pagehide', (event) => {
        if (!event.persisted) unsubscribeCartStore();
      });
    }
  }

})();

