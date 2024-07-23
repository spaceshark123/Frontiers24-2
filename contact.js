const contactForm = document.getElementById('contact-form');
let name, email, message;

function submit_form() {
    //hide the form and show a predefined response
    let response = document.getElementById('response');
    name = document.getElementById('name').value;
    email = document.getElementById('email').value;
    message = document.getElementById('message').value;
    response.innerHTML = `Thank you for your message ${name}. We will get back to you as soon as possible.`;
    console.log('form submitted');

    //clear the form
    let allInputs = document.querySelectorAll('input:not([type=\'submit\']) , textarea');
    allInputs.forEach(singleInput => singleInput.value = '');
}