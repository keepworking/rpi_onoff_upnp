const upnp = require('nat-upnp');
const express = require('express');
const Gpio = require('onoff').Gpio;

let led;

if (Gpio.accessible) {
  led = new Gpio(17, 'out');
} else {
  led = {
    writeSync: (value) => {
      console.log('virtual led now uses value: ' + value);
    }
  };
}

var client = upnp.createClient();
var app = express();

app.get('/',(req,res) => res.sendfile('index.html'))
app.get('/on',function (req,res) {
  led.writeSync(true);
  res.sendfile('index.html');
})
app.get('/off',function (req,res) {
  led.writeSync(false);
  res.sendfile('index.html');
})
client.portMapping({
  public: 12345,
  private: 54321,
  ttl: 10
}, function(err) {
});

client.externalIp(function(err, ip) {
  client.getMappings(function(err, results) {
    console.log(results)
    pulic_port = results[0].public.port;
    private_port = results[0].private.port;
    app.listen(private_port,()=> console.log('server is running on '+ip+':'+pulic_port))
  });
});
