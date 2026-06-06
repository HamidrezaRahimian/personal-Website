/**
* PHP Email Form Validation - v3.9
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');
      
      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!');
        return;
      }
      if (action.includes('formsubmit.co') && window.location.protocol === 'file:') {
        displayError(thisForm, 'Please test the contact form from a published website or local web server, not by opening the HTML file directly.');
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error);
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    const isFormSubmitAjax = action.includes('formsubmit.co/ajax/');
    const fetchOptions = {
      method: 'POST'
    };

    if (isFormSubmitAjax) {
      const formPayload = {};
      formData.forEach((value, key) => {
        formPayload[key] = value;
      });
      fetchOptions.body = JSON.stringify(formPayload);
      fetchOptions.headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      };
    } else {
      fetchOptions.body = formData;
      fetchOptions.headers = {'X-Requested-With': 'XMLHttpRequest'};
    }

    fetch(action, fetchOptions)
    .then(response => {
      const contentType = response.headers.get('content-type') || '';
      return response.text().then(text => {
        const data = contentType.includes('application/json') && text ? JSON.parse(text) : text;
        if (!response.ok) {
          const message = typeof data === 'object' ? (data.error || data.message) : data;
          throw new Error(message || `${response.status} ${response.statusText} ${response.url}`);
        }
        return data;
      });
    })
    .then(data => {
      const successText = typeof data === 'string' ? data.trim() : '';
      const successObject = typeof data === 'object' && data !== null && !data.error;
      const emptySuccess = successText === '';

      thisForm.querySelector('.loading').classList.remove('d-block');
      if (successText == 'OK' || successObject || emptySuccess) {
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset();
      } else {
        throw new Error(data || 'Form submission failed. Please try again.');
      }
    })
    .catch((error) => {
      displayError(thisForm, error);
    });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').textContent = error.message || error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
