// NOTE: Follow the security guide while implementing plugin app https://www.electronjs.org/docs/tutorial/security

// Modules to control application life and create native browser window.
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const os = require('os');
const WorkflowIntegration = require('./WorkflowIntegration.node');
const Timecode = require('./js/smpte-timecode.js')

const { create } = require('xmlbuilder2');

let DCDMSubtitleXML = require('./js/subtitlexml.js')

const fs = require('fs');
const { dialog } = require('electron')


const PLUGIN_ID = 'de.virtual-experience.resolve.stereoscopicsubtitlesplugin';

isInitialized = WorkflowIntegration.Initialize(PLUGIN_ID);
 if (!isInitialized) {
             alert("Error: Failed to initialize!");
         }

// Cached objects
let resolveObj = null;
let projectManagerObj = null;

// Initialize Resolve interface and returns Resolve object.
async function initResolveInterface() {
    // Initialize resolve interface
    const isSuccess = await WorkflowIntegration.Initialize(PLUGIN_ID);
    if (!isSuccess) {
        console.log('Error: Failed to initialize Resolve interface!');
        return null;
    }

    // Get resolve interface object
    resolveInterfacObj = await WorkflowIntegration.GetResolve();
    if (!resolveInterfacObj) {
        console.log('Error: Failed to get Resolve object!');
        return null;
    }

    return resolveInterfacObj
}

// Cleanup Resolve interface.
function cleanup() {
    const isSuccess = WorkflowIntegration.CleanUp();
    if (!isSuccess) {
        console.log('Error: Failed to cleanup Resolve interface!');
    }

    resolveObj = null;
    projectManagerObj = null;
}

// Gets Resolve object.
async function getResolve() {
    if (!resolveObj) {
        resolveObj = await initResolveInterface();
    }

    return resolveObj;
}

// Gets project manager object.
async function getProjectManager() {
    if (!projectManagerObj) {
        resolve = await getResolve();
        if (resolve) {
            projectManagerObj = await resolve.GetProjectManager();
            if (!projectManagerObj) {
                console.log('Error: Failed to get ProjectManager object!');
            }
        }
    }

    return projectManagerObj;
}

// Gets current project object.
async function getCurrentProject() {
    curProjManager = await getProjectManager();
    if (curProjManager) {
        currentProject = await curProjManager.GetCurrentProject();
        if (!currentProject) {
            console.log('Error: Failed to get current project object!');
        }

        return currentProject;
    }

    return null;
}

// Gets media pool object.
async function getMediaPool() {
    curProjManager = await getCurrentProject();
    if (curProjManager) {
        mediaPool = await curProjManager.GetMediaPool();
        if (!mediaPool) {
            console.log('Error: Failed to get MediaPool object!');
        }

        return mediaPool;
    }

    return null;
}

// Gets root folder object.
async function getRootFolder() {
    mediaPool = await getMediaPool();
    if (!mediaPool) return null;

    return await mediaPool.GetRootFolder();
}

// Gets folder object by name.
async function getFolder(rootBin, folderName) {
    if (!rootBin) return null;

    const folderList = await rootBin.GetSubFolderList();
    if (!folderList || (folderList.length === 0)) return null;

    for (const folder of folderList) {
        const tempFolderName = await folder.GetName();
        if (tempFolderName === folderName) return folder;
    }

    return null;
}

// Gets timeline object by name.
async function getTimeline(project, timelineName) {
    if (!project) return null;

    const timelineCount = await project.GetTimelineCount();
    if (!timelineCount || (timelineCount <= 0)) return null;

    for (let i = 1; i <= timelineCount; i++) {
        timeline = await project.GetTimelineByIndex(i);
        if (timeline && (await timeline.GetName() === timelineName)) {
            return timeline;
        }
    }

    return null;
}

// Opens input page.
async function openPage(event, pageName) {
    resolve = await getResolve();
    if (!resolve) return false;

    if (await resolve.GetCurrentPage() === pageName) return true;

    return await resolve.OpenPage(pageName);
}

// Creates a new project.
async function createProject(event, projectName) {
    projectManager = await getProjectManager();
    if (!projectManager) return null;

    return await projectManager.CreateProject(projectName);
}

// Saves current project.
async function saveProject() {
    projectManager = await getProjectManager();
    if (!projectManager) return false;

    return await projectManager.SaveProject();
}

// Opens a project.
async function openProject(event, projName) {
    projectManager = await getProjectManager();
    if (!projectManager) return null;

    return await projectManager.LoadProject(projName);
}

// Creates a new bin.
async function createBin(event, binName) {
    rootBin = await getRootFolder();
    if (!rootBin) return null;

    return await mediaPool.AddSubFolder(rootBin, binName);
}

