/* =====================================================
   js/pwa.js — PWA 서비스워커 등록 + 설치 배너 + iOS 가이드
   ===================================================== */

'use strict';

let deferredPrompt = null;

/* ── 서비스워커 등록 ── */
function registerSW() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(reg => {
          console.log('[SW] 등록 완료', reg.scope);
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                showToast('앱이 업데이트되었습니다. 새로고침해주세요.', 'info', 5000);
              }
            });
          });
        })
        .catch(err => console.warn('[SW] 등록 실패', err));
    });
  }
}

/* ── Android 설치 배너 ── */
function initPWAInstall() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredPrompt = e;
    // 이미 설치됐거나 dismissed 된 경우 표시 안 함
    if (localStorage.getItem('pwa_dismissed')) return;
    showInstallBanner();
  });

  window.addEventListener('appinstalled', () => {
    hidePWABanner();
    showToast('예스결재 앱이 설치되었습니다!', 'success');
    deferredPrompt = null;
  });

  // iOS 감지
  const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
  const isStandalone = window.navigator.standalone === true;
  if (isIOS && !isStandalone && !localStorage.getItem('ios_guide_dismissed')) {
    setTimeout(() => showIOSGuide(), 2000);
  }
}

function showInstallBanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) {
    banner.classList.add('show');
  }
}

function hidePWABanner() {
  const banner = document.getElementById('pwa-install-banner');
  if (banner) banner.classList.remove('show');
}

async function installPWA() {
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') {
    showToast('설치 중...', 'info');
  }
  deferredPrompt = null;
  hidePWABanner();
}

function dismissPWABanner() {
  hidePWABanner();
  localStorage.setItem('pwa_dismissed', '1');
}

/* ── iOS 설치 가이드 모달 ── */
function showIOSGuide() {
  openModal('ios-guide-overlay');
}

function dismissIOSGuide() {
  closeModal('ios-guide-overlay');
  localStorage.setItem('ios_guide_dismissed', '1');
}
