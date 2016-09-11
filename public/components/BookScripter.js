// BookScripter
import React, { PropTypes } from 'react'
import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import * as actions from '../redux/actions'
import Loading from './Loading'
import Snippets from './Presentation/Snippets'
import ExtractionZone from './Presentation/ExtractionZone'
import findIndex from 'lodash/findIndex'

class BookScripter extends React.Component {
  componentDidMount () {
    const { getBookInfo, params } = this.props;
    getBookInfo(params.bookName)
  }
  getNameSuggestion (preSnippetsId) {
    const { getNameSuggestion, params, currentBook } = this.props;
    getNameSuggestion({
      bookName: params.bookName,
      blockId: currentBook.lastBlockIndexWorkedOn,
      speechPreSnippetIdSelected: preSnippetsId
    })
  }
  render() {
    if (this.props.currentBook.bookName === undefined) {
      return <Loading text="Retrieving book details" />
    }
    const { characterProfiles, bookName, currentBlockWorkingOn: {snippets, preSnippets} } = this.props.currentBook;
    const { currentHighlightPredictedName, idLastAddedSnippet } = this.props
    let firstNonWhitespaceIndex = findIndex(preSnippets, ps => ps.type !== 'whitespace')
    return (
      <div>
        <h1>{bookName}</h1>
        <Snippets snippets={snippets} />
        <ExtractionZone
          preSnippets={preSnippets}
          firstNonWhitespaceIndex={firstNonWhitespaceIndex}
          currentHighlightPredictedName={currentHighlightPredictedName}
          characterProfiles={characterProfiles}
          idLastAddedSnippet={idLastAddedSnippet}
          predictCurrentHighlighted={this.getNameSuggestion.bind(this)}
        />
      </div>
    )
  }
}





BookScripter.propTypes = {}
const mapStateToProps = (store, ownProps) => ({
  currentBook: store.book.currentBook,
  currentHighlightPredictedName: store.book.currentHighlightPredictedName,
})
BookScripter = withRouter(connect(mapStateToProps, actions)(BookScripter))
export default BookScripter












