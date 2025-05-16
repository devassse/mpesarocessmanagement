const CONFIG = require("../utils/config");
const { Worker } = require('worker_threads');
const GridFSStringService = require("../utils/string_ops");



class PdfConverter {
  constructor(options = {}) {
    this.batchSize = options.batchSize || CONFIG.batchSize;
    this.maxWorkers = options.maxWorkers || CONFIG.maxWorkers;
    this.progressCallback = options.onProgress;
    this.jobId = options.jobId;
    this.userId = options.userId
    this.socket = options.socket
    this.myPDF = options.myPDF
  }



  async convertPages(inputPath, pageRange) {

    const pages = {};
    const batches = this.createBatches(pageRange);

    let completedPages = 0;

    // Emit initial status
    this.emitStatus('started', {
      jobId: this.jobId,
      total: pageRange.length,
      completed: 0,
      percentage: 0,
      userId: this.userId
    });

    const results = await Promise.all(
      batches.map(batch => this.processBatch(inputPath, batch))
    );


    results.forEach(batchResults => {
      Object.assign(pages, batchResults);
      completedPages += Object.keys(batchResults).length;
      this.updateProgress(completedPages, pageRange.length);
    });

    // Emit completion status
    this.emitStatus('completed', {
      jobId: this.jobId,
      total: pageRange.length,
      completed: completedPages,
      percentage: 100,
      userId: this.userId
    });

    return pages;
  }

  emitStatus(status, data) {
    if (this.socket.connected) {
      this.socket.emit('conversion_status', {
        status,
        ...data,
        timestamp: new Date().toISOString()
      });
    }
  }

  createBatches(pageRange) {
    const batches = [];
    for (let i = 0; i < pageRange.length; i += this.batchSize) {
      batches.push(pageRange.slice(i, i + this.batchSize));
    }
    return batches;
  }

  async processBatch(inputPath, pageNumbers) {



    const addHtmlPage = async (pageNumber, content) => {

      try {

        const uploadedFile = await GridFSStringService.storeString(content, `page_${pageNumber}.html`, { contentType: 'text/html' });

        this.myPDF.pages.push({
          pageNumber: pageNumber,
          htmlFile: {
            filename: `page_${pageNumber}.html`,
            fileId: uploadedFile,
          },
          status: 'completed'
        });

      } catch (e) {
        throw new Error("Failed to save the page", e)
      }
    }




    return new Promise((resolve, reject) => {
      const worker = new Worker(`
          const { workerData, parentPort } = require('worker_threads');
          const fs = require('fs').promises;
          const { exec } = require('child_process');
          const { promisify } = require('util');
          const execAsync = promisify(exec);
          const path = require('path');
  
          async function convertPage(inputPath, pageNumber) {
            const outputBasePath = path.join(process.cwd(), 'output', \`page-\${pageNumber}\`);
            
            try {
              await execAsync(\`pdftocairo -svg -f \${pageNumber} -l \${pageNumber} "\${inputPath}" "\${outputBasePath}"\`);
              
              const svgPath = \`\${outputBasePath}\`;
              const svgContent = await fs.readFile(svgPath, 'utf8');
              await fs.unlink(svgPath);
              
              return generateHtml(svgContent, pageNumber);
            } catch (error) {
              throw new Error(\`Failed to convert page \${pageNumber}: \${error.message}\`);
            }
          }
  
          function generateHtml(svgContent, pageNumber) {
            return \`<!DOCTYPE html>
                        <html>
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>PDF Page \${pageNumber}</title>
                            <style>
                                body { 
                                    margin: 0; 
                                    background: #f0f0f0; 
                                    min-width: 320px; 
                                }
                                .page { 
                                    background: white; 
                                    margin: 0 auto;
                                    max-width: 100%; 
                                    transition: transform 0.3s ease; 
                                    border-radius: 4px;
                                    position: relative;
                                }
                                .page svg { 
                                    display: block; 
                                    max-width: 100%; 
                                    height: auto; 
                                    margin: 0 auto; 
                                }
                              
                                @media print {
                                    body { margin: 0; padding: 0; background: white; }
                                    .page { margin: 0; box-shadow: none; border-radius: 0; }
                                    .page-number { display: none; }
                                    .drop-overlay { display: none; }
                                    .dropped-element { display: none; }
                                }
                            </style>
                        </head>
                        <body>
                            <div class="page" id="dropTarget">
                                <div class="drop-overlay"></div>
                                \${svgContent}
                                <div id="dropped-elements-container"></div>
                            </div>
                            <script>
                                // Set up SVG properties
                                document.querySelector('svg').setAttribute('preserveAspectRatio', 'xMidYMid meet');
                                document.querySelector('svg').removeAttribute('width');
                                document.querySelector('svg').removeAttribute('height');
                            </script>
                          
                        </body>
                        </html>\`;
          }
  
          async function processBatch() {
            const results = {};
            for (const pageNumber of workerData.pageNumbers) {
              try {
                results[pageNumber] = await convertPage(workerData.inputPath, pageNumber);
              } catch (error) {
                parentPort.postMessage({ success: false, error: error.message });
                return;
              }
            }
            parentPort.postMessage({ success: true, results });
          }
  
          processBatch();
        `, { eval: true, workerData: { inputPath, pageNumbers } });



      worker.on('message', async message => {
        if (message.success) {
          try {
            const results = message.results;
            for (const [pageNumber, content] of Object.entries(results)) {
              await addHtmlPage(pageNumber, content);
            }
            resolve("success");
          } catch (error) {
            reject(error);
          }
        } else {
          reject(new Error(message.error));
        }
      });

      worker.on('error', reject);
    });
  }

  updateProgress(completed, total) {
    const percentage = Math.round((completed / total) * 100);

    // Emit progress update
    this.emitStatus('progress', {
      jobId: this.jobId,
      total,
      completed,
      percentage
    });

    if (this.progressCallback) {
      this.progressCallback({ completed, total, percentage });
    }
  }
}

module.exports = PdfConverter;