// Selects a bin.
async function selectBin(event, binName) {
    rootBin = await getRootFolder();
    if (!rootBin) return null;

    const folderToSelect = await getFolder(rootBin, binName);
    if (!folderToSelect) return false;

    return await mediaPool.SetCurrentFolder(folderToSelect);
}

// Deletes a bin.
async function deleteBin(event, binName) {
    mediaPool = await getMediaPool();
    if (!mediaPool) return null;

    rootBin = await mediaPool.GetRootFolder();
    if (!rootBin) return null;

    const folderToDelete = await getFolder(rootBin, binName);
    if (!folderToDelete) return null;

    const folderList = [folderToDelete];
    return await mediaPool.DeleteFolders(folderList);
}

// Add clips to media pool.
async function addClips(event, filePathsArray) {
    resolve = await getResolve();
    if (!resolve) return null;

    mediaStorage = await resolve.GetMediaStorage();
    if (!mediaStorage) return null;

    return await mediaStorage.AddItemListToMediaPool(filePathsArray);
}

// Creates a new timeline with all the clips in current folder.
async function createTimeline(event, timelineName) {
    mediaPool = await getMediaPool();
    if (!mediaPool) return null;

    currentFolder = await mediaPool.GetCurrentFolder();
    if (!currentFolder) return null;

    // Get current folder clips
    clips = await currentFolder.GetClipList();
    if (!clips || (clips.length === 0)) return null;

    // Create timeline with clips
    return await mediaPool.CreateTimelineFromClips(timelineName, clips);
}

// Selects a timeline using name.
async function selectTimeline(event, timelineName) {
    project = await getCurrentProject();
    if (!project) return null;

    timeline = await getTimeline(project, timelineName);
    if (!timeline) return null;

    // Set current timeline
    return await project.SetCurrentTimeline(timeline);
}

// Render current timeline.
async function renderTimeline(event, timelineName, renderPresetName, targetDirPath, targetClipName) {
    project = await getCurrentProject();
    if (!project) return false;

    const timeline = await project.GetCurrentTimeline();
    if (!timeline) return false;

    // Set render settings
    const isSuccess = await project.SetRenderSettings({ "TargetDir": targetDirPath, "CustomName": targetClipName });
    if (!isSuccess) return false;

    // Add render job
    const jobId = await project.AddRenderJob();
    if (!jobId) return false;

    // Start rendering render job
    return await project.StartRendering(jobId);
}

// Gets render presets string list.
async function getRenderPresets() {
    project = await getCurrentProject();
    if (project) {
        return await project.GetRenderPresets();
    }

    return null;
}

// Register resolve event handler functions.
function registerResolveEventHandlers() {
    // Page
    ipcMain.handle('resolve:openPage', openPage);
    // Project
    ipcMain.handle('resolve:createProject', createProject);
    ipcMain.handle('resolve:saveProject', saveProject);
    ipcMain.handle('resolve:openProject', openProject);
    // Bin
    ipcMain.handle('resolve:createBin', createBin);
    ipcMain.handle('resolve:selectBin', selectBin);
    ipcMain.handle('resolve:deleteBin', deleteBin);
    // Clips
    ipcMain.handle('resolve:addClips', addClips);
    // Timeline
    ipcMain.handle('resolve:createTimeline', createTimeline);
    ipcMain.handle('resolve:selectTimeline', selectTimeline);
    // Render
    ipcMain.handle('resolve:renderTimeline', renderTimeline);
    // RenderPreset
    ipcMain.handle('resolve:getRenderPresets', getRenderPresets);
    //
    //
    // Added by Alaric
    ipcMain.handle('resolve:makeEDL', makeEDL);
    ipcMain.handle('resolve:saveEDL', saveEDL);
    ipcMain.handle('resolve:saveXML', saveXML);
    ipcMain.handle('resolve:makeXML', makeXML);
}

async function createWindow () {
    // Create the browser window.
    mainWindow = new BrowserWindow({
        width: 900,
        height: 825,
        useContentSize: true,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js')
        }
    });

    // activate the Debugger
    mainWindow.openDevTools();


    // Hide the menu bar (enable below code to hide menu bar)
    //mainWindow.setMenu(null);

    mainWindow.on('close', function(e) {
        cleanup();
        app.quit();
    });

    // Load index.html on the window.
    mainWindow.loadFile('index.html');

    // Open the DevTools (enable below code to show DevTools)
    //mainWindow.webContents.openDevTools();
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    registerResolveEventHandlers();
    createWindow();
});

// Quit when all windows are closed.
app.on('window-all-closed', function () {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        cleanup();
        app.quit();
    }
});

app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// In this file you can include the rest of your plugin specific main process
// code. You can also put them in separate files and require them here.

