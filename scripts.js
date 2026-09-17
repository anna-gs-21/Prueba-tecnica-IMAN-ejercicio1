const cache = new Set();

const routes = {
  '/': { 
    module: './sections/home/home.js', 
    tag: 'home-section' 
  },
  '/list': { 
    module: './sections/list/list.js', 
    tag: 'list-section' 
  },
};

/**
 * Imports a javascript file
 * Adds the content to a determined div in index.html
 *
 * @param idContainer The id of the index.html div
 * @param filePath The filepath of the html file to fetch
 */ 
async function loadSection(idContainer, filePath) {

  const container = document.getElementById(idContainer);
  const route = routes[filePath];

  try{
    if(!cache.has(route.tag)) {
      await import(route.module);
      cache.add(route.tag);
    }

    container.innerHTML = '';
    const element = document.createElement(route.tag);
    container.appendChild(element);

  } catch (error) {
    console.error('Error loading section:', error);
    container.innerHTML = '<p>Error loading section. Please try again later.</p>';
  }
}

/**
 * Fetches a html file
 * Adds the content to a determined div in index.html
 *
 * @param idContainer The id of the index.html div
 * @param filePath The filepath of the html file to fetch
 */ 
async function initLoad(idContainer, filePath){
  const container = document.getElementById(idContainer);

  try {
    if(!cache.has(idContainer)) {
      const response = await fetch(filePath);

      if (!response.ok) {
        throw new Error(response.statusText);
      }

      cache.add(idContainer);
      container.innerHTML = await response.text();
    }
  } catch (error) {
    console.error('Error loading content:', error);
    container.innerHTML = '<p>Error loading content. Please try again later.</p>';
  }
}
    
document.addEventListener('DOMContentLoaded', () => {
  initLoad('header', 'header.html');
  initLoad('footer', 'footer.html');
  loadSection('content', '/');
});