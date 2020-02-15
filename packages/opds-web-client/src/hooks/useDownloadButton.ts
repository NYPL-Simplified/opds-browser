import * as React from "react";
import { MediaLink, FulfillmentLink, MediaType } from "./../interfaces";
import { useActions } from "../components/context/ActionsContext";
import download from "../components/download";
import { generateFilename, typeMap } from "../utils/file";

export function fixMimeType(
  mimeType: MediaType | "vnd.adobe/adept+xml"
): MediaType {
  return mimeType === "vnd.adobe/adept+xml"
    ? "application/vnd.adobe.adept+xml"
    : mimeType;
}

function isIndirect(
  link: MediaLink | FulfillmentLink
): link is FulfillmentLink {
  return !!(
    (link as FulfillmentLink).indirectType &&
    link.type === "application/atom+xml;type=entry;profile=opds-catalog"
  );
}

const STREAMING_MEDIA_LINK_TYPE: MediaType =
  "text/html;profile=http://librarysimplified.org/terms/profiles/streaming-media";

export default function useDownloadButton(
  link: MediaLink | FulfillmentLink,
  title
) {
  const { actions, dispatch } = useActions();
  const mimeTypeValue = fixMimeType(link.type);

  // this ?? syntax is similar to x || y, except that it will only
  // fall back if the predicate is undefined or null, not if it
  // is falsy (false, 0, etc). Called nullish-coalescing
  const fileExtension = typeMap[mimeTypeValue]?.extension ?? "";

  const fulfill = async () => {
    if (isIndirect(link)) {
      const action = actions.indirectFulfillBook(link.url, link.indirectType);
      const url = await dispatch(action);
      window.open(url, "_blank");
    } else {
      // TODO: use mimeType variable once we fix the link type in our
      // OPDS entries
      const action = actions.fulfillBook(link.url);
      const blob = await dispatch(action);
      download(
        blob,
        generateFilename(title ?? "untitled", fileExtension),
        mimeTypeValue
      );
    }
  };

  const typeName = typeMap[mimeTypeValue]?.name;
  const downloadLabel =
    isIndirect(link) && link.indirectType === STREAMING_MEDIA_LINK_TYPE
      ? "Read Online"
      : `Download${typeName ? " " + typeName : ""}`;

  return {
    fulfill,
    isIndirect,
    downloadLabel,
    mimeType: mimeTypeValue,
    fileExtension
  };
}