// Alaric Plugin code:

const crypto = require('crypto');

function uuid() {
  return 'xxxxxxxx-xxxx-4xxx-8xxx-xxxxxxxxxxxx'.replace(/[x]/g, (c) => {
    const r = crypto.randomBytes(1)[0] % 16;
    return r.toString(16);
  });
}

var convertTime = function (frames, fps) {
    fps = (typeof fps !== 'undefined' ?  fps : 30 );
    var pad = function(input) {return (input < 10) ? "0" + input : input;},
        seconds = (typeof frames !== 'undefined' ?  frames / fps : 0 );
    return [
        pad(Math.floor(seconds / 3600)),
        pad(Math.floor(seconds % 3600 / 60)),
        pad(Math.floor(seconds % 60)),
        pad(Math.floor(frames % fps))
    ].join(':');
}

function pad(num, size) {
    var s = "000000000" + num;
    return s.substr(s.length-size);
}

async function saveEDL(event, EDLtext) {
    // Resolves to a Promise<Object>
    const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Select the File Path to save',
        defaultPath: app.getPath("desktop")+path.sep+("subtitles.edl"),
        buttonLabel: 'Save',
        // Restricting the user to only Text Files.
        filters: [
            {
                name: 'EDL',
                extensions: ['edl']
            }, ],
        properties: []
    });

        if (filePath && !canceled) {
            const docStr = EDLtext;
            // Creating and Writing to the file
            fs.writeFile(filePath,
                         docStr, function (err) {
                if (err) throw err;
            });
        }
        return 0;
}

async function saveXML(event, XMLtext) {
    // Resolves to a Promise<Object>
    const { filePath, canceled } = await dialog.showSaveDialog({
        title: 'Select the File Path to save',
        defaultPath: app.getPath("desktop")+path.sep+("subtitles.xml"),
        buttonLabel: 'Save',
        // Restricting the user to only Text Files.
        filters: [
            {
                name: 'XML',
                extensions: ['xml']
            }, ],
        properties: []
    });

        if (filePath && !canceled) {
            const docStr = XMLtext;
            // Creating and Writing to the file
            fs.writeFile(filePath,
                         docStr, function (err) {
                if (err) throw err;
            });
        }
        return 0;
}

/// make the EDLtext

async function getEDL(timeline, subtitletrackNR) {
    var edl = "";
    edl += "TITLE: " + timeline.GetName() + "\n";
    framerate = timeline.GetSetting("timelineFrameRate");

    var TrackItems = timeline.GetItemListInTrack("subtitle", subtitletrackNR);
    TrackItems.forEach(function(element, index) {
      // get the text from the SubTrackItems

      fstart = parseInt(element.GetStart());
      fend = parseInt(element.GetEnd());
      tstart = convertTime(fstart,framerate);
      tend = convertTime(fend,framerate);
      fname = "subtitles.mov";

    edl += pad(index+1,3) + "  AX       V     C        "
          + tstart + " " + tend + " "
          + tstart + " " + tend + "\n"
          + "* FROM CLIP NAME: " + fname + "\n\n";

    });

    return edl;
}

async function makeEDL() {
  // Get resolve object
  resolve = await WorkflowIntegration.GetResolve();
  if (!resolve) {
      alert("Error: Failed to get resolve object!");
      return;
  }

  // Get supporting objects
  projectManager = await resolve.GetProjectManager();
  project = await projectManager.GetCurrentProject();
  timeline = await project.GetCurrentTimeline(); // current timeline

  //testing the timecode module.
  console.log();
  console.log("timecode module test.");

  // currenttimeline and fisrst subtitle track.

  edl = getEDL(timeline, 1);

  return edl;

}




