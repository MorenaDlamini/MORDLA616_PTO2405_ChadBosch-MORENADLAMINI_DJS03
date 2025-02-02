import { books, authors, genres, BOOKS_PER_PAGE } from './data.js';

let page = 1;
let matches = books;

document.addEventListener("DOMContentLoaded", () => {
    initializeApp();
});

/**
 * Initializes app: renders books, populates dropdowns, sets theme, and adds events.
 */
function initializeApp() {
    renderBookList(matches.slice(0, BOOKS_PER_PAGE));
    populateDropdown("[data-search-genres]", genres, "All Genres");
    populateDropdown("[data-search-authors]", authors, "All Authors");
    setupTheme();
    attachEventListeners();
}

/**
 * Renders book list efficiently using document fragments.
 */
function renderBookList(booksToRender) {
    const listContainer = document.querySelector("[data-list-items]");
    listContainer.innerHTML = "";
    const fragment = document.createDocumentFragment();

    booksToRender.forEach(({ author, id, image, title }) => {
        const element = document.createElement("button");
        element.classList.add("preview");
        element.dataset.preview = id;
        element.innerHTML = `
            <img class="preview__image" src="${image}" />
            <div class="preview__info">
                <h3 class="preview__title">${title}</h3>
                <div class="preview__author">${authors[author]}</div>
            </div>
        `;
        fragment.appendChild(element);
    });

    listContainer.appendChild(fragment);
}

/**
 * Populates dropdown with options, adding 'All' as default.
 */
function populateDropdown(selector, data, defaultOption) {
    const dropdown = document.querySelector(selector);
    dropdown.innerHTML = `<option value="any">${defaultOption}</option>`;

    Object.entries(data).forEach(([id, name]) => {
        const option = document.createElement("option");
        option.value = id;
        option.innerText = name;
        dropdown.appendChild(option);
    });
}

/**
 * Sets theme based on user/system preference.
 */
function setupTheme() {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(prefersDark ? 'night' : 'day');
}

function setTheme(theme) {
    const darkMode = theme === 'night';
    document.documentElement.style.setProperty('--color-dark', darkMode ? '255, 255, 255' : '10, 10, 20');
    document.documentElement.style.setProperty('--color-light', darkMode ? '10, 10, 20' : '255, 255, 255');
}

/**
 * Adds event listeners for UI interactions.
 */
function attachEventListeners() {
    document.querySelector(".header__logo").addEventListener("click", () => location.reload());
    document.querySelector("[data-header-search]").addEventListener("click", () => toggleDialog("[data-search-overlay]", true));
    document.querySelector("[data-header-settings]").addEventListener("click", () => toggleDialog("[data-settings-overlay]", true));
    document.querySelector("[data-list-close]").addEventListener("click", () => toggleDialog("[data-list-active]", false));
    document.querySelector("[data-settings-cancel]").addEventListener("click", () => toggleDialog("[data-settings-overlay]", false));
    document.querySelector("[data-search-cancel]").addEventListener("click", () => toggleDialog("[data-search-overlay]", false));
    document.querySelector("[data-settings-form]").addEventListener("submit", handleThemeChange);
    document.querySelector("[data-search-form]").addEventListener("submit", handleSearch);
    document.querySelector("[data-list-items]").addEventListener("click", handleBookSelection);
    document.querySelector("[data-list-button]").innerText = "Load more";
    document.querySelector("[data-list-button]").addEventListener("click", loadMoreBooks);
}

function toggleDialog(selector, show) {
    document.querySelector(selector).open = show;
}

function handleThemeChange(event) {
    event.preventDefault();
    const theme = new FormData(event.target).get("theme");
    setTheme(theme);
    toggleDialog("[data-settings-overlay]", false);
}

/**
 * Filters books based on search criteria.
 */
function handleSearch(event) {
    page = 1;
    event.preventDefault();
    const filters = Object.fromEntries(new FormData(event.target));
    matches = books.filter(book => 
        (filters.title.trim() === "" || book.title.toLowerCase().includes(filters.title.toLowerCase())) &&
        (filters.author === "any" || book.author === filters.author) &&
        (filters.genre === "any" || book.genres.includes(filters.genre))
    );

    document.querySelector("[data-list-message]").classList.toggle("list__message_show", matches.length < 1);
    renderBookList(matches.slice(0, BOOKS_PER_PAGE));
    toggleDialog("[data-search-overlay]", false);
}

/**
 * Loads more books, prioritizing similar authors/genres.
 */
function loadMoreBooks() {
    page++;
    const lastLoadedBook = matches[(page - 1) * BOOKS_PER_PAGE - 1];
    let additionalBooks = books.filter(book => 
        book.author === lastLoadedBook.author || 
        book.genres.some(genre => lastLoadedBook.genres.includes(genre))
    );
    
    matches = [...matches, ...additionalBooks];
    page++;
    renderBookList(matches.slice(0, page * BOOKS_PER_PAGE));
}

/**
 * Displays book details in an overlay.
 */
function handleBookSelection(event) {
    const target = event.target.closest("[data-preview]");
    if (!target) return;
    const book = books.find(b => b.id === target.dataset.preview);
    if (!book) return;

    document.querySelector("[data-list-active]").open = true;
    document.querySelector("[data-list-blur]").src = book.image;
    document.querySelector("[data-list-image]").src = book.image;
    document.querySelector("[data-list-title]").innerText = book.title;
    document.querySelector("[data-list-subtitle]").innerText = `${authors[book.author]} (${new Date(book.published).getFullYear()})`;
    document.querySelector("[data-list-description]").innerText = book.description;
}
