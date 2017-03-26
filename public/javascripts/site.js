$(function () {

  $('.code-snippet-copy').click(function() {
    // Select the email link anchor text
    var emailLink = $(this).prev('pre').get(0);
    // debugger;
    var range = document.createRange();
    range.selectNode(emailLink);
    window.getSelection().addRange(range);

    try {
      // Now that we've selected the anchor text, execute the copy command
      var successful = document.execCommand('copy');
      var msg = successful ? 'successful' : 'unsuccessful';
      console.log('Copy email command was ' + msg);
    } catch(err) {
      console.log('Oops, unable to copy');
    }

    // Remove the selections - NOTE: Should use
    // removeRange(range) when it is supported
    window.getSelection().removeAllRanges();
  });

  $('[data-click-feedback-text]').click(function(ev) {
    var $el = $(ev.currentTarget);
    if (!$el.data('click-feedback-timeout')) {
      $el.data('click-feedback-original-text', $el.text());
      $el.text($el.data('click-feedback-text'));
      $el.data('click-feedback-timeout', setTimeout(function() {
        $el.text($el.data('click-feedback-original-text'));
        $el.removeData('click-feedback-timeout');
      }, 2000));
    }
  });


  $('.contact-us').click(function(e) {
    e.preventDefault();
    var options = {
      modalTitle: 'Contact Webtask Team',
      postUrl: '/contact?source=layout_contact',
    };
    Auth0ContactForm.default.handleQueryString(options);  
    var contact_form = new Auth0ContactForm.default.ContactForm(options);
    contact_form.show();
  });
  $('.contact-us-sales-custom').click(function(e) {
    e.preventDefault();
    var options = {
      modalTitle: 'Webtask Sales Inquiry',
      postUrl: '/contact?source=pricing_custom',
    };
    var contact_form = new Auth0ContactForm.default.ContactForm(options);
    Auth0ContactForm.default.handleQueryString(options);  
    contact_form.show();
  });    
});
