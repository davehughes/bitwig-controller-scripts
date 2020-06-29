// https://www.keithmcmillen.com/blog/controller-scripting-in-bitwig-studio-part-1
loadAPI(1);

var DEBUG = false;
var PROCESS_CHANNELS = [3];

var controllerName = 'DMC-8';
host.defineController("davehughes", controllerName, "1.0", "f0102be9-d7e1-407c-a486-e2090f630382");
host.defineMidiPorts(1, 0);

function init() {
  portIn = host.getMidiInPort(0).setMidiCallback(onMidi);
  transport = host.createTransport();
  log('initialized');

  userControls = host.createUserControlsSection(1);
  roller = userControls.getControl(0);
  roller.setLabel('DMC-8 Roller');
}

function onMidi(status, data1, data2) {
  debug("onMidi(status=" + status + ", data1=" + data1 + ", data2=" + data2 +  ")");

  var channel = (status & 0xF);

  // Roller is set to transmit CC messages on channel 0 (Device A)
  if (channel === 0 && isChannelController(status) && data1 === 100) {
    debug('setting roller value:' + data2);
    roller.set(data2, 128);
    return;
  }

  if (PROCESS_CHANNELS.indexOf(channel) < 0) {
    debug('Skipping processing of ignored channel: ' + channel);
    return;
  }

  if (isProgramChange(status)) {
    var programMap = {
      0: {
        action: 'play',
        func: function() { transport.play(); },
      },
      1: {
        action: 'stop',
        func: function() { transport.stop(); },
      },
      2: {
        action: 'record',
        func: function() { transport.record(); },
      },
    };
    debug('applying program change');
    var program = programMap[data1];
    if (program) {
      log('Action: ' + program.action);
      program.func();
    } else {
      debug("No action assigned to program: " + data1);
    }
  }
}

function exit() {
  log("exit");
}

function log(s) {
  println(controllerName + ': ' + s);
}

function debug(s) {
  if (DEBUG) {
    log(s);
  }
}
