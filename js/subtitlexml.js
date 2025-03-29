// DCDM Subtitle xml
module.exports = class DCDMSubtitleXML {
    ns = "http://www.smpte-ra.org/schemas/428-7/2014/DCST";
    nsprefix ="";
    //nsprefix ="dcst:";
  constructor(xdoc) {
    this.doc = xdoc;
  }
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
  toString() {
    const docStr = new XMLSerializer().serializeToString(this.doc);
    return docStr;
  }

  addElement(elementname, elementvalue) {
    var newElem = this.doc.createElement(elementname);
    var newText = this.doc.createTextNode(elementvalue);
    newElem.appendChild(newText);
    root = this.doc.getElementsByTagName(this.nsprefix+"SubtitleReel")[0];
    root.appendChild(newElem);
  }

  addElementWithParam(elementname, elementvalue, paramName, paramValue) {
    var newElem = this.doc.createElement(elementname);
    var newText = this.doc.createTextNode(elementvalue);
    newElem.appendChild(newText);
    newElem.setAttribute(paramName, paramValue);
    root = this.doc.getElementsByTagName(this.nsprefix+"SubtitleReel")[0];
    root.appendChild(newElem);
  }

  addFont(FontID, Color, Weight, Size) {
    var fontElem = this.doc.createElement(this.nsprefix+"Font");
    fontElem.setAttribute("ID",FontID);
    fontElem.setAttribute("Color", Color);
    fontElem.setAttribute("Weight", Weight);
    fontElem.setAttribute("Size", Size);
    root = this.doc.getElementsByTagName(this.nsprefix+"SubtitleList")[0];
    root.appendChild(fontElem);
  }

  addSubtitle(SpotNumber,TimeIn, TimeOut){
    root = this.doc.getElementsByTagName(this.nsprefix+"Font")[0];
    var subtitle = this.doc.createElement(this.nsprefix+"Subtitle");
    subtitle.setAttribute("SpotNumber", SpotNumber);
    subtitle.setAttribute("TimeIn", TimeIn);
    subtitle.setAttribute("TimeOut", TimeOut);
    root.appendChild(subtitle);
    return subtitle;
  }

  addText(subtitleref, Valign, Vposition, Zmax, Zposition, Text) {
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

  }

  }
