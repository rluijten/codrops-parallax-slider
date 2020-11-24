import VirtualScroll from 'virtual-scroll';
import { gsap } from 'gsap';

import { lerp, clamp } from './math';
import { constants } from '../store';

export default class Scroll {
  constructor() {
    this.vs = new VirtualScroll();
    this.vs.options.mouseMultiplier = 0.45;

    this.dom = {
      container: document.querySelector('[data-scroll]')
    };

    this.options = {
      ease: 0.1,
      dragSpeed: 1.5,
    };

    this.state = {
      bounds: {},
      current: 0,
      last: 0,
      dragStart: 0,
      dragEnd: 0,
    };
  }

  smooth = () => {
    this.state.last = lerp(this.state.last, this.state.current, this.options.ease);
    this.dom.container.style.transform = `translate3d(${this.state.last}px, 0, 0)`;
  }

  native = () => {
    this.state.current = this.dom.container.scrollLeft;
    this.state.last = lerp(this.state.last, this.state.current, this.options.ease);
  }

  calc = (e) => {
    this.state.current += e.deltaY;
    this.state.current = Math.max((this.state.bounds.width - window.innerWidth) * -1, this.state.current);
    this.state.current = Math.min(0, this.state.current);
  }

  enable() {
    if (!constants.isDevice) {
      this.vs.on(this.calc);
      gsap.ticker.add(this.smooth);
    } else {
      gsap.ticker.add(this.native);
    }
  }

  disable() {
    if (!constants.isDevice) {
      this.vs.off(this.calc);
      gsap.ticker.remove(this.smooth);
    } else {
      gsap.ticker.remove(this.native);
    }
  }

  handleMouseup = () => {
    this.state.dragging = false;
    this.state.dragEnd = this.state.current;

    document.body.classList.remove('is-dragging');
  }

  handleMousedown = (e) => {
    this.state.dragging = true;

    this.state.dragEnd = this.state.current;
    this.state.dragStart = e.clientX;

    document.body.classList.add('is-dragging');
  }

  handleMousemove = (e) => {
    if (!this.state.dragging) return;

    this.state.current = this.state.dragEnd + ((e.clientX - this.state.dragStart) * this.options.dragSpeed);
    this.state.current = clamp(this.state.current, 0, -this.state.bounds.width + window.innerWidth);
  }

  handleMouseleave = () => {
    this.state.dragging = false;
    this.state.dragEnd = this.state.current;

    document.body.classList.remove('is-dragging');
  }

  handleResize = () => {
    this.state.bounds = this.dom.container.getBoundingClientRect();
  }

  addListeners() {
    window.addEventListener('resize', this.handleResize, { passive: true });

    if (!constants.isDevice) {
      this.dom.container.addEventListener('mouseup', this.handleMouseup);
      this.dom.container.addEventListener('mousedown', this.handleMousedown);
      this.dom.container.addEventListener('mouseleave', this.handleMouseleave);
      this.dom.container.addEventListener('mousemove', this.handleMousemove);
    }
  }

  removeListeners() {
    window.removeEventListener('resize', this.handleResize, { passive: true });

    if (!constants.isDevice) {
      this.dom.container.removeEventListener('mouseup', this.handleMouseup);
      this.dom.container.removeEventListener('mousedown', this.handleMousedown);
      this.dom.container.removeEventListener('mouseleave', this.handleMouseleave);
      this.dom.container.removeEventListener('mousemove', this.handleMousemove);
    }
  }

  init() {
    if (constants.isDevice) {
      this.handleResize();
      this.vs.destroy();
      gsap.ticker.add(this.native);
    }

    if (!constants.isDevice) {
      this.handleResize();
      this.vs.on(this.calc);
      gsap.ticker.add(this.smooth);
      this.addListeners();
      this.disable();
    }
  }

  destroy() {
    if (!constants.isDevice) {
      this.disable();
      this.vs.destroy();
      this.removeListeners();
    }
  }
}