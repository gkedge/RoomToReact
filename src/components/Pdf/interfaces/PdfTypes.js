/* @flow */

export type PdfObject = {
  isLoading: boolean,
  file: ?string,
  content: ?string,
  page: ?number,
  scale: ?number,
  onDocumentComplete : Function,
  onPageComplete: Function
}


