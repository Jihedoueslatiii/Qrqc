import { Component, OnInit, HostListener, ElementRef, ViewChild } from '@angular/core';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.css']
})
export class WelcomeComponent implements OnInit {
  @ViewChild('particles') particles!: ElementRef;

  ngOnInit() {
    this.createParticles();
    this.applyLoadingAnimation();
  }

  createParticles() {
    const particlesContainer = this.particles.nativeElement;
    const particleCount = 50;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'particle';
      particle.style.left = Math.random() * 100 + 'vw';
      particle.style.animationDelay = Math.random() * 15 + 's';
      particle.style.animationDuration = (Math.random() * 10 + 10) + 's';
      particlesContainer.appendChild(particle);
    }
  }

  handleQRQCClick() {
    console.log('Navigating to QRQC KPIs...');
    // Add your navigation logic here
    // For example: this.router.navigate(['/qrqc-kpis']);

    const button = document.querySelector('.cta-button') as HTMLElement;
    if (button) {
      button.style.transform = 'scale(0.95)';
      setTimeout(() => {
        button.style.transform = '';
      }, 150);
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    const mouseX = event.clientX / window.innerWidth;
    const mouseY = event.clientY / window.innerHeight;
    
    const logo = document.querySelector('.safran-logo') as HTMLElement;
    const plane = document.querySelector('.plane') as HTMLElement;
    
    if (logo) logo.style.transform = `translate(${mouseX * 10}px, ${mouseY * 10}px)`;
    if (plane) plane.style.filter = `drop-shadow(${mouseX * 20}px ${mouseY * 20}px 30px rgba(69, 183, 209, 0.4))`;
  }

  @HostListener('scroll', ['$event'])
  onScroll() {
    const scrolled = window.pageYOffset;
    const clouds = document.querySelectorAll('.cloud');
    
    clouds.forEach((cloud, index) => {
      (cloud as HTMLElement).style.transform = `translateX(${scrolled * (0.5 + index * 0.2)}px)`;
    });
  }

  @HostListener('keydown', ['$event'])
  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      this.handleQRQCClick();
    }
  }

  applyLoadingAnimation() {
    document.body.style.opacity = '0';
    setTimeout(() => {
      document.body.style.transition = 'opacity 1s ease-in-out';
      document.body.style.opacity = '1';
    }, 100);
  }
}