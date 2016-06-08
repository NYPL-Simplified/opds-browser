import * as React from "react";
import Book from "./Book";
import CatalogLink from "./CatalogLink";

export default class LaneBook extends Book {
  render(): JSX.Element {
    let bookStyle = {
      whiteSpace: "normal", // overrides laneBooks style
      marginRight: "10px",
      overflow: "hidden",
      height: "250px"
    };

    let bookCoverStyle = {
      width: "150px",
      height: "200px"
    };

    let bookInfoStyle = {
      clear: "left",
      width: "150px",
      textAlign: "center",
      marginTop: "5px"
    };

    return (
      <div className="book laneBook" style={ bookStyle }>
        <CatalogLink
          className="laneBookLink"
          collectionUrl={this.props.collectionUrl}
          bookUrl={this.props.book.url}
          book={this.props.book}
          style={{ color: "black", textDecoration: "none" }}>
          <img src={this.props.book.imageUrl} style={bookCoverStyle} alt=""/>
          <div className="bookInfo" style={ bookInfoStyle }>
            <div className="bookTitle">{this.props.book.title}</div>
          </div>
        </CatalogLink>
      </div>
    );
  }
}