async function makeXML(event, withVariableZ, annotationText) {

    // Get resolve object
    resolve = await WorkflowIntegration.GetResolve();
    if (!resolve) {
        alert("Error: Failed to get resolve object!");
        return;
    }

    // Get supporting objects
    projectManager = await resolve.GetProjectManager();
    project = await projectManager.GetCurrentProject();
    timeline = await project.GetCurrentTimeline(); // current timeline

    //testing the timecode module.
    console.log(new Timecode(300,24,false).toString());
    console.log("timecode module test.");

    // var OutTextArea = document.getElementById("OutTextArea");
    // OutTextArea.innerText = "";

    var outText = "";

    // var EDLTextArea = document.getElementById("EDLTextArea");
    // EDLTextArea.innerText = "";

    var EDLtext = "";

    if (!timeline) {
        alert("Error: No current timeline exist, add a timeline (recommended duration >= 80 frames) and try again!");
        return;
    }

    // Open Edit page
    resolve.OpenPage("edit");

    // Get timeline frames
    startFrame = parseInt(timeline.GetStartFrame());
    endFrame = parseInt(timeline.GetEndFrame());
    numFrames = endFrame - startFrame;
    framerate = timeline.GetSetting("timelineFrameRate");
    timelineName = timeline.GetName();
    timelineWidth = parseInt(timeline.GetSetting("timelineResolutionWidth"));
    console.log(timelineWidth);

    outText += "Timeline Name: " + timelineName + " FPS: " + framerate ;
    outText += "\n" + "start: "+startFrame+" end: "+endFrame + "\n";

    // the stereoscopic subtitles are on top track.
    // Get the number of video tracks in the timeline
    var video_track_count = timeline.GetTrackCount("video")
    var TrackItems = timeline.GetItemListInTrack("video", video_track_count);
    var count = Object.keys(TrackItems).length;
    outText += "items on track: " + count + "\n";

    var SubTrackItems = timeline.GetItemListInTrack("subtitle", 1);
    var count = Object.keys(SubTrackItems).length;
    outText += "items on subtitle track: " + count + "\n";


    // global variable for the subtitle xml
    // create a new XML document

    xdoc = new DCDMSubtitleXML();

    xdoc.addElement("Id","urn:uuid:"+uuid());
    xdoc.addElement("ContentTitleText","Stereoscopic Subtitles: "+timelineName);
    xdoc.addElement("AnnotationText",annotationText);
    xdoc.addElement("IssueDate", new Date().toISOString().replace('Z','-00:00'));
    xdoc.addElement("ReelNumber", "1");
    xdoc.addElement("Language","en");
    xdoc.addElement("EditRate",framerate+" 1");
    xdoc.addElement("TimeCodeRate",framerate);
    xdoc.addElement("StartTime","00:00:00:00");
    xdoc.addElement("DisplayType","MainSubtitle");
    xdoc.addElementWithParam("LoadFont","urn:uuid:"+uuid(),"ID","MyFont");
    // xdoc.addElement("SubtitleList","");
    xdoc.addFont("MyFont","FFFFFFFF","normal","40");

    // alert(TrackItems[0].GetName())
    // Get all elements from the subtitletrack.
    TrackItems.forEach(function(element, index) {
      // get the text from the SubTrackItems
      subtext = SubTrackItems[index].GetName();
      outText.value += subtext + "\n";
      fstart = parseInt(element.GetStart());
      fend = parseInt(element.GetEnd());
      // convert frames to TC
      tstart = convertTime(fstart,framerate);
      tend = convertTime(fend,framerate);

      let currentsub = xdoc.addSubtitle(index+1,tstart,tend);

      convpair = "";
      conv = element.GetStereoConvergenceValues();
      zframes = 0;
      Zmax = 0.0

      entriesCount = Object.entries(conv).length;
      console.log(entriesCount);

      if (entriesCount == 1) {
        // set duration to total subtitle duration.
        const [key, value] = Object.entries(conv)[0]
        newkey = fend - fstart;
        // transform absolute pixels in percentage of the image width.
        newvalue = (-2.0*parseInt(value)/timelineWidth*100).toFixed(2);
        convpair = "0";
        // only one value is the max
        Zmax = newvalue;
      } else {
        // iterate and calculate the duration
        // find most forward (negative) value for ZValue
        Zmax = 0.0;
        for (let i = 1; i < entriesCount; i++) {
        const [key, value] = Object.entries(conv)[i];
        const [previouskey, previousvalue] = Object.entries(conv)[i-1];
          newkey = key - previouskey;
          // transform absolute pixels in percentage of the image width.
          newvalue = (-2.0*parseInt(previousvalue)/timelineWidth*100).toFixed(2);
          convpair += newvalue + ":" + newkey + " ";
          if (parseFloat(newvalue) < parseFloat(Zmax)) {
            Zmax = newvalue;
          }
          if (i == entriesCount-1) {
            newkey = fend - key;
            // transform values:
            newvalue = (-2.0*parseInt(value)/timelineWidth*100).toFixed(2);
            convpair += newvalue + ":" + newkey;
            // identify if there is a morefront parallax.
          }
          if (parseFloat(newvalue) < parseFloat(Zmax)) {
            Zmax = newvalue;
          }
          }
      }


      if (withVariableZ == false) {
        convpair = "0"
      };

      xdoc.addText(currentsub, "bottom","8",Zmax, convpair, subtext);

      outText += "F:"+ index + " fr start: "+fstart+" fr end: "+fend + " stereo: " + convpair + " \n";
      outText += "T:"+ index + " tc start: "+tstart+" tc end: "+tend + " stereo: " + convpair + " \n";

    });

    return xdoc.toString();

    outText += "\n\n";


}
