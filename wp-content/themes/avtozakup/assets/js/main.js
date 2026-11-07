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
    vehicle: 'Подбор по автомобилю временно недоступен. Перейдите в каталог или воспользуйтесь поиском.',
    vin: 'Онлайн-заявка по VIN временно недоступна. Свяжитесь с нами для подбора детали.',
    b2b: 'Чтобы обсудить условия для автосервиса, свяжитесь с нами.',
    delivery: 'Уточните доступные способы получения у менеджера.'
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

  const transformHomeAddButton = (button) => {
    if (!(button instanceof HTMLAnchorElement)) return;
    const card = button.closest('[data-home-product-card]');
    const action = button.closest('.az-product-card__action');
    if (!card || !action) return;

    const headerCartLink = document.querySelector('a.az-cart-link[href]');
    if (!(headerCartLink instanceof HTMLAnchorElement)) return;

    const label = 'Перейти в корзину';
    button.href = headerCartLink.href;
    button.textContent = label;
    button.setAttribute('aria-label', label);
    button.setAttribute('data-home-cart-link', '');
    button.removeAttribute('aria-describedby');
    button.removeAttribute('data-product_id');
    button.removeAttribute('data-product_sku');
    button.removeAttribute('data-quantity');
    button.removeAttribute('data-success_message');
    button.removeAttribute('rel');
    button.classList.remove('add_to_cart_button', 'ajax_add_to_cart', 'added', 'loading');
    button.classList.add('az-product-card__cart-link');
    action.querySelectorAll('a.added_to_cart.wc-forward').forEach((link) => link.remove());
  };

  if (window.jQuery) {
    window.jQuery(document.body).on('added_to_cart.avtozakupHome', (_event, _fragments, _cartHash, $button) => {
      const button = $button?.get?.(0);
      transformHomeAddButton(button);
      window.setTimeout(() => transformHomeAddButton(button), 0);
    });
  }

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
      ['.wc-block-cart__empty-cart__title', 'Your cart is currently empty!', 'Корзина пока пуста'],
      ['.wp-block-woocommerce-empty-cart-block > p > a', 'Browse store', 'Перейти в каталог'],
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
    const cartIntroCopy = document.querySelector('[data-cart-intro-copy]');
    if (cartStore && dataRegistry?.select && dataRegistry?.subscribe && headerCartCount) {
      const syncHeaderCartCount = () => {
        const cartSelectors = dataRegistry.select(cartStore);
        const hasFinishedCartResolution = cartSelectors?.hasFinishedResolution?.('getCartData', []);
        if (hasFinishedCartResolution === false) return;
        const count = cartSelectors?.getCartData?.()?.itemsCount;
        if (!Number.isSafeInteger(count) || count < 0) return;
        const nextCount = String(count);
        if (headerCartCount.textContent !== nextCount) headerCartCount.textContent = nextCount;
        if (cartIntroCopy) {
          const nextCopy = count === 0 ? cartIntroCopy.dataset.emptyCopy : cartIntroCopy.dataset.filledCopy;
          if (nextCopy && cartIntroCopy.textContent !== nextCopy) cartIntroCopy.textContent = nextCopy;
        }
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

