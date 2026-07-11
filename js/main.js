document.addEventListener('DOMContentLoaded', () => {
  const header = document.getElementById('header');
  const navToggle = document.getElementById('navToggle');
  const navMenu = document.getElementById('navMenu');
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const galeriaItems = document.querySelectorAll('.galeria__item');
  const contatoForm = document.getElementById('contatoForm');

  let currentImageIndex = 0;
  const images = Array.from(galeriaItems).map(item => ({
    src: item.querySelector('img').src,
    alt: item.querySelector('img').alt
  }));

  // Header scroll effect
  const handleScroll = () => {
    header.classList.toggle('header--scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile menu toggle
  navToggle.addEventListener('click', () => {
    navMenu.classList.toggle('nav__menu--open');
    navToggle.classList.toggle('active');
  });

  navMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('nav__menu--open');
      navToggle.classList.remove('active');
    });
  });

  // Scroll reveal animation
  const revealElements = document.querySelectorAll('.reveal');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('reveal--visible');
        }, i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  revealElements.forEach(el => revealObserver.observe(el));

  // Lightbox
  const openLightbox = (index) => {
    currentImageIndex = index;
    lightboxImg.src = images[index].src;
    lightboxImg.alt = images[index].alt;
    lightbox.classList.add('lightbox--active');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightbox.classList.remove('lightbox--active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  const showImage = (index) => {
    currentImageIndex = (index + images.length) % images.length;
    lightboxImg.src = images[currentImageIndex].src;
    lightboxImg.alt = images[currentImageIndex].alt;
  };

  galeriaItems.forEach((item, index) => {
    item.addEventListener('click', () => openLightbox(index));
  });

  lightboxClose.addEventListener('click', closeLightbox);
  lightboxPrev.addEventListener('click', () => showImage(currentImageIndex - 1));
  lightboxNext.addEventListener('click', () => showImage(currentImageIndex + 1));

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('lightbox--active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') showImage(currentImageIndex - 1);
    if (e.key === 'ArrowRight') showImage(currentImageIndex + 1);
  });

  // Contact form
  contatoForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const telefone = document.getElementById('telefone').value;
    const interesse = document.getElementById('interesse');
    const interesseText = interesse.options[interesse.selectedIndex].text;
    const mensagem = document.getElementById('mensagem').value;

    const subject = encodeURIComponent(`Casa Folloni — ${interesseText}`);
    const body = encodeURIComponent(
      `Nome: ${nome}\nE-mail: ${email}\nTelefone: ${telefone}\nInteresse: ${interesseText}\n\nMensagem:\n${mensagem}`
    );

    window.location.href = `mailto:raquelceloni@gmail.com?subject=${subject}&body=${body}`;
  });

  // Phone mask
  const telefoneInput = document.getElementById('telefone');
  telefoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }

    e.target.value = value;
  });
});
