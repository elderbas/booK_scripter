'use strict';
let express = require('express');
let _ = require('lodash');
let lowdb = require('lowdb');
let fse = require('fs-extra');
let fs = require('fs');
let router = express.Router();

// input - none BOOK INDEPENDENT
// response - string[] of book names without the .json
router.get('/', function (req, res) {
  // get all names of files in /db
  let filePathsOfBooks = fs.readdirSync(`${_serverDir_}/db`);
  let returnVal = filePathsOfBooks.map((bookNameStr) => {
    return bookNameStr.replace('.json', '');
  });
  res.send(returnVal);
});

// input - (required) bookName to check
// output - [] of {blockId: #, status: string} (in short - a portion of what's on all of them)
// gets the status of all blocks for a specific book
router.get('/:bookName/status/', function (req, res) {
  const bookNameToGetStatuses = _.get(req, 'params.bookName');
  if (!bookNameToGetStatuses) { return res.send('hey, where\'s the bookName beef?'); }

  let filePath = `${_serverDir_}/db/${bookNameToGetStatuses}.json`;
  fse.ensureFile(filePath, function (err) {
    if (err) { return res.send(err); }
    const db = lowdb(filePath);
    let allStatuses = db.get('book.snippetBlocks')
                        .map((v) => { return {blockId: v.blockId, status: v.status}; })
                        .value();
    return res.send(allStatuses);
  });
});

/*
* input: bookName - string of book (without the .json extension)
*        blockId - string (integer of the block of scriptedSnippet to grab)
* return: {block: <blockObj>, blob: <blobById>}
* */
router.get('/:bookName/:blockId', function (req, res) {
  const bookName = _.get(req, 'params.bookName');
  if (!bookName) { return res.send('hey, where\'s the bookName beef?'); }
  const blockId = _.get(req, 'params.blockId');
  if (blockId === undefined) { return res.send('hey, where\'s the blockId beef?'); }


  let filePath = `${_serverDir_}/db/${bookName}.json`;
  fse.ensureFile(filePath, function (err) {
    if (err) { return res.send(err); }
    const db = lowdb(filePath);
    let snippetBlockById = db.get(`book.snippetBlocks[${blockId}]`).value();
    let textBlobById = db.get(`book.textBlobs[${blockId}]`).value();
    return res.send({snippetBlockById, textBlobById});
  });
});


// updating an existing
router.put('/', function () {

});


/*
 * If a custom book name is sent, use that, otherwise use the full file name
 * */
// https://www.npmjs.com/package/express-fileupload
router.post('/', function (req, res) {
  console.log('inside book data');
  const file = _.get(req, 'files.file.data');
  const fileName = _.get(req, 'files.file.name');
  const customBookName = _.get(req, 'body.customBookName');
  const bookNameToUse = (customBookName === null) ? fileName : customBookName;

  if (!file) {
    console.log('bad parameters sent. yes this is intentionally vague.');
    res.send('bad parameters sent. yes this is intentionally vague.');
    return;
  }
  const bookSplitter = require(`${_serverDir_}/src/bookSplitter`);
  const bookStorageFormat = require(`${_serverDir_}/src/bookStorageFormat`);

  // TODO - need to get custom values for booksplitter
  // for now use default
  const bookSplitterConfig = {
    textToSplit: file.toString(),
    strPattern: '\n\n',
    indexIntervalCount: 10000
  };
  let objToStore = bookStorageFormat(bookNameToUse, bookSplitter(bookSplitterConfig));

  let filePath = `${_serverDir_}/db/${bookNameToUse}.json`;
  fse.ensureFile(filePath, function (err) {
    if (err) { return res.send(err); }
    const db = lowdb(filePath);
    db.set('book', objToStore).value();
    return res.send('Book split up and stored.')
  });
});//end router.post('/book_data'


module.exports = router;