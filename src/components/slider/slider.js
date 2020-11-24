import gsap from 'gsap';
import { CustomEase } from 'gsap/CustomEase';

import { constants, instances } from '../../store';

gsap.registerPlugin(CustomEase);

CustomEase.create('in-out-smooth', 'M0,0 C0.8,0 0.2,1 1,1');

class Slider {
  constructor() {
    this.dom = {};
    this.dom.el = document.querySelector('.js-slider');
    this.dom.container = this.dom.el.querySelector('.js-container');
    this.dom.items = this.dom.el.querySelectorAll('.js-item');
    this.dom.images = this.dom.el.querySelectorAll('.js-img-wrap');
    this.dom.headings = this.dom.el.querySelectorAll('.js-heading');
    this.dom.buttons = this.dom.el.querySelectorAll('.js-button');
    this.dom.buttonOpen = document.querySelector('.js-slider-open');
    this.dom.buttonClose = this.dom.el.querySelector('.js-slider-close');
    this.dom.buttonCloseCircle = this.dom.buttonClose.querySelector('circle');
    this.dom.progressWrap = this.dom.el.querySelector('.js-progress-wrap');
    this.dom.progress = this.dom.el.querySelector('.js-progress');
    this.dom.content = document.querySelector('.js-content');

    this.state = {
      open: false,
      scrollEnabled: false,
      progress: 0,
    };
  }

  setCache() {
    this.items = [];
    [...this.dom.items].forEach((el) => {
      const bounds = el.getBoundingClientRect();

      this.items.push({
        img: el.querySelector('img'),
        bounds,
        x: 0,
      });
    });
  }

  render = () => {
    if (constants.isDevice) return;

    const scrollLast = Math.abs(instances.scroll.state.last);

    this.items.forEach((item) => {
      const { bounds } = item;
      const inView = scrollLast + window.innerWidth >= bounds.left && scrollLast < bounds.right;

      if (inView) {
        const min = bounds.left - window.innerWidth;
        const max = bounds.right;
        const percentage = ((scrollLast - min) * 100) / (max - min);
        const newMin = -(window.innerWidth / 12) * 3;
        const newMax = 0;
        item.x = ((percentage - 0) / (100 - 0)) * (newMax - newMin) + newMin;

        item.img.style.transform = `translate3d(${item.x}px, 0, 0) scale(1.75)`;
      }
    });

    if (this.state.scrollEnabled) {
      const min = 0;
      const max = -instances.scroll.state.bounds.width + window.innerWidth;
      this.state.progress = ((instances.scroll.state.last - min) * 100) / (max - min) / 100;

      this.dom.progress.style.transform = `scaleX(${this.state.progress})`;
    }
  }

  open = () => {
    if (this.state.open) return;

    const tl = gsap.timeline({ paused: true });

    const length = this.dom.buttonCloseCircle.getTotalLength();
    this.dom.buttonCloseCircle.style.strokeDasharray = length;
    this.dom.buttonCloseCircle.style.strokeDashoffset = length;

    tl
      .addLabel('start')

      .set(this.dom.items, { autoAlpha: 0 })
      .set(this.dom.el, { autoAlpha: 1 })

      .set(this.dom.headings, { y: -this.dom.headings[0].offsetHeight, rotation: -5 })
      .set(this.dom.buttons, { y: -this.dom.buttons[0].offsetHeight * 1.7 })

      .set(this.dom.progressWrap, { autoAlpha: 0 })
      .set(this.dom.buttonClose, { autoAlpha: 0 })

      .to(this.dom.buttonClose, { duration: 1.5, autoAlpha: 1 }, '+=0.1')
      .to(this.dom.buttonCloseCircle, { duration: 1.5, ease: 'Expo.easeInOut', strokeDashoffset: 0 }, 'start+=0.1')

      .set(this.dom.items, { autoAlpha: 1 }, 'start+=0.5')
      .set(this.dom.images, { autoAlpha: 0 }, 'start+=0.5')
      .set(this.dom.images, { autoAlpha: 1 }, 'start+=1.67')

      .call(() => {
        // reset scroll position
        if (constants.isDevice) {
          this.dom.container.scrollLeft = 0;
        } else {
          instances.scroll.state.current = 0;
          instances.scroll.state.last = 0;
        }

        this.state.scrollEnabled = true;
      })

      .to(this.dom.headings, { duration: 1.6, stagger: 0.15, ease: 'in-out-smooth', y: 0, rotation: 0 }, 'start+=0.5')
      .to(this.dom.buttons, { duration: 1.6, stagger: 0.15, ease: 'in-out-smooth', y: 0 }, 'start+=0.6')
      .to(this.dom.progressWrap, { duration: 0.6, ease: 'in-out-smooth', autoAlpha: 1 }, 'start+=0.73');

    tl.play();

    this.state.open = true;
  }

  close = () => {
    if (!this.state.open) return;

    instances.scroll.disable();
    this.state.scrollEnabled = false;

    const { top, height } = this.dom.items[0].getBoundingClientRect();
    const y = window.innerHeight - top - height + height;

    const tl = gsap.timeline({ paused: true, onComplete: () => {
      if (!constants.isDevice) {
        // reset scroll position
        instances.scroll.state.current = 0;
        instances.scroll.state.last = 0;
        this.state.progress = 0;
      } else {
        this.dom.container.scrollLeft = 0;
      }
    } });

    tl.addLabel('start');

    tl
      .to(this.dom.items, { duration: 1.8, stagger: { each: 0.03, from: 'center' }, ease: 'in-out-smooth', autoAlpha: 0, y })
      .to(this.dom.buttonClose, { duration: 0.5, autoAlpha: 0 }, 'start')
      .to(this.dom.progressWrap, { duration: 0.5, autoAlpha: 0 }, 'start')
      .to(this.dom.buttonOpen, { duration: 0.5, autoAlpha: 1 }, 'start+=0.5')
      .to(this.dom.content, { duration: 0.8, autoAlpha: 1 }, 'start+=1.1')
      .set(this.dom.items, { y: 0 })
      .set(this.dom.el, { autoAlpha: 0 });

    tl.play();

    this.state.open = false;
  }

  handleResize = () => {
    this.setCache();
  }

  addListeners() {
    window.addEventListener('resize', this.handleResize);
    this.dom.buttonClose.addEventListener('click', this.close);
  }

  init() {
    gsap.ticker.add(this.render);
    this.setCache();
    this.addListeners();
  }
}

export default Slider;
