document.querySelectorAll('.faq-question').forEach((question) => {
	question.addEventListener('click', () => {
		const selectedItem = question.closest('.faq-item');
		const shouldOpen = !selectedItem.classList.contains('is-open');

		document.querySelectorAll('.faq-item').forEach((item) => {
			item.classList.remove('is-open');
			item.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
		});

		if (shouldOpen) {
			selectedItem.classList.add('is-open');
			question.setAttribute('aria-expanded', 'true');
		}
	});
});
