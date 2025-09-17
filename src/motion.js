// Central motion timing and easing tokens
export const PAGE_TRANSITION = {
  duration: 0.22,
  ease: 'easeInOut',
};

export const TAP_TRANSITION = {
  duration: 0.12,
  ease: 'easeOut',
};

export const MODAL_TRANSITION = {
  duration: 0.3,
  type: 'spring',
  stiffness: 260,
  damping: 20,
};

export const slideVariants = {
  initial: (dir = 1) => ({ opacity: 0, x: 50 * dir }),
  animate: { opacity: 1, x: 0 },
  exit: (dir = -1) => ({ opacity: 0, x: 50 * dir }),
};

