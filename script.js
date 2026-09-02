document.addEventListener('DOMContentLoaded', function () {
  // Checklist items: toggle done state, update progress bar.
  var checkItems = Array.prototype.slice.call(document.querySelectorAll('.check-item'));
  var progressLabel = document.querySelector('.progress-label');
  var progressFill = document.querySelector('.progress-fill');
  var totalChecks = checkItems.length;

  function updateProgress() {
    var doneCount = checkItems.filter(function (item) {
      return item.classList.contains('is-done');
    }).length;
    progressLabel.textContent = '완료 ' + doneCount + ' / ' + totalChecks;
    progressFill.style.width = Math.round((doneCount / totalChecks) * 100) + '%';
  }

  checkItems.forEach(function (item) {
    var header = item.querySelector('.check-header');
    header.addEventListener('click', function () {
      item.classList.toggle('is-done');
      updateProgress();
    });
  });

  updateProgress();

  // Accordions: systems / welfare / faq sections.
  var accordionItems = document.querySelectorAll('.accordion-item');
  accordionItems.forEach(function (item) {
    var header = item.querySelector('.accordion-header');
    header.addEventListener('click', function () {
      item.classList.toggle('is-open');
    });
  });
});
