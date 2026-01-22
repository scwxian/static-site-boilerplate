'use strict';

import { initAccordionAnimations, initTabLayout, initTooltips } from '../js/utils.js';

export default function init() {
    const contentContainer = document.querySelector('#swup[data-page="about"]');
    if (!contentContainer) return;

    initAccordionAnimations(contentContainer);
    initTabLayout(contentContainer);

    const { clickOutsideHandler, tooltip } = initTooltips(contentContainer);
    
    return function cleanupAboutPage() {
        if (clickOutsideHandler) {
            document.removeEventListener('click', clickOutsideHandler);
        }
        
        if (tooltip && tooltip.parentNode === document.body) {
            document.body.removeChild(tooltip);
        }
    };
}
