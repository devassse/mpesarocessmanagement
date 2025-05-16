function createSignatureElement(element, iframe) {
  const { position, data, id } = element;
  const domElement = document.createElement('div');
  domElement.className = 'dropped-element new-element signature-element';
  domElement.style.left = position.x + '%';
  domElement.style.top = position.y + '%';

  if (data.from === 'current_user') {
    domElement.style.backgroundColor = '#22222299';
    domElement.style.color = 'white';
  }

  // Set data attributes
  domElement.dataset.type = data.type;
  domElement.dataset.content = data.content;
  domElement.dataset.from = data.from;
  domElement.dataset.elementId = id;

  // Create signature element content
  const image = document.createElement('img');
  image.src = '/checklist.png';
  image.alt = 'Signature';
  image.style.width = '2em';
  image.style.height = '2em';

  const textDiv = document.createElement('div');
  textDiv.textContent = 'sign';

  domElement.appendChild(image);
  domElement.appendChild(textDiv);
  domElement.draggable = true;

  iframe.contentDocument.getElementById('dropTarget').appendChild(domElement);

  // Add event listeners
  const script = document.createElement('script');
  script.textContent = `
    document.querySelectorAll('.new-element').forEach(element => {
      element.addEventListener('dragstart', handleElementDragStart);
      element.addEventListener('drag', handleElementDrag);
      element.addEventListener('dragend', handleElementDragEnd);
      element.addEventListener('click', openSignatureSidebar);
    });
  `;
  iframe.contentDocument.body.appendChild(script);
}

const initContent = (elementsStore, pageNumber, iframe) => {
  // Get elements for current page from Pinia store
  const currentPageElements = elementsStore.getCurrentPageElements;

  console.log('Initializing content for page', pageNumber, 'with elements:', currentPageElements);

  if (currentPageElements && currentPageElements.length > 0) {
    currentPageElements.forEach(element => {
      if (element.data.type === 'signature') {
        createSignatureElement(element, iframe);
      }
    });
  }

  return iframe;
};

export default initContent;
