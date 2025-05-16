import createElement from "./createElement";

const iframeText = (pageNumber) => {
  return `
        // Set up drag and drop
        const dropTarget = document.getElementById('dropTarget');
        const droppedContainer = document.getElementById('dropped-elements-container');

        let draggedElement = null;
        let initialX = 0;
        let initialY = 0;
        let currentX = 0;
        let currentY = 0;

        // Handle external elements being dragged over
        dropTarget.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropTarget.classList.add('drag-over');
            e.dataTransfer.dropEffect = 'copy';
        });

        dropTarget.addEventListener('dragleave', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dropTarget.classList.remove('drag-over');
        });

        dropTarget.addEventListener('drop', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if ( !draggedElement ) {
              dropTarget.classList.remove('drag-over');
              const rect = dropTarget.getBoundingClientRect();
              const x = ((e.clientX - rect.left) / rect.width) * 100;
              const y = ((e.clientY - rect.top) / rect.height) * 100;

              const eventData = JSON.parse(e.dataTransfer.getData('text/plain'))
              if ( eventData.type == 'signature' ) {
                const id_ = generateUniqueId();
                // Send drop event data to parent window
                window.parent.postMessage({
                    type: 'iframe-drop',
                    pageNumber: ${pageNumber},
                    data: eventData,
                    position: { x, y },
                    id: id_,
                }, '*');
                createSignatureElement(x, y, eventData, id_);
              } else if ( eventData.type == 'sidebar-element') {
                const id_ = generateUniqueId();
                // Send drop event data to parent window
                window.parent.postMessage({
                    type: 'iframe-drop',
                    pageNumber: ${pageNumber},
                    data: e.dataTransfer.getData('text/plain'),
                    position: { x, y },
                    id: id_,
                }, '*');
                createDroppedElement(x, y);
              }


              // Create visual element at drop position

            } else {

              dropTarget.classList.remove('drag-over');
            }
        });

        ${createElement(pageNumber)}


        function handleElementDragStart(e) {
          draggedElement = e.target;
          const rect = draggedElement.getBoundingClientRect();
          const dropRect = dropTarget.getBoundingClientRect();

          initialX = ((e.clientX - rect.left) / dropRect.width) * 100;
          initialY = ((e.clientY - rect.top) / dropRect.height) * 100;
        }

        function handleElementDrag(e) {
            if (draggedElement && e.clientX && e.clientY) {
                const rect = dropTarget.getBoundingClientRect();
                currentX = (((e.clientX - rect.left) / rect.width) * 100) - initialX;
                currentY = (((e.clientY - rect.top) / rect.height) * 100) - initialY;

                const draggedRect = draggedElement.getBoundingClientRect();
                console.log(draggedRect.left , currentX)

                draggedElement.style.left = currentX + '%';
                draggedElement.style.top = currentY + '%';
            } else {
             console.log("element removed", draggedElement);
            draggedElement.remove();
            }
        }

        function handleElementDragEnd(e) {
            console.log('dragEnd', e)
             const element = e.target;
             if (element.dataset.type == "signature") {
                window.parent.postMessage({
                  type: 'update',
                  data: {
                    type: element.dataset.type,
                    content: element.dataset.content,
                    from: element.dataset.from,
                    id: element.dataset.elementId,
                    position: {
                      x: parseInt(element.style.left),
                      y: parseInt(element.style.top)
                    }
                  }
                }, '*');
              }
            draggedElement = null;
        }
      `
}
  ;

export default iframeText
