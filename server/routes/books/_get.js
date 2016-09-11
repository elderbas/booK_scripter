let router = require('express').Router();
let Books = require(`${_serverDir_}/src/dbModels/Books`);
let _ = require('lodash')

router.get('/', getBookNames);
router.get('/info', getBookInfoByName);

function getBookNames (req, res) {
  Books.getNamesOfBooksLoaded()
  .then(arrBookNames => res.send(arrBookNames))
  .catch((err) => {
    console.log('err', err);
    res.send(err);
  });
}

function getBookInfoByName (req, res) {
  let bookName = _.get(req, 'query.bookName')
  if (!bookName) { return errorHandler(req, res, 'empty bookname passed as param', 500) }

  Books.getBookInfo(bookName)
    .then(bookInfo => {
      res.send(filterOutUnnecessaryDataForFrontend(bookInfo))
    })
    .catch(err => res.send(err))
}



module.exports = router;

function filterOutUnnecessaryDataForFrontend (book) {
  let preSnips = book.currentBlockWorkingOn.preSnippets;
  book.currentBlockWorkingOn.preSnippets = preSnips.map(filterOutUnnecessaryDataOnPreSnippetForFrontend)
  return book;
}
function filterOutUnnecessaryDataOnPreSnippetForFrontend (preSnippet) {
  // less work to not have to check the type?
  delete preSnippet.classification
  delete preSnippet.personConfirmedNormalized
  delete preSnippet.predictedCharacterNameNormalized
  return preSnippet
}