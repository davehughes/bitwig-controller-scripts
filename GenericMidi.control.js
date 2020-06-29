// https://www.keithmcmillen.com/blog/controller-scripting-in-bitwig-studio-part-1
loadAPI(1);

var controllerName = 'GenericMidi';

host.defineController("davehughes", controllerName, "1.0", "1c76d7d1-3d2b-4390-9dd0-695ab7916357");
host.defineMidiPorts(1, 0);

function exit() {
  log("exit");
}

function onMidi(status, data1, data2) {
  log("onMidi(status=" + status + ", data1=" + data1 + ", data2=" + data2 +  ")");
  if (isChannelController(status)) {
    log("passing CC: " + userControls.getControl(data1).getLabel());
    userControls.getControl(data1).set(data2, 128);
  } else if (isProgramChange(status)) {
    log("TODO: pass PC: " + data1);
  }
}

function log(s) {
  println(controllerName + ': ' + s);
}

function init() {
  portIn = host.getMidiInPort(0).setMidiCallback(onMidi);

  userControls = host.createUserControlsSection(128);
  for(var i = 0; i < 128; i++) {
	  userControls.getControl(i).setLabel('CC' + i);
	}

  noteIn = host.getMidiInPort(0).createNoteInput("Notes");
  noteIn.setShouldConsumeEvents(false);

  log('initialized');
}

