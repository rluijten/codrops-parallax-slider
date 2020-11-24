import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

import { constants, instances } from '../../store';

gsap.registerPlugin(CustomEase);

CustomEase.create('in-out-smooth', 'M0,0 C0.8,0 0.2,1 1,1');

class Placeholders {
  constructor() {
    this.dom = {};
    this.dom.el = document.querySelector('.js-placeholders');
    this.dom.images = this.dom.el.querySelectorAll('.js-img-wrap');
    this.dom.buttonOpen = document.querySelector('.js-slider-open');
    this.dom.content = document.querySelector('.js-content');

    this.bounds = this.dom.el.getBoundingClientRect();

    this.state = {
      animating: false
    };
  }

  setHoverAnimation() {
    this.tlHover = gsap.timeline({ paused: true });

    this.tlHover
      .addLabel('start')

      .set(this.dom.el, { autoAlpha: 1 })
      .set(this.dom.images, { scale: 0.5, x: (window.innerWidth / 12) * 1.2, rotation: 0 })

      .to(this.dom.images, { duration: 1, stagger: 0.07, ease: 'in-out-smooth', x: 0, y: 0 })
      .to(this.dom.images[0], { duration: 1, ease: 'in-out-smooth', rotation: -4 }, 'start')
      .to(this.dom.images[1], { duration: 1, ease: 'in-out-smooth', rotation: -2 }, 'start');
  }

  setExpandAnimation() {
    setTimeout(() => { // set timeout to make sure x position is set (parallax)
      !constants.isDevice && instances.scroll.enable();

      const x1 = this.bounds.left - instances.slider.items[0].bounds.left - 20;
      const x2 = this.bounds.left - instances.slider.items[1].bounds.left + 10;
      const x3 = this.bounds.left - instances.slider.items[2].bounds.left;

      const y1 = this.bounds.top - instances.slider.items[0].bounds.top + 10;
      const y2 = this.bounds.top - instances.slider.items[1].bounds.top - 30;
      const y3 = this.bounds.top - instances.slider.items[2].bounds.top + 30;

      const intersectX1 = constants.isDevice ? 0 : instances.slider.items[0].x;
      const intersectX2 = constants.isDevice ? 0 : instances.slider.items[1].x;
      const intersectX3 = constants.isDevice ? 0 : instances.slider.items[2].x;

      const scale = instances.slider.items[0].bounds.width / this.bounds.width;
      const rotation = 0;

      this.tlExpand = gsap.timeline({
        paused: true,
        onComplete: () => {
          this.state.animating = false;
          this.setHoverAnimation();
        }
      });

      if (constants.isDevice) {
        // set images position + rotation, because there's no hover animation on touch devices
        this.tlExpand.set(this.dom.images, { scale: 0.5, x: (window.innerWidth / 12) * 7, rotation: 0 });
      }

      this.tlExpand
        .addLabel('start')

        .set(this.dom.el, { autoAlpha: 1 })

        .to(this.dom.buttonOpen, { duration: 0.5, autoAlpha: 0 })

        .to(this.dom.content, { duration: 0.8, autoAlpha: 0 }, 'start')

        .to(this.dom.images[0], { duration: 1.67, ease: 'in-out-smooth', x: -x1, y: -y1, scale, rotation }, 'start')
        .to(this.dom.images[1], { duration: 1.67, ease: 'in-out-smooth', x: -x2, y: -y2, scale, rotation }, 'start')
        .to(this.dom.images[2], { duration: 1.67, ease: 'in-out-smooth', x: -x3, y: -y3, scale, rotation }, 'start')

        .to(this.dom.images[0].querySelector('img'), { duration: 1.67, ease: 'in-out-smooth', x: intersectX1 }, 'start')
        .to(this.dom.images[1].querySelector('img'), { duration: 1.67, ease: 'in-out-smooth', x: intersectX2 }, 'start')
        .to(this.dom.images[2].querySelector('img'), { duration: 1.67, ease: 'in-out-smooth', x: intersectX3 }, 'start')

        .set(this.dom.el, { autoAlpha: 0 }, 'start+=1.67')

      this.tlExpand.play();

      instances.slider.open();
    }, 100);
  }

  handleMouseenter = () => {
    if (this.state.animating || constants.isDevice) return;

    this.tlHover.play();
  }

  handleMouseleave = () => {
    if (this.state.animating || constants.isDevice) return;

    this.tlHover.reverse();
  }

  handleClick = () => {
    if (this.state.animating) return;

    this.state.animating = true;

    this.setExpandAnimation();
  }

  handleResize = () => {
    this.bounds = this.dom.el.getBoundingClientRect();

    this.setHoverAnimation();
  }

  addListeners() {
    this.dom.buttonOpen.addEventListener('click', this.handleClick);
    this.dom.buttonOpen.addEventListener('mouseenter', this.handleMouseenter);
    this.dom.buttonOpen.addEventListener('mouseleave', this.handleMouseleave);
    window.addEventListener('resize', this.handleResize);
  }

  init() {
    this.addListeners();
    this.setHoverAnimation();
  }
}

export default Placeholders;