/*!-- main.js --!*/

// маска номера телефона
$('body').on('click', 'input[name="phone"]', function() {
    $(this).each(function() {
        var phone = $(this)
        phone.inputmask("+7(999)999-9999",{ "clearIncomplete": true });
    });
});

// closest полифил
(function(ELEMENT) {
  ELEMENT.matches = ELEMENT.matches || ELEMENT.mozMatchesSelector || ELEMENT.msMatchesSelector || ELEMENT.oMatchesSelector || ELEMENT.webkitMatchesSelector;
  ELEMENT.closest = ELEMENT.closest || function closest(selector) {
      if (!this) return null;
      if (this.matches(selector)) return this;
      if (!this.parentElement) {return null}
      else return this.parentElement.closest(selector)
    };
}(Element.prototype));