
const PDF = require('../../../models/pdf_file');


/**
 * Updates edit coordinates for multiple pages in a PDF document
 * @route PUT /api/pdf/:jobId/coordinates
 */
async function handleBulkEditCoordinates(req, res) {
  try {
    const { Id } = req.params;
    const { coordinates } = req.body;

    // Input validation
    if (!Id || !Array.isArray(coordinates) || coordinates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid input. Expected jobId and array of coordinates'
      });
    }

    // Validate each coordinate entry
    for (const coord of coordinates) {
      if (!coord.pageNumber || !coord.x || !coord.y || !coord.dataType) {
        return res.status(400).json({
          success: false,
          message: 'Each coordinate must include pageNumber, x, y, and dataType',
          invalidEntry: coord
        });
      }

      // Validate pageNumber is a positive integer
      if (typeof coord.pageNumber !== 'number' || coord.pageNumber < 1) {
        return res.status(400).json({
          success: false,
          message: 'Invalid page number',
          invalidEntry: coord
        });
      }
    }

    // Group coordinates by page number
    const coordinatesByPage = coordinates.reduce((acc, coord) => {
      if (!acc[coord.pageNumber]) {
        acc[coord.pageNumber] = [];
      }
      acc[coord.pageNumber].push({
        x: coord.x,
        y: coord.y,
        dataType: coord.dataType,
        from: coord.from || 'current_user',
        userId: coord.userId || null,  // Make userId optional
        eventId: coord.eventId
      });
      return acc;
    }, {});

    // Create bulk update operations
    const bulkOps = Object.entries(coordinatesByPage).map(([pageNumber, coords]) => ({
      updateOne: {
        filter: {
          _id: Id,
          'pages.pageNumber': parseInt(pageNumber)
        },
        update: {
          $push: {
            'pages.$.editCoordinates': {
              $each: coords
            }
          }
        }
      }
    }));

    console.log(bulkOps)

    // Execute bulk update
    const bulkWriteResult = await PDF.bulkWrite(bulkOps);

    if (bulkWriteResult.modifiedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No pages were updated. PDF document or pages not found'
      });
    }

    // Fetch updated document to return current state
    const updatedPdf = await PDF.findById( Id );
    const updatedPages = updatedPdf.pages.filter(page => 
      coordinates.some(coord => coord.pageNumber === page.pageNumber)
    );

    return res.status(200).json({
      success: true,
      message: 'Edit coordinates updated successfully',
      data: {
        Id,
        modifiedPages: updatedPages.map(page => ({
          pageNumber: page.pageNumber,
          editCoordinates: page.editCoordinates
        })),
        updateSummary: {
          totalPagesUpdated: bulkWriteResult.modifiedCount,
          matchedPages: bulkWriteResult.matchedCount
        }
      }
    });

  } catch (error) {
    console.error('Error updating edit coordinates:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
}


module.exports = handleBulkEditCoordinates