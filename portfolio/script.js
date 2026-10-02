import { applyPortfolioContent } from './content.js';
import { portfolioSupabase } from './backend.js';

const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('.site-nav');
const themeButton = document.querySelector('.theme-toggle');
const navLinks = [...document.querySelectorAll('.nav-link')];
const sections = [...document.querySelectorAll('main section[id]')];
const liveStatus = document.querySelector('#live-status');

if (portfolioSupabase) {
  let latestUpdate = 0;
  const channel = portfolioSupabase
    .channel('public-portfolio-content')
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'portfolio_content',
      filter: 'id=eq.main',
    }, (payload) => {
      const updatedAt = Date.parse(payload.new.updated_at);
      if (Number.isFinite(updatedAt) && updatedAt < latestUpdate) return;
      latestUpdate = Number.isFinite(updatedAt) ? updatedAt : latestUpdate;
      applyPortfolioContent(payload.new.content);
    })
    .subscribe((status) => {
      liveStatus.classList.toggle('is-connected', status === 'SUBSCRIBED');
      liveStatus.lastChild.textContent = status === 'SUBSCRIBED'
        ? ' Live updates on'
        : ' Published portfolio';
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        console.error(`Portfolio realtime connection status: ${status}`);
      }
    });

  portfolioSupabase
    .from('portfolio_content')
    .select('content, updated_at')
    .eq('id', 'main')
    .single()
    .then(({ data, error }) => {
      if (error) {
        console.error('Unable to load the latest portfolio content', error);
        liveStatus.lastChild.textContent = ' Published version · live sync unavailable';
        return;
      }
      const updatedAt = Date.parse(data.updated_at);
      if (!Number.isFinite(updatedAt) || updatedAt >= latestUpdate) {
        applyPortfolioContent(data.content);
        if (Number.isFinite(updatedAt)) latestUpdate = updatedAt;
      }
    });

  window.addEventListener('pagehide', () => {
    portfolioSupabase.removeChannel(channel);
  }, { once: true });
}

menuButton.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
  navigation.classList.toggle('is-open', !isOpen);
});

navLinks.forEach((link) => {
  link.addEventListener('click', () => {
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    navigation.classList.remove('is-open');
  });
});

themeButton.addEventListener('click', () => {
  const isDark = document.body.classList.toggle('dark-theme');
  themeButton.setAttribute('aria-label', isDark ? 'Switch to light theme' : 'Switch to dark theme');
});

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      navLinks.forEach((link) => {
        const isActive = link.hash === `#${entry.target.id}`;
        link.classList.toggle('active', isActive);
        if (isActive) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-25% 0px -65% 0px' });

  sections.forEach((section) => sectionObserver.observe(section));
} else {
  document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
}
