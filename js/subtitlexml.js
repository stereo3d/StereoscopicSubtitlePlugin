// DCDM Subtitle xml
/*
© Alaric Hamacher 2025
/
module.exports = class DCDMSubtitleXML {
    ns = "http://www.smpte-ra.org/schemas/428-7/2014/DCST";
    nsprefix ="";
    //nsprefix ="dcst:";
  constructor(xdoc) {
    this.doc = xdoc;
  }
  */
  const { create } = require('xmlbuilder2');

  class DCDMSubtitleXML {
    constructor(xdoc = null) {
      this.nsprefix = "http://www.smpte-ra.org/schemas/428-7/2014/DCST";
      this.ns = ""; // Or "dcst:" if you want prefixed tags

      if (xdoc) {
        // Use provided XML document
        this.doc = xdoc;
      } else {
        // Create a new XML document with the root element
        this.doc = create()
        this.root = this.doc.ele('SubtitleReel'); // You can also use this.nsprefix + 'DCSubtitle' if needed
      }
    }


  /*
  addheader() {
    const pi = this.doc.createProcessingInstruction('xml', 'version="1.0" encoding="UTF-8"');
    this.doc.insertBefore(pi, this.doc.firstChild);
    //var newElem = this.doc.createElementNS(this.ns,this.nsprefix+"SubtitleReel");
    var newElem = this.doc.createElement(this.nsprefix+"SubtitleReel");
    newElem.setAttribute("xmlns", this.ns);
    newElem.setAttribute("xmlns:xs", "http://www.w3.org/2001/XMLSchema");
    this.doc.appendChild(newElem);
    var root = newElem
    return "addheader";
  }
  */
  addHeader() {
  // Create a new document with processing instruction and root element
  // this.doc.ins('xml', 'version="1.0" encoding="UTF-8"') // Adds <?xml version="1.0" encoding="UTF-8"?>
  //this.doc.ele(this.nsprefix + 'SubtitleReel', {
  //    xmlns: this.ns,
  //    'xmlns:xs': 'http://www.w3.org/2001/XMLSchema'
  //  });

  return "addHeader";
}

  // To get the final XML string
toString(pretty = true) {
  return this.doc.end({ prettyPrint: pretty, headless: true});
}


addElement(elementname, elementvalue) {
  //const targetTag = this.nsprefix + 'SubtitleReel';

  // Find the first element with the given tag name
  // const root = this.doc.find(node => node.node.nodeName === targetTag);
  const root = this.root;

  if (root) {
    root.ele(elementname).txt(elementvalue).up();
  } else {
    console.warn(`Element not found in document.`);
  }
}

  addElementWithParam(elementName, elementValue, paramName, paramValue) {
  // Find the first <SubtitleReel> element
  const root = this.root;

  if (root) {
    // Add new element with text content and an attribute
    root.ele(elementName)
        .att(paramName, paramValue)
        .txt(elementValue)
        .up();
  } else {
    console.warn(`Element not found.`);
  }
}

  addFont(FontID, Color, Weight, Size) {

  let parent = this.doc.find(node => node.node.localName === 'SubtitleList');

  if (!parent) {
    parent = this.doc.root().ele('SubtitleList');
  }
      this.subtitlelist = parent;
  if (this.subtitlelist) {
    // Create a <Font> element with attributes and append it
    this.font = parent.ele('Font')
      .att('ID', FontID)
      .att('Color', Color)
      .att('Weight', Weight)
      .att('Size', Size)
  } else {
    console.log(`Element not found.`);
  }
}

  addSubtitle(SpotNumber, TimeIn, TimeOut) {

    // Find the first <Font> element
    const root = this.font;

    if (root) {
      // Create a new <Subtitle> element with attributes
      const subtitle = root.ele('Subtitle')
        .att('SpotNumber', SpotNumber)
        .att('TimeIn', TimeIn)
        .att('TimeOut', TimeOut);
      console.warn(`Element  added.`);

      return subtitle;
    } else {
      console.warn(`Element not found.`);
      //return null;
    }
  }


  addText(subtitleref, Valign, Vposition, Zmax, Zposition, Text) {
  if (!subtitleref) {
    console.warn("Invalid subtitle reference passed to addText()");
    return;
  }

  // Optional <LoadVariableZ> element if Zposition is not "0"
  if (Zposition !== "0") {
    subtitleref.ele("LoadVariableZ", { ID: "Zvector1" }).txt(Zposition);
  }

  // Create <Text> element with required attributes
  const textElement = subtitleref.ele("Text")
    .att("Valign", Valign)
    .att("Vposition", Vposition)
    .att("Zposition", Zmax);

  if (Zposition !== "0") {
    textElement.att("VariableZ", "Zvector1");
  }

  // Set the text content
  textElement.txt(Text);
}

  }

module.exports = DCDMSubtitleXML;
