(function(){
  const revealNodes = document.querySelectorAll('.reveal');
  if(!revealNodes.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if(entry.isIntersecting) entry.target.classList.add('visible');
    });
  }, { threshold: 0.15 });

  revealNodes.forEach((el) => observer.observe(el));
})();
