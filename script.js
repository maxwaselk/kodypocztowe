document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('searchForm');
    const resultDiv = document.getElementById('result');
    const inputs = document.querySelectorAll('input');

    gsap.from(".container", {duration: 1, opacity: 0, y: 50, ease: "power3.out"});
    gsap.from("h1, .description", {duration: 1, opacity: 0, y: 30, ease: "power3.out", delay: 0.3, stagger: 0.2});
    gsap.from(".input-group", {duration: 1, opacity: 0, y: 30, ease: "power3.out", stagger: 0.2, delay: 0.7});
    gsap.from("button", {duration: 1, opacity: 0, y: 30, ease: "power3.out", delay: 1.1});

    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            gsap.to(input.nextElementSibling, {duration: 0.3, y: -20, scale: 0.8, color: getComputedStyle(document.documentElement).getPropertyValue('--secondary-color')});
        });

        input.addEventListener('blur', () => {
            if(input.value === '') {
                gsap.to(input.nextElementSibling, {duration: 0.3, y: 0, scale: 1, color: getComputedStyle(document.documentElement).getPropertyValue('--text-color')});
            }
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const street = document.getElementById('street').value;
        const city = document.getElementById('city').value;

        resultDiv.innerHTML = '<div class="loading"></div>Wyszukiwanie...';
        resultDiv.classList.add('show');

        try {
            const response = await fetchPostalCode(street, city);
            gsap.to(resultDiv, {duration: 0.5, opacity: 0, y: 20, ease: "power3.out", onComplete: () => {
                resultDiv.innerHTML = `Znaleziony kod pocztowy: <strong>${response.postalCode}</strong>`;
                gsap.to(resultDiv, {duration: 0.5, opacity: 1, y: 0, ease: "power3.out"});
            }});
        } catch (error) {
            console.error('Wystąpił błąd:', error);
            gsap.to(resultDiv, {duration: 0.5, opacity: 0, y: 20, ease: "power3.out", onComplete: () => {
                resultDiv.innerHTML = 'Nie znaleziono kodu pocztowego dla podanego adresu lub wystąpił błąd podczas wyszukiwania.';
                gsap.to(resultDiv, {duration: 0.5, opacity: 1, y: 0, ease: "power3.out"});
            }});
        }
    });
});

async function fetchPostalCode(street, city) {
    const query = encodeURIComponent(`${street}, ${city}, Polska`);
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${query}&addressdetails=1`;

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('Błąd sieci podczas pobierania danych');
    }

    const data = await response.json();
    if (data.length === 0) {
        throw new Error('Nie znaleziono adresu');
    }

    const postalCode = data[0].address.postcode;
    if (!postalCode) {
        throw new Error('Nie znaleziono kodu pocztowego dla podanego adresu');
    }

    return { postalCode };
}