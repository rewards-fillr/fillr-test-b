"use strict";

// Write your module here
// It must send an event "frames:loaded" from the top frame containing a list of { name:label } pairs,
// which describes all the fields in each frame.

// This is a template to help you get started, feel free to make your own solution.
function execute() {
  try {
    // Step 1: Scrape Fields and Create Fields list object.
    function scrapeFields() {
      const fields = Array.from(document.querySelectorAll("form [name]")).map(
        (control) => ({
          name: control.name,
          label: getLabelForControl(control),
        })
      );

      return fields;
    }

    function getLabelForControl(control) {
      const labelElement = control.labels && control.labels[0];
      if (labelElement) {
        return labelElement.textContent;
      }
      return "";
    }

    function countFieldsInTopFrameAndFrames() {
      const topFrameFieldsCount = scrapeFields().length;
      const iframeFieldsCount = Array.from(
        document.querySelectorAll("iframe")
      ).reduce(
        (count, iframe) => count + iframe.contentWindow.scrapeFields().length,
        0
      );
      return topFrameFieldsCount + iframeFieldsCount;
    }

    function sortFieldsByName(fields) {
      return fields.sort((a, b) => a.name.localeCompare(b.name));
    }

    // Step 2: Add Listener for Top Frame to Receive Fields.
    if (isTopFrame()) {
      let allFields = [];

      window.addEventListener("message", (event) => {
        const { source, data } = event;

        if (source !== window.top || !data.fields) return;

        allFields = allFields.concat(data.fields);
        console.log("all", allFields);
        if (allFields.length === countFieldsInTopFrameAndFrames()) {
          const sortedFields = sortFieldsByName(allFields);
          const event = new CustomEvent("frames:loaded", {
            detail: { fields: sortedFields },
          });
          window.dispatchEvent(event);
        }
      });
    } else {
      // Child frames send Fields up to Top Frame.
      const fields = scrapeFields();
      console.log(fields);
      const message = { fields };
      window.parent.postMessage(message, "*");
    }
  } catch (e) {
    console.error(e);
  }
}

execute();

// Utility functions to check and get the top frame
// as Karma test framework changes top & context frames.
// Use this instead of "window.top".
function getTopFrame() {
  return window.top.frames[0];
}

// function isTopFrame() {
//   return window.self === window.top;
// }

function isTopFrame() {
  return window.location.pathname == "/context.html";
}
