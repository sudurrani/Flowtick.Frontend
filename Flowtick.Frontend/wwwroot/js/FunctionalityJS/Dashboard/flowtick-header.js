/* ============================================================
   FLOWTICK — BOARD HEADER ROW — jQuery
   File: board-header.js
   Depends on: jQuery 3.x
   ============================================================ */

$(function () {

    /* ── Close all dropdowns ── */
    function ftCloseAllDropdowns() {
        $('#ft-user-menu').addClass('ft-dropdown--hidden');
        $('#ft-user-avatar').attr('aria-expanded', 'false');
    }

    /* ── User avatar toggle ── */
    $('#ft-user-avatar').on('click', function (e) {
        e.stopPropagation();
        const $menu = $('#ft-user-menu');
        const isHidden = $menu.hasClass('ft-dropdown--hidden');

        ftCloseAllDropdowns();

        if (isHidden) {
            $menu.removeClass('ft-dropdown--hidden');
            $(this).attr('aria-expanded', 'true');
        }
    });

    /* ── Close dropdowns on outside click ── */
    $(document).on('click.ft-header', function (e) {
        if (!$(e.target).closest('#ft-user-wrap').length) {
            ftCloseAllDropdowns();
        }
    });

    /* ── View toggle (Board / List / Backlog) ── */
    $('#ft-view-toggle').on('click', '.ft-view-toggle__btn', function () {
        $('#ft-view-toggle .ft-view-toggle__btn').removeClass('ft-view-toggle__btn--active');
        $(this).addClass('ft-view-toggle__btn--active');

        const view = $(this).data('view');
        // Fire custom event so other modules can react
        $(document).trigger('ft:view-changed', [view]);
    });

    /* ── Search input focus/blur ── */
    $('#ft-search-input')
        .on('focus', function () {
            $(this).closest('.ft-search').addClass('ft-search--focused');
        })
        .on('blur', function () {
            $(this).closest('.ft-search').removeClass('ft-search--focused');
        })
        .on('input', function () {
            const query = $(this).val().trim();
            // Fire custom event so board/list/backlog can filter
            $(document).trigger('ft:search', [query]);
        });

    /* ── Keyboard: Escape closes menu ── */
    $(document).on('keydown.ft-header', function (e) {
        if (e.key === 'Escape') ftCloseAllDropdowns();
    });

    /* ── Menu item actions (extend as needed) ── */
    $('#ft-menu-profile').on('click', function () {
        ftCloseAllDropdowns();
        $(document).trigger('ft:navigate', ['profile']);
    });

    $('#ft-menu-my-tasks').on('click', function () {
        ftCloseAllDropdowns();
        $(document).trigger('ft:navigate', ['my-tasks']);
    });

    $('#ft-menu-notifications').on('click', function () {
        ftCloseAllDropdowns();
        $(document).trigger('ft:navigate', ['notifications']);
    });

    $('#ft-menu-settings').on('click', function () {
        ftCloseAllDropdowns();
        $(document).trigger('ft:navigate', ['settings']);
    });

    $('#ft-menu-signout').on('click', function () {
        ftCloseAllDropdowns();
        $(document).trigger('ft:signout');
    });




});
