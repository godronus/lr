$(document).ready(function() {

  $('#search-input').bind('input', () => {
    $('#search-input').removeClass('is-invalid');
  });

  $('#search-button').click(() => {
    submitSearch();
  });

  $('#search-input').keydown((e) => {
    if (e.keyCode === 13) submitSearch();
  });

  function submitSearch() {
    const searchPhrase = $('#search-input').val().trim();
    if (!searchPhrase.length) {
      $('#search-input').addClass('is-invalid');
      $('#search-input').focus();
      return;
    }
    window.location = '/classifieds?sP=' + searchPhrase;
  }
});
