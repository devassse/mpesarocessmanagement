const createElement = ( pageNumber ) => {

  return (
  `
      const openSignatureSidebar =  () => {
        window.parent.postMessage({
          type: 'open-signature-sidebar',
          pageNumber: ${pageNumber}
        }, '*');
      }

      function createDroppedElement(x, y) {
          const element = document.createElement('div');
          element.className = 'dropped-element';
          element.style.left = x + 'px';
          element.style.top = y + 'px';
          element.textContent = 'Dragged Element';

          // Make the dropped element draggable
          element.draggable = true;
          element.addEventListener('dragstart', handleElementDragStart);
          element.addEventListener('drag', handleElementDrag);
          element.addEventListener('dragend', handleElementDragEnd);

          droppedContainer.appendChild(element);
      }

      function createSignatureElement(x, y, eventData, id_) {
        const element = document.createElement('div');
        element.className = 'dropped-element signature-element';
        element.style.left = x + '%';
        element.style.top = y + '%';

        if (eventData.from === 'current_user') {
          element.style.backgroundColor = '#22222299';
          element.style.color = 'white';
        }

        element.dataset.type = eventData.type;
        element.dataset.content = eventData.content;
        element.dataset.from = eventData.from;
        element.dataset.elementId = id_;

        const image = document.createElement('img');
        image.src = '/checklist.png';
        image.alt = 'Signature';
        image.style.width = '2em';
        image.style.height = '2em';

        const textDiv = document.createElement('div');
        textDiv.textContent = 'sign';

        element.appendChild(image);
        element.appendChild(textDiv);

        element.draggable = true;
        element.addEventListener('dragstart', handleElementDragStart);
        element.addEventListener('drag', handleElementDrag);
        element.addEventListener('dragend', handleElementDragEnd);
        element.addEventListener('click', openSignatureSidebar)

        droppedContainer.appendChild(element);

        return element;
      }

  `)
}

export default createElement;
