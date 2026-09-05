const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.desktop-nav');

menuButton?.addEventListener('click', () => {
  const isOpen = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!isOpen));
  menuButton.setAttribute('aria-label', isOpen ? 'Open menu' : 'Close menu');
  nav?.classList.toggle('is-open', !isOpen);
});

document.querySelectorAll('.desktop-nav a').forEach((link) => {
  link.addEventListener('click', () => {
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open menu');
    nav?.classList.remove('is-open');
    document.querySelectorAll('.desktop-nav a').forEach((item) => item.classList.remove('active'));
    link.classList.add('active');
  });
});

const serviceMap = {
  seo: 'Local SEO',
  google: 'Google Business Profile',
  social: 'Social Media',
  ads: 'Ads',
  reviews: 'Not sure yet',
  website: 'Website',
};

const requestedService = new URLSearchParams(window.location.search).get('service');
const serviceCheckbox = [...document.querySelectorAll('input[name="help"]')].find((input) => input.value === serviceMap[requestedService]);
if (serviceCheckbox) serviceCheckbox.checked = true;

document.querySelector('.audit-form')?.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.currentTarget;
  const button = form.querySelector('button');
  button.innerHTML = 'Message received <span>✓</span>';
  button.disabled = true;
});
