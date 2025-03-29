// DCDM Subtitle xml
/*
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

  /* toString() {
    const docStr = new XMLSerializer().serializeToString(this.doc);
    return docStr;
  }
  */
  // To get the final XML string
toString(pretty = true) {
  return this.doc.end({ prettyPrint: pretty, headless: true});
}

/*  addElement(elementname, elementvalue) {
    var newElem = this.doc.createElement(elementname);
    var newText = this.doc.createTextNode(elementvalue);
    newElem.appendChild(newText);
    root = this.doc.getElementsByTagName(this.nsprefix+"SubtitleReel")[0];
    root.appendChild(newElem);
  }
*/

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

/*  addElementWithParam(elementname, elementvalue, paramName, paramValue) {
    var newElem = this.doc.createElement(elementname);
    var newText = this.doc.createTextNode(elementvalue);
    newElem.appendChild(newText);
    newElem.setAttribute(paramName, paramValue);
    root = this.doc.getElementsByTagName(this.nsprefix+"SubtitleReel")[0];
    root.appendChild(newElem);
  }
  */

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

/*  addFont(FontID, Color, Weight, Size) {
    var fontElem = this.doc.createElement(this.nsprefix+"Font");
    fontElem.setAttribute("ID",FontID);
    fontElem.setAttribute("Color", Color);
    fontElem.setAttribute("Weight", Weight);
    fontElem.setAttribute("Size", Size);
    root = this.doc.getElementsByTagName(this.nsprefix+"SubtitleList")[0];
    root.appendChild(fontElem);
  } */

  addFont(FontID, Color, Weight, Size) {
  //const targetTag = 'SubtitleList';

  // Find the <SubtitleList> element
  // const root = this.doc.find(node => node.node.localName === targetTag);
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

/*  addSubtitle(SpotNumber,TimeIn, TimeOut){
    root = this.doc.getElementsByTagName(this.nsprefix+"Font")[0];
    var subtitle = this.doc.createElement(this.nsprefix+"Subtitle");
    subtitle.setAttribute("SpotNumber", SpotNumber);
    subtitle.setAttribute("TimeIn", TimeIn);
    subtitle.setAttribute("TimeOut", TimeOut);
    root.appendChild(subtitle);
    return subtitle;
  } */

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

/*  addText(subtitleref, Valign, Vposition, Zmax, Zposition, Text) {
    // add variableZ firstChild
    if (Zposition != "0"){
    var varzElement = this.doc.createElement(this.nsprefix+"LoadVariableZ")
    varzElement.setAttribute("ID","Zvector1");
    var varzValues = this.doc.createTextNode(Zposition);
    varzElement.appendChild(varzValues);
    subtitleref.appendChild(varzElement);
    }
    // add the textelement
    var TextElement = this.doc.createElement(this.nsprefix+"Text");
    var TextNode = this.doc.createTextNode(Text);
    TextElement.setAttribute("Valign",Valign);
    TextElement.setAttribute("Vposition", Vposition);
    TextElement.setAttribute("Zposition", Zmax);
    if (Zposition != "0"){
    TextElement.setAttribute("VariableZ","Zvector1");
    }
    TextElement.appendChild(TextNode);
    subtitleref.appendChild(TextElement);
  }*/

  addText(subtitleref, Valign, Vposition, Zmax, Zposition, Text) {
  if (!subtitleref) {
    console.warn("Invalid subtitle reference passed to addText()");
    return;
  }

  // Optional <LoadVariableZ> element if Zposition is not "0"
  if (Zposition !== "0") {
    subtitleref.ele(this.nsprefix + "LoadVariableZ", { ID: "Zvector1" }).txt(Zposition);
  }

  // Create <Text> element with required attributes
  const textElement = subtitleref.ele(this.nsprefix + "Text")
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
