// This file is required by the index.html file and will
// be executed in the renderer process for that window.

/*
// Perform action on DOM loaded.
window.addEventListener('DOMContentLoaded', async () => {
     await loadRenderPreset();
});
*/

// Loads render preset list.
async function loadRenderPreset() {
    var cbRenderPreset = document.getElementById('cbRenderPreset');

    if (!cbRenderPreset.options || (cbRenderPreset.options.length === 0)) {
        const renderPresetList = await window.resolveAPI.getRenderPresets();

        for (var index in renderPresetList) {
            option = document.createElement('option');
            option.text = renderPresetList[index];
            option.value = renderPresetList[index];
            cbRenderPreset.appendChild(option);
        }
    }
}

// Creates a new project.
async function createProject() {
    const projName = document.getElementById('projName').value;
    if (!projName) {
        alert('Error: Project name is empty!');
        return;
    }

    project = await window.resolveAPI.createProject(projName);
    if (!project) {
        alert(`Error: Failed to create project: ${projName}`);
        return;
    }

    const isSuccess = await window.resolveAPI.saveProject();
    if (!isSuccess) {
        alert(`Error: Failed to save project: ${projName}`);
        return;
    }

    console.log(`Created project: ${projName}`);
}

// Opens a project.
async function openProject() {
    const projName = document.getElementById('projName').value;
    if (!projName) {
        alert('Error: Project name is empty!');
        return;
    }

    project = await window.resolveAPI.openProject(projName);
    if (!project) {
        alert(`Error: Failed to open project: ${projName}`);
        return;
    }

    console.log(`Opened project: ${projName}`);
}

// Saves current project.
async function saveProject() {
    const isSuccess = await window.resolveAPI.saveProject();
    if (!isSuccess) {
        alert('Error: Failed to save project');
        return;
    }

    console.log('Saved project');
}


// Selects a timeline using name.
async function selectTimeline() {
    const timelineName = document.getElementById('timelineName').value;
    if (!timelineName) {
        alert('Error: Timeline name is empty!');
        return;
    }

    // Set current timeline
    const isSuccess = await window.resolveAPI.selectTimeline(timelineName);
    if (!isSuccess) {
        alert(`Error: Failed to select timeline: ${timelineName}`);
        return;
    }

    console.log(`Selected timeline: ${timelineName}`);
}

// Render current timeline.
async function renderTimeline() {
    const targetDirPath = document.getElementById('targetDirPath').value;
    if (!targetDirPath) {
        alert('Error: Target directory path is empty!');
        return;
    }

    const targetClipName = document.getElementById('targetClipName').value;
    if (!targetClipName) {
        alert('Error: Target clip name is empty!');
        return;
    }

    const renderPresetName = document.getElementById('cbRenderPreset').value;

    await window.resolveAPI.openPage('deliver');

    // Start rendering render job
    const isSuccess = await window.resolveAPI.renderTimeline(timelineName, renderPresetName, targetDirPath, targetClipName);
    if (!isSuccess) {
        alert(`Error: Failed to render timeline: ${timelineName}`);
        return;
    }

    console.log(`Render timeline started: ${timelineName}`);
}

// Added by Alaric

function clearEDL() {
    document.getElementById("EDLTextArea").value = "";
}

function clearXML() {
    document.getElementById("XMLTextArea").value = "";
}

async function makeEDL() {
  const EDLtext = document.getElementById('EDLTextArea');
  EDLtext.value = await window.resolveAPI.makeEDL();
}

async function makeXML() {
  const XMLtext = document.getElementById('XMLTextArea');
  const variableZ = document.getElementById('cbvariablez').checked;
  const annotationText = document.getElementById('annotationText').value;
  console.log(`Call makeXML: ${variableZ}  ${annotationText}`);
  XMLtext.value = await window.resolveAPI.makeXML(variableZ, annotationText);
}

function saveEDL() {
  const EDLtext = document.getElementById('EDLTextArea').value;
  if (!EDLTextArea.value) {
      alert('Error: EDL Area is empty!');
      return;
  }
  console.log(`calling saveEDL function`);
  console.log(`calling saveEDL. EDLtext: ${EDLtext}`);
  window.resolveAPI.saveEDL(EDLtext);
  console.log(`calling saveEDL function`);
}

function saveXML() {
  const XMLtext = document.getElementById('XMLTextArea').value;
  if (!XMLTextArea.value) {
      alert('Error: XML Area is empty!');
      return;
  }
  console.log(`calling saveXML function`);
  console.log(`calling saveXML. XMLtext: ${XMLtext}`);
  window.resolveAPI.saveXML(XMLtext);
}
