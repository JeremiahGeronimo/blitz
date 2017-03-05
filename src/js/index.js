/*
 * Copyright (C) Webaggressive Development, 2009-2017
 * Denis Klimov (plitnichenko@gmail.com)
 * -------------------------------------------------------------
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 * -------------------------------------------------------------
 */


(function (core) {

    if (!window.jQuery) {
        throw new Error('jQuery not found!');
    }

    if (window && window.jQuery) {
        core(window, window.jQuery);
    }

})(function (global, $) {

    'use strict';

    $(document).ready(function () {

        $(window).on('load resize orientationchange', function () {
            setTimeout(function () {

                var $sectionGetPriceAlt     = $('.tm-section-get-price-alt'),
                    $sectionGetPriceOverlay = $('.tm-section-get-price-overlay'),
                    height                  = $sectionGetPriceAlt.innerHeight();

                if ($sectionGetPriceAlt && $sectionGetPriceOverlay) {
                    $sectionGetPriceOverlay.css({height: height})
                }

            }, 0)
        })

    })

});
