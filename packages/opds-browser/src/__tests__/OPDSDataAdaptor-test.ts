jest.dontMock("../OPDSDataAdapter");
jest.dontMock("./OPDSFactory");

import { OPDSArtworkLink, OPDSCollectionLink, OPDSFacetLink } from "opds-feed-parser";
import * as factory from "./OPDSFactory";
import { feedToCollection } from "../OPDSDataAdapter";
const sanitizeHtml = require("sanitize-html");

describe("OPDSDataAdapter", () => {
  it("extracts book info", () => {
    let largeImageLink = factory.artworkLink({
      href: "https://dlotdqc6pnwqb.cloudfront.net/3M/crrmnr9/cover.jpg",
      rel: "http://opds-spec.org/image",
    });

    let thumbImageLink = factory.artworkLink({
      href: "http://example.com/testthumb.jpg",
      rel: "http://opds-spec.org/image/thumbnail",
    });

    let entry = factory.entry({
      id: "urn:librarysimplified.org/terms/id/3M%20ID/crrmnr9",
      title: "The Mayan Secrets",
      authors: [factory.contributor({name: "Clive Cussler"}), factory.contributor({name: "Thomas Perry"})],
      contributors: [factory.contributor({name: "contributor"})],
      summary: factory.summary({content: "&lt;b&gt;Sam and Remi Fargo race for treasure&#8212;and survival&#8212;in this lightning-paced new adventure from #1&lt;i&gt; New York Times&lt;/i&gt; bestselling author Clive Cussler.&lt;/b&gt;&lt;br /&gt;&lt;br /&gt;Husband-and-wife team Sam and Remi Fargo are in Mexico when they come upon a remarkable discovery&#8212;the mummified remainsof a man clutching an ancient sealed pot. Within the pot is a Mayan book larger than any known before.&lt;br /&gt;&lt;br /&gt;The book contains astonishing information about the Mayans, their cities, and about mankind itself. The secrets are so powerful that some people would do anything to possess them&#8212;as the Fargos are about to find out. Many men and women are going to die for that book.<script>alert('danger!');</script>"}),
      categories: [factory.category({label: "label"}), factory.category({term: "no label"}), factory.category({label: "label 2"})],
      links: [largeImageLink, thumbImageLink],
      published: "2014-06-08T22:45:58Z",
      publisher: "Fake Publisher"
    });

    let acquisitionFeed = factory.acquisitionFeed({
      id: "some id",
      entries: [entry],
    });

    let collection = feedToCollection(acquisitionFeed, "");
    expect(collection.books.length).toEqual(1);
    let book = collection.books[0];
    expect(book.id).toEqual(entry.id);
    expect(book.title).toEqual(entry.title);
    expect(book.authors.length).toEqual(2);
    expect(book.authors[0]).toEqual(entry.authors[0].name);
    expect(book.authors[1]).toEqual(entry.authors[1].name);
    expect(book.contributors.length).toEqual(1);
    expect(book.contributors[0]).toEqual(entry.contributors[0].name);
    expect(book.summary).toEqual(sanitizeHtml(entry.summary.content));
    expect(book.summary).toContain("Many men and women are going to die for that book.");
    expect(book.summary).not.toContain("script");
    expect(book.summary).not.toContain("danger");
    expect(book.categories.length).toEqual(2);
    expect(book.categories).toContain("label");
    expect(book.categories).toContain("label 2");
    expect(book.imageUrl).toEqual(thumbImageLink.href);
    expect(book.publisher).toBe("Fake Publisher");
    expect(book.published).toBe("June 8, 2014");
    expect(book.rawEntry).toBe(entry);
  });

  it("extracts link info", () => {
    let navigationLink = factory.link({
      href: "href",
    });

    let linkEntry = factory.entry({
      id: "feed.xml",
      title: "Feed",
      links: [navigationLink],
    });

    let navigationFeed = factory.navigationFeed({
      id: "some id",
      entries: [linkEntry],
    });

    let collection = feedToCollection(navigationFeed, "");
    expect(collection.links.length).toEqual(1);
    let link = collection.links[0];
    expect(link.id).toEqual(linkEntry.id);
    expect(link.text).toEqual(linkEntry.title);
    expect(link.url).toEqual(navigationLink.href);
  });

  it("extracts facet groups", () => {
    let facetLinks = [
      factory.facetLink({
        href: "href1",
        title: "title 1",
        facetGroup: "group A",
        activeFacet: true
      }),
      factory.facetLink({
        href: "href2",
        title: "title 2",
        facetGroup: "group B",
        activeFacet: false
      }),
      factory.facetLink({
        href: "href3",
        title: "title 3",
        facetGroup: "group A"
      })
    ];

    let acquisitionFeed = factory.acquisitionFeed({
      id: "some id",
      entries: [],
      links: facetLinks,
    });

    let collection = feedToCollection(acquisitionFeed, "");
    expect(collection.facetGroups.length).toEqual(2);

    let groupA = collection.facetGroups[0];
    expect(groupA.label).toEqual("group A");
    expect(groupA.facets.length).toEqual(2);

    let groupB = collection.facetGroups[1];
    expect(groupB.label).toEqual("group B");
    expect(groupB.facets.length).toEqual(1);

    let facet1 = groupA.facets[0];
    expect(facet1.label).toEqual("title 1");
    expect(facet1.active).toBeTruthy;
    expect(facet1.href).toEqual("href1");

    let facet2 = groupB.facets[0];
    expect(facet2.label).toEqual("title 2");
    expect(facet2.active).toBeFalsy;
    expect(facet2.href).toEqual("href2");

    let facet3 = groupA.facets[1];
    expect(facet3.label).toEqual("title 3");
    expect(facet3.active).toBeFalsy;
    expect(facet3.href).toEqual("href3");
  });

  it("extracts search link", () => {
    let searchLink = factory.searchLink({
      href: "href",
    });

    let navigationFeed = factory.navigationFeed({
      id: "some id",
      entries: [],
      links: [searchLink],
    });

    let collection = feedToCollection(navigationFeed, "");
    expect(collection.search).toBeTruthy;
    expect(collection.search.url).toEqual("href");
  });

  it("extracts next page url", () => {
    let nextLink = factory.link({
      href: "href",
      rel: "next"
    });

    let acquisitionFeed = factory.acquisitionFeed({
      id: "some id",
      entries: [],
      links: [nextLink],
    });

    let collection = feedToCollection(acquisitionFeed, "");
    expect(collection.nextPageUrl).toBeTruthy;
    expect(collection.nextPageUrl).toEqual("href");
  });
});