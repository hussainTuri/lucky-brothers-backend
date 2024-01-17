import { NextFunction, Request, Response } from 'express';
import { response } from '../../lib/response';
import puppeteer from 'puppeteer';
import fs from 'fs';

export const generatePdf = async (req: Request, res: Response, next: NextFunction) => {
  const resp = response();

  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`http://localhost:8080/invoices/${req.params.invoiceId}/print`, {
    waitUntil: 'networkidle2',
  });
  await page.waitForSelector('#print-content');
  await page.emulateMediaType('print');

  const path = `/tmp/lucky/invoice-${Date.now()}.pdf`;

  // Downlaod the PDF
  const pdfOptions: Record<string, any> = {
    path,
    margin: { top: '1in', right: '0px', bottom: '1in', left: '0px' },
    printBackground: true,
    timeout: 1800000,
    format: 'A4',
  };
  await page.pdf(pdfOptions);
  // const buffer = await fs.readFile(path)

  res.setHeader('Content-disposition', 'attachment; filename=' + path);
  res.setHeader('Content-type', 'application/octet-stream');

  // Create a read stream from the file and pipe it to the response
  const fileStream = fs.createReadStream(path);
  fileStream.pipe(res);
  // return res.json(resp);
};
