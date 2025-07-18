(async () => {
  function U(p, e, o, a) {
    var t = new Date(),
      o =
        (t.setTime(t.getTime() + 24 * o * 60 * 60 * 1e3),
        'expires=' + t.toUTCString());
    (a = a || 'samesite=None;'),
      (document.cookie = p + '=' + e + ';' + o + ';' + a + 'path=/;Secure');
  }
  function H(p) {
    for (
      var e = p + '=',
        o = decodeURIComponent(document.cookie).split(';'),
        a = 0;
      a < o.length;
      a++
    ) {
      for (var t = o[a]; ' ' == t.charAt(0); ) t = t.substring(1);
      if (0 == t.indexOf(e)) return t.substring(e.length, t.length);
    }
    return '';
  }
  let p = !1;
  var J = 'https://www.powr.io';
  function Y() {
    return 'http://localhost:3000' != J &&
      'https://localhost:3000' != J &&
      'http://10.0.2.2:3000' != J &&
      'http://192.168.1.149:3000' != J &&
      'http://localhost:8888' != J
      ? function () {}
      : console.log.bind(window.console);
  }
  if ('undefined' != typeof loadPowr) Y()('Powr already loaded');
  else {
    for (
      var e = document.querySelectorAll('.powrLoaded'), o = 0;
      o < e.length;
      o++
    ) {
      var a = e[o];
      (a.innerHTML = ''), a.classList.remove('powrLoaded');
    }
    var t,
      Q = ((e, o) => {
        let a = null;
        return (...p) => {
          window.clearTimeout(a),
            (a = window.setTimeout(() => {
              e.apply(null, p);
            }, o));
        };
      })((p) => {
        for (var e = 0; e < POWR_RECEIVERS.length; e++)
          POWR_RECEIVERS[e].receiver.postMessage(
            JSON.stringify({message: 'triggerPowrPopupAfterInactivity'}),
            POWR_RECEIVERS[e].url,
          );
      }, 300),
      $ =
        (window.addEventListener
          ? window.addEventListener('message', l)
          : window.attachEvent('onmessage', l),
        0),
      r = ((POWR_RECEIVERS = []), document.createEvent('Event')),
      n =
        (r.initEvent('powrPingListener', !0, !0),
        (loadPowr = async function () {
          if (document.body) {
            for (
              var e = null,
                o = null,
                p = null,
                a = !1,
                t = document.querySelectorAll('script'),
                r = 0;
              r < t.length;
              r++
            ) {
              var n = t[r],
                i = n.getAttribute('src');
              if (null != i) {
                var l,
                  s = n.getAttribute('powr-token'),
                  y = n.getAttribute('external-type'),
                  u =
                    ((p = pp(i)) &&
                      p.loadApp &&
                      p.uniqueId &&
                      !n.getAttribute('auto-add') &&
                      ((A = document.createElement('div')).setAttribute(
                        'class',
                        'powr-' + p.loadApp,
                      ),
                      A.setAttribute('id', p.uniqueId),
                      document.body.appendChild(A),
                      n.setAttribute('auto-add', !0)),
                    (y = y || n.getAttribute('platform')),
                    n.getAttribute('template-powr-token')),
                  m = n.getAttribute('powr-load');
                if (
                  (null == m && (m = 'sync'),
                  ep() && ep() <= 9 && (m = 'sync'),
                  (a = n.getAttribute('demo-mode')),
                  null != s
                    ? (e = s)
                    : -1 < i.search('powr-token') &&
                      void 0 !== p['powr-token'] &&
                      0 < p['powr-token'].length &&
                      (e = p['powr-token']),
                  null != y
                    ? (o = y)
                    : -1 < i.search('external-type')
                      ? null != (l = (p = pp(i))['external-type']) &&
                        0 < l.length &&
                        (o = l)
                      : -1 < i.search('platform') &&
                        null != (l = (p = pp(i)).platform) &&
                        0 < l.length &&
                        (o = l),
                  'ecwid' == o && (m = 'sync'),
                  null != e || null != o)
                )
                  break;
              }
            }
            if (null == e || 0 == e.length)
              try {
                e = window.top.location.host;
              } catch (p) {
                e = '';
              }
            'wix-oauth' == o &&
              document
                .querySelectorAll('head .powr-popup, head .powr-chat')
                .forEach(function (p) {
                  document.body.append(p);
                });
            for (
              var d,
                c,
                T,
                W,
                V = /\[powr-[^\]]*\]/gi,
                M = /\[powr-[^\s\]]*/gi,
                f = document.querySelectorAll('a'),
                r = 0;
              r < f.length;
              r++
            )
              rp((w = f[r])) ||
                ((d = w.previousSibling),
                (c = w.nextSibling),
                d &&
                  c &&
                  w.getAttribute('href') &&
                  -1 < w.getAttribute('href').search('tel') &&
                  3 == d.nodeType &&
                  3 == c.nodeType &&
                  d.nodeValue.match(M) &&
                  -1 < c.nodeValue.search(']') &&
                  ((T = w.innerHTML),
                  (W = d.nodeValue.match(/powr-[^\s\]]*/gi)[0]),
                  ((b = document.createElement('div')).innerHTML =
                    '<div class="' + W + '" label="' + T + '"></div>'),
                  d.parentNode.removeChild(d),
                  c.parentNode.removeChild(c),
                  w.parentNode.replaceChild(b, w)));
            for (
              var A, g, f = document.querySelectorAll('body, body *'), r = 0;
              r < f.length;
              r++
            ) {
              var w,
                L = (w = f[r]).childNodes;
              if (!rp(w))
                for (var h = 0; h < L.length; h++) {
                  var D,
                    N,
                    b,
                    v = L[h];
                  3 == v.nodeType &&
                    (N = (D = v.nodeValue).replace(V, Z)) != D &&
                    (((b = document.createElement('div')).innerHTML = N),
                    w.replaceChild(b, v));
                }
            }
            0 == document.querySelectorAll('#powrIframeLoader').length &&
              ((A = document.createElement('div')),
              (g =
                document.getElementsByTagName('base')[0] ||
                document.getElementsByTagName('script')[0]),
              (A.id = 'powrIframeLoader'),
              (A.innerHTML =
                '&shy;<style> .powrLoaded iframe { visibility: hidden; } </style>'),
              g.parentNode.insertBefore(A, g));
            for (
              var E,
                B = document.querySelectorAll('[class*=powr-]'),
                G = !1,
                j = !1,
                r = 0;
              r < B.length;
              r++
            ) {
              var S = B[r];
              if (
                !rp(S) &&
                !(
                  S instanceof SVGElement ||
                  -1 < S.className.search('powrLoaded')
                )
              ) {
                up(S) &&
                  ((P = S),
                  (C = R = void 0),
                  ((C = document.createElement('img')).src =
                    'https://www.powrcdn.com/loader/powr-loader.gif'),
                  (C.id = 'app-preloader'),
                  (C.style.height = C.style.width = '40px'),
                  (P.style.height = P.style.width = '360px'),
                  (P.style.margin = '0 auto'),
                  ((R = P).style.display = 'flex'),
                  (R.style.justifyContent = R.style.alignItems = 'center'),
                  P.appendChild(C));
                var R = lp(S);
                if (void 0 !== R) {
                  op(R) && (G = !0),
                    ('scroll-to-top' != R && !op(R)) || (j = !0);
                  var P = S.getAttribute('label');
                  if ('weebly_' != (P = null == P ? '' : P)) {
                    (S.className += ' powrLoaded'), null == u && (u = '');
                    let p = S.getAttribute('id');
                    null == p
                      ? (p = '')
                      : p.includes('-template--') && (p = p.split('__')[1]);
                    var C = S.getAttribute('view-mode'),
                      k = 'true' == a || 'true' == S.getAttribute('demo-mode'),
                      F = J + '/' + R + '/u/' + p;
                    if (
                      (!1 === ip() && (F += '/cookieless'),
                      p.startsWith('bigcommerce_') &&
                        S.dataset &&
                        'pagebuilder' === S.dataset.installSrc &&
                        (op(R) || ap(R)))
                    )
                      if (tp()) F += '?hideContent=true';
                      else {
                        var _ = S.closest(
                          '[data-content-region]',
                        ).querySelectorAll('div');
                        for (let p = 0; p < _.length; p++)
                          -1 === _[p].className.indexOf('powr-') &&
                            (_[p].style.zIndex = '9999999');
                      }
                    'product-reviews' === R &&
                      ((I = S.getAttribute('data-product-id')) &&
                        (F = F + '?product_id=' + I),
                      (I = S.getAttribute('data-product-name'))) &&
                      (F = F + '&product_name=' + encodeURI(I)),
                      (F += '#platform=' + (l || 'html'));
                    var q,
                      S = encodeURIComponent(P),
                      I = 'https://vcdn.powr.io',
                      O =
                        ((I =
                          J.includes('alpha') ||
                          ((E = J).includes('powr') && E.includes('staging')) ||
                          yp(J)
                            ? 'https://vcdn.powr-staging.io'
                            : I),
                        (E = R),
                        (E = K() ? K()[E] : null) && E.parentAppType,
                        p,
                        J +
                          '/plugins/' +
                          R +
                          '/cached_view?load=' +
                          m +
                          '&index=' +
                          $ +
                          '&unique_label=' +
                          p +
                          '&powr_token=' +
                          e +
                          '&user_label=' +
                          S +
                          '&demo_mode=' +
                          k +
                          '&isCookieAllowed=' +
                          ip()),
                      k =
                        'https://www.powr.io/plugins/' +
                        R +
                        '/view.json?unique_label=' +
                        p +
                        '&powr_token=' +
                        e +
                        '&user_label=' +
                        S +
                        '&demo_mode=' +
                        k +
                        '&isCookieAllowed=' +
                        ip();
                    if (
                      (null != o &&
                        ((k += q = '&external_type=' + o), (O += q)),
                      null != u &&
                        ((k += q = '&template_powr_token=' + u), (O += q)),
                      null != C && ((k += x = '&view_mode=' + C), (O += x)),
                      Y()('page url IS ' + np()),
                      np() && (k += '&url=' + encodeURIComponent(np())),
                      document.location.host)
                    )
                      var z =
                        document.location.protocol +
                        '//' +
                        document.location.host;
                    else
                      try {
                        var z = document.location.ancestorOrigins[0];
                      } catch (p) {
                        z =
                          window.top &&
                          window.top.location &&
                          window.top.location.host
                            ? window.top.location.protocol +
                              '//' +
                              window.top.location.host
                            : '';
                      }
                    if (
                      ((k += '&request_url=' + encodeURIComponent(z)),
                      (O +=
                        '&request_url=' +
                        encodeURIComponent(document.location.href)),
                      0 == S.length &&
                        ((O = F), np()) &&
                        (O += '&url=' + encodeURIComponent(np())),
                      window.CookieControl &&
                        'function' == typeof window.CookieControl.isPOWrAllowed)
                    ) {
                      var x = H('isJimdoCookieSettingsShownBefore');
                      if (!ip() && !x)
                        return void setTimeout(function () {
                          window.CookieControl &&
                            window.CookieControl.showCookieSettings &&
                            (window.CookieControl.showCookieSettings(),
                            U('isJimdoCookieSettingsShownBefore', !0, 1));
                        }, 1e3);
                    }
                    mp() && (B[r].style.width = '100%'),
                      sp(B[r], R, $, o, O, k, m),
                      $++;
                  }
                }
              }
            }
            G &&
              (X(document, 'click', function (p) {
                p =
                  (p = p || window.event).relatedTarget ||
                  p.toElement ||
                  p.target;
                if (p && p.classList.contains('trigger-popup'))
                  for (var e = 0; e < POWR_RECEIVERS.length; e++)
                    POWR_RECEIVERS[e].receiver.postMessage(
                      JSON.stringify({message: 'triggerPowrPopupClick'}),
                      POWR_RECEIVERS[e].url,
                    );
                else Q();
              }),
              X(document, 'keypress', Q),
              X(document, 'mousemove', Q),
              X(document, 'mouseout', function (p) {
                if ((p = p || window.event).clientY < 5)
                  for (var e = 0; e < POWR_RECEIVERS.length; e++)
                    POWR_RECEIVERS[e].receiver.postMessage(
                      JSON.stringify({message: 'exitDocument'}),
                      POWR_RECEIVERS[e].url,
                    );
              })),
              j &&
                X(document, 'scroll', function (p) {
                  for (
                    var e =
                        (document.documentElement.scrollHeight ||
                          document.body.scrollHeight) - window.innerHeight,
                      o =
                        (100 *
                          (document.documentElement.scrollTop ||
                            document.body.scrollTop)) /
                        e,
                      a = 0;
                    a < POWR_RECEIVERS.length;
                    a++
                  )
                    POWR_RECEIVERS[a].receiver.postMessage(
                      JSON.stringify({
                        message: 'scrollPosition',
                        scrollPercentage: o,
                      }),
                      POWR_RECEIVERS[a].url,
                    );
                });
          }
        }),
        window.location.search.includes('powr-review-badge-preview') &&
          ((p = !0),
          ((t = document.createElement('script')).src =
            J + '/powr_product_review_badge_installation.js'),
          document.head.appendChild(t)),
        await loadPowr(),
        setInterval(function () {
          p || loadPowr();
        }, 500),
        X(window, 'load', loadPowr),
        !1);
    X(window, 'keydown', function (p) {
      if (
        (80 == p.keyCode &&
          ((n = !0),
          setTimeout(function () {
            n = !1;
          }, 2e3)),
        38 == p.keyCode && n)
      ) {
        for (var e = 0; e < POWR_RECEIVERS.length; e++)
          POWR_RECEIVERS[e].receiver.postMessage(
            JSON.stringify({message: 'showEdit'}),
            POWR_RECEIVERS[e].url,
          );
        return p.preventDefault(), !1;
      }
      if (40 == p.keyCode && n) {
        for (e = 0; e < POWR_RECEIVERS.length; e++)
          POWR_RECEIVERS[e].receiver.postMessage(
            JSON.stringify({message: 'hideEdit'}),
            POWR_RECEIVERS[e].url,
          );
        return p.preventDefault(), !1;
      }
    });
  }
  function X(p, e, o) {
    p.addEventListener
      ? p.addEventListener(e, o, !1)
      : p.attachEvent && p.attachEvent('on' + e, o);
  }
  function s(p, e, o, a) {
    var t = -1 < o.indexOf('product-reviews');
    window.Shopify;
    setTimeout(() => {
      e.appendChild(p),
        POWR_RECEIVERS.push({receiver: p.contentWindow, url: o, data_url: a});
    }, 0);
  }
  function K() {
    return {
      'contact-form': {appType: 'contactForm', parentAppType: 'formBuilder'},
      'weebly-staging': {
        appType: 'weeblyStaging',
        parentAppType: 'formBuilder',
      },
      leadcapture: {appType: 'leadcapture', parentAppType: 'formBuilder'},
      'secure-form': {appType: 'secureForm', parentAppType: 'hipaaForm'},
      'apple-pay-button': {
        appType: 'applePayButton',
        parentAppType: 'paypalButton',
      },
      'shipping-delay-popup': {
        appType: 'shippingDelayPopup',
        parentAppType: 'popup',
      },
      linqinbio: {appType: 'linqinbio', parentAppType: 'mediaGallery'},
      linqtree: {appType: 'linqtree', parentAppType: 'mediaGallery'},
      'size-chart': {appType: 'sizeChart', parentAppType: 'planComparison'},
      'emergency-contact-form': {
        appType: 'emergencyContactForm',
        parentAppType: 'formBuilder',
      },
      'apple-pay-subscription-button': {
        appType: 'applePaySubscriptionButton',
        parentAppType: 'paypalButton',
      },
      'facebook-chat': {appType: 'facebookChat', parentAppType: 'chat'},
      'countdown-popup': {appType: 'countdownPopup', parentAppType: 'popup'},
      chat: {appType: 'chat', parentAppType: 'chat'},
      'popup-form': {appType: 'popupForm', parentAppType: 'popup'},
      'coronavirus-form': {
        appType: 'coronavirusForm',
        parentAppType: 'formBuilder',
      },
      'nps-form': {appType: 'npsForm', parentAppType: 'formBuilder'},
      'tiktok-feed': {appType: 'tiktokFeed', parentAppType: 'socialFeed'},
      'coronavirus-faq': {appType: 'coronavirusFaq', parentAppType: 'faq'},
      'fundraising-form': {
        appType: 'fundraisingForm',
        parentAppType: 'formBuilder',
      },
      'contact-quote-form': {
        appType: 'contactQuoteForm',
        parentAppType: 'formBuilder',
      },
      'easy-poll': {appType: 'easyPoll', parentAppType: 'formBuilder'},
      email: {appType: 'email', parentAppType: 'email'},
      'youtube-feed': {appType: 'youtubeFeed', parentAppType: 'socialFeed'},
      pack: {appType: 'pack', parentAppType: 'pack'},
      'tiktok-gallery': {appType: 'tiktokGallery', parentAppType: 'microblog'},
      'shopify-staging': {
        appType: 'shopifyStaging',
        parentAppType: 'formBuilder',
      },
      'file-download-form': {
        appType: 'fileDownloadForm',
        parentAppType: 'formBuilder',
      },
      'custom-order-form': {
        appType: 'customOrderForm',
        parentAppType: 'formBuilder',
      },
      'review-form': {appType: 'reviewForm', parentAppType: 'formBuilder'},
      'lead-generation-form': {
        appType: 'leadGenerationForm',
        parentAppType: 'formBuilder',
      },
      'covid-19-faq': {appType: 'covid19Faq', parentAppType: 'faq'},
      'lead-capture-form': {
        appType: 'leadCaptureForm',
        parentAppType: 'formBuilder',
      },
      'staging-dev': {appType: 'stagingDev', parentAppType: 'stagingDev'},
      'donate-now-popup': {appType: 'donateNowPopup', parentAppType: 'popup'},
      'wholesale-application-form': {
        appType: 'wholesaleApplicationForm',
        parentAppType: 'formBuilder',
      },
      'estimate-form': {appType: 'estimateForm', parentAppType: 'formBuilder'},
      'resume-application-form': {
        appType: 'resumeApplicationForm',
        parentAppType: 'formBuilder',
      },
      'returns-policy-faq': {appType: 'returnsPolicyFaq', parentAppType: 'faq'},
      'customer-satisfaction-survey': {
        appType: 'customerSatisfactionSurvey',
        parentAppType: 'formBuilder',
      },
      'weebly-demo': {appType: 'weeblyDemo', parentAppType: 'map'},
      'subscription-form': {
        appType: 'subscriptionForm',
        parentAppType: 'formBuilder',
      },
      'zoom-pop-up': {appType: 'zoomPopUp', parentAppType: 'popup'},
      'full-screen-popup': {appType: 'fullScreenPopup', parentAppType: 'popup'},
      'survey-popup': {appType: 'surveyPopup', parentAppType: 'popup'},
      'popup-maker': {appType: 'popupMaker', parentAppType: 'popup'},
      'email-form': {appType: 'emailForm', parentAppType: 'formBuilder'},
      'email-sign-up': {appType: 'emailSignUp', parentAppType: 'popup'},
      'modal-popup': {appType: 'modalPopup', parentAppType: 'popup'},
      'newsletter-form': {
        appType: 'newsletterForm',
        parentAppType: 'formBuilder',
      },
      'mailchimp-form': {
        appType: 'mailchimpForm',
        parentAppType: 'formBuilder',
      },
      'warranty-registration-form': {
        appType: 'warrantyRegistrationForm',
        parentAppType: 'formBuilder',
      },
      'social-gallery': {appType: 'socialGallery', parentAppType: 'socialFeed'},
      'independence-day-sale-popup': {
        appType: 'independenceDaySalePopup',
        parentAppType: 'popup',
      },
      'summer-discount-popup': {
        appType: 'summerDiscountPopup',
        parentAppType: 'popup',
      },
      'fourth-of-july-sale-popup': {
        appType: 'fourthOfJulySalePopup',
        parentAppType: 'popup',
      },
      'yoga-class-appointments': {
        appType: 'yogaClassAppointments',
        parentAppType: 'appointments',
      },
      'star-rating': {appType: 'starRating', parentAppType: 'comments'},
      'star-ratings': {appType: 'starRatings', parentAppType: 'productReviews'},
      'powr-one': {appType: 'powrOne', parentAppType: 'powrOne'},
      popup: {appType: 'popup', parentAppType: 'popup'},
      newslettersignuppopup: {
        appType: 'newslettersignuppopup',
        parentAppType: 'popup',
      },
      'wix-dev': {appType: 'wixDev', parentAppType: 'formBuilder'},
      'event-registration': {
        appType: 'eventRegistration',
        parentAppType: 'formBuilder',
      },
      'insta-link-list': {appType: 'instaLinkList', parentAppType: 'microblog'},
      'podcast-player': {
        appType: 'podcastPlayer',
        parentAppType: 'musicPlayer',
      },
      'bfcm-countdown': {
        appType: 'bfcmCountdown',
        parentAppType: 'countdownTimer',
      },
      'square-order-form': {
        appType: 'squareOrderForm',
        parentAppType: 'formBuilder',
      },
      'wix-ie-local': {appType: 'wixIeLocal', parentAppType: 'microblog'},
      emailpopup: {appType: 'emailpopup', parentAppType: 'popup'},
      rating: {appType: 'rating', parentAppType: 'productReviews'},
      'ebook-popup': {appType: 'ebookPopup', parentAppType: 'popup'},
      review: {appType: 'review', parentAppType: 'productReviews'},
      'square-payment-form': {
        appType: 'squarePaymentForm',
        parentAppType: 'formBuilder',
      },
      'brand-ambassador-application-form': {
        appType: 'brandAmbassadorApplicationForm',
        parentAppType: 'formBuilder',
      },
      'bfcm-faq': {appType: 'bfcmFaq', parentAppType: 'faq'},
      'spin-to-win': {appType: 'spinToWin', parentAppType: 'popup'},
      'zoom-form': {appType: 'zoomForm', parentAppType: 'formBuilder'},
      'pre-sale-popup': {appType: 'preSalePopup', parentAppType: 'popup'},
      'email-list-signup': {
        appType: 'emailListSignup',
        parentAppType: 'formBuilder',
      },
      'email-countdown': {
        appType: 'emailCountdown',
        parentAppType: 'emailCountdown',
      },
      'credit-card-payment-form': {
        appType: 'creditCardPaymentForm',
        parentAppType: 'formBuilder',
      },
      'donate-form': {appType: 'donateForm', parentAppType: 'formBuilder'},
      'subscription-signup-popup': {
        appType: 'subscriptionSignupPopup',
        parentAppType: 'popup',
      },
      vote: {appType: 'vote', parentAppType: 'vote'},
      'google-pay-form': {
        appType: 'googlePayForm',
        parentAppType: 'formBuilder',
      },
      'integrated-contact-form': {
        appType: 'integratedContactForm',
        parentAppType: 'formBuilder',
      },
      'gym-popup': {appType: 'gymPopup', parentAppType: 'popup'},
      'disco-jukebox': {appType: 'discoJukebox', parentAppType: 'musicPlayer'},
      form: {appType: 'form', parentAppType: 'formBuilder'},
      'bfcm-product-image-gallery': {
        appType: 'bfcmProductImageGallery',
        parentAppType: 'microblog',
      },
      'donation-form': {appType: 'donationForm', parentAppType: 'formBuilder'},
      'apple-pay-form': {appType: 'applePayForm', parentAppType: 'formBuilder'},
      'multi-slider': {appType: 'multiSlider', parentAppType: 'multiSlider'},
      'stripe-button': {appType: 'stripeButton', parentAppType: 'paypalButton'},
      'tip-jar': {appType: 'tipJar', parentAppType: 'paypalButton'},
      'video-slideshow': {
        appType: 'videoSlideshow',
        parentAppType: 'multiSlider',
      },
      'book-now': {appType: 'bookNow', parentAppType: 'formBuilder'},
      'paypal-payment-form': {
        appType: 'paypalPaymentForm',
        parentAppType: 'formBuilder',
      },
      'ebook-download-form': {
        appType: 'ebookDownloadForm',
        parentAppType: 'formBuilder',
      },
      'coronavirus-popup': {
        appType: 'coronavirusPopup',
        parentAppType: 'popup',
      },
      'banner-slider': {appType: 'bannerSlider', parentAppType: 'multiSlider'},
      'delivery-form': {appType: 'deliveryForm', parentAppType: 'formBuilder'},
      'campaign-builder': {
        appType: 'campaignBuilder',
        parentAppType: 'campaignBuilder',
      },
      'request-a-quote': {
        appType: 'requestAQuote',
        parentAppType: 'formBuilder',
      },
      'subscription-signup-form': {
        appType: 'subscriptionSignupForm',
        parentAppType: 'formBuilder',
      },
      'contact-collector': {
        appType: 'contactCollector',
        parentAppType: 'formBuilder',
      },
      'stripe-link-form': {
        appType: 'stripeLinkForm',
        parentAppType: 'formBuilder',
      },
      'free-gift-popup': {appType: 'freeGiftPopup', parentAppType: 'popup'},
      'hit-counter': {appType: 'hitCounter', parentAppType: 'hitCounter'},
      'yahoo-local': {appType: 'yahooLocal', parentAppType: 'yahooLocal'},
      'digital-download': {
        appType: 'digitalDownload',
        parentAppType: 'ecommerce',
      },
      'payment-request-form': {
        appType: 'paymentRequestForm',
        parentAppType: 'formBuilder',
      },
      leadcapture2: {appType: 'leadcapture2', parentAppType: 'formBuilder'},
      'photo-watermark': {
        appType: 'photoWatermark',
        parentAppType: 'photoEditor',
      },
      'wholesale-order-form': {
        appType: 'wholesaleOrderForm',
        parentAppType: 'formBuilder',
      },
      'job-application-form': {
        appType: 'jobApplicationForm',
        parentAppType: 'formBuilder',
      },
      'warranty-form': {appType: 'warrantyForm', parentAppType: 'formBuilder'},
      'warranty-claim-form': {
        appType: 'warrantyClaimForm',
        parentAppType: 'formBuilder',
      },
      'vine-feed': {appType: 'vineFeed', parentAppType: 'socialFeed'},
      graph: {appType: 'graph', parentAppType: 'graph'},
      'wedding-invitation': {
        appType: 'weddingInvitation',
        parentAppType: 'formBuilder',
      },
      'donation-button': {
        appType: 'donationButton',
        parentAppType: 'paypalButton',
      },
      'link-in-bio': {appType: 'linkInBio', parentAppType: 'microblog'},
      'sales-popup': {appType: 'salesPopup', parentAppType: 'popup'},
      'feedback-form': {appType: 'feedbackForm', parentAppType: 'formBuilder'},
      'facebook-stream': {
        appType: 'facebookStream',
        parentAppType: 'socialFeed',
      },
      'event-gallery': {appType: 'eventGallery', parentAppType: 'microblog'},
      microblog: {appType: 'microblog', parentAppType: 'microblog'},
      'cyber-monday-countdown-timer': {
        appType: 'cyberMondayCountdownTimer',
        parentAppType: 'countdownTimer',
      },
      'photo-gallery': {appType: 'photoGallery', parentAppType: 'microblog'},
      'online-store': {appType: 'onlineStore', parentAppType: 'ecommerce'},
      'black-friday-countdown-timer': {
        appType: 'blackFridayCountdownTimer',
        parentAppType: 'countdownTimer',
      },
      'job-board': {appType: 'jobBoard', parentAppType: 'jobBoard'},
      'slide-show': {appType: 'slideShow', parentAppType: 'bannerSlider'},
      'video-gallery': {appType: 'videoGallery', parentAppType: 'microblog'},
      'tumblr-feed': {appType: 'tumblrFeed', parentAppType: 'socialFeed'},
      'live-chat': {appType: 'liveChat', parentAppType: 'chat'},
      'covid-19-form': {appType: 'covid19Form', parentAppType: 'formBuilder'},
      'product-slider': {
        appType: 'productSlider',
        parentAppType: 'multiSlider',
      },
      'booking-form': {appType: 'bookingForm', parentAppType: 'formBuilder'},
      'payment-authorization-form': {
        appType: 'paymentAuthorizationForm',
        parentAppType: 'formBuilder',
      },
      'chat-box': {appType: 'chatBox', parentAppType: 'chat'},
      'comments-box': {appType: 'commentsBox', parentAppType: 'comments'},
      'media-gallery': {appType: 'mediaGallery', parentAppType: 'microblog'},
      'social-proof': {appType: 'socialProof', parentAppType: 'comments'},
      'notification-banner': {
        appType: 'notificationBanner',
        parentAppType: 'notificationBar',
      },
      'youtube-gallery': {
        appType: 'youtubeGallery',
        parentAppType: 'socialFeed',
      },
      'video-slider': {appType: 'videoSlider', parentAppType: 'multiSlider'},
      'contest-entry-form': {
        appType: 'contestEntryForm',
        parentAppType: 'formBuilder',
      },
      'exit-popup': {appType: 'exitPopup', parentAppType: 'popup'},
      poll: {appType: 'poll', parentAppType: 'formBuilder'},
      'wholesale-form': {
        appType: 'wholesaleForm',
        parentAppType: 'formBuilder',
      },
      'shipping-policy-faq': {
        appType: 'shippingPolicyFaq',
        parentAppType: 'faq',
      },
      'discount-popup': {appType: 'discountPopup', parentAppType: 'popup'},
      survey: {appType: 'survey', parentAppType: 'formBuilder'},
      'price-table': {appType: 'priceTable', parentAppType: 'planComparison'},
      'image-slider': {appType: 'imageSlider', parentAppType: 'multiSlider'},
      'press-gallery': {appType: 'pressGallery', parentAppType: 'mediaGallery'},
      'victory-test': {appType: 'victoryTest', parentAppType: 'socialFeed'},
      'new-hire-survey': {
        appType: 'newHireSurvey',
        parentAppType: 'formBuilder',
      },
      'application-form': {
        appType: 'applicationForm',
        parentAppType: 'formBuilder',
      },
      'subscription-picker': {
        appType: 'subscriptionPicker',
        parentAppType: 'priceTable',
      },
      'registration-form': {
        appType: 'registrationForm',
        parentAppType: 'formBuilder',
      },
      'invoice-form': {appType: 'invoiceForm', parentAppType: 'formBuilder'},
      'social-stream': {appType: 'socialStream', parentAppType: 'socialFeed'},
      'mailing-list': {appType: 'mailingList', parentAppType: 'formBuilder'},
      'online-form': {appType: 'onlineForm', parentAppType: 'formBuilder'},
      'customer-survey': {
        appType: 'customerSurvey',
        parentAppType: 'formBuilder',
      },
      'countdown-timer-sale': {
        appType: 'countdownTimerSale',
        parentAppType: 'countdownTimer',
      },
      resume: {appType: 'resume', parentAppType: 'resume'},
      'product-reviews': {
        appType: 'productReviews',
        parentAppType: 'productReviews',
      },
      'job-postings': {appType: 'jobPostings', parentAppType: 'jobBoard'},
      'buzzing-yellow-paypal-button': {
        appType: 'buzzingYellowPaypalButton',
        parentAppType: 'paypalButton',
      },
      'patient-satisfaction-questionnaire': {
        appType: 'patientSatisfactionQuestionnaire',
        parentAppType: 'formBuilder',
      },
      'plan-comparison': {
        appType: 'planComparison',
        parentAppType: 'planComparison',
      },
      'business-form': {appType: 'businessForm', parentAppType: 'formBuilder'},
      eform: {appType: 'eform', parentAppType: 'formBuilder'},
      'stripe-form': {appType: 'stripeForm', parentAppType: 'formBuilder'},
      'covid-19-popup': {appType: 'covid19Popup', parentAppType: 'popup'},
      'refund-policy-faq': {appType: 'refundPolicyFaq', parentAppType: 'faq'},
      'paypal-form': {appType: 'paypalForm', parentAppType: 'formBuilder'},
      'rsvp-form': {appType: 'rsvpForm', parentAppType: 'formBuilder'},
      'about-us-profile': {appType: 'aboutUsProfile', parentAppType: 'aboutUs'},
      'testimonial-gallery': {
        appType: 'testimonialGallery',
        parentAppType: 'mediaGallery',
      },
      'image-resizer': {appType: 'imageResizer', parentAppType: 'photoEditor'},
      'photography-order-form': {
        appType: 'photographyOrderForm',
        parentAppType: 'formBuilder',
      },
      'conference-registration-form': {
        appType: 'conferenceRegistrationForm',
        parentAppType: 'formBuilder',
      },
      'zoom-donation-button': {
        appType: 'zoomDonationButton',
        parentAppType: 'paypalButton',
      },
      'event-registration-form': {
        appType: 'eventRegistrationForm',
        parentAppType: 'formBuilder',
      },
      'sports-camp-registration-form': {
        appType: 'sportsCampRegistrationForm',
        parentAppType: 'formBuilder',
      },
      'notification-bar': {
        appType: 'notificationBar',
        parentAppType: 'notificationBar',
      },
      'evaluation-form': {
        appType: 'evaluationForm',
        parentAppType: 'formBuilder',
      },
      'subscription-button': {
        appType: 'subscriptionButton',
        parentAppType: 'paypalButton',
      },
      'boot-camp-registration-form': {
        appType: 'bootCampRegistrationForm',
        parentAppType: 'formBuilder',
      },
      'stripe-subscription-button': {
        appType: 'stripeSubscriptionButton',
        parentAppType: 'paypalButton',
      },
      'wix-local': {appType: 'wixLocal', parentAppType: 'formBuilder'},
      'cv-application-form': {
        appType: 'cvApplicationForm',
        parentAppType: 'formBuilder',
      },
      'age-validation-popup': {
        appType: 'ageValidationPopup',
        parentAppType: 'popup',
      },
      'black-friday-popup': {
        appType: 'blackFridayPopup',
        parentAppType: 'popup',
      },
      'restaurant-reservation-appointments': {
        appType: 'restaurantReservationAppointments',
        parentAppType: 'appointments',
      },
      test: {appType: 'test', parentAppType: 'test'},
      'image-gallery': {appType: 'imageGallery', parentAppType: 'microblog'},
      'sign-up-form': {appType: 'signUpForm', parentAppType: 'formBuilder'},
      'form-creator': {appType: 'formCreator', parentAppType: 'formBuilder'},
      'web-form': {appType: 'webForm', parentAppType: 'formBuilder'},
      'wedding-rsvp': {appType: 'weddingRsvp', parentAppType: 'formBuilder'},
      'request-a-quote-form': {
        appType: 'requestAQuoteForm',
        parentAppType: 'formBuilder',
      },
      'sale-notification': {
        appType: 'saleNotification',
        parentAppType: 'notificationBar',
      },
      'social-media-buttons': {
        appType: 'socialMediaButtons',
        parentAppType: 'socialMediaIcons',
      },
      'payment-slider': {
        appType: 'paymentSlider',
        parentAppType: 'multiSlider',
      },
      'holiday-countdown': {
        appType: 'holidayCountdown',
        parentAppType: 'countdownTimer',
      },
      'patient-satisfaction-survey': {
        appType: 'patientSatisfactionSurvey',
        parentAppType: 'formBuilder',
      },
      'frequently-asked-questions': {
        appType: 'frequentlyAskedQuestions',
        parentAppType: 'faq',
      },
      'nps-survey': {appType: 'npsSurvey', parentAppType: 'formBuilder'},
      'opt-in-form': {appType: 'optInForm', parentAppType: 'formBuilder'},
      'black-friday-promotion': {
        appType: 'blackFridayPromotion',
        parentAppType: 'popup',
      },
      'graduation-sale-popup': {
        appType: 'graduationSalePopup',
        parentAppType: 'popup',
      },
      menu: {appType: 'menu', parentAppType: 'menu'},
      'school-registration-form': {
        appType: 'schoolRegistrationForm',
        parentAppType: 'formBuilder',
      },
      'spin-wheel': {appType: 'spinWheel', parentAppType: 'popup'},
      'discount-notification-bar': {
        appType: 'discountNotificationBar',
        parentAppType: 'popup',
      },
      'quote-form': {appType: 'quoteForm', parentAppType: 'formBuilder'},
      'testmonial-slider': {
        appType: 'testmonialSlider',
        parentAppType: 'multiSlider',
      },
      ecommerce: {appType: 'ecommerce', parentAppType: 'ecommerce'},
      'social-media-icons': {
        appType: 'socialMediaIcons',
        parentAppType: 'socialMediaIcons',
      },
      'membership-form': {
        appType: 'membershipForm',
        parentAppType: 'formBuilder',
      },
      'recurring-payment': {
        appType: 'recurringPayment',
        parentAppType: 'ecommerce',
      },
      slideshow: {appType: 'slideshow', parentAppType: 'multiSlider'},
      'exit-intent-popup': {appType: 'exitIntentPopup', parentAppType: 'popup'},
      'overlay-popup': {appType: 'overlayPopup', parentAppType: 'popup'},
      'faq-page': {appType: 'faqPage', parentAppType: 'faq'},
      'brand-ambassador-form': {
        appType: 'brandAmbassadorForm',
        parentAppType: 'formBuilder',
      },
      'product-registration-form': {
        appType: 'productRegistrationForm',
        parentAppType: 'formBuilder',
      },
      'sponsorship-form': {
        appType: 'sponsorshipForm',
        parentAppType: 'formBuilder',
      },
      'voting-form': {appType: 'votingForm', parentAppType: 'formBuilder'},
      'cyber-monday-promotion': {
        appType: 'cyberMondayPromotion',
        parentAppType: 'popup',
      },
      'blog-subscriber-poll': {
        appType: 'blogSubscriberPoll',
        parentAppType: 'formBuilder',
      },
      'pride-month-popup': {appType: 'prideMonthPopup', parentAppType: 'popup'},
      'event-registration-popup': {
        appType: 'eventRegistrationPopup',
        parentAppType: 'popup',
      },
      'rss-feed': {appType: 'rssFeed', parentAppType: 'socialFeed'},
      'net-promoter-score-template': {
        appType: 'netPromoterScoreTemplate',
        parentAppType: 'formBuilder',
      },
      'onclick-popup': {appType: 'onclickPopup', parentAppType: 'popup'},
      'accordion-faq': {appType: 'accordionFaq', parentAppType: 'faq'},
      'sales-pop': {appType: 'salesPop', parentAppType: 'popup'},
      'sales-countdown': {
        appType: 'salesCountdown',
        parentAppType: 'countdownTimer',
      },
      'product-carousel': {
        appType: 'productCarousel',
        parentAppType: 'multiSlider',
      },
      'feature-request-form': {
        appType: 'featureRequestForm',
        parentAppType: 'formBuilder',
      },
      'cyber-monday-popup': {
        appType: 'cyberMondayPopup',
        parentAppType: 'popup',
      },
      'pet-grooming-appointments': {
        appType: 'petGroomingAppointments',
        parentAppType: 'appointments',
      },
      tabs: {appType: 'tabs', parentAppType: 'tabs'},
      'online-registration-form': {
        appType: 'onlineRegistrationForm',
        parentAppType: 'formBuilder',
      },
      'email-popup': {appType: 'emailPopup', parentAppType: 'popup'},
      'coupon-box': {appType: 'couponBox', parentAppType: 'popup'},
      'subscription-payment': {
        appType: 'subscriptionPayment',
        parentAppType: 'ecommerce',
      },
      button: {appType: 'button', parentAppType: 'button'},
      'email-subscription-popup': {
        appType: 'emailSubscriptionPopup',
        parentAppType: 'popup',
      },
      'popup-notification': {
        appType: 'popupNotification',
        parentAppType: 'popup',
      },
      'photo-album': {appType: 'photoAlbum', parentAppType: 'mediaGallery'},
      'flickr-gallery': {appType: 'flickrGallery', parentAppType: 'socialFeed'},
      'youtube-slideshow': {
        appType: 'youtubeSlideshow',
        parentAppType: 'multiSlider',
      },
      'q-and-a-maker': {appType: 'qAndAMaker', parentAppType: 'faq'},
      'ecommerce-cart': {appType: 'ecommerceCart', parentAppType: 'ecommerce'},
      'captcha-form': {appType: 'captchaForm', parentAppType: 'formBuilder'},
      'mailchimp-email-signup': {
        appType: 'mailchimpEmailSignup',
        parentAppType: 'popup',
      },
      'newsletter-sign-up': {
        appType: 'newsletterSignUp',
        parentAppType: 'formBuilder',
      },
      'workshop-registration-form': {
        appType: 'workshopRegistrationForm',
        parentAppType: 'formBuilder',
      },
      'multi-currency-button': {
        appType: 'multiCurrencyButton',
        parentAppType: 'paypalButton',
      },
      'video-banner': {appType: 'videoBanner', parentAppType: 'multiSlider'},
      'vimeo-slideshow': {
        appType: 'vimeoSlideshow',
        parentAppType: 'multiSlider',
      },
      'promotion-popup': {appType: 'promotionPopup', parentAppType: 'popup'},
      'splash-popup': {appType: 'splashPopup', parentAppType: 'popup'},
      'pinterest-feed': {appType: 'pinterestFeed', parentAppType: 'socialFeed'},
      'file-upload-form': {
        appType: 'fileUploadForm',
        parentAppType: 'formBuilder',
      },
      'image-editor': {appType: 'imageEditor', parentAppType: 'photoEditor'},
      'social-feed': {appType: 'socialFeed', parentAppType: 'socialFeed'},
      'form-builder': {appType: 'formBuilder', parentAppType: 'formBuilder'},
      'countdown-clock': {
        appType: 'countdownClock',
        parentAppType: 'countdownTimer',
      },
      'google-pay-button': {
        appType: 'googlePayButton',
        parentAppType: 'paypalButton',
      },
      'picture-gallery': {
        appType: 'pictureGallery',
        parentAppType: 'microblog',
      },
      'pet-service-form': {
        appType: 'petServiceForm',
        parentAppType: 'formBuilder',
      },
      'about-us-page': {appType: 'aboutUsPage', parentAppType: 'aboutUs'},
      'slide-in': {appType: 'slideIn', parentAppType: 'popup'},
      'product-image-slider': {
        appType: 'productImageSlider',
        parentAppType: 'multiSlider',
      },
      'donation-popup': {appType: 'donationPopup', parentAppType: 'popup'},
      'sale-promotion-bar': {
        appType: 'salePromotionBar',
        parentAppType: 'popup',
      },
      'scroll-to-top': {appType: 'scrollToTop', parentAppType: 'scrollToTop'},
      'contact-us': {appType: 'contactUs', parentAppType: 'formBuilder'},
      'image-carousel': {
        appType: 'imageCarousel',
        parentAppType: 'multiSlider',
      },
      'payment-form': {appType: 'paymentForm', parentAppType: 'formBuilder'},
      'birthday-countdown': {
        appType: 'birthdayCountdown',
        parentAppType: 'countdownTimer',
      },
      'paypal-button': {appType: 'paypalButton', parentAppType: 'paypalButton'},
      forum: {appType: 'forum', parentAppType: 'comments'},
      'home-repair-form': {
        appType: 'homeRepairForm',
        parentAppType: 'formBuilder',
      },
      'landscaping-service-appointments': {
        appType: 'landscapingServiceAppointments',
        parentAppType: 'appointments',
      },
      'price-comparison': {
        appType: 'priceComparison',
        parentAppType: 'priceTable',
      },
      'pdf-embed': {appType: 'pdfEmbed', parentAppType: 'fileEmbed'},
      'fixed-position-payment-button': {
        appType: 'fixedPositionPaymentButton',
        parentAppType: 'paypalButton',
      },
      comments: {appType: 'comments', parentAppType: 'comments'},
      'sticky-payment-button': {
        appType: 'stickyPaymentButton',
        parentAppType: 'paypalButton',
      },
      'pricing-table': {appType: 'pricingTable', parentAppType: 'priceTable'},
      'powerpoint-embed': {
        appType: 'powerpointEmbed',
        parentAppType: 'fileEmbed',
      },
      'music-player': {appType: 'musicPlayer', parentAppType: 'musicPlayer'},
      'instagram-feed': {appType: 'instagramFeed', parentAppType: 'socialFeed'},
      'shopify-form': {appType: 'shopifyForm', parentAppType: 'formBuilder'},
      counter: {appType: 'counter', parentAppType: 'countdownTimer'},
      'countdown-bar': {
        appType: 'countdownBar',
        parentAppType: 'countdownTimer',
      },
      'paypal-donate-button': {
        appType: 'paypalDonateButton',
        parentAppType: 'paypalButton',
      },
      'order-form': {appType: 'orderForm', parentAppType: 'formBuilder'},
      'blog-comments': {appType: 'blogComments', parentAppType: 'comments'},
      'size-chart-tabs': {appType: 'sizeChartTabs', parentAppType: 'tabs'},
      'bfcm-sales-popup': {appType: 'bfcmSalesPopup', parentAppType: 'popup'},
      reviews: {appType: 'reviews', parentAppType: 'comments'},
      'photo-filter': {appType: 'photoFilter', parentAppType: 'photoEditor'},
      'count-up-timer': {
        appType: 'countUpTimer',
        parentAppType: 'countdownTimer',
      },
      ratings: {appType: 'ratings', parentAppType: 'comments'},
      'car-maintenance-appointment-form': {
        appType: 'carMaintenanceAppointmentForm',
        parentAppType: 'formBuilder',
      },
      'car-maintenance-appointment-appointments': {
        appType: 'carMaintenanceAppointmentAppointments',
        parentAppType: 'appointments',
      },
      'summer-sale-popup': {appType: 'summerSalePopup', parentAppType: 'popup'},
      'vimeo-gallery': {appType: 'vimeoGallery', parentAppType: 'socialFeed'},
      'facebook-feed': {appType: 'facebookFeed', parentAppType: 'socialFeed'},
      'vimeo-feed': {appType: 'vimeoFeed', parentAppType: 'socialFeed'},
      weather: {appType: 'weather', parentAppType: 'weather'},
      'testimonial-feed': {
        appType: 'testimonialFeed',
        parentAppType: 'socialFeed',
      },
      'newsletter-sign-up-popup': {
        appType: 'newsletterSignUpPopup',
        parentAppType: 'popup',
      },
      booking: {appType: 'booking', parentAppType: 'booking'},
      'store-locator': {appType: 'storeLocator', parentAppType: 'map'},
      'event-slider': {appType: 'eventSlider', parentAppType: 'multiSlider'},
      'timer-bar': {appType: 'timerBar', parentAppType: 'countdownTimer'},
      'photo-slider': {appType: 'photoSlider', parentAppType: 'multiSlider'},
      'pop-up': {appType: 'popUp', parentAppType: 'popup'},
      'photo-editor': {appType: 'photoEditor', parentAppType: 'photoEditor'},
      'social-media-feed': {
        appType: 'socialMediaFeed',
        parentAppType: 'socialFeed',
      },
      'social-media-stream': {
        appType: 'socialMediaStream',
        parentAppType: 'socialFeed',
      },
      'countdown-cart': {
        appType: 'countdownCart',
        parentAppType: 'countdownTimer',
      },
      'product-tabs': {appType: 'productTabs', parentAppType: 'tabs'},
      'messenger-chat': {appType: 'messengerChat', parentAppType: 'chat'},
      'visitor-counter': {
        appType: 'visitorCounter',
        parentAppType: 'hitCounter',
      },
      lookbook: {appType: 'lookbook', parentAppType: 'mediaGallery'},
      'easy-tabs': {appType: 'easyTabs', parentAppType: 'tabs'},
      'product-lookbook': {
        appType: 'productLookbook',
        parentAppType: 'mediaGallery',
      },
      'product-options': {
        appType: 'productOptions',
        parentAppType: 'priceTable',
      },
      'membership-options': {
        appType: 'membershipOptions',
        parentAppType: 'priceTable',
      },
      'lightbox-gallery': {
        appType: 'lightboxGallery',
        parentAppType: 'mediaGallery',
      },
      'product-packages': {
        appType: 'productPackages',
        parentAppType: 'priceTable',
      },
      'coupon-popup': {appType: 'couponPopup', parentAppType: 'popup'},
      'package-picker': {appType: 'packagePicker', parentAppType: 'priceTable'},
      meerkat: {appType: 'meerkat', parentAppType: 'meerkat'},
      'team-profile': {appType: 'teamProfile', parentAppType: 'aboutUs'},
      carousel: {appType: 'carousel', parentAppType: 'multiSlider'},
      'back-to-school-popup': {
        appType: 'backToSchoolPopup',
        parentAppType: 'popup',
      },
      'car-maintenance-appointments': {
        appType: 'carMaintenanceAppointments',
        parentAppType: 'appointments',
      },
      testimonials: {appType: 'testimonials', parentAppType: 'comments'},
      'stripe-link-button': {
        appType: 'stripeLinkButton',
        parentAppType: 'paypalButton',
      },
      'payment-button': {
        appType: 'paymentButton',
        parentAppType: 'paypalButton',
      },
      'product-description-tabs': {
        appType: 'productDescriptionTabs',
        parentAppType: 'tabs',
      },
      'subscription-plan-comparison': {
        appType: 'subscriptionPlanComparison',
        parentAppType: 'planComparison',
      },
      'small-business-saturday-popup': {
        appType: 'smallBusinessSaturdayPopup',
        parentAppType: 'popup',
      },
      'cinco-de-mayo-discount-popup': {
        appType: 'cincoDeMayoDiscountPopup',
        parentAppType: 'popup',
      },
      'cinco-de-mayo-sale-popup': {
        appType: 'cincoDeMayoSalePopup',
        parentAppType: 'popup',
      },
      'file-embed': {appType: 'fileEmbed', parentAppType: 'fileEmbed'},
      'about-us': {appType: 'aboutUs', parentAppType: 'aboutUs'},
      'google-pay-subscription-button': {
        appType: 'googlePaySubscriptionButton',
        parentAppType: 'paypalButton',
      },
      'international-nurses-day-popup': {
        appType: 'internationalNursesDayPopup',
        parentAppType: 'popup',
      },
      'fathers-day-popup': {appType: 'fathersDayPopup', parentAppType: 'popup'},
      'world-book-day-discount-popup': {
        appType: 'worldBookDayDiscountPopup',
        parentAppType: 'popup',
      },
      'product-information-tabs': {
        appType: 'productInformationTabs',
        parentAppType: 'tabs',
      },
      appointments: {appType: 'appointments', parentAppType: 'appointments'},
      'teacher-appreciation-day-popup': {
        appType: 'teacherAppreciationDayPopup',
        parentAppType: 'popup',
      },
      'memorial-day-sale-popup': {
        appType: 'memorialDaySalePopup',
        parentAppType: 'popup',
      },
      'first-order-discount-popup': {
        appType: 'firstOrderDiscountPopup',
        parentAppType: 'popup',
      },
      'halloween-countdown-timer': {
        appType: 'halloweenCountdownTimer',
        parentAppType: 'notificationBar',
      },
      'countdown-timer': {
        appType: 'countdownTimer',
        parentAppType: 'countdownTimer',
      },
      'abandoned-cart-popup': {
        appType: 'abandonedCartPopup',
        parentAppType: 'popup',
      },
      'april-fools-day-sale-popup': {
        appType: 'aprilFoolsDaySalePopup',
        parentAppType: 'popup',
      },
      'national-pet-day-offer-popup': {
        appType: 'nationalPetDayOfferPopup',
        parentAppType: 'popup',
      },
      'mothers-day-discount-popup': {
        appType: 'mothersDayDiscountPopup',
        parentAppType: 'popup',
      },
      'national-wine-day-popup': {
        appType: 'nationalWineDayPopup',
        parentAppType: 'popup',
      },
      'easter-sale-popup': {appType: 'easterSalePopup', parentAppType: 'popup'},
      'fathers-day-discount-popup': {
        appType: 'fathersDayDiscountPopup',
        parentAppType: 'popup',
      },
      'landing-page-countdown': {
        appType: 'landingPageCountdown',
        parentAppType: 'countdownTimer',
      },
      'halloween-notification-bar': {
        appType: 'halloweenNotificationBar',
        parentAppType: 'notificationBar',
      },
      map: {appType: 'map', parentAppType: 'map'},
      nudge: {appType: 'nudge', parentAppType: 'nudge'},
      'pride-month-discount-popup': {
        appType: 'prideMonthDiscountPopup',
        parentAppType: 'popup',
      },
      'timer-popup': {appType: 'timerPopup', parentAppType: 'popup'},
      'wix-staging': {appType: 'wixStaging', parentAppType: 'socialMediaIcons'},
      'pride-media-gallery': {
        appType: 'prideMediaGallery',
        parentAppType: 'microblog',
      },
      faq: {appType: 'faq', parentAppType: 'faq'},
      'holiday-food-gallery': {
        appType: 'holidayFoodGallery',
        parentAppType: 'microblog',
      },
      'announcement-bar-countdown': {
        appType: 'announcementBarCountdown',
        parentAppType: 'countdownTimer',
      },
      'product-page-countdown': {
        appType: 'productPageCountdown',
        parentAppType: 'countdownTimer',
      },
      'cart-countdown-timer': {
        appType: 'cartCountdownTimer',
        parentAppType: 'countdownTimer',
      },
      'labor-day-countdown-timer': {
        appType: 'laborDayCountdownTimer',
        parentAppType: 'countdownTimer',
      },
      'christmas-countdown-timer': {
        appType: 'christmasCountdownTimer',
        parentAppType: 'countdownTimer',
      },
      'new-years-countdown-timer': {
        appType: 'newYearsCountdownTimer',
        parentAppType: 'countdownTimer',
      },
      'giving-tuesday-popup': {
        appType: 'givingTuesdayPopup',
        parentAppType: 'popup',
      },
      'tax-free-holiday-popup': {
        appType: 'taxFreeHolidayPopup',
        parentAppType: 'popup',
      },
      'labor-day-sale-popup': {
        appType: 'laborDaySalePopup',
        parentAppType: 'popup',
      },
      'christmas-popup': {appType: 'christmasPopup', parentAppType: 'popup'},
      'new-years-popup': {appType: 'newYearsPopup', parentAppType: 'popup'},
      'giving-tuesday-button': {
        appType: 'givingTuesdayButton',
        parentAppType: 'paypalButton',
      },
      'consultation-calendar': {
        appType: 'consultationCalendar',
        parentAppType: 'appointments',
      },
      'testimonial-slider': {
        appType: 'testimonialSlider',
        parentAppType: 'multiSlider',
      },
      'hipaa-form': {appType: 'hipaaForm', parentAppType: 'hipaaForm'},
    };
  }
  function Z(p, e, o, a, t, r) {
    var n,
      i,
      l = p,
      p = (Y()('Match:', p), l.match(/powr-[^\s\]]*/i)),
      s = l.match(/id="[^"]*"/i),
      l =
        (null ==
          (s =
            null ==
            (s =
              null ==
              (s =
                null == (s = null == s ? l.match(/id='[^']*'/i) : s) &&
                null != (s = l.match(/id=[^\]]*/i))
                  ? s[0].replace('id=', 'id="') + '"'
                  : s)
                ? l.match(/label="[^"]*"/i)
                : s)
              ? l.match(/label='[^']*'/i)
              : s) && (s = ''),
        p?.toString().trim().replace('powr-', ''));
    return ['appointments', 'nudge'].includes(l)
      ? ((i = `${((i = J), i.includes('powr.io') ? 'https://app.powr.io' : i.includes('powr-staging.io') ? 'https://app.powr-staging.io' : i.includes('localhost') ? 'https://localhost:3101' : void 0)}/assets/webcomponent.js`),
        (n = document.createElement('script')).setAttribute('src', i),
        document.head.appendChild(n),
        `<web-component-embed ${s} app_slug="${l}"></web-component-embed>`)
      : ((i = '<div class="' + p + '" ' + s + '></div>'),
        Y()('Result is:' + i),
        i);
  }
  function pp(p) {
    for (
      var e = {},
        o = p.search('\\?'),
        a = (p = p.substr(o + 1)).split('&'),
        t = 0;
      t < a.length;
      t++
    ) {
      var r,
        n = a[t].split('=');
      void 0 === e[n[0]]
        ? (e[n[0]] = n[1])
        : 'string' == typeof e[n[0]]
          ? ((r = [e[n[0]], n[1]]), (e[n[0]] = r))
          : e[n[0]].push(n[1]);
    }
    return e;
  }
  function ep() {
    var p = navigator.userAgent.toLowerCase();
    return -1 != p.indexOf('msie') && parseInt(p.split('msie')[1]);
  }
  function op(p) {
    return (
      -1 <
      [
        'subscription-signup-popup',
        'donate-now-popup',
        'newslettersignuppopup',
        'emailpopup',
        'ebook-popup',
        'shipping-delay-popup',
        'sales-popup',
        'spin-to-win',
        'pre-sale-popup',
        'cyber-monday-popup',
        'coronavirus-popup',
        'discount-popup',
        'exit-popup',
        'covid-19-popup',
        'spin-wheel',
        'discount-notification-bar',
        'zoom-pop-up',
        'exit-intent-popup',
        'overlay-popup',
        'onclick-popup',
        'sales-pop',
        'email-popup',
        'coupon-box',
        'email-subscription-popup',
        'popup-notification',
        'full-screen-popup',
        'survey-popup',
        'mailchimp-email-signup',
        'promotion-popup',
        'splash-popup',
        'event-registration-popup',
        'popup-maker',
        'slide-in',
        'donation-popup',
        'sale-promotion-bar',
        'email-sign-up',
        'modal-popup',
        'newsletter-sign-up-popup',
        'popup',
        'coupon-popup',
        'popup-form',
      ].indexOf(p)
    );
  }
  function ap(p) {
    return [
      'chat',
      'live-chat',
      'chat-box',
      'facebook-chat',
      'messenger-chat',
    ].includes(p);
  }
  function tp() {
    return (
      (() => {
        try {
          return window.self !== window.top;
        } catch (p) {
          return 1;
        }
      })() &&
      window.location.search &&
      window.location.search.includes('ctk=')
    );
  }
  function rp(p) {
    for (var e = !1, o = p; o && o !== document; o = o.parentNode)
      if (null != o.classList && o.classList.contains('powr-ignore')) {
        e = !0;
        break;
      }
    return e;
  }
  function np() {
    try {
      return window.top.location.href;
    } catch (p) {
      return Y()("Couldn't get page url:", p), '';
    }
  }
  function y(e, o, a) {
    let t;
    function r() {
      var p;
      (p = parseInt(e.getAttribute('powrindex'))),
        isNaN(p) || !0 !== window.POWR_RECEIVERS[p].loaded
          ? ((p = {
              message: 'loaded',
              data: {
                iframe_index: o,
                parent_window_width:
                  window.innerWidth ||
                  document.documentElement.clientWidth ||
                  document.getElementsByTagName('body')[0].clientWidth,
                parent_window_height:
                  window.innerHeight ||
                  document.documentElement.clientHeight ||
                  document.getElementsByTagName('body')[0].clientHeight,
                powrMetafields: window.powrMetafields,
                powrShopMetafields: window.powrShopMetafields,
                parentWindowLocation: window.location.href,
              },
            }),
            Y()('POWr.js sending load message to url' + a + '; iframe:', e),
            e.contentWindow.postMessage(JSON.stringify(p), a),
            (t = setTimeout(r, 50)))
          : clearTimeout(t);
    }
    e.addEventListener
      ? e.addEventListener('load', r)
      : e.attachEvent('onload', r);
  }
  function u(e, p) {
    p.addEventListener &&
      (p.addEventListener(
        'powrPingListener',
        function () {
          return (POWR_RECEIVERS[e].listenerConnected = !0);
        },
        !1,
      ),
      (POWR_RECEIVERS[e].ping_interval = setInterval(function () {
        var p = document.querySelectorAll('[powrindex="' + e + '"]')[0];
        p &&
          ((POWR_RECEIVERS[e].listenerConnected = !1),
          p.dispatchEvent(r),
          !1 === POWR_RECEIVERS[e].listenerConnected) &&
          (console.log('POWr Lost connection. Reconnecting'),
          clearInterval(POWR_RECEIVERS[e].ping_interval),
          (POWR_RECEIVERS[e].receiver = p.contentWindow),
          m(e),
          u(e, p));
      }, 2e3)));
  }
  function m(o) {
    var a = new XMLHttpRequest();
    a.open('GET', POWR_RECEIVERS[o].data_url, !0),
      (a.withCredentials = !0),
      (a.onreadystatechange = function () {
        var p, e;
        (a.readyState != XMLHttpRequest.DONE && 4 != a.readyState) ||
          (200 == a.status
            ? (((p = JSON.parse(a.responseText)).iframe_index = o),
              (POWR_RECEIVERS[o].data = p),
              (e = setInterval(function () {
                POWR_RECEIVERS[o].loaded &&
                  (POWR_RECEIVERS[o].receiver.postMessage(
                    JSON.stringify({message: 'loadView', data: p}),
                    POWR_RECEIVERS[o].url,
                  ),
                  clearInterval(e));
              }, 10)))
            : Y()('Error receiving POWr App Data'));
      }),
      a.send();
  }
  function d(p) {
    switch (p.scrollTo) {
      case 'top':
        i(0, p.scrollSpeed);
        break;
      case 'bottom':
        (e = p.scrollSpeed),
          i(
            (document.documentElement.scrollHeight ||
              document.body.scrollHeight) -
              window.innerHeight +
              50,
            e,
          );
        break;
      case 'text':
        var e = p.scrollToText,
          o = p.scrollSpeed;
        (e = ((p) => {
          for (
            var e = document.querySelectorAll('body, body *'), o = 0;
            o < e.length;
            o++
          )
            for (var a = e[o], t = a.childNodes, r = 0; r < t.length; r++) {
              var n = t[r];
              if (3 == n.nodeType) if (-1 < n.nodeValue.search(p)) return a;
            }
          return !1;
        })(e)) && i(e.getBoundingClientRect().top + window.scrollY - 150, o);
        break;
      case 'anchor':
        var o = p.scrollToAnchor,
          a = p.scrollSpeed;
        (o = document.getElementById(o)) &&
          i(o.getBoundingClientRect().top + window.scrollY - 150, a);
        break;
      case 'app':
        a = document.querySelector('iframe[src="' + p.url + '"]');
        a
          ? p.ios
            ? window.scrollTo(0, a.offsetTop - 50)
            : i(a.offsetTop - 50, p.scrollSpeed)
          : window.scrollBy(0, p.distance);
    }
    var e;
  }
  function i(p, e, o) {
    var a = document.documentElement.scrollTop || document.body.scrollTop;
    a !== o &&
      (window.requestAnimationFrame(function () {
        i(p, e, a);
      }),
      a < p
        ? window.scrollTo(0, a + (p - a) / e)
        : window.scrollTo(0, a - (a - p) / e));
  }
  function l(p) {
    try {
      var e = JSON.parse(p.data);
      if (
        ('clearCart' === e.message &&
          fetch('/cart/clear.js', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
          })
            .then(() => {
              window.location.reload();
            })
            .catch((p) => {
              console.log('Error during clearing cart', p);
            }),
        'checkCartIsEmpty' === e.message &&
          fetch('/cart.js', {
            method: 'GET',
            headers: {'Content-Type': 'application/json'},
          })
            .then((p) => p.json())
            .then((p) => {
              if (0 < p.item_count)
                for (let p = 0; p < POWR_RECEIVERS.length; p++)
                  POWR_RECEIVERS[p].receiver.postMessage(
                    JSON.stringify({message: 'showCartTimer'}),
                    POWR_RECEIVERS[p].url,
                  );
            })
            .catch((p) => {
              console.log('Error during checking cart items', p);
            }),
        'viewLoaded' == e.message)
      ) {
        Y()('Settings received view loaded');
        var o = e.data.iframe_index,
          a = ((POWR_RECEIVERS[o].loaded = !0), e.data.cookiesToGet);
        0 < a.length &&
          ((POWR_RECEIVERS[o].cookies = a.map(function (p) {
            return {cname: p, value: H(p)};
          })),
          POWR_RECEIVERS[o].receiver.postMessage(
            JSON.stringify({
              message: 'cookiesSent',
              cookies: POWR_RECEIVERS[o].cookies,
            }),
            POWR_RECEIVERS[o].url,
          ));
      } else if ('updateSize' == e.message) {
        'undefined' != typeof gadgets &&
          void 0 !== gadgets.window &&
          void 0 !== gadgets.window.adjustHeight &&
          gadgets.window.adjustHeight(e.data.height);
        var t,
          o = e.data.iframe_index,
          r = document.querySelectorAll('[powrindex="' + o + '"]')[0];
        if (r) {
          if (
            ((r.height = e.data.height + 'px'),
            (r.style.height = e.data.height + 'px'),
            (r.style.display = 'inline'),
            null != e.data.postCss)
          )
            for (var n in e.data.postCss) r.style[n] = e.data.postCss[n];
          var i = r.parentNode,
            l = lp(i);
          (i.getAttribute('id') || '').startsWith('bigcommerce_') &&
            tp() &&
            i.dataset &&
            'pagebuilder' === i.dataset.installSrc &&
            (op(l) || ap(l)) &&
            ((r.style.display = 'block'),
            (r.style.position = 'unset'),
            (r.style.height = '200px'));
        }
        e.data.postMessage && 'scrollTo' == e.data.postMessage.messageType
          ? d(e.data.postMessage)
          : e.data.postMessage &&
            'deliverHashedData' === e.data.postMessage.messageType &&
            ((t = e.data.postMessage.data),
            Y()('HASHED DATA RECEIVED', t),
            __sharethis__) &&
            'function' == typeof __sharethis__.hem &&
            __sharethis__.hem(t),
          Y()('Updating size of el', r);
      } else
        'loadMe' == e.message
          ? (Y()('Settings received loadMe request'),
            (o = e.data.iframe_index),
            null != POWR_RECEIVERS[o] &&
              null != POWR_RECEIVERS[o].data &&
              POWR_RECEIVERS[o].receiver.postMessage(
                JSON.stringify({
                  message: 'loadView',
                  data: POWR_RECEIVERS[o].data,
                }),
                POWR_RECEIVERS[o].url,
              ))
          : 'setCookie' === e.message && U(e.cname, e.value, e.exdays);
    } catch (p) {}
  }
  function ip() {
    return (
      window.CookieControl &&
      window.CookieControl.isPOWrAllowed &&
      window.CookieControl.isPOWrAllowed()
    );
  }
  function lp(p) {
    var e = p.className.split(/\s+/);
    for (let p = 0; p < e.length; p++)
      if (0 === e[p].toLowerCase().search('powr-'))
        return e[p].toLowerCase().replace('powr-', '');
  }
  function sp(e, p, o, a, t, r, n) {
    var i = document.createElement('iframe'),
      l = ((i.src = t), up(e));
    if (l)
      i.onload = () => {
        var p;
        e.querySelector('#app-preloader')?.remove(),
          ((p = e).style.display =
            p.style.justifyContent =
            p.style.alignItems =
              ''),
          (p.style.height = p.style.width = ''),
          mp() && (p.style.width = '100%'),
          (p.style.margin = ''),
          (i.style.display = 'block');
      };
    e.classList &&
      e.classList[0] &&
      (i.title = e.classList[0].replace(/-/g, ' ')),
      i.setAttribute('powrindex', o),
      (i.width = '100%'),
      (i.height = i.style.height = '0px'),
      op(p) ||
        ((i.style.transition = 'height 0.3s'),
        (i.style.webkitTransition = 'height 0.3s')),
      (i.style.display = l ? 'none' : 'block'),
      (i.frameBorder = '0'),
      (i.style.visibility = 'visible'),
      i.setAttribute('webkitallowfullscreen', ''),
      i.setAttribute('mozallowfullscreen', ''),
      i.setAttribute('allowfullscreen', ''),
      'ecwid' == a &&
        ((e.style.minWidth = '280px'), ap(p)) &&
        (e.style.height = '0px'),
      y(i, o, t),
      'async' == n && (m(o), u(o, i)),
      'complete' === document.readyState || op(p)
        ? s(i, e, t, r)
        : X(window, 'load', () => {
            s(i, e, t, r);
          });
  }
  function yp(p) {
    return p.includes('localhost');
  }
  function up(p) {
    return [
      'form-builder',
      'contact-form',
      'poll',
      'mailing-list',
      'survey',
      'order-form',
      'zoom-form',
      'registration-form',
      'job-application-form',
      'membership-form',
      'payment-form',
      'wholesale-form',
      'request-a-quote',
      'feedback-form',
      'event-registration-form',
      'booking-form',
      'sign-up-form',
      'rsvp-form',
      'donation-form',
      'contest-entry-form',
      'wedding-invitation',
      'email-list-signup',
      'subscription-signup-form',
      'credit-card-payment-form',
      'stripe-form',
      'eform',
      'lead-capture-form',
      'custom-order-form',
      'evaluation-form',
      'easy-poll',
      'request-a-quote-form',
      'wedding-rsvp',
      'file-download-form',
      'application-form',
      'paypal-payment-form',
      'ebook-download-form',
      'file-upload-form',
      'email-form',
      'captcha-form',
      'nps-survey',
      'invoice-form',
      'covid-19-form',
      'boot-camp-registration-form',
      'customer-satisfaction-survey',
      'quote-form',
      'estimate-form',
      'subscription-form',
      'web-form',
      'brand-ambassador-form',
      'form-creator',
      'book-now',
      'event-registration',
      'online-form',
      'contact-us',
      'customer-survey',
      'online-registration-form',
      'lead-generation-form',
      'conference-registration-form',
      'donate-form',
      'contact-quote-form',
      'sponsorship-form',
      'net-promoter-score-template',
      'fundraising-form',
      'mailchimp-form',
      'brand-ambassador-application-form',
      'delivery-form',
      'sports-camp-registration-form',
      'contact-collector',
      'patient-satisfaction-questionnaire',
      'school-registration-form',
      'new-hire-survey',
      'coronavirus-form',
      'product-registration-form',
      'newsletter-form',
      'payment-request-form',
      'photography-order-form',
      'payment-authorization-form',
      'shopify-form',
      'newsletter-sign-up',
      'patient-satisfaction-survey',
      'business-form',
      'apple-pay-form',
      'leadcapture2',
      'wholesale-application-form',
      'paypal-form',
      'leadcapture',
      'wholesale-order-form',
      'review-form',
      'form',
      'google-pay-form',
      'square-payment-form',
      'square-order-form',
      'home-repair-form',
      'cv-application-form',
      'car-maintenance-appointment-form',
      'warranty-form',
      'resume-application-form',
      'warranty-claim-form',
      'opt-in-form',
      'integrated-contact-form',
      'workshop-registration-form',
      'nps-form',
      'warranty-registration-form',
    ].includes(lp(p));
  }
  function mp() {
    return [...document.scripts]
      .filter((p) => p.src)
      .map((p) => p.src)
      .some(
        (p) =>
          p.includes('https://events.framer.com/script') ||
          p.includes('https://framerusercontent.com/') ||
          p.includes('framercanvas.com'),
      );
  }
})();
