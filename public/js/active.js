function toggleMobileMenu() {
  const mobileNav = document.getElementById('mobile-nav');
  const menuIcon = document.getElementById('menu-icon');
  const closeIcon = document.getElementById('close-icon');

  if (mobileNav.classList.contains('open')) {
    mobileNav.classList.remove('open');
    menuIcon.classList.remove('hidden');
    closeIcon.classList.add('hidden');
    document.body.style.overflow = '';
  } else {
    mobileNav.classList.add('open');
    menuIcon.classList.add('hidden');
    closeIcon.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function active(clickedElement) {
  const navItems = document.querySelectorAll('.nav-link-top, .nav-link-mobile');
  navItems.forEach(item => {
    item.classList.remove('active-link');
  });
  clickedElement.classList.add('active-link');
}

lucide.createIcons();
